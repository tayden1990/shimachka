export function getSimpleAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitner Bot - Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        [x-cloak] { display: none !important; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <div x-data="simpleAdmin()" x-init="init()" x-cloak>
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-brain text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900">Leitner Bot Admin</h1>
                        <p class="text-gray-600 mt-2">Admin Panel</p>
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
                            <span x-show="loading">Signing In...</span>
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
                    <button @click="logout()" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-sign-out-alt mr-2"></i>
                        Logout
                    </button>
                </div>
            </header>

            <!-- Content -->
            <div class="p-6">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

                <!-- Users Table -->
                <div class="bg-white rounded-lg shadow">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-medium text-gray-900">Recent Users</h3>
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
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
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
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="formatDate(user.createdAt)"></td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function simpleAdmin() {
            return {
                isAuthenticated: false,
                loading: false,
                error: '',
                token: '',
                
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
                            headers: { 'Authorization': \`Bearer \${this.token}\` }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.stats = data.stats || this.stats;
                            this.users = data.users || [];
                        }
                    } catch (error) {
                        console.error('Error loading dashboard:', error);
                    }
                },
                
                async loadUsers() {
                    try {
                        const response = await fetch('/admin/users', {
                            headers: { 'Authorization': \`Bearer \${this.token}\` }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.users = data.users || [];
                        }
                    } catch (error) {
                        console.error('Error loading users:', error);
                    }
                },
                
                formatDate(dateString) {
                    if (!dateString) return 'N/A';
                    return new Date(dateString).toLocaleDateString();
                }
            };
        }
        
        // Expose to global scope for Alpine.js
        window.simpleAdmin = simpleAdmin;
    </script>
</body>
</html>`;
}
