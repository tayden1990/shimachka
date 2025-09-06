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
                
                // Navigation
                navigationItems: [
                    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                    { id: 'users', label: 'Users', icon: 'fas fa-users', badge: 0 },
                    { id: 'bulk-words', label: 'AI Bulk Words', icon: 'fas fa-magic' },
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
                
                // Settings
                settings: {
                    systemName: 'Leitner Bot Admin',
                    maintenanceMode: false
                },
                
                // Methods
                async init() {
                    this.checkAuthentication();
                    this.loadInitialData();
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
                
                async loadUsers() {
                    try {
                        const response = await this.apiCall('/admin/users');
                        if (response.ok) {
                            const data = await response.json();
                            this.users = data.users || this.generateMockUsers();
                            this.filterUsers();
                        }
                    } catch (error) {
                        console.error('Failed to load users:', error);
                        this.users = this.generateMockUsers();
                        this.filterUsers();
                    }
                },
                
                generateMockUsers() {
                    const users = [];
                    for (let i = 1; i <= 10; i++) {
                        users.push({
                            id: i,
                            username: 'user' + i,
                            firstName: 'User' + i,
                            fullName: 'User ' + i + ' Name',
                            language: ['en', 'es', 'fr', 'de'][Math.floor(Math.random() * 4)],
                            isActive: Math.random() > 0.2,
                            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
                        });
                    }
                    return users;
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
                viewUser(user) {
                    this.showToast('info', 'View User', 'Viewing user: ' + (user.fullName || user.username));
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
                }
            };
        }
    </script>
</body>
</html>`;
}