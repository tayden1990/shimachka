export function getAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitner Bot Admin Panel - Enhanced v3.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .notification-badge {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e0 #f7fafc;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f7fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e0;
            border-radius: 3px;
        }
        .sidebar-transition {
            transition: transform 0.3s ease-in-out;
        }
        @media (max-width: 768px) {
            .sidebar-hidden {
                transform: translateX(-100%);
            }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div x-data="adminApp()" x-init="init()">
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div class="text-center">
                    <div class="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-brain text-indigo-600 text-3xl"></i>
                    </div>
                    <h2 class="text-3xl font-extrabold text-white">
                        🎯 Leitner Bot Admin
                    </h2>
                    <p class="mt-2 text-indigo-100">
                        Advanced Learning Management System
                    </p>
                </div>
                <div class="bg-white rounded-lg shadow-xl p-8">
                    <form @submit.prevent="login()" class="space-y-6">
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                            <input x-model="loginForm.username" type="text" required
                                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                   placeholder="Enter your username">
                        </div>
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                            <input x-model="loginForm.password" type="password" required
                                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                   placeholder="Enter your password">
                        </div>
                        <div>
                            <button type="submit" :disabled="loading"
                                    class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white gradient-bg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-200">
                                <span x-show="!loading">Sign in</span>
                                <span x-show="loading" class="flex items-center">
                                    <i class="fas fa-spinner fa-spin mr-2"></i>
                                    Signing in...
                                </span>
                            </button>
                        </div>
                    </form>
                    <div x-show="error" class="mt-4 text-red-600 text-sm text-center" x-text="error"></div>
                </div>
            </div>
        </div>

        <!-- Admin Dashboard -->
        <div x-show="isAuthenticated" class="min-h-screen bg-gray-50 flex">
            <!-- Mobile sidebar toggle -->
            <div class="md:hidden fixed top-4 left-4 z-50">
                <button @click="sidebarOpen = !sidebarOpen" class="bg-white p-2 rounded-md shadow-lg">
                    <i class="fas fa-bars text-gray-600"></i>
                </button>
            </div>

            <!-- Sidebar -->
            <div class="sidebar-transition w-64 bg-white shadow-lg fixed md:relative h-screen z-40 md:translate-x-0" 
                 :class="sidebarOpen ? '' : 'sidebar-hidden'">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-brain text-white text-lg"></i>
                        </div>
                        <div class="ml-3">
                            <h2 class="text-lg font-bold text-gray-900">Leitner Bot</h2>
                            <p class="text-sm text-gray-500">Admin Panel v3.0</p>
                        </div>
                    </div>
                </div>

                <!-- Navigation Menu -->
                <nav class="mt-6 custom-scrollbar overflow-y-auto h-full pb-20">
                    <div class="px-3">
                        <button @click="activeTab = 'dashboard'; loadDashboard()" 
                                :class="activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 mb-1">
                            <i class="fas fa-chart-line mr-3 text-lg"></i>
                            <span>Dashboard</span>
                        </button>
                        
                        <button @click="activeTab = 'users'; refreshUsers()" 
                                :class="activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 mb-1">
                            <i class="fas fa-users mr-3 text-lg"></i>
                            <span>Users</span>
                        </button>
                        
                        <button @click="activeTab = 'analytics'" 
                                :class="activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 mb-1">
                            <i class="fas fa-chart-bar mr-3 text-lg"></i>
                            <span>Analytics</span>
                        </button>
                        
                        <button @click="activeTab = 'bulk-words'" 
                                :class="activeTab === 'bulk-words' ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 mb-1">
                            <i class="fas fa-magic mr-3 text-lg"></i>
                            <span>AI Bulk Words</span>
                        </button>
                        
                        <button @click="activeTab = 'messages'" 
                                :class="activeTab === 'messages' ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 mb-1">
                            <i class="fas fa-bullhorn mr-3 text-lg"></i>
                            <span>Messaging</span>
                        </button>
                        
                        <button @click="activeTab = 'content'" 
                                :class="activeTab === 'content' ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 mb-1">
                            <i class="fas fa-book mr-3 text-lg"></i>
                            <span>Content</span>
                        </button>
                        
                        <button @click="activeTab = 'tickets'" 
                                :class="activeTab === 'tickets' ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 mb-1">
                            <i class="fas fa-ticket-alt mr-3 text-lg"></i>
                            <span>Support</span>
                        </button>
                        
                        <button @click="activeTab = 'settings'" 
                                :class="activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 mb-1">
                            <i class="fas fa-cog mr-3 text-lg"></i>
                            <span>Settings</span>
                        </button>
                    </div>
                </nav>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 md:ml-0">
                <!-- Top Header -->
                <header class="bg-white shadow-sm border-b border-gray-200">
                    <div class="flex items-center justify-between px-6 py-4">
                        <div class="flex items-center">
                            <h1 class="text-2xl font-bold text-gray-900" x-text="getPageTitle()"></h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <!-- Notifications -->
                            <div class="relative" x-show="notifications.length > 0">
                                <button @click="showNotifications = !showNotifications" 
                                        class="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                    <i class="fas fa-bell text-xl"></i>
                                    <span class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center notification-badge"
                                          x-text="notifications.length"></span>
                                </button>
                                
                                <!-- Notifications Dropdown -->
                                <div x-show="showNotifications" x-transition 
                                     class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                     @click.away="showNotifications = false">
                                    <div class="p-4 border-b border-gray-200">
                                        <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
                                    </div>
                                    <div class="max-h-64 overflow-y-auto">
                                        <template x-for="notification in notifications" :key="notification.id">
                                            <div class="p-4 border-b border-gray-100 hover:bg-gray-50">
                                                <div class="flex items-start">
                                                    <div class="flex-shrink-0">
                                                        <i :class="notification.icon" class="text-lg text-blue-500"></i>
                                                    </div>
                                                    <div class="ml-3">
                                                        <p class="text-sm font-medium text-gray-900" x-text="notification.title"></p>
                                                        <p class="text-sm text-gray-500" x-text="notification.message"></p>
                                                        <p class="text-xs text-gray-400 mt-1" x-text="notification.time"></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- User Menu -->
                            <div class="flex items-center space-x-3">
                                <span class="text-sm font-medium text-gray-700" x-text="'Welcome, ' + (admin?.fullName || 'Admin')"></span>
                                <div class="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white text-sm"></i>
                                </div>
                                <button @click="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Page Content -->
                <main class="p-6 custom-scrollbar overflow-y-auto" style="height: calc(100vh - 80px);">
                    <!-- Dashboard Tab -->
                    <div x-show="activeTab === 'dashboard'" x-transition:enter="transition ease-out duration-300" 
                         x-transition:enter-start="opacity-0 transform translate-y-4" 
                         x-transition:enter-end="opacity-100 transform translate-y-0">
                        <!-- Quick Stats Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div class="card-hover bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-users text-blue-600 text-xl"></i>
                                    </div>
                                    <div class="ml-4">
                                        <h3 class="text-lg font-semibold text-gray-900" x-text="stats.totalUsers || 0"></h3>
                                        <p class="text-sm text-gray-500">Total Users</p>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <div class="flex items-center text-sm">
                                        <span class="text-green-600 font-medium">+12%</span>
                                        <span class="text-gray-500 ml-1">from last month</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-hover bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-user-check text-green-600 text-xl"></i>
                                    </div>
                                    <div class="ml-4">
                                        <h3 class="text-lg font-semibold text-gray-900" x-text="stats.activeUsers || 0"></h3>
                                        <p class="text-sm text-gray-500">Active Users</p>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <div class="flex items-center text-sm">
                                        <span class="text-green-600 font-medium">+8%</span>
                                        <span class="text-gray-500 ml-1">from last week</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-hover bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-book text-purple-600 text-xl"></i>
                                    </div>
                                    <div class="ml-4">
                                        <h3 class="text-lg font-semibold text-gray-900" x-text="stats.totalCards || 0"></h3>
                                        <p class="text-sm text-gray-500">Total Cards</p>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <div class="flex items-center text-sm">
                                        <span class="text-green-600 font-medium">+156</span>
                                        <span class="text-gray-500 ml-1">this week</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-hover bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-ticket-alt text-red-600 text-xl"></i>
                                    </div>
                                    <div class="ml-4">
                                        <h3 class="text-lg font-semibold text-gray-900" x-text="stats.openTickets || 0"></h3>
                                        <p class="text-sm text-gray-500">Open Tickets</p>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <div class="flex items-center text-sm">
                                        <span class="text-red-600 font-medium">-2</span>
                                        <span class="text-gray-500 ml-1">from yesterday</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Charts Row -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <!-- User Growth Chart -->
                            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                                <canvas id="userGrowthChart" width="400" height="200"></canvas>
                            </div>

                            <!-- Learning Progress Chart -->
                            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
                                <canvas id="learningProgressChart" width="400" height="200"></canvas>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div class="p-6 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            </div>
                            <div class="p-6">
                                <div class="space-y-4">
                                    <template x-for="activity in recentActivity" :key="activity.id">
                                        <div class="flex items-center space-x-4">
                                            <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="activity.iconBg">
                                                <i :class="activity.icon" class="text-white"></i>
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
                    </div>

                    <!-- Enhanced Users Tab -->
                    <div x-show="activeTab === 'users'" x-transition:enter="transition ease-out duration-300" 
                         x-transition:enter-start="opacity-0 transform translate-y-4" 
                         x-transition:enter-end="opacity-100 transform translate-y-0">
                        <div class="mb-6">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
                                    <p class="text-gray-600">Manage and monitor user accounts</p>
                                </div>
                                <div class="flex space-x-3">
                                    <button @click="refreshUsers()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                                        <i class="fas fa-sync mr-2"></i>Refresh
                                    </button>
                                    <button @click="exportUsers()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                                        <i class="fas fa-download mr-2"></i>Export
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- User Filters -->
                        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                                    <input x-model="userFilter.search" type="text" placeholder="Search by name or email..."
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select x-model="userFilter.status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                    <select x-model="userFilter.language" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="">All Languages</option>
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                                <div class="flex items-end">
                                    <button @click="applyUserFilters()" class="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors duration-200">
                                        <i class="fas fa-filter mr-2"></i>Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Users Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <template x-for="user in filteredUsers" :key="user.id">
                                <div class="card-hover bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div class="flex items-center space-x-4 mb-4">
                                        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span class="text-white font-semibold" x-text="(user.firstName || user.fullName || 'U').charAt(0).toUpperCase()"></span>
                                        </div>
                                        <div class="flex-1">
                                            <h3 class="font-semibold text-gray-900" x-text="user.fullName || user.firstName || 'Unknown User'"></h3>
                                            <p class="text-sm text-gray-500" x-text="user.email || 'No email'"></p>
                                        </div>
                                        <div class="flex items-center">
                                            <div :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                                                 class="px-2 py-1 rounded-full text-xs font-medium">
                                                <span x-text="user.isActive ? 'Active' : 'Inactive'"></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-3">
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-500">User ID:</span>
                                            <span class="font-medium" x-text="user.id"></span>
                                        </div>
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-500">Language:</span>
                                            <span class="font-medium" x-text="user.language || 'Not set'"></span>
                                        </div>
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-500">Total Cards:</span>
                                            <span class="font-medium" x-text="user.totalCards || 0"></span>
                                        </div>
                                        <div class="flex justify-between text-sm">
                                            <span class="text-gray-500">Progress:</span>
                                            <div class="flex items-center space-x-2">
                                                <div class="w-16 bg-gray-200 rounded-full h-2">
                                                    <div class="bg-blue-600 h-2 rounded-full" :style="'width: ' + (user.progress || 0) + '%'"></div>
                                                </div>
                                                <span class="text-xs font-medium" x-text="(user.progress || 0) + '%'"></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-6 flex space-x-2">
                                        <button @click="viewUserDetails(user)" 
                                                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200">
                                            <i class="fas fa-eye mr-1"></i>View
                                        </button>
                                        <button @click="sendDirectMessageToUser(user)" 
                                                class="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200">
                                            <i class="fas fa-envelope mr-1"></i>Message
                                        </button>
                                        <button @click="editUser(user)" 
                                                class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200">
                                            <i class="fas fa-edit mr-1"></i>Edit
                                        </button>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <!-- No Users Found -->
                        <div x-show="filteredUsers.length === 0" class="text-center py-12">
                            <div class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <i class="fas fa-users text-gray-400 text-3xl"></i>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p class="text-gray-500">Try adjusting your filters or refresh to load users.</p>
                        </div>
                    </div>

                    <!-- Analytics Tab -->
                    <div x-show="activeTab === 'analytics'" x-transition:enter="transition ease-out duration-300" 
                         x-transition:enter-start="opacity-0 transform translate-y-4" 
                         x-transition:enter-end="opacity-100 transform translate-y-0">
                        <div class="mb-6">
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
                            <p class="text-gray-600">Detailed analytics and performance metrics</p>
                        </div>

                        <!-- Analytics Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900">Engagement Rate</h3>
                                    <i class="fas fa-chart-line text-blue-500 text-xl"></i>
                                </div>
                                <div class="text-3xl font-bold text-blue-600 mb-2">78.5%</div>
                                <div class="text-sm text-gray-500">+5.2% from last week</div>
                            </div>

                            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900">Avg. Session Time</h3>
                                    <i class="fas fa-clock text-green-500 text-xl"></i>
                                </div>
                                <div class="text-3xl font-bold text-green-600 mb-2">12.4min</div>
                                <div class="text-sm text-gray-500">+2.1min from last week</div>
                            </div>

                            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900">Completion Rate</h3>
                                    <i class="fas fa-check-circle text-purple-500 text-xl"></i>
                                </div>
                                <div class="text-3xl font-bold text-purple-600 mb-2">82.1%</div>
                                <div class="text-sm text-gray-500">+3.4% from last week</div>
                            </div>
                        </div>

                        <!-- Charts Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">User Activity Trends</h3>
                                <canvas id="activityChart" width="400" height="300"></canvas>
                            </div>

                            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Learning Progress Distribution</h3>
                                <canvas id="progressChart" width="400" height="300"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Settings Tab -->
                    <div x-show="activeTab === 'settings'" x-transition:enter="transition ease-out duration-300" 
                         x-transition:enter-start="opacity-0 transform translate-y-4" 
                         x-transition:enter-end="opacity-100 transform translate-y-0">
                        <div class="mb-6">
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">System Settings</h2>
                            <p class="text-gray-600">Configure system preferences and bot behavior</p>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Bot Configuration -->
                            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div class="p-6 border-b border-gray-200">
                                    <h3 class="text-lg font-semibold text-gray-900">Bot Configuration</h3>
                                </div>
                                <div class="p-6 space-y-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                                        <select x-model="settings.defaultLanguage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                                        <textarea x-model="settings.welcomeMessage" rows="3" 
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                  placeholder="Enter welcome message..."></textarea>
                                    </div>
                                    <div class="flex items-center">
                                        <input x-model="settings.autoBackup" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                                        <label class="ml-2 block text-sm text-gray-700">Enable automatic backups</label>
                                    </div>
                                </div>
                            </div>

                            <!-- Notification Settings -->
                            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div class="p-6 border-b border-gray-200">
                                    <h3 class="text-lg font-semibold text-gray-900">Notification Settings</h3>
                                </div>
                                <div class="p-6 space-y-6">
                                    <div class="flex items-center">
                                        <input x-model="settings.emailNotifications" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                                        <label class="ml-2 block text-sm text-gray-700">Email notifications</label>
                                    </div>
                                    <div class="flex items-center">
                                        <input x-model="settings.pushNotifications" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                                        <label class="ml-2 block text-sm text-gray-700">Push notifications</label>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
                                        <select x-model="settings.notificationFrequency" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                            <option value="immediate">Immediate</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 flex justify-end space-x-3">
                            <button @click="resetSettings()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                                Reset to Defaults
                            </button>
                            <button @click="saveSettings()" class="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                                Save Settings
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>

    <script>
        function adminApp() {
            return {
                isAuthenticated: false,
                loading: false,
                error: '',
                activeTab: 'dashboard',
                sidebarOpen: true,
                showNotifications: false,
                admin: null,
                loginForm: {
                    username: '',
                    password: ''
                },
                stats: {
                    totalUsers: 0,
                    activeUsers: 0,
                    totalCards: 0,
                    openTickets: 0
                },
                users: [],
                filteredUsers: [],
                userFilter: {
                    search: '',
                    status: '',
                    language: ''
                },
                notifications: [
                    {
                        id: 1,
                        title: 'New User Registration',
                        message: '5 new users registered today',
                        time: '2 hours ago',
                        icon: 'fas fa-user-plus'
                    },
                    {
                        id: 2,
                        title: 'System Update',
                        message: 'Admin panel has been updated to v3.0',
                        time: '1 day ago',
                        icon: 'fas fa-info-circle'
                    }
                ],
                recentActivity: [
                    {
                        id: 1,
                        title: 'User Registration',
                        description: 'New user "John Doe" registered',
                        time: '2 hours ago',
                        icon: 'fas fa-user-plus',
                        iconBg: 'bg-green-500'
                    },
                    {
                        id: 2,
                        title: 'Card Created',
                        description: '150 new flashcards added',
                        time: '4 hours ago',
                        icon: 'fas fa-plus',
                        iconBg: 'bg-blue-500'
                    },
                    {
                        id: 3,
                        title: 'Bulk Message Sent',
                        description: 'Announcement sent to 523 users',
                        time: '1 day ago',
                        icon: 'fas fa-envelope',
                        iconBg: 'bg-purple-500'
                    }
                ],
                settings: {
                    defaultLanguage: 'en',
                    welcomeMessage: 'Welcome to Leitner Bot! Let\\'s start learning together.',
                    autoBackup: true,
                    emailNotifications: true,
                    pushNotifications: false,
                    notificationFrequency: 'daily'
                },

                init() {
                    // Check if already authenticated
                    const token = localStorage.getItem('adminToken');
                    if (token) {
                        this.isAuthenticated = true;
                        this.loadDashboard();
                    }
                    
                    // Initialize charts after a short delay
                    setTimeout(() => {
                        this.initCharts();
                    }, 1000);
                },

                async login() {
                    this.loading = true;
                    this.error = '';
                    
                    try {
                        const response = await fetch('/admin/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(this.loginForm)
                        });

                        const data = await response.json();
                        
                        if (response.ok) {
                            this.isAuthenticated = true;
                            this.admin = data.admin;
                            localStorage.setItem('adminToken', data.token);
                            this.loadDashboard();
                        } else {
                            this.error = data.error || 'Login failed';
                        }
                    } catch (error) {
                        this.error = 'Network error. Please try again.';
                    } finally {
                        this.loading = false;
                    }
                },

                logout() {
                    this.isAuthenticated = false;
                    this.admin = null;
                    this.activeTab = 'dashboard';
                    localStorage.removeItem('adminToken');
                },

                getPageTitle() {
                    const titles = {
                        dashboard: 'Dashboard',
                        users: 'User Management',
                        analytics: 'Analytics & Insights',
                        'bulk-words': 'AI Bulk Words',
                        messages: 'Messaging',
                        content: 'Content Management',
                        tickets: 'Support Tickets',
                        settings: 'Settings'
                    };
                    return titles[this.activeTab] || 'Dashboard';
                },

                async loadDashboard() {
                    try {
                        const response = await fetch('/admin/api/stats');
                        if (response.ok) {
                            this.stats = await response.json();
                        }
                    } catch (error) {
                        console.error('Failed to load dashboard stats:', error);
                    }
                },

                async refreshUsers() {
                    try {
                        const response = await fetch('/admin/api/users');
                        if (response.ok) {
                            this.users = await response.json();
                            this.applyUserFilters();
                        }
                    } catch (error) {
                        console.error('Failed to load users:', error);
                    }
                },

                applyUserFilters() {
                    this.filteredUsers = this.users.filter(user => {
                        if (this.userFilter.search) {
                            const searchTerm = this.userFilter.search.toLowerCase();
                            const matchesSearch = (user.fullName || '').toLowerCase().includes(searchTerm) ||
                                                (user.firstName || '').toLowerCase().includes(searchTerm) ||
                                                (user.email || '').toLowerCase().includes(searchTerm);
                            if (!matchesSearch) return false;
                        }
                        
                        if (this.userFilter.status) {
                            const isActive = this.userFilter.status === 'active';
                            if (user.isActive !== isActive) return false;
                        }
                        
                        if (this.userFilter.language && user.language !== this.userFilter.language) {
                            return false;
                        }
                        
                        return true;
                    });
                },

                viewUserDetails(user) {
                    // Implementation for viewing user details
                    alert('View user details for: ' + (user.fullName || user.firstName || 'User'));
                },

                sendDirectMessageToUser(user) {
                    // Implementation for sending direct message
                    alert('Send message to: ' + (user.fullName || user.firstName || 'User'));
                },

                editUser(user) {
                    // Implementation for editing user
                    alert('Edit user: ' + (user.fullName || user.firstName || 'User'));
                },

                exportUsers() {
                    // Implementation for exporting users
                    alert('Export users functionality');
                },

                saveSettings() {
                    // Implementation for saving settings
                    alert('Settings saved successfully!');
                },

                resetSettings() {
                    // Reset to default settings
                    this.settings = {
                        defaultLanguage: 'en',
                        welcomeMessage: 'Welcome to Leitner Bot! Let\\'s start learning together.',
                        autoBackup: true,
                        emailNotifications: true,
                        pushNotifications: false,
                        notificationFrequency: 'daily'
                    };
                },

                initCharts() {
                    // Initialize User Growth Chart
                    const userGrowthCtx = document.getElementById('userGrowthChart');
                    if (userGrowthCtx) {
                        new Chart(userGrowthCtx, {
                            type: 'line',
                            data: {
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                datasets: [{
                                    label: 'Users',
                                    data: [12, 19, 25, 32, 45, 52],
                                    borderColor: 'rgb(59, 130, 246)',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false
                            }
                        });
                    }

                    // Initialize Learning Progress Chart
                    const learningProgressCtx = document.getElementById('learningProgressChart');
                    if (learningProgressCtx) {
                        new Chart(learningProgressCtx, {
                            type: 'doughnut',
                            data: {
                                labels: ['Beginner', 'Intermediate', 'Advanced'],
                                datasets: [{
                                    data: [45, 35, 20],
                                    backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6']
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false
                            }
                        });
                    }
                }
            }
        }
    </script>
</body>
</html>`;
}
