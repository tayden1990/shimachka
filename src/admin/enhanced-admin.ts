export function getEnhancedAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitner Bot - Enhanced Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        [x-cloak] { display: none !important; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .loading-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <div x-data="enhancedAdmin()" x-init="init()" x-cloak>
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-brain text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900">Leitner Bot Admin</h1>
                        <p class="text-gray-600 mt-2">Enhanced Admin Panel</p>
                    </div>

                    <form @submit.prevent="login()" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input x-model="loginForm.username" type="text" required
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="Enter username">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input x-model="loginForm.password" type="password" required
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="Enter password">
                        </div>

                        <button type="submit" :disabled="loading"
                                class="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            <span x-show="!loading">Sign In</span>
                            <span x-show="loading">
                                <i class="fas fa-spinner loading-spinner mr-2"></i>
                                Signing In...
                            </span>
                        </button>

                        <div x-show="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
                            <span class="text-red-700 text-sm" x-text="error"></span>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Dashboard -->
        <div x-show="isAuthenticated" class="min-h-screen">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b border-gray-200">
                <div class="flex items-center justify-between px-6 py-4">
                    <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <button @click="showNotifications = !showNotifications" class="text-gray-600 hover:text-gray-900">
                                <i class="fas fa-bell text-xl"></i>
                                <span x-show="notifications.length > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" x-text="notifications.length"></span>
                            </button>
                        </div>
                        <button @click="logout()" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-sign-out-alt mr-2"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <!-- Navigation Tabs -->
            <div class="bg-white border-b border-gray-200">
                <nav class="px-6">
                    <div class="flex space-x-8">
                        <button @click="activeTab = 'dashboard'" 
                                :class="activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                            <i class="fas fa-tachometer-alt mr-2"></i>
                            Dashboard
                        </button>
                        <button @click="activeTab = 'users'" 
                                :class="activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                            <i class="fas fa-users mr-2"></i>
                            Users
                        </button>
                        <button @click="activeTab = 'messaging'" 
                                :class="activeTab === 'messaging' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                            <i class="fas fa-paper-plane mr-2"></i>
                            Messaging
                        </button>
                        <button @click="activeTab = 'analytics'" 
                                :class="activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                            <i class="fas fa-chart-line mr-2"></i>
                            Analytics
                        </button>
                        <button @click="activeTab = 'settings'" 
                                :class="activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors">
                            <i class="fas fa-cog mr-2"></i>
                            Settings
                        </button>
                    </div>
                </nav>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Dashboard Tab -->
                <div x-show="activeTab === 'dashboard'" class="space-y-6">
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-blue-100">
                                    <i class="fas fa-users text-blue-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Users</p>
                                    <p class="text-2xl font-bold text-gray-900" x-text="stats.totalUsers || '0'"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-green-100">
                                    <i class="fas fa-book text-green-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Words</p>
                                    <p class="text-2xl font-bold text-gray-900" x-text="stats.totalWords || '0'"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-purple-100">
                                    <i class="fas fa-chart-line text-purple-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Study Sessions</p>
                                    <p class="text-2xl font-bold text-gray-900" x-text="stats.studySessions || '0'"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-yellow-100">
                                    <i class="fas fa-robot text-yellow-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Bot Status</p>
                                    <p class="text-lg font-bold text-green-600">Online</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
                        </div>
                        <div class="divide-y divide-gray-200">
                            <template x-for="activity in recentActivity" :key="activity.id">
                                <div class="p-6 flex items-center space-x-4">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-500">
                                        <i :class="activity.icon"></i>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-900" x-text="activity.title"></p>
                                        <p class="text-sm text-gray-500" x-text="activity.description"></p>
                                    </div>
                                    <div class="text-sm text-gray-400" x-text="activity.time"></div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Users Tab -->
                <div x-show="activeTab === 'users'" class="space-y-6">
                    <div class="bg-white rounded-lg shadow">
                        <div class="px-6 py-4 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-medium text-gray-900">User Management</h3>
                                <button @click="loadUsers()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-sync-alt mr-2"></i>
                                    Refresh
                                </button>
                            </div>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Words</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <template x-for="user in users" :key="user.id">
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="flex items-center">
                                                    <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                        <i class="fas fa-user text-gray-600"></i>
                                                    </div>
                                                    <div class="ml-4">
                                                        <div class="text-sm font-medium text-gray-900" x-text="user.fullName || 'Unknown'"></div>
                                                        <div class="text-sm text-gray-500" x-text="'ID: ' + user.id"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                                      :class="user.isRegistrationComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                                                      x-text="user.isRegistrationComplete ? 'Active' : 'Pending'"></span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="user.totalWords || 0"></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="user.interfaceLanguage || 'en'"></td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button @click="sendMessageToUser(user.id)" class="text-blue-600 hover:text-blue-900 mr-3">
                                                    <i class="fas fa-paper-plane mr-1"></i>
                                                    Message
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Messaging Tab -->
                <div x-show="activeTab === 'messaging'" class="space-y-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-6">Send Message to Users</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                                <select x-model="messaging.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="broadcast">Broadcast to All Users</option>
                                    <option value="individual">Individual User</option>
                                </select>
                            </div>

                            <div x-show="messaging.type === 'individual'">
                                <label class="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                <input type="text" x-model="messaging.targetUser" placeholder="Enter user ID"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea x-model="messaging.content" rows="4" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                          placeholder="Enter your message here..."></textarea>
                            </div>

                            <div class="flex justify-end">
                                <button @click="sendMessage()" :disabled="!messaging.content || messaging.sending"
                                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    <span x-show="!messaging.sending">Send Message</span>
                                    <span x-show="messaging.sending">
                                        <i class="fas fa-spinner loading-spinner mr-2"></i>
                                        Sending...
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Analytics Tab -->
                <div x-show="activeTab === 'analytics'" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
                            <div class="text-center py-8 text-gray-500">
                                <i class="fas fa-chart-line text-4xl mb-2"></i>
                                <p>Analytics charts will be displayed here</p>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Command Usage</h3>
                            <div class="space-y-2">
                                <template x-for="cmd in commandStats" :key="cmd.command">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-gray-600" x-text="cmd.command"></span>
                                        <span class="text-sm font-medium text-gray-900" x-text="cmd.count"></span>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Settings Tab -->
                <div x-show="activeTab === 'settings'" class="space-y-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-6">System Settings</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                                <input type="text" x-model="settings.systemName" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>

                            <div class="flex items-center">
                                <input type="checkbox" x-model="settings.maintenanceMode" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 text-sm text-gray-700">Maintenance Mode</span>
                            </div>

                            <div class="flex justify-end">
                                <button @click="saveSettings()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notifications -->
        <div x-show="showNotifications" @click.away="showNotifications = false" 
             class="absolute top-16 right-6 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div class="p-4 border-b border-gray-200">
                <h4 class="text-sm font-medium text-gray-900">Notifications</h4>
            </div>
            <div class="max-h-64 overflow-y-auto">
                <template x-for="notification in notifications" :key="notification.id">
                    <div class="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <p class="text-sm text-gray-900" x-text="notification.message"></p>
                        <p class="text-xs text-gray-500 mt-1" x-text="notification.time"></p>
                    </div>
                </template>
                <div x-show="notifications.length === 0" class="p-4 text-center text-gray-500">
                    No notifications
                </div>
            </div>
        </div>
    </div>

    <script>
        function enhancedAdmin() {
            return {
                isAuthenticated: false,
                loading: false,
                error: '',
                token: '',
                activeTab: 'dashboard',
                showNotifications: false,
                
                loginForm: {
                    username: '',
                    password: ''
                },
                
                stats: {
                    totalUsers: 0,
                    totalWords: 0,
                    studySessions: 0
                },
                
                users: [],
                notifications: [],
                recentActivity: [],
                commandStats: [
                    { command: '/start', count: 0 },
                    { command: '/register', count: 0 },
                    { command: '/study', count: 0 },
                    { command: '/add', count: 0 }
                ],
                
                messaging: {
                    type: 'broadcast',
                    targetUser: '',
                    content: '',
                    sending: false
                },
                
                settings: {
                    systemName: 'Leitner Bot Admin',
                    maintenanceMode: false
                },
                
                init() {
                    const token = localStorage.getItem('admin_token');
                    if (token) {
                        this.token = token;
                        this.isAuthenticated = true;
                        this.loadDashboard();
                    }
                },
                
                async login() {
                    this.loading = true;
                    this.error = '';
                    
                    try {
                        const response = await fetch('/admin/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(this.loginForm)
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.token = data.token;
                            localStorage.setItem('admin_token', this.token);
                            this.isAuthenticated = true;
                            this.loadDashboard();
                        } else {
                            const error = await response.json();
                            this.error = error.message || 'Login failed';
                        }
                    } catch (error) {
                        this.error = 'Network error occurred';
                    } finally {
                        this.loading = false;
                    }
                },
                
                logout() {
                    localStorage.removeItem('admin_token');
                    this.isAuthenticated = false;
                    this.token = '';
                    this.loginForm = { username: '', password: '' };
                },
                
                async loadDashboard() {
                    try {
                        const response = await fetch('/admin/dashboard', {
                            headers: { 'Authorization': 'Bearer ' + this.token }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.stats = data.stats || this.stats;
                            this.users = data.users || [];
                            this.recentActivity = data.activity || [];
                        }
                    } catch (error) {
                        console.error('Error loading dashboard:', error);
                    }
                },
                
                async loadUsers() {
                    try {
                        const response = await fetch('/admin/users', {
                            headers: { 'Authorization': 'Bearer ' + this.token }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.users = data.users || [];
                        }
                    } catch (error) {
                        console.error('Error loading users:', error);
                    }
                },
                
                async sendMessage() {
                    if (!this.messaging.content.trim()) return;
                    
                    this.messaging.sending = true;
                    try {
                        const response = await fetch('/admin/send-message', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + this.token
                            },
                            body: JSON.stringify({
                                type: this.messaging.type,
                                content: this.messaging.content,
                                targetUser: this.messaging.targetUser
                            })
                        });

                        if (response.ok) {
                            const result = await response.json();
                            alert('Message sent successfully to ' + (result.recipientCount || 1) + ' users');
                            this.messaging.content = '';
                            this.messaging.targetUser = '';
                        } else {
                            alert('Failed to send message');
                        }
                    } catch (error) {
                        alert('Error sending message');
                    } finally {
                        this.messaging.sending = false;
                    }
                },
                
                sendMessageToUser(userId) {
                    this.activeTab = 'messaging';
                    this.messaging.type = 'individual';
                    this.messaging.targetUser = userId.toString();
                },
                
                async saveSettings() {
                    try {
                        const response = await fetch('/admin/settings', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + this.token
                            },
                            body: JSON.stringify(this.settings)
                        });

                        if (response.ok) {
                            alert('Settings saved successfully');
                        } else {
                            alert('Failed to save settings');
                        }
                    } catch (error) {
                        alert('Error saving settings');
                    }
                }
            };
        }
        
        // Expose to global scope for Alpine.js
        window.enhancedAdmin = enhancedAdmin;
    </script>
</body>
</html>`;
}
