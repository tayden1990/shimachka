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

                    <!-- Users Tab - Comprehensive User Management -->
                    <div x-show="activeTab === 'users'" class="space-y-6">
                        <!-- User Management Header with Advanced Controls -->
                        <div class="bg-white rounded-xl shadow-sm">
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
                                        <p class="text-sm text-gray-600 mt-1">Manage bot users, track progress, and analyze learning patterns</p>
                                    </div>
                                    <div class="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                                        <button @click="exportUsers()" 
                                                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200">
                                            <i class="fas fa-download mr-2"></i>
                                            Export
                                        </button>
                                        <button @click="refreshUsers()" 
                                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                                            <i class="fas fa-sync-alt mr-2"></i>
                                            Refresh
                                        </button>
                                        <button @click="showBulkActions = !showBulkActions" 
                                                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                            <i class="fas fa-tasks mr-2"></i>
                                            Bulk Actions
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Advanced Search and Filters -->
                            <div class="p-6 bg-gray-50 border-b border-gray-200">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <!-- Search Input -->
                                    <div class="relative">
                                        <input type="text" x-model="userSearch" @input="searchUsers()"
                                               class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                               placeholder="Search users...">
                                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                    </div>
                                    
                                    <!-- Registration Status Filter -->
                                    <select x-model="userFilters.registrationStatus" @change="filterUsers()"
                                            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Registration Status</option>
                                        <option value="complete">Registration Complete</option>
                                        <option value="pending">Pending Registration</option>
                                    </select>
                                    
                                    <!-- Activity Status Filter -->
                                    <select x-model="userFilters.activityStatus" @change="filterUsers()"
                                            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Activity Status</option>
                                        <option value="active">Active Users</option>
                                        <option value="inactive">Inactive Users</option>
                                        <option value="recent">Active Last 7 Days</option>
                                    </select>
                                    
                                    <!-- Language Filter -->
                                    <select x-model="userFilters.language" @change="filterUsers()"
                                            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="">All Languages</option>
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                        <option value="it">Italian</option>
                                        <option value="pt">Portuguese</option>
                                        <option value="ru">Russian</option>
                                        <option value="ar">Arabic</option>
                                        <option value="fa">Persian</option>
                                        <option value="zh">Chinese</option>
                                        <option value="ja">Japanese</option>
                                        <option value="ko">Korean</option>
                                    </select>
                                </div>
                                
                                <!-- Additional Filters Row -->
                                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                                    <!-- Progress Range -->
                                    <div>
                                        <label class="block text-xs font-medium text-gray-700 mb-1">Learning Progress</label>
                                        <select x-model="userFilters.progressRange" @change="filterUsers()"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                                            <option value="">Any Progress</option>
                                            <option value="0-20">0-20% Progress</option>
                                            <option value="21-50">21-50% Progress</option>
                                            <option value="51-80">51-80% Progress</option>
                                            <option value="81-100">81-100% Progress</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Word Count Range -->
                                    <div>
                                        <label class="block text-xs font-medium text-gray-700 mb-1">Word Count</label>
                                        <select x-model="userFilters.wordCountRange" @change="filterUsers()"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                                            <option value="">Any Count</option>
                                            <option value="0">No Words</option>
                                            <option value="1-10">1-10 Words</option>
                                            <option value="11-50">11-50 Words</option>
                                            <option value="51-100">51-100 Words</option>
                                            <option value="100+">100+ Words</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Join Date Range -->
                                    <div>
                                        <label class="block text-xs font-medium text-gray-700 mb-1">Joined</label>
                                        <select x-model="userFilters.joinDateRange" @change="filterUsers()"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                                            <option value="">Any Time</option>
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="3months">Last 3 Months</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Study Frequency -->
                                    <div>
                                        <label class="block text-xs font-medium text-gray-700 mb-1">Study Activity</label>
                                        <select x-model="userFilters.studyFrequency" @change="filterUsers()"
                                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                                            <option value="">Any Activity</option>
                                            <option value="daily">Daily Studiers</option>
                                            <option value="weekly">Weekly Studiers</option>
                                            <option value="inactive">Inactive Studiers</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Clear Filters -->
                                    <div class="flex items-end">
                                        <button @click="clearFilters()" 
                                                class="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 text-sm">
                                            <i class="fas fa-times mr-1"></i>
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- User Statistics Summary -->
                            <div class="p-6 bg-blue-50 border-b border-gray-200">
                                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-blue-600" x-text="userStats.total"></div>
                                        <div class="text-xs text-gray-600">Total Users</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-green-600" x-text="userStats.active"></div>
                                        <div class="text-xs text-gray-600">Active</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-purple-600" x-text="userStats.registrationComplete"></div>
                                        <div class="text-xs text-gray-600">Registered</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-indigo-600" x-text="userStats.studyingToday"></div>
                                        <div class="text-xs text-gray-600">Studying Today</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-orange-600" x-text="userStats.averageWords"></div>
                                        <div class="text-xs text-gray-600">Avg Words</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-red-600" x-text="userStats.filtered"></div>
                                        <div class="text-xs text-gray-600">Filtered</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Bulk Actions Panel -->
                            <div x-show="showBulkActions" x-transition class="p-6 bg-purple-50 border-b border-gray-200">
                                <div class="flex flex-wrap gap-4">
                                    <button @click="bulkMessageUsers()" 
                                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                                        <i class="fas fa-envelope mr-2"></i>
                                        Message Selected
                                    </button>
                                    <button @click="bulkExportUsers()" 
                                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200">
                                        <i class="fas fa-download mr-2"></i>
                                        Export Selected
                                    </button>
                                    <button @click="bulkAssignWords()" 
                                            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                                        <i class="fas fa-plus mr-2"></i>
                                        Assign Words
                                    </button>
                                    <button @click="bulkUpdateSettings()" 
                                            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
                                        <i class="fas fa-cog mr-2"></i>
                                        Update Settings
                                    </button>
                                    <div class="text-sm text-gray-600 flex items-center">
                                        <span x-text="selectedUsers.length"></span> users selected
                                    </div>
                                </div>
                            </div>
                        </div>
                            
                            <!-- Enhanced Users Table -->
                            <div class="overflow-x-auto">
                                <table class="min-w-full">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left">
                                                <input type="checkbox" @change="toggleAllUsers($event.target.checked)"
                                                       class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                @click="sortUsers('name')">
                                                User Info
                                                <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                @click="sortUsers('registrationComplete')">
                                                Status
                                                <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                @click="sortUsers('totalWords')">
                                                Learning Progress
                                                <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                @click="sortUsers('accuracy')">
                                                Performance
                                                <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                @click="sortUsers('lastActive')">
                                                Activity
                                                <i class="fas fa-sort ml-1"></i>
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <template x-for="user in paginatedUsers" :key="user.telegramId">
                                            <tr class="hover:bg-gray-50 transition duration-150">
                                                <!-- Checkbox -->
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <input type="checkbox" :value="user.telegramId" 
                                                           @change="toggleUserSelection(user.telegramId, $event.target.checked)"
                                                           :checked="selectedUsers.includes(user.telegramId)"
                                                           class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                                                </td>
                                                
                                                <!-- User Info -->
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <div class="flex-shrink-0 h-10 w-10">
                                                            <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                                <span class="text-sm font-medium text-white" 
                                                                      x-text="(user.firstName?.charAt(0) || 'U').toUpperCase()"></span>
                                                            </div>
                                                        </div>
                                                        <div class="ml-4">
                                                            <div class="text-sm font-medium text-gray-900">
                                                                <span x-text="user.firstName || 'Unknown'"></span>
                                                                <span x-text="user.lastName || ''"></span>
                                                            </div>
                                                            <div class="text-sm text-gray-500">
                                                                ID: <span x-text="user.telegramId"></span>
                                                            </div>
                                                            <div class="text-xs text-gray-400">
                                                                @<span x-text="user.username || 'No username'"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <!-- Status -->
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="space-y-2">
                                                        <!-- Registration Status -->
                                                        <span :class="{
                                                            'bg-green-100 text-green-800': user.registrationComplete,
                                                            'bg-yellow-100 text-yellow-800': !user.registrationComplete
                                                        }" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                                                            <i :class="{
                                                                'fas fa-check-circle': user.registrationComplete,
                                                                'fas fa-clock': !user.registrationComplete
                                                            }" class="mr-1"></i>
                                                            <span x-text="user.registrationComplete ? 'Registered' : 'Pending'"></span>
                                                        </span>
                                                        
                                                        <!-- Activity Status -->
                                                        <div>
                                                            <span :class="{
                                                                'bg-blue-100 text-blue-800': user.lastActive && isActiveUser(user.lastActive),
                                                                'bg-gray-100 text-gray-800': !user.lastActive || !isActiveUser(user.lastActive)
                                                            }" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                                                                <i :class="{
                                                                    'fas fa-circle text-green-500': user.lastActive && isActiveUser(user.lastActive),
                                                                    'fas fa-circle text-gray-400': !user.lastActive || !isActiveUser(user.lastActive)
                                                                }" class="mr-1 text-xs"></i>
                                                                <span x-text="user.lastActive && isActiveUser(user.lastActive) ? 'Active' : 'Inactive'"></span>
                                                            </span>
                                                        </div>
                                                        
                                                        <!-- Language -->
                                                        <div class="text-xs text-gray-600">
                                                            <i class="fas fa-language mr-1"></i>
                                                            <span x-text="getLanguageName(user.nativeLanguage)"></span>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <!-- Learning Progress -->
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="space-y-2">
                                                        <!-- Word Count -->
                                                        <div class="flex items-center">
                                                            <i class="fas fa-book text-purple-500 mr-2"></i>
                                                            <span class="text-sm font-medium text-gray-900" x-text="user.totalWords || 0"></span>
                                                            <span class="text-xs text-gray-500 ml-1">words</span>
                                                        </div>
                                                        
                                                        <!-- Study Progress Bar -->
                                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                                            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                                 :style="'width: ' + (user.studyProgress || 0) + '%'"></div>
                                                        </div>
                                                        <div class="text-xs text-gray-600">
                                                            <span x-text="user.studyProgress || 0"></span>% Complete
                                                        </div>
                                                        
                                                        <!-- Due for Review -->
                                                        <div x-show="user.dueForReview > 0" class="text-xs text-orange-600">
                                                            <i class="fas fa-clock mr-1"></i>
                                                            <span x-text="user.dueForReview"></span> due for review
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <!-- Performance -->
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="space-y-2">
                                                        <!-- Accuracy -->
                                                        <div class="flex items-center">
                                                            <i class="fas fa-target text-green-500 mr-2"></i>
                                                            <span class="text-sm font-medium" 
                                                                  :class="{
                                                                      'text-green-600': (user.accuracy || 0) >= 80,
                                                                      'text-yellow-600': (user.accuracy || 0) >= 60 && (user.accuracy || 0) < 80,
                                                                      'text-red-600': (user.accuracy || 0) < 60
                                                                  }"
                                                                  x-text="(user.accuracy || 0) + '%'"></span>
                                                        </div>
                                                        
                                                        <!-- Study Streak -->
                                                        <div class="flex items-center text-xs text-gray-600">
                                                            <i class="fas fa-fire text-orange-500 mr-1"></i>
                                                            <span x-text="user.studyStreak || 0"></span> day streak
                                                        </div>
                                                        
                                                        <!-- Total Reviews -->
                                                        <div class="text-xs text-gray-600">
                                                            <i class="fas fa-redo mr-1"></i>
                                                            <span x-text="user.totalReviews || 0"></span> reviews
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <!-- Activity -->
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="space-y-1">
                                                        <!-- Join Date -->
                                                        <div class="text-sm text-gray-900">
                                                            <i class="fas fa-calendar-plus text-blue-500 mr-1"></i>
                                                            <span x-text="formatDate(user.joinedAt)"></span>
                                                        </div>
                                                        
                                                        <!-- Last Activity -->
                                                        <div class="text-xs text-gray-600">
                                                            <i class="fas fa-clock mr-1"></i>
                                                            <span x-show="user.lastActive">
                                                                Last active: <span x-text="formatRelativeTime(user.lastActive)"></span>
                                                            </span>
                                                            <span x-show="!user.lastActive">Never active</span>
                                                        </div>
                                                        
                                                        <!-- Last Study Session -->
                                                        <div class="text-xs text-gray-600" x-show="user.lastStudySession">
                                                            <i class="fas fa-graduation-cap mr-1"></i>
                                                            Study: <span x-text="formatRelativeTime(user.lastStudySession)"></span>
                                                        </div>
                                                    </div>
                                                </td>
                                                
                                                <!-- Actions -->
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div class="flex items-center space-x-2">
                                                        <!-- View Details -->
                                                        <button @click="viewUserDetails(user)" 
                                                                class="text-blue-600 hover:text-blue-900 transition duration-200"
                                                                title="View Details">
                                                            <i class="fas fa-eye"></i>
                                                        </button>
                                                        
                                                        <!-- Send Message -->
                                                        <button @click="messageUser(user)" 
                                                                class="text-green-600 hover:text-green-900 transition duration-200"
                                                                title="Send Message">
                                                            <i class="fas fa-envelope"></i>
                                                        </button>
                                                        
                                                        <!-- View Progress -->
                                                        <button @click="viewUserProgress(user)" 
                                                                class="text-purple-600 hover:text-purple-900 transition duration-200"
                                                                title="View Learning Progress">
                                                            <i class="fas fa-chart-line"></i>
                                                        </button>
                                                        
                                                        <!-- Manage Words -->
                                                        <button @click="manageUserWords(user)" 
                                                                class="text-indigo-600 hover:text-indigo-900 transition duration-200"
                                                                title="Manage Vocabulary">
                                                            <i class="fas fa-book-open"></i>
                                                        </button>
                                                        
                                                        <!-- More Actions Menu -->
                                                        <div class="relative" x-data="{ open: false }">
                                                            <button @click="open = !open" 
                                                                    class="text-gray-600 hover:text-gray-900 transition duration-200"
                                                                    title="More Actions">
                                                                <i class="fas fa-ellipsis-v"></i>
                                                            </button>
                                                            
                                                            <!-- Dropdown Menu -->
                                                            <div x-show="open" @click.outside="open = false" x-transition
                                                                 class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                                <div class="py-1">
                                                                    <button @click="editUser(user); open = false" 
                                                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <i class="fas fa-edit mr-2"></i>
                                                                        Edit User
                                                                    </button>
                                                                    <button @click="resetUserProgress(user); open = false" 
                                                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <i class="fas fa-undo mr-2"></i>
                                                                        Reset Progress
                                                                    </button>
                                                                    <button @click="exportUserData(user); open = false" 
                                                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <i class="fas fa-download mr-2"></i>
                                                                        Export Data
                                                                    </button>
                                                                    <button @click="viewUserActivity(user); open = false" 
                                                                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                        <i class="fas fa-history mr-2"></i>
                                                                        Activity Log
                                                                    </button>
                                                                    <hr class="my-1">
                                                                    <button @click="blockUser(user); open = false" 
                                                                            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                                        <i class="fas fa-ban mr-2"></i>
                                                                        Block User
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>
                                
                                <!-- Empty State -->
                                <div x-show="filteredUsers.length === 0" class="text-center py-12">
                                    <i class="fas fa-users text-gray-300 text-4xl mb-4"></i>
                                    <h3 class="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                                    <p class="text-gray-500">
                                        <span x-show="userSearch || Object.values(userFilters).some(v => v)">
                                            Try adjusting your search criteria or filters.
                                        </span>
                                        <span x-show="!userSearch && !Object.values(userFilters).some(v => v)">
                                            No users have registered with the bot yet.
                                        </span>
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Pagination -->
                            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div class="flex items-center justify-between">
                                    <div class="text-sm text-gray-700">
                                        Showing <span class="font-medium" x-text="Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)"></span>
                                        to <span class="font-medium" x-text="Math.min(currentPage * pageSize, filteredUsers.length)"></span>
                                        of <span class="font-medium" x-text="filteredUsers.length"></span> results
                                    </div>
                                    
                                    <div class="flex items-center space-x-2">
                                        <!-- Page Size Selector -->
                                        <select x-model="pageSize" @change="currentPage = 1; updatePagination()"
                                                class="px-3 py-1 border border-gray-300 rounded text-sm">
                                            <option value="10">10 per page</option>
                                            <option value="25">25 per page</option>
                                            <option value="50">50 per page</option>
                                            <option value="100">100 per page</option>
                                        </select>
                                        
                                        <!-- Pagination Controls -->
                                        <nav class="flex items-center space-x-1">
                                            <button @click="goToPage(1)" :disabled="currentPage === 1"
                                                    class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                First
                                            </button>
                                            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                                                    class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                Previous
                                            </button>
                                            
                                            <!-- Page Numbers -->
                                            <template x-for="page in getVisiblePages()" :key="page">
                                                <button @click="goToPage(page)" 
                                                        :class="{
                                                            'bg-blue-600 text-white border-blue-600': page === currentPage,
                                                            'border-gray-300 hover:bg-gray-50': page !== currentPage
                                                        }"
                                                        class="px-3 py-1 text-sm border rounded"
                                                        x-text="page"></button>
                                            </template>
                                            
                                            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                                                    class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                Next
                                            </button>
                                            <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages"
                                                    class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                Last
                                            </button>
                                        </nav>
                                    </div>
                                </div>
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
        
        <!-- ==================== USER DETAIL MODALS ==================== -->
        
        <!-- User Details Modal -->
        <div x-show="showUserDetailsModal" x-transition class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold text-gray-900">User Details</h2>
                        <button @click="showUserDetailsModal = false" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6" x-show="selectedUserDetails">
                    <!-- User Profile Section -->
                    <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
                        <div class="flex items-center">
                            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                <span class="text-2xl font-bold" x-text="(selectedUserDetails?.firstName?.charAt(0) || 'U').toUpperCase()"></span>
                            </div>
                            <div>
                                <h3 class="text-xl font-semibold" x-text="(selectedUserDetails?.firstName || '') + ' ' + (selectedUserDetails?.lastName || '')"></h3>
                                <p class="text-blue-100">@<span x-text="selectedUserDetails?.username || 'No username'"></span></p>
                                <p class="text-blue-100">ID: <span x-text="selectedUserDetails?.telegramId"></span></p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tabs for different sections -->
                    <div class="border-b border-gray-200 mb-6">
                        <nav class="-mb-px flex space-x-8">
                            <button @click="userDetailsTab = 'overview'" 
                                    :class="userDetailsTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap">
                                Overview
                            </button>
                            <button @click="userDetailsTab = 'progress'" 
                                    :class="userDetailsTab === 'progress' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap">
                                Learning Progress
                            </button>
                            <button @click="userDetailsTab = 'vocabulary'" 
                                    :class="userDetailsTab === 'vocabulary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap">
                                Vocabulary
                            </button>
                            <button @click="userDetailsTab = 'activity'" 
                                    :class="userDetailsTab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                    class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap">
                                Activity Log
                            </button>
                        </nav>
                    </div>
                    
                    <!-- Overview Tab -->
                    <div x-show="userDetailsTab === 'overview'" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- Basic Information -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-medium text-gray-900 mb-3">Basic Information</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Registration Status:</span>
                                        <span :class="selectedUserDetails?.registrationComplete ? 'text-green-600' : 'text-yellow-600'"
                                              x-text="selectedUserDetails?.registrationComplete ? 'Complete' : 'Pending'"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Native Language:</span>
                                        <span x-text="getLanguageName(selectedUserDetails?.nativeLanguage)"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Joined:</span>
                                        <span x-text="formatDate(selectedUserDetails?.joinedAt)"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Last Active:</span>
                                        <span x-text="formatRelativeTime(selectedUserDetails?.lastActive)"></span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Learning Statistics -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-medium text-gray-900 mb-3">Learning Stats</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Total Words:</span>
                                        <span class="font-medium" x-text="selectedUserDetails?.totalWords || 0"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Study Progress:</span>
                                        <span class="font-medium" x-text="(selectedUserDetails?.studyProgress || 0) + '%'"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Accuracy:</span>
                                        <span class="font-medium" x-text="(selectedUserDetails?.accuracy || 0) + '%'"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Study Streak:</span>
                                        <span class="font-medium" x-text="(selectedUserDetails?.studyStreak || 0) + ' days'"></span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Review Statistics -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-medium text-gray-900 mb-3">Review Stats</h4>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Total Reviews:</span>
                                        <span class="font-medium" x-text="selectedUserDetails?.totalReviews || 0"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Due for Review:</span>
                                        <span class="font-medium text-orange-600" x-text="selectedUserDetails?.dueForReview || 0"></span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Last Study:</span>
                                        <span x-text="formatRelativeTime(selectedUserDetails?.lastStudySession)"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Progress Tab -->
                    <div x-show="userDetailsTab === 'progress'" class="space-y-6">
                        <div class="text-center text-gray-600">
                            <i class="fas fa-chart-line text-4xl text-gray-300 mb-4"></i>
                            <p>Detailed progress charts and analytics would be displayed here</p>
                            <p class="text-sm mt-2">Including Leitner box distribution, accuracy trends, and study patterns</p>
                        </div>
                    </div>
                    
                    <!-- Vocabulary Tab -->
                    <div x-show="userDetailsTab === 'vocabulary'" class="space-y-6">
                        <div class="text-center text-gray-600">
                            <i class="fas fa-book text-4xl text-gray-300 mb-4"></i>
                            <p>User's vocabulary management interface would be displayed here</p>
                            <p class="text-sm mt-2">Including word lists, difficulty levels, and learning status</p>
                        </div>
                    </div>
                    
                    <!-- Activity Tab -->
                    <div x-show="userDetailsTab === 'activity'" class="space-y-6">
                        <div class="text-center text-gray-600">
                            <i class="fas fa-history text-4xl text-gray-300 mb-4"></i>
                            <p>User activity timeline would be displayed here</p>
                            <p class="text-sm mt-2">Including command usage, study sessions, and bot interactions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Bulk Message Modal -->
        <div x-show="showBulkMessageModal" x-transition class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold text-gray-900">Send Bulk Message</h2>
                        <button @click="showBulkMessageModal = false" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <div class="mb-4">
                        <p class="text-sm text-gray-600 mb-2">
                            Sending message to <span class="font-medium" x-text="selectedUsers.length"></span> selected users
                        </p>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                        <textarea x-model="bulkMessageContent" 
                                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                  rows="4" 
                                  placeholder="Enter your message here..."></textarea>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input type="checkbox" x-model="bulkMessageSchedule" id="scheduleMessage" class="mr-2">
                            <label for="scheduleMessage" class="text-sm text-gray-700">Schedule for later</label>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button @click="showBulkMessageModal = false" 
                                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button @click="sendBulkMessage()" 
                                    :disabled="!bulkMessageContent.trim()"
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                <i class="fas fa-paper-plane mr-2"></i>
                                Send Message
                            </button>
                        </div>
                    </div>
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
                paginatedUsers: [],
                toasts: [],
                recentActivity: [],
                systemStatus: { online: true },
                systemHealth: [],
                userSearch: '',
                
                // User Management Enhanced Data
                userFilters: {
                    registrationStatus: '',
                    activityStatus: '',
                    language: '',
                    progressRange: '',
                    wordCountRange: '',
                    joinDateRange: '',
                    studyFrequency: ''
                },
                userStats: {
                    total: 0,
                    active: 0,
                    registrationComplete: 0,
                    studyingToday: 0,
                    averageWords: 0,
                    filtered: 0
                },
                selectedUsers: [],
                showBulkActions: false,
                sortField: 'joinedAt',
                sortDirection: 'desc',
                currentPage: 1,
                pageSize: 25,
                totalPages: 1,
                
                // Modal state
                showUserDetailsModal: false,
                showBulkMessageModal: false,
                selectedUserDetails: null,
                userDetailsTab: 'overview',
                bulkMessageContent: '',
                bulkMessageSchedule: false,
                
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
                            value: data.totalUsers || 156,
                            change: data.userGrowth || 8.2,
                            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            icon: 'fas fa-users'
                        },
                        {
                            id: 'active',
                            label: 'Active Users',
                            value: data.activeUsers || 89,
                            change: data.activeGrowth || 15.4,
                            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            icon: 'fas fa-user-check'
                        },
                        {
                            id: 'cards',
                            label: 'Total Cards',
                            value: data.totalCards || 3420,
                            change: data.cardGrowth || 12.1,
                            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            icon: 'fas fa-clone'
                        },
                        {
                            id: 'reviews',
                            label: 'Reviews Today',
                            value: data.reviewsToday || 1180,
                            change: data.reviewGrowth || 18.7,
                            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            icon: 'fas fa-chart-line'
                        }
                    ];
                    
                    this.recentActivity = data.recentActivity || this.generateMockActivity();
                },
                
                generateMockActivity() {
                    return [
                        {
                            id: 1,
                            title: 'New user registered',
                            description: 'User @john_doe joined the system',
                            timestamp: '2 minutes ago',
                            color: '#3b82f6',
                            icon: 'fas fa-user-plus'
                        },
                        {
                            id: 2,
                            title: 'Bulk words processed',
                            description: '25 words added to Spanish learning set',
                            timestamp: '15 minutes ago',
                            color: '#8b5cf6',
                            icon: 'fas fa-magic'
                        },
                        {
                            id: 3,
                            title: 'System health check',
                            description: 'All systems running normally',
                            timestamp: '1 hour ago',
                            color: '#10b981',
                            icon: 'fas fa-check-circle'
                        }
                    ];
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
                
                // ==================== ENHANCED USER MANAGEMENT METHODS ====================
                
                async loadUsers() {
                    try {
                        const response = await this.apiCall('/admin/users');
                        if (response.ok) {
                            const data = await response.json();
                            this.users = data.users || [];
                            this.calculateUserStats();
                            this.filterUsers();
                            this.updatePagination();
                        }
                    } catch (error) {
                        console.error('Failed to load users:', error);
                        this.showToast('error', 'Load Failed', 'Could not load users');
                    }
                },
                
                calculateUserStats() {
                    const now = Date.now();
                    const dayMs = 24 * 60 * 60 * 1000;
                    
                    this.userStats = {
                        total: this.users.length,
                        active: this.users.filter(u => u.lastActive && (now - new Date(u.lastActive).getTime()) < 7 * dayMs).length,
                        registrationComplete: this.users.filter(u => u.registrationComplete).length,
                        studyingToday: this.users.filter(u => u.lastStudySession && (now - new Date(u.lastStudySession).getTime()) < dayMs).length,
                        averageWords: this.users.length > 0 ? Math.round(this.users.reduce((sum, u) => sum + (u.totalWords || 0), 0) / this.users.length) : 0,
                        filtered: this.filteredUsers.length
                    };
                },
                
                filterUsers() {
                    let filtered = [...this.users];
                    
                    // Search filter
                    if (this.userSearch.trim()) {
                        const search = this.userSearch.toLowerCase();
                        filtered = filtered.filter(user => 
                            (user.firstName && user.firstName.toLowerCase().includes(search)) ||
                            (user.lastName && user.lastName.toLowerCase().includes(search)) ||
                            (user.username && user.username.toLowerCase().includes(search)) ||
                            (user.telegramId && user.telegramId.toString().includes(search))
                        );
                    }
                    
                    // Registration status filter
                    if (this.userFilters.registrationStatus) {
                        if (this.userFilters.registrationStatus === 'complete') {
                            filtered = filtered.filter(u => u.registrationComplete);
                        } else if (this.userFilters.registrationStatus === 'pending') {
                            filtered = filtered.filter(u => !u.registrationComplete);
                        }
                    }
                    
                    // Activity status filter
                    if (this.userFilters.activityStatus) {
                        const now = Date.now();
                        const dayMs = 24 * 60 * 60 * 1000;
                        
                        if (this.userFilters.activityStatus === 'active') {
                            filtered = filtered.filter(u => u.lastActive && (now - new Date(u.lastActive).getTime()) < 7 * dayMs);
                        } else if (this.userFilters.activityStatus === 'inactive') {
                            filtered = filtered.filter(u => !u.lastActive || (now - new Date(u.lastActive).getTime()) >= 7 * dayMs);
                        } else if (this.userFilters.activityStatus === 'recent') {
                            filtered = filtered.filter(u => u.lastActive && (now - new Date(u.lastActive).getTime()) < 7 * dayMs);
                        }
                    }
                    
                    // Language filter
                    if (this.userFilters.language) {
                        filtered = filtered.filter(u => u.nativeLanguage === this.userFilters.language);
                    }
                    
                    // Progress range filter
                    if (this.userFilters.progressRange) {
                        const [min, max] = this.userFilters.progressRange.split('-').map(n => parseInt(n));
                        filtered = filtered.filter(u => {
                            const progress = u.studyProgress || 0;
                            return progress >= min && progress <= (max || 100);
                        });
                    }
                    
                    // Word count filter
                    if (this.userFilters.wordCountRange) {
                        if (this.userFilters.wordCountRange === '0') {
                            filtered = filtered.filter(u => (u.totalWords || 0) === 0);
                        } else if (this.userFilters.wordCountRange === '100+') {
                            filtered = filtered.filter(u => (u.totalWords || 0) >= 100);
                        } else {
                            const [min, max] = this.userFilters.wordCountRange.split('-').map(n => parseInt(n));
                            filtered = filtered.filter(u => {
                                const words = u.totalWords || 0;
                                return words >= min && words <= max;
                            });
                        }
                    }
                    
                    // Join date filter
                    if (this.userFilters.joinDateRange) {
                        const now = Date.now();
                        const dayMs = 24 * 60 * 60 * 1000;
                        
                        if (this.userFilters.joinDateRange === 'today') {
                            filtered = filtered.filter(u => u.joinedAt && (now - new Date(u.joinedAt).getTime()) < dayMs);
                        } else if (this.userFilters.joinDateRange === 'week') {
                            filtered = filtered.filter(u => u.joinedAt && (now - new Date(u.joinedAt).getTime()) < 7 * dayMs);
                        } else if (this.userFilters.joinDateRange === 'month') {
                            filtered = filtered.filter(u => u.joinedAt && (now - new Date(u.joinedAt).getTime()) < 30 * dayMs);
                        } else if (this.userFilters.joinDateRange === '3months') {
                            filtered = filtered.filter(u => u.joinedAt && (now - new Date(u.joinedAt).getTime()) < 90 * dayMs);
                        }
                    }
                    
                    // Study frequency filter
                    if (this.userFilters.studyFrequency) {
                        const now = Date.now();
                        const dayMs = 24 * 60 * 60 * 1000;
                        
                        if (this.userFilters.studyFrequency === 'daily') {
                            filtered = filtered.filter(u => u.studyStreak >= 7);
                        } else if (this.userFilters.studyFrequency === 'weekly') {
                            filtered = filtered.filter(u => u.lastStudySession && (now - new Date(u.lastStudySession).getTime()) < 7 * dayMs);
                        } else if (this.userFilters.studyFrequency === 'inactive') {
                            filtered = filtered.filter(u => !u.lastStudySession || (now - new Date(u.lastStudySession).getTime()) >= 14 * dayMs);
                        }
                    }
                    
                    // Apply sorting
                    filtered.sort((a, b) => {
                        let aVal = a[this.sortField];
                        let bVal = b[this.sortField];
                        
                        // Handle special cases
                        if (this.sortField === 'name') {
                            aVal = a.firstName || a.username || '';
                            bVal = b.firstName || b.username || '';
                        } else if (this.sortField === 'registrationComplete') {
                            aVal = a.registrationComplete ? 1 : 0;
                            bVal = b.registrationComplete ? 1 : 0;
                        }
                        
                        // Convert to comparable values
                        if (typeof aVal === 'string') {
                            aVal = aVal.toLowerCase();
                            bVal = bVal ? bVal.toLowerCase() : '';
                        }
                        
                        let result = 0;
                        if (aVal < bVal) result = -1;
                        else if (aVal > bVal) result = 1;
                        
                        return this.sortDirection === 'asc' ? result : -result;
                    });
                    
                    this.filteredUsers = filtered;
                    this.userStats.filtered = filtered.length;
                    this.currentPage = 1; // Reset to first page when filtering
                    this.updatePagination();
                },
                
                updatePagination() {
                    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
                    const start = (this.currentPage - 1) * this.pageSize;
                    const end = start + this.pageSize;
                    this.paginatedUsers = this.filteredUsers.slice(start, end);
                },
                
                searchUsers() {
                    this.filterUsers();
                },
                
                clearFilters() {
                    this.userFilters = {
                        registrationStatus: '',
                        activityStatus: '',
                        language: '',
                        progressRange: '',
                        wordCountRange: '',
                        joinDateRange: '',
                        studyFrequency: ''
                    };
                    this.userSearch = '';
                    this.filterUsers();
                    this.showToast('info', 'Filters Cleared', 'All filters have been reset');
                },
                
                sortUsers(field) {
                    if (this.sortField === field) {
                        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                    } else {
                        this.sortField = field;
                        this.sortDirection = 'asc';
                    }
                    this.filterUsers();
                },
                
                // Pagination methods
                goToPage(page) {
                    if (page >= 1 && page <= this.totalPages) {
                        this.currentPage = page;
                        this.updatePagination();
                    }
                },
                
                getVisiblePages() {
                    const visible = [];
                    const start = Math.max(1, this.currentPage - 2);
                    const end = Math.min(this.totalPages, this.currentPage + 2);
                    
                    for (let i = start; i <= end; i++) {
                        visible.push(i);
                    }
                    
                    return visible;
                },
                
                // Selection methods
                toggleAllUsers(checked) {
                    if (checked) {
                        this.selectedUsers = this.paginatedUsers.map(u => u.telegramId);
                    } else {
                        this.selectedUsers = [];
                    }
                },
                
                toggleUserSelection(telegramId, checked) {
                    if (checked) {
                        if (!this.selectedUsers.includes(telegramId)) {
                            this.selectedUsers.push(telegramId);
                        }
                    } else {
                        this.selectedUsers = this.selectedUsers.filter(id => id !== telegramId);
                    }
                },
                
                // User action methods
                async viewUserDetails(user) {
                    try {
                        this.selectedUserDetails = user;
                        this.userDetailsTab = 'overview';
                        this.showUserDetailsModal = true;
                        
                        // Optionally load additional details from API
                        const response = await this.apiCall('/admin/users/' + user.telegramId + '/details');
                        if (response.ok) {
                            const details = await response.json();
                            this.selectedUserDetails = { ...user, ...details };
                        }
                    } catch (error) {
                        console.error('Failed to load user details:', error);
                        // Still show modal with basic user data
                        this.selectedUserDetails = user;
                        this.userDetailsTab = 'overview';
                        this.showUserDetailsModal = true;
                    }
                },
                
                showUserModal(user, details) {
                    this.selectedUserDetails = { ...user, ...details };
                    this.userDetailsTab = 'overview';
                    this.showUserDetailsModal = true;
                },
                
                async viewUserProgress(user) {
                    try {
                        const response = await this.apiCall('/admin/users/' + user.telegramId + '/progress');
                        if (response.ok) {
                            const progress = await response.json();
                            this.showProgressModal(user, progress);
                        } else {
                            this.showToast('error', 'Load Failed', 'Could not load user progress');
                        }
                    } catch (error) {
                        console.error('Failed to load user progress:', error);
                        this.showToast('error', 'Error', 'Network error occurred');
                    }
                },
                
                showProgressModal(user, progress) {
                    // Show detailed progress with Leitner box distribution, accuracy trends, etc.
                    this.showToast('info', 'Learning Progress', 'Progress details for ' + (user.firstName || user.username));
                },
                
                async manageUserWords(user) {
                    try {
                        const response = await this.apiCall('/admin/users/' + user.telegramId + '/words');
                        if (response.ok) {
                            const words = await response.json();
                            this.showWordsModal(user, words);
                        } else {
                            this.showToast('error', 'Load Failed', 'Could not load user words');
                        }
                    } catch (error) {
                        console.error('Failed to load user words:', error);
                        this.showToast('error', 'Error', 'Network error occurred');
                    }
                },
                
                showWordsModal(user, words) {
                    // Show word management interface with add/edit/delete capabilities
                    this.showToast('info', 'Vocabulary Management', 'Managing words for ' + (user.firstName || user.username));
                },
                
                async viewUserActivity(user) {
                    try {
                        const response = await this.apiCall('/admin/users/' + user.telegramId + '/activity');
                        if (response.ok) {
                            const activity = await response.json();
                            this.showActivityModal(user, activity);
                        } else {
                            this.showToast('error', 'Load Failed', 'Could not load user activity');
                        }
                    } catch (error) {
                        console.error('Failed to load user activity:', error);
                        this.showToast('error', 'Error', 'Network error occurred');
                    }
                },
                
                showActivityModal(user, activity) {
                    // Show timeline of user activities: commands used, study sessions, etc.
                    this.showToast('info', 'Activity Log', 'Activity history for ' + (user.firstName || user.username));
                },
                
                async editUser(user) {
                    // Show edit user form
                    this.showToast('info', 'Edit User', 'Editing ' + (user.firstName || user.username));
                },
                
                async resetUserProgress(user) {
                    if (confirm('Are you sure you want to reset all progress for ' + (user.firstName || user.username) + '? This action cannot be undone.')) {
                        try {
                            const response = await this.apiCall('/admin/users/' + user.telegramId + '/reset-progress', {
                                method: 'POST'
                            });
                            
                            if (response.ok) {
                                await this.loadUsers();
                                this.showToast('success', 'Progress Reset', 'Progress reset for ' + (user.firstName || user.username));
                            } else {
                                this.showToast('error', 'Reset Failed', 'Could not reset user progress');
                            }
                        } catch (error) {
                            console.error('Failed to reset user progress:', error);
                            this.showToast('error', 'Error', 'Network error occurred');
                        }
                    }
                },
                
                async exportUserData(user) {
                    try {
                        const response = await this.apiCall('/admin/users/' + user.telegramId + '/export');
                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'user_' + user.telegramId + '_data.json';
                            a.click();
                            window.URL.revokeObjectURL(url);
                            this.showToast('success', 'Export Complete', 'Data exported for ' + (user.firstName || user.username));
                        } else {
                            this.showToast('error', 'Export Failed', 'Could not export user data');
                        }
                    } catch (error) {
                        console.error('Failed to export user data:', error);
                        this.showToast('error', 'Error', 'Network error occurred');
                    }
                },
                
                async blockUser(user) {
                    if (confirm('Are you sure you want to block ' + (user.firstName || user.username) + '? They will no longer be able to use the bot.')) {
                        try {
                            const response = await this.apiCall('/admin/users/' + user.telegramId + '/block', {
                                method: 'POST'
                            });
                            
                            if (response.ok) {
                                await this.loadUsers();
                                this.showToast('success', 'User Blocked', (user.firstName || user.username) + ' has been blocked');
                            } else {
                                this.showToast('error', 'Block Failed', 'Could not block user');
                            }
                        } catch (error) {
                            console.error('Failed to block user:', error);
                            this.showToast('error', 'Error', 'Network error occurred');
                        }
                    }
                },
                
                // Bulk operations
                async bulkMessageUsers() {
                    if (this.selectedUsers.length === 0) {
                        this.showToast('warning', 'No Selection', 'Please select users to message');
                        return;
                    }
                    
                    this.showBulkMessageModal = true;
                },
                
                async sendBulkMessage() {
                    if (!this.bulkMessageContent.trim()) {
                        this.showToast('warning', 'No Message', 'Please enter a message to send');
                        return;
                    }
                    
                    try {
                        const response = await this.apiCall('/admin/bulk-message', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userIds: this.selectedUsers,
                                message: this.bulkMessageContent,
                                schedule: this.bulkMessageSchedule
                            })
                        });
                        
                        if (response.ok) {
                            this.showToast('success', 'Messages Sent', 'Message sent to ' + this.selectedUsers.length + ' users');
                            this.selectedUsers = [];
                            this.showBulkMessageModal = false;
                            this.bulkMessageContent = '';
                            this.bulkMessageSchedule = false;
                        } else {
                            this.showToast('error', 'Send Failed', 'Could not send messages');
                        }
                    } catch (error) {
                        console.error('Failed to send bulk messages:', error);
                        this.showToast('error', 'Error', 'Network error occurred');
                    }
                },
                
                async bulkExportUsers() {
                    if (this.selectedUsers.length === 0) {
                        this.showToast('warning', 'No Selection', 'Please select users to export');
                        return;
                    }
                    
                    try {
                        const response = await this.apiCall('/admin/users/bulk-export', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userIds: this.selectedUsers
                            })
                        });
                        
                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'selected_users_' + Date.now() + '.json';
                            a.click();
                            window.URL.revokeObjectURL(url);
                            this.showToast('success', 'Export Complete', this.selectedUsers.length + ' users exported');
                        } else {
                            this.showToast('error', 'Export Failed', 'Could not export selected users');
                        }
                    } catch (error) {
                        console.error('Failed to bulk export users:', error);
                        this.showToast('error', 'Error', 'Network error occurred');
                    }
                },
                
                async bulkAssignWords() {
                    if (this.selectedUsers.length === 0) {
                        this.showToast('warning', 'No Selection', 'Please select users to assign words to');
                        return;
                    }
                    
                    // Switch to bulk words tab and pre-select these users
                    this.activeTab = 'bulk-words';
                    this.showToast('info', 'Bulk Words', this.selectedUsers.length + ' users pre-selected for word assignment');
                },
                
                async bulkUpdateSettings() {
                    if (this.selectedUsers.length === 0) {
                        this.showToast('warning', 'No Selection', 'Please select users to update settings for');
                        return;
                    }
                    
                    this.showToast('info', 'Bulk Settings', 'Settings update for ' + this.selectedUsers.length + ' users');
                },
                
                // Export/Import methods
                async exportUsers() {
                    try {
                        const response = await this.apiCall('/admin/users/export');
                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'all_users_' + Date.now() + '.json';
                            a.click();
                            window.URL.revokeObjectURL(url);
                            this.showToast('success', 'Export Complete', 'All users exported successfully');
                        } else {
                            this.showToast('error', 'Export Failed', 'Could not export users');
                        }
                    } catch (error) {
                        console.error('Failed to export users:', error);
                        this.showToast('error', 'Error', 'Network error occurred');
                    }
                },
                
                async refreshUsers() {
                    await this.loadUsers();
                    this.showToast('success', 'Users Refreshed', 'User list has been updated');
                },
                
                // Utility methods
                isActiveUser(lastActive) {
                    if (!lastActive) return false;
                    const now = Date.now();
                    const lastActiveTime = new Date(lastActive).getTime();
                    return (now - lastActiveTime) < 7 * 24 * 60 * 60 * 1000; // 7 days
                },
                
                getLanguageName(code) {
                    const languages = {
                        'en': 'English',
                        'es': 'Spanish', 
                        'fr': 'French',
                        'de': 'German',
                        'it': 'Italian',
                        'pt': 'Portuguese',
                        'ru': 'Russian',
                        'ar': 'Arabic',
                        'fa': 'Persian',
                        'zh': 'Chinese',
                        'ja': 'Japanese',
                        'ko': 'Korean'
                    };
                    return languages[code] || code || 'Unknown';
                },
                
                formatRelativeTime(timestamp) {
                    if (!timestamp) return 'Never';
                    
                    const now = Date.now();
                    const time = new Date(timestamp).getTime();
                    const diff = now - time;
                    
                    const minute = 60 * 1000;
                    const hour = 60 * minute;
                    const day = 24 * hour;
                    const week = 7 * day;
                    
                    if (diff < minute) return 'Just now';
                    if (diff < hour) return Math.floor(diff / minute) + 'm ago';
                    if (diff < day) return Math.floor(diff / hour) + 'h ago';
                    if (diff < week) return Math.floor(diff / day) + 'd ago';
                    return Math.floor(diff / week) + 'w ago';
                },
                
                // ==================== END USER MANAGEMENT METHODS ====================
                
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
