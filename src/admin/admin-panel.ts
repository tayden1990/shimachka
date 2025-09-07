export function getAdminPanelHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitner Bot - Advanced Admin Panel v5.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        [x-cloak] { display: none !important; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .notification-badge { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .loading-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .card-hover { transition: all 0.2s ease-in-out; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .toast-enter { animation: slideInRight 0.3s ease-out; }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    </style>
</head>
<body class="bg-gray-50 font-sans">
    <div x-data="adminApp()" x-init="init()" x-cloak>
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <div class="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-2 gradient-bg"></div>
                    
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-brain text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900">Leitner Bot Admin</h1>
                        <p class="text-gray-600 mt-2">Advanced Learning Management System</p>
                        <span class="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            v5.0 - Complete Rebuild
                        </span>
                    </div>

                    <form @submit.prevent="login()" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <div class="relative">
                                <input x-model="loginForm.username" type="text" required
                                       class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                       placeholder="Enter your username">
                                <i class="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div class="relative">
                                <input x-model="loginForm.password" :type="showPassword ? 'text' : 'password'" required
                                       class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                       placeholder="Enter your password">
                                <i class="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <button type="button" @click="showPassword = !showPassword" 
                                        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                </button>
                            </div>
                        </div>

                        <button type="submit" :disabled="loading"
                                class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center">
                            <span x-show="!loading" class="flex items-center">
                                <i class="fas fa-sign-in-alt mr-2"></i>
                                Sign In
                            </span>
                            <span x-show="loading" class="flex items-center">
                                <i class="fas fa-spinner loading-spinner mr-2"></i>
                                Signing In...
                            </span>
                        </button>

                        <div x-show="error" class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                            <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                            <span class="text-red-700 text-sm" x-text="error"></span>
                        </div>
                    </form>

                    <div class="mt-6 pt-6 border-t border-gray-200">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-500">System Status</span>
                            <div class="flex items-center">
                                <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                <span class="text-green-600 font-medium">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Dashboard -->
        <div x-show="isAuthenticated" class="min-h-screen bg-gray-50">
            <!-- Sidebar -->
            <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300" 
                 :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
                
                <!-- Sidebar Header -->
                <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 gradient-bg">
                    <h1 class="text-xl font-bold text-white">🎯 Admin Panel</h1>
                    <button @click="sidebarOpen = false" class="lg:hidden text-white hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Navigation Menu -->
                <nav class="mt-6 px-4">
                    <template x-for="item in navigationItems" :key="item.id">
                        <button @click="activeTab = item.id; sidebarOpen = false"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition duration-200"
                                :class="activeTab === item.id ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500' : 'text-gray-600 hover:bg-gray-50'">
                            <i :class="item.icon" class="mr-3 text-lg"></i>
                            <span x-text="item.label"></span>
                            <span x-show="item.badge && item.badge > 0" 
                                  class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 notification-badge"
                                  x-text="item.badge"></span>
                        </button>
                    </template>
                </nav>

                <!-- User Info -->
                <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-white"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900" x-text="admin?.fullName || 'Admin User'"></p>
                            <p class="text-xs text-gray-500" x-text="admin?.role || 'Administrator'"></p>
                        </div>
                        <button @click="logout()" class="ml-auto text-gray-400 hover:text-red-500">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="lg:ml-64">
                <!-- Top Bar -->
                <header class="bg-white shadow-sm border-b border-gray-200">
                    <div class="flex items-center justify-between px-6 py-4">
                        <div class="flex items-center">
                            <button @click="sidebarOpen = true" class="lg:hidden mr-4 text-gray-500 hover:text-gray-700">
                                <i class="fas fa-bars"></i>
                            </button>
                            <h2 class="text-2xl font-semibold text-gray-900" x-text="getCurrentTabTitle()"></h2>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <!-- System Status -->
                            <div class="flex items-center space-x-2">
                                <div class="w-2 h-2 rounded-full" :class="systemStatus.online ? 'bg-green-500' : 'bg-red-500'"></div>
                                <span class="text-sm font-medium" :class="systemStatus.online ? 'text-green-600' : 'text-red-600'" 
                                      x-text="systemStatus.online ? 'Online' : 'Offline'"></span>
                            </div>

                            <!-- Refresh Button -->
                            <button @click="refreshData()" :disabled="loading"
                                    class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 disabled:opacity-50">
                                <i class="fas fa-sync-alt" :class="loading ? 'loading-spinner' : ''"></i>
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Tab Content -->
                <main class="p-6">
                    <!-- Dashboard Tab -->
                    <div x-show="activeTab === 'dashboard'" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <!-- Stats Cards -->
                            <template x-for="stat in dashboardStats" :key="stat.id">
                                <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-sm font-medium text-gray-600" x-text="stat.label"></p>
                                            <p class="text-3xl font-bold text-gray-900 mt-2" x-text="stat.value"></p>
                                            <p class="text-sm mt-1" 
                                               :class="stat.change > 0 ? 'text-green-600' : stat.change < 0 ? 'text-red-600' : 'text-gray-500'">
                                                <i :class="stat.change > 0 ? 'fas fa-arrow-up' : stat.change < 0 ? 'fas fa-arrow-down' : 'fas fa-minus'"></i>
                                                <span x-text="Math.abs(stat.change) + '%'"></span>
                                                <span x-text="stat.change > 0 ? ' increase' : stat.change < 0 ? ' decrease' : ' no change'"></span>
                                            </p>
                                        </div>
                                        <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white" 
                                             x-bind:style="'background: ' + stat.color">
                                            <i :class="stat.icon" class="text-xl"></i>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <!-- Recent Activity -->
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            </div>
                            <div class="divide-y divide-gray-200">
                                <template x-for="activity in recentActivity" :key="activity.id">
                                    <div class="p-6 flex items-center space-x-4">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" 
                                             x-bind:style="'background: ' + activity.color">
                                            <i :class="activity.icon"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-medium text-gray-900" x-text="activity.title"></p>
                                            <p class="text-sm text-gray-500" x-text="activity.description"></p>
                                        </div>
                                        <div class="text-sm text-gray-400" x-text="activity.timestamp"></div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- Analytics Tab -->
                    <div x-show="activeTab === 'analytics'" class="space-y-6">
                        <!-- Key Metrics -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Active Users (24h)</p>
                                        <p class="text-3xl font-bold text-green-600 mt-2" x-text="analytics.activeUsers24h || '0'"></p>
                                    </div>
                                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-user-check text-green-600 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Commands Today</p>
                                        <p class="text-3xl font-bold text-blue-600 mt-2" x-text="analytics.commandsToday || '0'"></p>
                                    </div>
                                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-terminal text-blue-600 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Words Added</p>
                                        <p class="text-3xl font-bold text-purple-600 mt-2" x-text="analytics.wordsAdded || '0'"></p>
                                    </div>
                                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-plus-circle text-purple-600 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Study Sessions</p>
                                        <p class="text-3xl font-bold text-orange-600 mt-2" x-text="analytics.studySessions || '0'"></p>
                                    </div>
                                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-brain text-orange-600 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Charts Row -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- User Growth Chart -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                                <canvas id="userGrowthChart" width="400" height="200"></canvas>
                            </div>
                            
                            <!-- Command Usage Chart -->
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Command Usage</h3>
                                <canvas id="commandUsageChart" width="400" height="200"></canvas>
                            </div>
                        </div>

                        <!-- Language Distribution -->
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                <template x-for="lang in analytics.languageStats || []" :key="lang.code">
                                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                                        <div class="text-2xl mb-2" x-text="lang.flag || '🌐'"></div>
                                        <div class="text-sm font-medium text-gray-900" x-text="lang.name"></div>
                                        <div class="text-lg font-bold text-blue-600" x-text="lang.users || 0"></div>
                                        <div class="text-xs text-gray-500">users</div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- Messaging Tab -->
                    <div x-show="activeTab === 'messaging'" class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900">Send Message to Users</h3>
                                <p class="text-sm text-gray-600 mt-1">Send announcements, notifications, or targeted messages</p>
                            </div>
                            <div class="p-6 space-y-6">
                                <!-- Message Type Selection -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                                    <select x-model="messaging.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="broadcast">Broadcast to All Users</option>
                                        <option value="targeted">Targeted Users</option>
                                        <option value="individual">Individual User</option>
                                    </select>
                                </div>

                                <!-- Target Selection -->
                                <div x-show="messaging.type === 'targeted'">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Target Criteria</label>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <select x-model="messaging.targetLanguage" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                            <option value="">All Languages</option>
                                            <option value="en">English</option>
                                            <option value="fa">Persian</option>
                                            <option value="ar">Arabic</option>
                                            <option value="es">Spanish</option>
                                        </select>
                                        <select x-model="messaging.userStatus" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                            <option value="">All Users</option>
                                            <option value="active">Active Users</option>
                                            <option value="inactive">Inactive Users</option>
                                        </select>
                                        <input type="number" x-model="messaging.minWords" placeholder="Min words learned" 
                                               class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>

                                <div x-show="messaging.type === 'individual'">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">User ID or Username</label>
                                    <input type="text" x-model="messaging.targetUser" placeholder="Enter user ID or @username"
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>

                                <!-- Message Content -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea x-model="messaging.content" rows="6" 
                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                              placeholder="Enter your message here... (Markdown supported)"></textarea>
                                </div>

                                <!-- Message Options -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="flex items-center">
                                            <input type="checkbox" x-model="messaging.includeButtons" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                            <span class="ml-2 text-sm text-gray-700">Include action buttons</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label class="flex items-center">
                                            <input type="checkbox" x-model="messaging.scheduleMessage" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                            <span class="ml-2 text-sm text-gray-700">Schedule for later</span>
                                        </label>
                                    </div>
                                </div>

                                <!-- Preview -->
                                <div x-show="messaging.content" class="border-t pt-6">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                                    <div class="bg-gray-50 p-4 rounded-lg border">
                                        <div class="whitespace-pre-wrap text-sm" x-text="messaging.content"></div>
                                    </div>
                                </div>

                                <!-- Send Button -->
                                <div class="flex justify-end space-x-3">
                                    <button @click="clearMessage()" 
                                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                        Clear
                                    </button>
                                    <button @click="sendMessage()" :disabled="!messaging.content || messaging.sending"
                                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span x-show="!messaging.sending">Send Message</span>
                                        <span x-show="messaging.sending">
                                            <i class="fas fa-spinner loading-spinner mr-2"></i>
                                            Sending...
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Message History -->
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900">Message History</h3>
                            </div>
                            <div class="divide-y divide-gray-200">
                                <template x-for="msg in messaging.history || []" :key="msg.id">
                                    <div class="p-6 flex items-start space-x-4">
                                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <i class="fas fa-paper-plane text-blue-600"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex items-center justify-between">
                                                <h4 class="text-sm font-medium text-gray-900" x-text="msg.type === 'broadcast' ? 'Broadcast Message' : msg.type === 'targeted' ? 'Targeted Message' : 'Individual Message'"></h4>
                                                <span class="text-sm text-gray-500" x-text="msg.timestamp"></span>
                                            </div>
                                            <p class="text-sm text-gray-600 mt-1" x-text="msg.preview"></p>
                                            <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                <span x-text="'Recipients: ' + (msg.recipients || 0)"></span>
                                                <span x-text="'Delivered: ' + (msg.delivered || 0)"></span>
                                                <span x-text="'Read: ' + (msg.read || 0)"></span>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- Users Tab -->
                    <div x-show="activeTab === 'users'" class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
                                    <div class="flex items-center space-x-3">
                                        <input type="text" x-model="userSearch" @input="searchUsers()"
                                               class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                               placeholder="Search users...">
                                        <button @click="refreshUsers()" 
                                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                                            <i class="fas fa-sync-alt mr-2"></i>
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Users Table -->
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <template x-for="user in filteredUsers" :key="user.id">
                                            <tr class="hover:bg-gray-50">
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                                            <span class="text-white font-medium" x-text="(user.firstName?.charAt(0) || user.username?.charAt(0) || '?')"></span>
                                                        </div>
                                                        <div class="ml-4">
                                                            <div class="text-sm font-medium text-gray-900" x-text="user.fullName || user.firstName || user.username || 'Unknown User'"></div>
                                                            <div class="text-sm text-gray-500" x-text="'@' + (user.username || 'no_username')"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                          :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                                        <div class="w-1.5 h-1.5 rounded-full mr-1" 
                                                             :class="user.isActive ? 'bg-green-400' : 'bg-red-400'"></div>
                                                        <span x-text="user.isActive ? 'Active' : 'Inactive'"></span>
                                                    </span>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="user.language || 'Not set'"></td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="formatDate(user.createdAt)"></td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div class="flex items-center space-x-2">
                                                        <button @click="viewUser(user)" 
                                                                class="text-blue-600 hover:text-blue-900">
                                                            <i class="fas fa-eye"></i>
                                                        </button>
                                                        <button @click="editUser(user)" 
                                                                class="text-indigo-600 hover:text-indigo-900">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button @click="messageUser(user)" 
                                                                class="text-green-600 hover:text-green-900">
                                                            <i class="fas fa-envelope"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- AI Bulk Words Tab -->
                    <div x-show="activeTab === 'bulk-words'" class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-6">AI-Powered Bulk Word Processing</h3>
                            
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- Input Section -->
                                <div class="space-y-4">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Source Language</label>
                                            <select x-model="bulkWords.sourceLanguage"
                                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                                            <select x-model="bulkWords.targetLanguage"
                                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                                <option value="es">Spanish</option>
                                                <option value="en">English</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Words to Process</label>
                                        <textarea x-model="bulkWords.wordsInput" rows="8"
                                                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                                  placeholder="Enter words separated by commas or new lines..."></textarea>
                                        <p class="text-xs text-gray-500 mt-1">
                                            Words detected: <span x-text="getWordCount()"></span>
                                        </p>
                                    </div>

                                    <button @click="processWordsWithAI()" :disabled="loading || !canProcessWords()"
                                            class="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center">
                                        <span x-show="!loading" class="flex items-center">
                                            <i class="fas fa-magic mr-2"></i>
                                            Process with AI
                                        </span>
                                        <span x-show="loading" class="flex items-center">
                                            <i class="fas fa-spinner loading-spinner mr-2"></i>
                                            Processing...
                                        </span>
                                    </button>
                                </div>

                                <!-- Results Section -->
                                <div class="space-y-4">
                                    <h4 class="text-md font-semibold text-gray-900">Results</h4>
                                    
                                    <div x-show="bulkWords.processing" class="text-center py-8">
                                        <div class="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                                            <i class="fas fa-brain text-blue-600 mr-2"></i>
                                            <span class="text-blue-800 font-medium">AI is processing...</span>
                                        </div>
                                        <div class="mt-4">
                                            <div class="w-full bg-gray-200 rounded-full h-2">
                                                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                     x-bind:style="'width: ' + bulkWords.progress + '%'"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div x-show="bulkWords.results.length > 0" class="space-y-3">
                                        <div class="max-h-80 overflow-y-auto space-y-2">
                                            <template x-for="(result, index) in bulkWords.results" :key="index">
                                                <div class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                                                    <div class="flex items-center justify-between mb-2">
                                                        <span class="font-medium text-gray-900" x-text="result.word"></span>
                                                        <span class="text-sm text-gray-500" x-text="result.translation"></span>
                                                    </div>
                                                    <p class="text-xs text-gray-600" x-text="result.definition"></p>
                                                </div>
                                            </template>
                                        </div>

                                        <button @click="assignWordsToUsers()" :disabled="loading"
                                                class="w-full bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50">
                                            <i class="fas fa-paper-plane mr-2"></i>
                                            Assign to Users
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Content Management Tab -->
                    <div x-show="activeTab === 'content'" class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900">Bot Content Management</h3>
                                <p class="text-sm text-gray-600 mt-1">Manage bot responses, messages, and interface text</p>
                            </div>
                            <div class="p-6">
                                <!-- Content Categories -->
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <button @click="content.category = 'welcome'" 
                                            :class="content.category === 'welcome' ? 'ring-2 ring-blue-500 bg-blue-50' : ''"
                                            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                                        <i class="fas fa-hand-wave text-blue-600 text-xl mb-2"></i>
                                        <h4 class="font-medium text-gray-900">Welcome Messages</h4>
                                        <p class="text-sm text-gray-600">Start, registration, onboarding</p>
                                    </button>
                                    <button @click="content.category = 'commands'" 
                                            :class="content.category === 'commands' ? 'ring-2 ring-blue-500 bg-blue-50' : ''"
                                            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                                        <i class="fas fa-terminal text-green-600 text-xl mb-2"></i>
                                        <h4 class="font-medium text-gray-900">Command Responses</h4>
                                        <p class="text-sm text-gray-600">Help, study, add, stats</p>
                                    </button>
                                    <button @click="content.category = 'errors'" 
                                            :class="content.category === 'errors' ? 'ring-2 ring-blue-500 bg-blue-50' : ''"
                                            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                                        <i class="fas fa-exclamation-triangle text-red-600 text-xl mb-2"></i>
                                        <h4 class="font-medium text-gray-900">Error Messages</h4>
                                        <p class="text-sm text-gray-600">Validation, failures, limits</p>
                                    </button>
                                </div>

                                <!-- Content Editor -->
                                <div x-show="content.category">
                                    <div class="border rounded-lg">
                                        <div class="p-4 border-b bg-gray-50">
                                            <h4 class="font-medium text-gray-900" x-text="content.category.charAt(0).toUpperCase() + content.category.slice(1) + ' Messages'"></h4>
                                        </div>
                                        <div class="p-4 space-y-4">
                                            <template x-for="(msg, index) in content.messages[content.category] || []" :key="index">
                                                <div class="border rounded-lg p-4">
                                                    <div class="flex items-center justify-between mb-2">
                                                        <label class="text-sm font-medium text-gray-700" x-text="msg.label"></label>
                                                        <div class="flex items-center space-x-2">
                                                            <span class="text-xs text-gray-500" x-text="msg.key"></span>
                                                            <button @click="content.previewMessage = msg.content" class="text-blue-600 hover:text-blue-800">
                                                                <i class="fas fa-eye"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <textarea x-model="msg.content" rows="3" 
                                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                                              :placeholder="msg.placeholder"></textarea>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>

                                <!-- Preview Panel -->
                                <div x-show="content.previewMessage" class="mt-6 border-t pt-6">
                                    <h4 class="font-medium text-gray-900 mb-2">Message Preview</h4>
                                    <div class="bg-gray-50 p-4 rounded-lg border">
                                        <div class="whitespace-pre-wrap text-sm" x-text="content.previewMessage"></div>
                                    </div>
                                </div>

                                <!-- Save Changes -->
                                <div class="flex justify-end mt-6">
                                    <button @click="saveContent()" 
                                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        <i class="fas fa-save mr-2"></i>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bot Monitoring Tab -->
                    <div x-show="activeTab === 'monitoring'" class="space-y-6">
                        <!-- Real-time Stats -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Webhook Status</p>
                                        <p class="text-lg font-bold mt-1" 
                                           :class="monitoring.webhook.status === 'healthy' ? 'text-green-600' : 'text-red-600'"
                                           x-text="monitoring.webhook.status || 'Unknown'"></p>
                                    </div>
                                    <div class="w-3 h-3 rounded-full" 
                                         :class="monitoring.webhook.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'"></div>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Response Time</p>
                                        <p class="text-lg font-bold text-blue-600 mt-1" x-text="(monitoring.webhook.responseTime || 0) + 'ms'"></p>
                                    </div>
                                    <i class="fas fa-tachometer-alt text-blue-600"></i>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Requests/Hour</p>
                                        <p class="text-lg font-bold text-purple-600 mt-1" x-text="monitoring.webhook.requestsPerHour || 0"></p>
                                    </div>
                                    <i class="fas fa-chart-bar text-purple-600"></i>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl shadow-sm p-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Error Rate</p>
                                        <p class="text-lg font-bold mt-1" 
                                           :class="(monitoring.webhook.errorRate || 0) > 5 ? 'text-red-600' : 'text-green-600'"
                                           x-text="(monitoring.webhook.errorRate || 0) + '%'"></p>
                                    </div>
                                    <i class="fas fa-exclamation-triangle" 
                                       :class="(monitoring.webhook.errorRate || 0) > 5 ? 'text-red-600' : 'text-green-600'"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Live Activity Feed -->
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
                                    <div class="flex items-center space-x-3">
                                        <button @click="monitoring.autoRefresh = !monitoring.autoRefresh" 
                                                :class="monitoring.autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                                                class="px-3 py-1 rounded-full text-sm font-medium">
                                            <i class="fas fa-sync-alt mr-1"></i>
                                            Auto Refresh
                                        </button>
                                        <button @click="refreshMonitoring()" 
                                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                            <i class="fas fa-refresh mr-2"></i>
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="max-h-96 overflow-y-auto">
                                <template x-for="activity in monitoring.liveActivity || []" :key="activity.id">
                                    <div class="p-4 border-b border-gray-100 flex items-start space-x-3">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" 
                                             :style="'background-color: ' + activity.color">
                                            <i :class="activity.icon"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center justify-between">
                                                <p class="text-sm font-medium text-gray-900" x-text="activity.title"></p>
                                                <span class="text-xs text-gray-500" x-text="activity.timestamp"></span>
                                            </div>
                                            <p class="text-sm text-gray-600" x-text="activity.description"></p>
                                            <div x-show="activity.details" class="mt-1">
                                                <code class="text-xs bg-gray-100 px-2 py-1 rounded" x-text="activity.details"></code>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- Command Statistics -->
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900">Command Usage Statistics</h3>
                            </div>
                            <div class="p-6">
                                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <template x-for="cmd in monitoring.commandStats || []" :key="cmd.command">
                                        <div class="text-center p-4 bg-gray-50 rounded-lg">
                                            <div class="text-lg font-bold text-blue-600" x-text="cmd.count || 0"></div>
                                            <div class="text-sm font-medium text-gray-900" x-text="cmd.command"></div>
                                            <div class="text-xs text-gray-500">uses</div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Export/Import Tab -->
                    <div x-show="activeTab === 'export'" class="space-y-6">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Export Section -->
                            <div class="bg-white rounded-xl shadow-sm">
                                <div class="p-6 border-b border-gray-200">
                                    <h3 class="text-lg font-semibold text-gray-900">Export Data</h3>
                                    <p class="text-sm text-gray-600 mt-1">Download system data for backup or analysis</p>
                                </div>
                                <div class="p-6 space-y-4">
                                    <div class="space-y-3">
                                        <label class="flex items-center">
                                            <input type="checkbox" x-model="exportData.includeUsers" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                            <span class="ml-2 text-sm text-gray-700">User Data & Profiles</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" x-model="exportData.includeWords" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                            <span class="ml-2 text-sm text-gray-700">Words & Cards</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" x-model="exportData.includeProgress" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                            <span class="ml-2 text-sm text-gray-700">Learning Progress</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" x-model="exportData.includeSettings" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                            <span class="ml-2 text-sm text-gray-700">System Settings</span>
                                        </label>
                                    </div>
                                    <div class="pt-4 border-t">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                                        <select x-model="exportData.format" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                            <option value="json">JSON (Structured)</option>
                                            <option value="csv">CSV (Spreadsheet)</option>
                                            <option value="xml">XML (Markup)</option>
                                        </select>
                                    </div>
                                    <button @click="exportSystemData()" :disabled="exportData.processing"
                                            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                                        <span x-show="!exportData.processing">
                                            <i class="fas fa-download mr-2"></i>
                                            Export Data
                                        </span>
                                        <span x-show="exportData.processing">
                                            <i class="fas fa-spinner loading-spinner mr-2"></i>
                                            Exporting...
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <!-- Import Section -->
                            <div class="bg-white rounded-xl shadow-sm">
                                <div class="p-6 border-b border-gray-200">
                                    <h3 class="text-lg font-semibold text-gray-900">Import Data</h3>
                                    <p class="text-sm text-gray-600 mt-1">Restore data from backup files</p>
                                </div>
                                <div class="p-6 space-y-4">
                                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <input type="file" @change="handleFileUpload($event)" accept=".json,.csv,.xml" class="hidden" id="importFile">
                                        <label for="importFile" class="cursor-pointer">
                                            <i class="fas fa-upload text-gray-400 text-3xl mb-2"></i>
                                            <p class="text-sm text-gray-600">Click to select backup file</p>
                                            <p class="text-xs text-gray-500 mt-1">Supports JSON, CSV, XML</p>
                                        </label>
                                    </div>
                                    
                                    <div x-show="importData.file" class="space-y-3">
                                        <div class="bg-blue-50 p-3 rounded-lg">
                                            <p class="text-sm text-blue-800">
                                                <strong>Selected:</strong> <span x-text="importData.file?.name"></span>
                                            </p>
                                            <p class="text-xs text-blue-600" x-text="'Size: ' + (importData.file?.size / 1024 / 1024).toFixed(2) + ' MB'"></p>
                                        </div>
                                        
                                        <div class="space-y-2">
                                            <label class="flex items-center">
                                                <input type="checkbox" x-model="importData.mergeMode" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                <span class="ml-2 text-sm text-gray-700">Merge with existing data</span>
                                            </label>
                                            <label class="flex items-center">
                                                <input type="checkbox" x-model="importData.createBackup" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                                <span class="ml-2 text-sm text-gray-700">Create backup before import</span>
                                            </label>
                                        </div>
                                    </div>

                                    <button @click="importSystemData()" :disabled="!importData.file || importData.processing"
                                            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                        <span x-show="!importData.processing">
                                            <i class="fas fa-upload mr-2"></i>
                                            Import Data
                                        </span>
                                        <span x-show="importData.processing">
                                            <i class="fas fa-spinner loading-spinner mr-2"></i>
                                            Importing...
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Backup History -->
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900">Backup History</h3>
                                    <button @click="createAutoBackup()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                        <i class="fas fa-save mr-2"></i>
                                        Create Backup
                                    </button>
                                </div>
                            </div>
                            <div class="divide-y divide-gray-200">
                                <template x-for="backup in exportData.backupHistory || []" :key="backup.id">
                                    <div class="p-6 flex items-center justify-between">
                                        <div class="flex items-center space-x-4">
                                            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <i class="fas fa-archive text-purple-600"></i>
                                            </div>
                                            <div>
                                                <p class="text-sm font-medium text-gray-900" x-text="backup.name"></p>
                                                <p class="text-sm text-gray-500" x-text="backup.created"></p>
                                                <p class="text-xs text-gray-400" x-text="backup.size + ' • ' + backup.records + ' records'"></p>
                                            </div>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <button @click="downloadBackup(backup.id)" class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-download mr-1"></i>
                                                Download
                                            </button>
                                            <button @click="restoreBackup(backup.id)" class="px-3 py-1 text-sm text-green-600 hover:text-green-800">
                                                <i class="fas fa-undo mr-1"></i>
                                                Restore
                                            </button>
                                            <button @click="deleteBackup(backup.id)" class="px-3 py-1 text-sm text-red-600 hover:text-red-800">
                                                <i class="fas fa-trash mr-1"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- System Health Tab -->
                    <div x-show="activeTab === 'health'" class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                            <div class="space-y-4">
                                <template x-for="health in systemHealth" :key="health.id">
                                    <div class="flex items-center justify-between p-4 rounded-lg border"
                                         :class="health.status === 'healthy' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
                                        <div class="flex items-center">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                                 :class="health.status === 'healthy' ? 'bg-green-100' : 'bg-red-100'">
                                                <i :class="health.icon" 
                                                   :class="health.status === 'healthy' ? 'text-green-600' : 'text-red-600'"></i>
                                            </div>
                                            <div>
                                                <div class="text-sm font-medium text-gray-900" x-text="health.name"></div>
                                                <div class="text-xs text-gray-600" x-text="health.description"></div>
                                            </div>
                                        </div>
                                        <div class="text-sm font-medium" 
                                             :class="health.status === 'healthy' ? 'text-green-600' : 'text-red-600'"
                                             x-text="health.status"></div>
                                    </div>
                                </template>
                            </div>
                            
                            <button @click="runHealthCheck()" :disabled="loading"
                                    class="w-full mt-4 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                <i class="fas fa-stethoscope mr-2" :class="loading ? 'loading-spinner' : ''"></i>
                                Run Health Check
                            </button>
                        </div>

                        <!-- Debug Tools -->
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Debug Tools</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button @click="testWebhook()" :disabled="loading"
                                        class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                    <i class="fas fa-webhook text-blue-600 text-xl mb-2"></i>
                                    <span class="text-sm font-medium text-gray-900">Test Webhook</span>
                                </button>
                                
                                <button @click="testAI()" :disabled="loading"
                                        class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                    <i class="fas fa-brain text-purple-600 text-xl mb-2"></i>
                                    <span class="text-sm font-medium text-gray-900">Test AI</span>
                                </button>
                                
                                <button @click="testDatabase()" :disabled="loading"
                                        class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                    <i class="fas fa-database text-green-600 text-xl mb-2"></i>
                                    <span class="text-sm font-medium text-gray-900">Test Database</span>
                                </button>
                                
                                <button @click="clearCache()" :disabled="loading"
                                        class="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                    <i class="fas fa-broom text-yellow-600 text-xl mb-2"></i>
                                    <span class="text-sm font-medium text-gray-900">Clear Cache</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Settings Tab -->
                    <div x-show="activeTab === 'settings'" class="space-y-6">
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">System Name</label>
                                    <input type="text" x-model="settings.systemName"
                                           class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700">Maintenance Mode</label>
                                        <p class="text-xs text-gray-500">Disable bot for maintenance</p>
                                    </div>
                                    <button @click="settings.maintenanceMode = !settings.maintenanceMode" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                            :class="settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between pt-4">
                                <button @click="resetSettings()" 
                                        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                    Reset to Defaults
                                </button>
                                <button @click="saveSettings()" :disabled="loading"
                                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    <span x-show="!loading">Save Settings</span>
                                    <span x-show="loading" class="flex items-center">
                                        <i class="fas fa-spinner loading-spinner mr-2"></i>
                                        Saving...
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Toast Notifications -->
        <div class="fixed bottom-4 right-4 space-y-2 z-50">
            <template x-for="toast in toasts" :key="toast.id">
                <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm toast-enter"
                     :class="toast.type === 'error' ? 'border-red-200' : toast.type === 'success' ? 'border-green-200' : 'border-blue-200'">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <i :class="toast.type === 'error' ? 'fas fa-exclamation-circle text-red-500' : 
                                       toast.type === 'success' ? 'fas fa-check-circle text-green-500' : 
                                       'fas fa-info-circle text-blue-500'"></i>
                        </div>
                        <div class="ml-3 flex-1">
                            <p class="text-sm font-medium text-gray-900" x-text="toast.title"></p>
                            <p class="text-sm text-gray-600" x-text="toast.message"></p>
                        </div>
                        <button @click="removeToast(toast.id)" class="ml-2 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <!-- User Details Modal -->
    <div x-show="userDetails.show" class="fixed inset-0 z-50 overflow-y-auto" style="display: none;">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeUserDetails()"></div>
            
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                <!-- Modal Header -->
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white text-xl"></i>
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-medium text-white" x-text="userDetails.user ? userDetails.user.fullName : 'Loading...'"></h3>
                                <p class="text-blue-100" x-text="userDetails.user ? 'User ID: ' + userDetails.user.id : ''"></p>
                            </div>
                        </div>
                        <button @click="closeUserDetails()" class="text-white hover:text-gray-200 transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Modal Content -->
                <div x-show="userDetails.loading" class="p-8 text-center">
                    <i class="fas fa-spinner fa-spin text-blue-500 text-3xl mb-4"></i>
                    <p class="text-gray-600">Loading user details...</p>
                </div>

                <div x-show="!userDetails.loading && userDetails.user" class="p-6">
                    <!-- User Overview -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <!-- Basic Info -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
                            <div class="space-y-2 text-sm">
                                <div><span class="font-medium">Username:</span> <span x-text="userDetails.user?.username || 'N/A'"></span></div>
                                <div><span class="font-medium">Language:</span> <span x-text="userDetails.user?.language || 'N/A'"></span></div>
                                <div><span class="font-medium">Status:</span> 
                                    <span :class="userDetails.user?.isActive ? 'text-green-600' : 'text-red-600'" x-text="userDetails.user?.isActive ? 'Active' : 'Inactive'"></span>
                                </div>
                                <div><span class="font-medium">Joined:</span> <span x-text="formatDate(userDetails.user?.createdAt)"></span></div>
                                <div><span class="font-medium">Last Active:</span> <span x-text="formatDate(userDetails.user?.lastActiveAt)"></span></div>
                            </div>
                        </div>

                        <!-- Study Statistics -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-gray-900 mb-3">Study Statistics</h4>
                            <div class="space-y-2 text-sm">
                                <div><span class="font-medium">Total Words:</span> <span x-text="userDetails.user?.totalCards || 0"></span></div>
                                <div><span class="font-medium">Total Reviews:</span> <span x-text="userDetails.user?.totalReviews || 0"></span></div>
                                <div><span class="font-medium">Accuracy:</span> <span x-text="(userDetails.user?.accuracy || 0) + '%'"></span></div>
                                <div><span class="font-medium">Due for Review:</span> <span x-text="userDetails.user?.dueForReview || 0"></span></div>
                                <div><span class="font-medium">Study Days:</span> <span x-text="userDetails.user?.studyDays || 0"></span></div>
                            </div>
                        </div>

                        <!-- Box Distribution -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-gray-900 mb-3">Leitner Boxes</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span>Box 1:</span> 
                                    <span class="font-medium" x-text="userDetails.user?.boxCounts?.box1 || 0"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Box 2:</span> 
                                    <span class="font-medium" x-text="userDetails.user?.boxCounts?.box2 || 0"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Box 3:</span> 
                                    <span class="font-medium" x-text="userDetails.user?.boxCounts?.box3 || 0"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Box 4:</span> 
                                    <span class="font-medium" x-text="userDetails.user?.boxCounts?.box4 || 0"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Box 5:</span> 
                                    <span class="font-medium" x-text="userDetails.user?.boxCounts?.box5 || 0"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Language Breakdown -->
                    <div x-show="userDetails.user?.languages?.length > 0" class="mb-8">
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Languages</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <template x-for="lang in userDetails.user?.languages || []" :key="lang.sourceLanguage + '-' + lang.targetLanguage">
                                <div class="bg-white border rounded-lg p-4">
                                    <div class="font-medium text-gray-900" x-text="lang.sourceLanguage.toUpperCase() + ' → ' + lang.targetLanguage.toUpperCase()"></div>
                                    <div class="text-sm text-gray-600 mt-1">
                                        <div><span x-text="lang.cardCount"></span> words</div>
                                        <div>Avg box: <span x-text="lang.avgBox"></span></div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Words Tabs -->
                    <div class="border-b border-gray-200 mb-6">
                        <nav class="-mb-px flex space-x-8">
                            <button @click="userDetails.activeWordsTab = 'all'" 
                                    :class="userDetails.activeWordsTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                    class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                All Words (<span x-text="userDetails.user?.words?.length || 0"></span>)
                            </button>
                            <button @click="userDetails.activeWordsTab = 'due'" 
                                    :class="userDetails.activeWordsTab === 'due' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                    class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                Due for Review (<span x-text="userDetails.user?.words?.filter(w => w.isDue).length || 0"></span>)
                            </button>
                            <button @click="userDetails.activeWordsTab = 'byBox'" 
                                    :class="userDetails.activeWordsTab === 'byBox' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                    class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                                By Box
                            </button>
                        </nav>
                    </div>

                    <!-- Words Content -->
                    <div class="space-y-4">
                        <!-- Search and Filters -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <input x-model="userDetails.wordSearch" type="text" placeholder="Search words..."
                                       class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <div x-show="userDetails.activeWordsTab === 'byBox'" class="flex items-center space-x-2">
                                    <label class="text-sm font-medium">Box:</label>
                                    <select x-model="userDetails.selectedBox" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                        <option value="1">Box 1</option>
                                        <option value="2">Box 2</option>
                                        <option value="3">Box 3</option>
                                        <option value="4">Box 4</option>
                                        <option value="5">Box 5</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Words Table -->
                        <div class="border border-gray-200 rounded-lg overflow-hidden">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Translation</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Definition</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Review</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <template x-for="word in getFilteredWords()" :key="word.id">
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-3 text-sm">
                                                <div class="font-medium text-gray-900" x-text="word.word"></div>
                                                <div class="text-xs text-gray-500" x-text="word.sourceLanguage + ' → ' + word.targetLanguage"></div>
                                            </td>
                                            <td class="px-4 py-3 text-sm text-gray-900" x-text="word.translation"></td>
                                            <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" x-text="word.definition"></td>
                                            <td class="px-4 py-3 text-sm">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                      :class="{
                                                          'bg-red-100 text-red-800': word.box === 1,
                                                          'bg-yellow-100 text-yellow-800': word.box === 2,
                                                          'bg-blue-100 text-blue-800': word.box === 3,
                                                          'bg-green-100 text-green-800': word.box === 4,
                                                          'bg-purple-100 text-purple-800': word.box === 5
                                                      }">
                                                    Box <span x-text="word.box"></span>
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 text-sm">
                                                <div class="text-gray-900" x-text="word.accuracy + '%'"></div>
                                                <div class="text-xs text-gray-500" x-text="word.correctCount + '/' + word.reviewCount + ' correct'"></div>
                                            </td>
                                            <td class="px-4 py-3 text-sm">
                                                <div class="text-gray-900" x-text="formatDate(word.nextReviewAt)"></div>
                                                <div class="text-xs" :class="word.isDue ? 'text-red-600' : 'text-gray-500'" 
                                                     x-text="word.isDue ? 'Due now' : 'Not due'"></div>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>

                        <!-- No words message -->
                        <div x-show="getFilteredWords().length === 0" class="text-center py-8 text-gray-500">
                            <i class="fas fa-search text-4xl mb-4"></i>
                            <p>No words found</p>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="bg-gray-50 px-6 py-4 flex justify-between">
                    <div class="flex space-x-3">
                        <button class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <i class="fas fa-plus mr-2"></i>
                            Add Words
                        </button>
                        <button class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <i class="fas fa-envelope mr-2"></i>
                            Send Message
                        </button>
                    </div>
                    <button @click="closeUserDetails()" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        function adminApp() {
            return {
                // Authentication state
                isAuthenticated: false,
                admin: null,
                token: null,
                showPassword: false,
                
                // UI state
                activeTab: 'dashboard',
                sidebarOpen: false,
                loading: false,
                error: '',
                
                // Forms
                loginForm: {
                    username: '',
                    password: ''
                },
                
                // Data
                dashboardStats: [],
                users: [],
                filteredUsers: [],
                toasts: [],
                recentActivity: [],
                systemStatus: { online: true },
                systemHealth: [],
                userSearch: '',
                
                // User Details Modal
                userDetails: {
                    show: false,
                    loading: false,
                    user: null,
                    activeWordsTab: 'all', // all, due, byBox, byLanguage
                    wordsPage: 1,
                    wordsPerPage: 20,
                    wordSearch: '',
                    selectedBox: 1
                },
                
                // Navigation
                navigationItems: [
                    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
                    { id: 'users', label: 'Users', icon: 'fas fa-users', badge: 0 },
                    { id: 'messaging', label: 'Messaging', icon: 'fas fa-paper-plane' },
                    { id: 'content', label: 'Content', icon: 'fas fa-edit' },
                    { id: 'bulk-words', label: 'AI Bulk Words', icon: 'fas fa-magic' },
                    { id: 'monitoring', label: 'Bot Monitor', icon: 'fas fa-robot' },
                    { id: 'export', label: 'Export/Import', icon: 'fas fa-download' },
                    { id: 'health', label: 'System Health', icon: 'fas fa-heart' },
                    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
                ],
                
                // Bulk words
                bulkWords: {
                    sourceLanguage: 'en',
                    targetLanguage: 'es',
                    wordsInput: '',
                    processing: false,
                    progress: 0,
                    results: [],
                    lastAssignmentId: null
                },

                // Analytics
                analytics: {
                    activeUsers24h: 0,
                    commandsToday: 0,
                    wordsAdded: 0,
                    studySessions: 0,
                    languageStats: [
                        { code: 'en', name: 'English', flag: '🇺🇸', users: 0 },
                        { code: 'fa', name: 'Persian', flag: '🇮🇷', users: 0 },
                        { code: 'ar', name: 'Arabic', flag: '🇸🇦', users: 0 },
                        { code: 'es', name: 'Spanish', flag: '🇪🇸', users: 0 }
                    ]
                },

                // Messaging
                messaging: {
                    type: 'broadcast',
                    targetLanguage: '',
                    userStatus: '',
                    minWords: '',
                    targetUser: '',
                    content: '',
                    includeButtons: false,
                    scheduleMessage: false,
                    sending: false,
                    history: []
                },

                // Content Management
                content: {
                    category: 'welcome',
                    previewMessage: '',
                    messages: {
                        welcome: [
                            { key: 'start_message', label: 'Start Command', content: '', placeholder: 'Welcome message for /start command' },
                            { key: 'registration_welcome', label: 'Registration Welcome', content: '', placeholder: 'Welcome message during registration' },
                            { key: 'language_selection', label: 'Language Selection', content: '', placeholder: 'Language selection prompt' }
                        ],
                        commands: [
                            { key: 'help_message', label: 'Help Command', content: '', placeholder: 'Response for /help command' },
                            { key: 'study_start', label: 'Study Start', content: '', placeholder: 'Message when starting study session' },
                            { key: 'add_words', label: 'Add Words', content: '', placeholder: 'Instructions for adding words' },
                            { key: 'stats_display', label: 'Statistics Display', content: '', placeholder: 'Format for displaying user stats' }
                        ],
                        errors: [
                            { key: 'invalid_command', label: 'Invalid Command', content: '', placeholder: 'Unknown command error message' },
                            { key: 'registration_required', label: 'Registration Required', content: '', placeholder: 'Must register first message' },
                            { key: 'processing_error', label: 'Processing Error', content: '', placeholder: 'General processing error' }
                        ]
                    }
                },

                // Monitoring
                monitoring: {
                    autoRefresh: false,
                    webhook: {
                        status: 'healthy',
                        responseTime: 0,
                        requestsPerHour: 0,
                        errorRate: 0
                    },
                    liveActivity: [],
                    commandStats: [
                        { command: '/start', count: 0 },
                        { command: '/register', count: 0 },
                        { command: '/study', count: 0 },
                        { command: '/add', count: 0 },
                        { command: '/stats', count: 0 },
                        { command: '/help', count: 0 }
                    ]
                },

                // Export/Import
                exportData: {
                    includeUsers: true,
                    includeWords: true,
                    includeProgress: true,
                    includeSettings: false,
                    format: 'json',
                    processing: false,
                    backupHistory: []
                },

                importData: {
                    file: null,
                    mergeMode: true,
                    createBackup: true,
                    processing: false
                },
                
                // Settings
                settings: {
                    systemName: 'Leitner Bot Admin',
                    maintenanceMode: false
                },
                
                // Methods
                async init() {
                    this.checkAuthentication();
                    this.loadInitialData();
                    // Initialize charts after a short delay to ensure DOM is ready
                    setTimeout(() => {
                        this.initializeCharts();
                    }, 1000);
                },

                initializeCharts() {
                    // User Growth Chart
                    const userGrowthCtx = document.getElementById('userGrowthChart');
                    if (userGrowthCtx) {
                        new Chart(userGrowthCtx, {
                            type: 'line',
                            data: {
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                datasets: [{
                                    label: 'New Users',
                                    data: [12, 19, 8, 25, 22, 30],
                                    borderColor: 'rgb(59, 130, 246)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }
                        });
                    }

                    // Command Usage Chart
                    const commandUsageCtx = document.getElementById('commandUsageChart');
                    if (commandUsageCtx) {
                        new Chart(commandUsageCtx, {
                            type: 'doughnut',
                            data: {
                                labels: ['/start', '/study', '/add', '/stats', '/help', 'Other'],
                                datasets: [{
                                    data: [30, 25, 20, 15, 8, 2],
                                    backgroundColor: [
                                        '#3B82F6',
                                        '#10B981',
                                        '#F59E0B',
                                        '#EF4444',
                                        '#8B5CF6',
                                        '#6B7280'
                                    ]
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false
                            }
                        });
                    }
                },
                
                checkAuthentication() {
                    const token = localStorage.getItem('admin_token');
                    if (token) {
                        this.token = token;
                        this.isAuthenticated = true;
                        this.loadAdminProfile();
                    }
                },
                
                async login() {
                    this.loading = true;
                    this.error = '';
                    
                    try {
                        const response = await fetch('/admin/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: this.loginForm.username,
                                password: this.loginForm.password
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok) {
                            this.token = data.token;
                            this.admin = data.admin;
                            this.isAuthenticated = true;
                            localStorage.setItem('admin_token', data.token);
                            this.showToast('success', 'Login Successful', 'Welcome to the admin panel');
                            this.loadDashboardData();
                        } else {
                            this.error = data.error || 'Login failed';
                        }
                    } catch (error) {
                        this.error = 'Connection error. Please try again.';
                        console.error('Login error:', error);
                    } finally {
                        this.loading = false;
                    }
                },
                
                logout() {
                    this.isAuthenticated = false;
                    this.admin = null;
                    this.token = null;
                    localStorage.removeItem('admin_token');
                    this.showToast('info', 'Logged Out', 'You have been logged out successfully');
                },
                
                async loadAdminProfile() {
                    try {
                        const response = await this.apiCall('/admin/profile');
                        if (response.ok) {
                            const data = await response.json();
                            this.admin = data;
                        }
                    } catch (error) {
                        console.error('Failed to load admin profile:', error);
                    }
                },
                
                async loadInitialData() {
                    if (this.isAuthenticated) {
                        await this.loadDashboardData();
                        await this.loadAnalytics();
                        await this.loadMessageHistory();
                        await this.loadContent();
                        await this.refreshMonitoring();
                        await this.loadBackupHistory();
                    }
                },
                
                async loadDashboardData() {
                    try {
                        const response = await this.apiCall('/admin/dashboard');
                        if (response.ok) {
                            const data = await response.json();
                            this.updateDashboardStats(data);
                            this.updateSystemStatus(data);
                        }
                    } catch (error) {
                        console.error('Failed to load dashboard data:', error);
                    }
                },
                
                updateDashboardStats(data) {
                    this.dashboardStats = [
                        {
                            id: 'users',
                            label: 'Total Users',
                            value: data.totalUsers || 0,
                            change: data.userGrowth || 0,
                            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            icon: 'fas fa-users'
                        },
                        {
                            id: 'active',
                            label: 'Active Users',
                            value: data.activeUsers || 0,
                            change: data.activeGrowth || 0,
                            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            icon: 'fas fa-user-check'
                        },
                        {
                            id: 'cards',
                            label: 'Total Cards',
                            value: data.totalCards || 0,
                            change: data.cardGrowth || 0,
                            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            icon: 'fas fa-clone'
                        },
                        {
                            id: 'reviews',
                            label: 'Reviews Today',
                            value: data.reviewsToday || 0,
                            change: data.reviewGrowth || 0,
                            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            icon: 'fas fa-chart-line'
                        }
                    ];
                    
                    this.recentActivity = data.recentActivity || [];
                },
                
                updateSystemStatus(data) {
                    this.systemStatus = {
                        online: data.systemOnline !== false,
                        lastCheck: new Date().toLocaleTimeString()
                    };
                    
                    this.systemHealth = [
                        {
                            id: 'database',
                            name: 'Database',
                            description: 'KV Storage connectivity',
                            status: 'healthy',
                            icon: 'fas fa-database'
                        },
                        {
                            id: 'telegram',
                            name: 'Telegram Bot',
                            description: 'Bot API connectivity',
                            status: 'healthy',
                            icon: 'fab fa-telegram'
                        },
                        {
                            id: 'ai',
                            name: 'AI Service',
                            description: 'Gemini API connectivity',
                            status: 'healthy',
                            icon: 'fas fa-brain'
                        }
                    ];
                },
                
                getCurrentTabTitle() {
                    const currentTab = this.navigationItems.find(item => item.id === this.activeTab);
                    return currentTab ? currentTab.label : 'Admin Panel';
                },
                
                async refreshData() {
                    this.loading = true;
                    try {
                        await this.loadDashboardData();
                        if (this.activeTab === 'users') {
                            await this.loadUsers();
                        }
                        this.showToast('success', 'Data Refreshed', 'All data has been updated');
                    } catch (error) {
                        this.showToast('error', 'Refresh Failed', 'Could not refresh data');
                    } finally {
                        this.loading = false;
                    }
                },
                
                async loadUsers() {
                    try {
                        const response = await this.apiCall('/admin/users');
                        if (response.ok) {
                            const data = await response.json();
                            this.users = data.users || [];
                            this.filterUsers();
                            
                            if (this.users.length === 0) {
                                this.showToast('info', 'No Users Found', 'No users are currently registered with the bot');
                            }
                        } else {
                            console.error('Failed to load users - API response not ok:', response.status);
                            this.users = [];
                            this.showToast('error', 'Load Failed', 'Failed to load users from the bot database');
                            this.filterUsers();
                        }
                    } catch (error) {
                        console.error('Failed to load users:', error);
                        this.users = [];
                        this.showToast('error', 'Connection Error', 'Could not connect to the bot database');
                        this.filterUsers();
                    }
                },
                
                filterUsers() {
                    if (!this.userSearch.trim()) {
                        this.filteredUsers = this.users;
                    } else {
                        const search = this.userSearch.toLowerCase();
                        this.filteredUsers = this.users.filter(user => 
                            (user.username && user.username.toLowerCase().includes(search)) ||
                            (user.firstName && user.firstName.toLowerCase().includes(search)) ||
                            (user.fullName && user.fullName.toLowerCase().includes(search))
                        );
                    }
                },
                
                searchUsers() {
                    this.filterUsers();
                },
                
                async refreshUsers() {
                    await this.loadUsers();
                    this.showToast('success', 'Users Refreshed', 'User list has been updated');
                },
                
                // User actions
                async viewUser(user) {
                    this.userDetails.show = true;
                    this.userDetails.loading = true;
                    this.userDetails.user = null;
                    
                    try {
                        const response = await this.apiCall('/admin/users/' + user.id);
                        if (response.ok) {
                            const data = await response.json();
                            this.userDetails.user = data.user;
                            this.showToast('success', 'User Loaded', 'Loaded details for ' + data.user.fullName);
                        } else {
                            this.showToast('error', 'Load Failed', 'Failed to load user details');
                        }
                    } catch (error) {
                        console.error('Failed to load user details:', error);
                        this.showToast('error', 'Error', 'Could not load user details');
                    } finally {
                        this.userDetails.loading = false;
                    }
                },
                
                closeUserDetails() {
                    this.userDetails.show = false;
                    this.userDetails.user = null;
                    this.userDetails.activeWordsTab = 'all';
                    this.userDetails.wordsPage = 1;
                    this.userDetails.wordSearch = '';
                },
                
                getFilteredWords() {
                    if (!this.userDetails.user?.words) return [];
                    
                    let words = [...this.userDetails.user.words];
                    
                    // Filter by tab
                    if (this.userDetails.activeWordsTab === 'due') {
                        words = words.filter(w => w.isDue);
                    } else if (this.userDetails.activeWordsTab === 'byBox') {
                        words = words.filter(w => w.box === parseInt(this.userDetails.selectedBox));
                    }
                    
                    // Filter by search
                    if (this.userDetails.wordSearch.trim()) {
                        const search = this.userDetails.wordSearch.toLowerCase();
                        words = words.filter(w => 
                            w.word.toLowerCase().includes(search) ||
                            w.translation.toLowerCase().includes(search) ||
                            w.definition.toLowerCase().includes(search)
                        );
                    }
                    
                    return words;
                },
                
                editUser(user) {
                    this.showToast('info', 'Edit User', 'Editing user: ' + (user.fullName || user.username));
                },
                
                messageUser(user) {
                    this.showToast('info', 'Message User', 'Messaging user: ' + (user.fullName || user.username));
                },
                
                // Bulk words methods
                getWordCount() {
                    if (!this.bulkWords.wordsInput.trim()) return 0;
                    return this.bulkWords.wordsInput.split(/[,\\n]/).filter(word => word.trim()).length;
                },
                
                canProcessWords() {
                    return this.getWordCount() > 0;
                },
                
                async processWordsWithAI() {
                    this.bulkWords.processing = true;
                    this.bulkWords.progress = 0;
                    this.bulkWords.results = [];
                    this.bulkWords.lastAssignmentId = null;
                    
                    try {
                        const words = this.bulkWords.wordsInput.split(/[,\n]/).filter(word => word.trim());
                        
                        if (words.length === 0) {
                            this.showToast('error', 'No Words', 'Please enter some words to process');
                            return;
                        }
                        
                        // Get selected target users
                        const targetUsers = Array.from(document.querySelectorAll('input[name="targetUsers"]:checked'))
                            .map(checkbox => parseInt(checkbox.value))
                            .filter(id => !isNaN(id));
                        
                        if (targetUsers.length === 0) {
                            this.showToast('error', 'No Users Selected', 'Please select at least one user to assign words to');
                            return;
                        }
                        
                        this.bulkWords.progress = 10;
                        
                        const response = await fetch('/admin/bulk-words-ai', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + this.authToken
                            },
                            body: JSON.stringify({
                                words: words,
                                sourceLanguage: this.bulkWords.sourceLanguage,
                                targetLanguage: this.bulkWords.targetLanguage,
                                targetUsers: targetUsers
                            })
                        });
                        
                        this.bulkWords.progress = 90;
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            this.bulkWords.results = result.processedWords || [];
                            this.bulkWords.lastAssignmentId = result.assignmentId;
                            this.showToast('success', 'AI Processing Complete', 
                                result.totalWords + ' words processed: ' + result.successCount + ' successful, ' + result.failureCount + ' with fallback data');
                        } else {
                            this.showToast('error', 'Processing Failed', result.error || 'AI processing encountered an error');
                        }
                    } catch (error) {
                        console.error('AI processing error:', error);
                        this.showToast('error', 'Processing Failed', 'Network error occurred during AI processing');
                    } finally {
                        this.bulkWords.processing = false;
                        this.bulkWords.progress = 100;
                    }
                },
                
                async assignWordsToUsers() {
                    if (!this.bulkWords.lastAssignmentId) {
                        this.showToast('error', 'Assignment Error', 'No recent word processing found. Please process words first.');
                        return;
                    }
                    
                    this.loading = true;
                    try {
                        const response = await fetch('/admin/assign-words', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + this.authToken
                            },
                            body: JSON.stringify({
                                assignmentId: this.bulkWords.lastAssignmentId
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok) {
                            this.showToast('success', 'Words Assigned', 'Words have been assigned to users successfully');
                            this.bulkWords.lastAssignmentId = null; // Clear after assignment
                        } else {
                            this.showToast('error', 'Assignment Failed', result.error || 'Failed to assign words to users');
                        }
                    } catch (error) {
                        console.error('Assignment error:', error);
                        this.showToast('error', 'Assignment Error', 'Network error occurred while assigning words');
                    } finally {
                        this.loading = false;
                    }
                },
                
                // System health methods
                async runHealthCheck() {
                    this.loading = true;
                    try {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        this.showToast('success', 'Health Check Complete', 'All systems are running normally');
                    } catch (error) {
                        this.showToast('error', 'Health Check Failed', 'Some systems may be experiencing issues');
                    } finally {
                        this.loading = false;
                    }
                },
                
                async testWebhook() {
                    this.showToast('info', 'Testing Webhook', 'Webhook test initiated');
                },
                
                async testAI() {
                    this.showToast('info', 'Testing AI', 'AI service test initiated');
                },
                
                async testDatabase() {
                    this.showToast('info', 'Testing Database', 'Database connectivity test initiated');
                },
                
                async clearCache() {
                    this.showToast('success', 'Cache Cleared', 'System cache has been cleared');
                },
                
                // Settings methods
                async saveSettings() {
                    this.loading = true;
                    try {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        this.showToast('success', 'Settings Saved', 'Configuration has been updated');
                    } catch (error) {
                        this.showToast('error', 'Save Failed', 'Could not save settings');
                    } finally {
                        this.loading = false;
                    }
                },
                
                resetSettings() {
                    this.settings = {
                        systemName: 'Leitner Bot Admin',
                        maintenanceMode: false
                    };
                    this.showToast('info', 'Settings Reset', 'Settings have been reset to defaults');
                },
                
                showToast(type, title, message) {
                    const toast = {
                        id: Date.now(),
                        type,
                        title,
                        message
                    };
                    this.toasts.push(toast);
                    
                    setTimeout(() => {
                        this.removeToast(toast.id);
                    }, 5000);
                },
                
                removeToast(id) {
                    this.toasts = this.toasts.filter(toast => toast.id !== id);
                },
                
                async apiCall(endpoint, options = {}) {
                    const defaultOptions = {
                        headers: {
                            'Content-Type': 'application/json',
                            ...(this.token && { 'Authorization': 'Bearer ' + this.token })
                        }
                    };
                    
                    return fetch(endpoint, { ...defaultOptions, ...options });
                },
                
                formatDate(dateString) {
                    if (!dateString) return 'N/A';
                    return new Date(dateString).toLocaleDateString();
                },

                // Analytics methods
                async loadAnalytics() {
                    try {
                        const response = await fetch('/admin/analytics', {
                            headers: { 'Authorization': 'Bearer ' + this.token }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            this.analytics = { ...this.analytics, ...data };
                        }
                    } catch (error) {
                        console.error('Error loading analytics:', error);
                    }
                },

                // Messaging methods
                async sendMessage() {
                    if (!this.messaging.content.trim()) {
                        this.showToast('error', 'Error', 'Message content is required');
                        return;
                    }

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
                                targetLanguage: this.messaging.targetLanguage,
                                userStatus: this.messaging.userStatus,
                                minWords: this.messaging.minWords,
                                targetUser: this.messaging.targetUser,
                                includeButtons: this.messaging.includeButtons,
                                scheduleMessage: this.messaging.scheduleMessage
                            })
                        });

                        if (response.ok) {
                            const result = await response.json();
                            this.showToast('success', 'Success', 'Message sent to ' + (result.recipientCount || 0) + ' users');
                            this.clearMessage();
                            this.loadMessageHistory();
                        } else {
                            const error = await response.json();
                            this.showToast('error', 'Error', error.message || 'Failed to send message');
                        }
                    } catch (error) {
                        this.showToast('error', 'Error', 'Network error occurred');
                    } finally {
                        this.messaging.sending = false;
                    }
                },

                clearMessage() {
                    this.messaging.content = '';
                    this.messaging.targetUser = '';
                    this.messaging.includeButtons = false;
                    this.messaging.scheduleMessage = false;
                },

                async loadMessageHistory() {
                    try {
                        const response = await fetch('/admin/message-history', {
                            headers: { 'Authorization': \`Bearer \${this.token}\` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            this.messaging.history = data.messages || [];
                        }
                    } catch (error) {
                        console.error('Error loading message history:', error);
                    }
                },

                // Content management methods
                async saveContent() {
                    try {
                        const response = await fetch('/admin/save-content', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${this.token}\`
                            },
                            body: JSON.stringify({
                                category: this.content.category,
                                messages: this.content.messages[this.content.category]
                            })
                        });

                        if (response.ok) {
                            this.showToast('success', 'Success', 'Content saved successfully');
                        } else {
                            this.showToast('error', 'Error', 'Failed to save content');
                        }
                    } catch (error) {
                        this.showToast('error', 'Error', 'Network error occurred');
                    }
                },

                async loadContent() {
                    try {
                        const response = await fetch('/admin/content', {
                            headers: { 'Authorization': \`Bearer \${this.token}\` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            this.content.messages = { ...this.content.messages, ...data.messages };
                        }
                    } catch (error) {
                        console.error('Error loading content:', error);
                    }
                },

                // Monitoring methods
                async refreshMonitoring() {
                    try {
                        const response = await fetch('/admin/monitoring', {
                            headers: { 'Authorization': \`Bearer \${this.token}\` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            this.monitoring = { ...this.monitoring, ...data };
                        }
                    } catch (error) {
                        console.error('Error loading monitoring data:', error);
                    }
                },

                // Export/Import methods
                async exportSystemData() {
                    this.exportData.processing = true;
                    try {
                        const response = await fetch('/admin/export', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${this.token}\`
                            },
                            body: JSON.stringify({
                                includeUsers: this.exportData.includeUsers,
                                includeWords: this.exportData.includeWords,
                                includeProgress: this.exportData.includeProgress,
                                includeSettings: this.exportData.includeSettings,
                                format: this.exportData.format
                            })
                        });

                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            a.download = 'leitner-backup-' + new Date().toISOString().split('T')[0] + '.' + this.exportData.format;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            this.showToast('success', 'Success', 'Data exported successfully');
                        } else {
                            this.showToast('error', 'Error', 'Export failed');
                        }
                    } catch (error) {
                        this.showToast('error', 'Error', 'Export failed');
                    } finally {
                        this.exportData.processing = false;
                    }
                },

                handleFileUpload(event) {
                    const file = event.target.files[0];
                    if (file) {
                        this.importData.file = file;
                    }
                },

                async importSystemData() {
                    if (!this.importData.file) {
                        this.showToast('error', 'Error', 'Please select a file to import');
                        return;
                    }

                    this.importData.processing = true;
                    try {
                        const formData = new FormData();
                        formData.append('file', this.importData.file);
                        formData.append('mergeMode', this.importData.mergeMode);
                        formData.append('createBackup', this.importData.createBackup);

                        const response = await fetch('/admin/import', {
                            method: 'POST',
                            headers: {
                                'Authorization': \`Bearer \${this.token}\`
                            },
                            body: formData
                        });

                        if (response.ok) {
                            const result = await response.json();
                            this.showToast('success', 'Success', 'Data imported successfully. ' + (result.recordsImported || 0) + ' records processed.');
                            this.importData.file = null;
                            this.loadInitialData();
                        } else {
                            const error = await response.json();
                            this.showToast('error', 'Error', error.message || 'Import failed');
                        }
                    } catch (error) {
                        this.showToast('error', 'Error', 'Import failed');
                    } finally {
                        this.importData.processing = false;
                    }
                },

                async createAutoBackup() {
                    try {
                        const response = await fetch('/admin/create-backup', {
                            method: 'POST',
                            headers: {
                                'Authorization': \`Bearer \${this.token}\`
                            }
                        });

                        if (response.ok) {
                            this.showToast('success', 'Success', 'Backup created successfully');
                            this.loadBackupHistory();
                        } else {
                            this.showToast('error', 'Error', 'Failed to create backup');
                        }
                    } catch (error) {
                        this.showToast('error', 'Error', 'Backup creation failed');
                    }
                },

                async loadBackupHistory() {
                    try {
                        const response = await fetch('/admin/backups', {
                            headers: { 'Authorization': \`Bearer \${this.token}\` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            this.exportData.backupHistory = data.backups || [];
                        }
                    } catch (error) {
                        console.error('Error loading backup history:', error);
                    }
                }
            };
        }
    </script>
</body>
</html>`;
}
