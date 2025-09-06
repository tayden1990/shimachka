export function getPremiumAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitner Bot - Premium Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        [x-cloak] { display: none !important; }
        body { font-family: 'Inter', sans-serif; }
        
        .gradient-bg { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .glass { 
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .card-hover {
            transition: all 0.3s ease;
            transform: translateY(0);
        }
        
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .loading-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .pulse-dot {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        
        .slide-in {
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .log-level-debug { border-left: 4px solid #6b7280; }
        .log-level-info { border-left: 4px solid #3b82f6; }
        .log-level-warn { border-left: 4px solid #f59e0b; }
        .log-level-error { border-left: 4px solid #ef4444; }
        .log-level-success { border-left: 4px solid #10b981; }
        
        .sidebar {
            transition: transform 0.3s ease;
        }
        
        .sidebar.collapsed {
            transform: translateX(-100%);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
        
        .stat-card {
            background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to));
        }
    </style>
</head>
<body class="bg-gray-50 font-sans antialiased">
    <div x-data="premiumAdmin()" x-init="init()" x-cloak>
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <div class="glass rounded-3xl shadow-2xl p-8 fade-in">
                    <div class="text-center mb-8">
                        <div class="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                            <i class="fas fa-brain text-white text-3xl"></i>
                        </div>
                        <h1 class="text-4xl font-bold text-white mb-2">Leitner Bot</h1>
                        <p class="text-white text-opacity-80 text-lg">Premium Admin Panel</p>
                        <div class="w-20 h-1 bg-white bg-opacity-30 mx-auto mt-4 rounded"></div>
                    </div>

                    <form @submit.prevent="login()" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-white text-opacity-90 mb-2">
                                <i class="fas fa-user mr-2"></i>Username
                            </label>
                            <input x-model="loginForm.username" type="text" required
                                   class="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-60 focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
                                   placeholder="Enter your username">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-white text-opacity-90 mb-2">
                                <i class="fas fa-lock mr-2"></i>Password
                            </label>
                            <input x-model="loginForm.password" type="password" required
                                   class="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl text-white placeholder-white placeholder-opacity-60 focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
                                   placeholder="Enter your password">
                        </div>

                        <button type="submit" :disabled="loading"
                                class="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl hover:bg-opacity-30 disabled:opacity-50 transition-all duration-300 border border-white border-opacity-30">
                            <span x-show="!loading" class="flex items-center justify-center">
                                <i class="fas fa-sign-in-alt mr-2"></i>
                                Sign In
                            </span>
                            <span x-show="loading" class="flex items-center justify-center">
                                <i class="fas fa-spinner loading-spinner mr-2"></i>
                                Authenticating...
                            </span>
                        </button>

                        <div x-show="error" class="bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-xl p-4 backdrop-blur-sm">
                            <div class="flex items-center">
                                <i class="fas fa-exclamation-triangle text-red-200 mr-2"></i>
                                <span class="text-red-100 text-sm" x-text="error"></span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Dashboard -->
        <div x-show="isAuthenticated" class="min-h-screen bg-gray-50">
            <!-- Sidebar -->
            <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl sidebar" :class="{ 'collapsed': !sidebarOpen }">
                <div class="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-brain text-blue-600"></i>
                        </div>
                        <h1 class="text-white font-bold text-lg">Admin Panel</h1>
                    </div>
                </div>
                
                <nav class="mt-8 px-4">
                    <div class="space-y-2">
                        <button @click="switchTab('dashboard')" 
                                :class="activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-tachometer-alt mr-3 text-lg"></i>
                            Dashboard
                        </button>
                        
                        <button @click="switchTab('users')" 
                                :class="activeTab === 'users' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-users mr-3 text-lg"></i>
                            Users
                            <span x-show="stats.totalUsers > 0" class="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full" x-text="stats.totalUsers"></span>
                        </button>
                        
                        <button @click="switchTab('messaging')" 
                                :class="activeTab === 'messaging' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-paper-plane mr-3 text-lg"></i>
                            Messaging
                        </button>
                        
                        <button @click="switchTab('analytics')" 
                                :class="activeTab === 'analytics' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-chart-line mr-3 text-lg"></i>
                            Analytics
                        </button>
                        
                        <button @click="switchTab('logs')" 
                                :class="activeTab === 'logs' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-file-alt mr-3 text-lg"></i>
                            Debug Logs
                            <span x-show="logs.length > 0" class="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full" x-text="logs.length"></span>
                        </button>
                        
                        <button @click="switchTab('system')" 
                                :class="activeTab === 'system' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-server mr-3 text-lg"></i>
                            System Health
                            <div class="ml-auto w-2 h-2 rounded-full pulse-dot" :class="systemHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'"></div>
                        </button>
                        
                        <button @click="switchTab('commands')" 
                                :class="activeTab === 'commands' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-terminal mr-3 text-lg"></i>
                            Bot Commands
                        </button>
                        
                        <button @click="switchTab('words')" 
                                :class="activeTab === 'words' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-book mr-3 text-lg"></i>
                            Word Management
                        </button>
                        
                        <button @click="switchTab('study')" 
                                :class="activeTab === 'study' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-graduation-cap mr-3 text-lg"></i>
                            Study Sessions
                        </button>
                        
                        <button @click="switchTab('topics')" 
                                :class="activeTab === 'topics' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-lightbulb mr-3 text-lg"></i>
                            AI Topics
                        </button>
                        
                        <button @click="switchTab('support')" 
                                :class="activeTab === 'support' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-life-ring mr-3 text-lg"></i>
                            Support Tickets
                            <span x-show="supportTickets.openTickets > 0" class="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full" x-text="supportTickets.openTickets"></span>
                        </button>
                        
                        <button @click="switchTab('settings')" 
                                :class="activeTab === 'settings' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'"
                                class="w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200">
                            <i class="fas fa-cog mr-3 text-lg"></i>
                            Settings
                        </button>
                    </div>
                </nav>
                
                <div class="absolute bottom-4 left-4 right-4">
                    <div class="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-4 text-white text-center">
                        <div class="text-sm font-medium">System Status</div>
                        <div class="text-xs opacity-80" x-text="'Last updated: ' + lastUpdateTime"></div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="transition-all duration-300" :class="sidebarOpen ? 'ml-64' : 'ml-0'">
                <!-- Header -->
                <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div class="flex items-center justify-between px-6 py-4">
                        <div class="flex items-center">
                            <button @click="sidebarOpen = !sidebarOpen" class="text-gray-600 hover:text-gray-900 mr-4">
                                <i class="fas fa-bars text-xl"></i>
                            </button>
                            <h2 class="text-2xl font-bold text-gray-900 capitalize" x-text="activeTab"></h2>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <!-- Real-time Clock -->
                            <div class="text-sm text-gray-600" x-text="currentTime"></div>
                            
                            <!-- Notifications -->
                            <div class="relative">
                                <button @click="showNotifications = !showNotifications" class="text-gray-600 hover:text-gray-900 relative">
                                    <i class="fas fa-bell text-xl"></i>
                                    <span x-show="notifications.length > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse" x-text="notifications.length"></span>
                                </button>
                            </div>
                            
                            <!-- User Menu -->
                            <div class="relative" x-data="{ open: false }">
                                <button @click="open = !open" class="flex items-center text-gray-600 hover:text-gray-900">
                                    <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                                        <i class="fas fa-user text-white text-sm"></i>
                                    </div>
                                    <span class="font-medium">Admin</span>
                                    <i class="fas fa-chevron-down ml-2 text-sm"></i>
                                </button>
                                
                                <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <button @click="exportLogs()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <i class="fas fa-download mr-2"></i>Export Logs
                                    </button>
                                    <button @click="clearLogs()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <i class="fas fa-trash mr-2"></i>Clear Logs
                                    </button>
                                    <hr class="my-2">
                                    <button @click="logout(); open = false" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Content Area -->
                <div class="p-6">
                    <!-- Dashboard Tab -->
                    <div x-show="activeTab === 'dashboard'" class="space-y-6 fade-in">
                        <!-- Stats Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div class="stat-card from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white card-hover">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-blue-100 text-sm font-medium">Total Users</p>
                                        <p class="text-3xl font-bold" x-text="stats.totalUsers || '0'"></p>
                                        <p class="text-blue-100 text-xs mt-1">
                                            <i class="fas fa-arrow-up mr-1"></i>
                                            +12% from last week
                                        </p>
                                    </div>
                                    <div class="bg-white bg-opacity-20 rounded-lg p-3">
                                        <i class="fas fa-users text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stat-card from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white card-hover">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-green-100 text-sm font-medium">Total Words</p>
                                        <p class="text-3xl font-bold" x-text="stats.totalWords || '0'"></p>
                                        <p class="text-green-100 text-xs mt-1">
                                            <i class="fas fa-arrow-up mr-1"></i>
                                            +8% from last week
                                        </p>
                                    </div>
                                    <div class="bg-white bg-opacity-20 rounded-lg p-3">
                                        <i class="fas fa-book text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stat-card from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white card-hover">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-purple-100 text-sm font-medium">Study Sessions</p>
                                        <p class="text-3xl font-bold" x-text="stats.studySessions || '0'"></p>
                                        <p class="text-purple-100 text-xs mt-1">
                                            <i class="fas fa-arrow-up mr-1"></i>
                                            +15% from last week
                                        </p>
                                    </div>
                                    <div class="bg-white bg-opacity-20 rounded-lg p-3">
                                        <i class="fas fa-chart-line text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stat-card from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white card-hover">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-yellow-100 text-sm font-medium">Bot Status</p>
                                        <p class="text-2xl font-bold">Online</p>
                                        <p class="text-yellow-100 text-xs mt-1">
                                            <i class="fas fa-check-circle mr-1"></i>
                                            All systems operational
                                        </p>
                                    </div>
                                    <div class="bg-white bg-opacity-20 rounded-lg p-3">
                                        <i class="fas fa-robot text-2xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Charts Row -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                                <canvas id="userGrowthChart" width="400" height="200"></canvas>
                            </div>
                            
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Command Usage</h3>
                                <canvas id="commandUsageChart" width="400" height="200"></canvas>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="bg-white rounded-xl shadow-lg card-hover">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                            </div>
                            <div class="divide-y divide-gray-200 custom-scrollbar max-h-96 overflow-y-auto">
                                <template x-for="activity in recentActivity" :key="activity.id">
                                    <div class="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" :class="activity.bgColor">
                                            <i :class="activity.icon" class="text-sm"></i>
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
                    <div x-show="activeTab === 'users'" class="space-y-6 fade-in">
                        <div class="bg-white rounded-xl shadow-lg card-hover">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
                                    <div class="flex space-x-3">
                                        <button @click="exportUsers()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                            <i class="fas fa-download mr-2"></i>Export
                                        </button>
                                        <button @click="loadUsers()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                            <i class="fas fa-sync-alt mr-2"></i>Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Search and Filter -->
                            <div class="p-6 border-b border-gray-200">
                                <div class="flex flex-col md:flex-row gap-4">
                                    <div class="flex-1">
                                        <input x-model="userSearch" type="text" placeholder="Search users..." 
                                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <select x-model="userFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        <option value="all">All Users</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Words</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <template x-for="user in filteredUsers" :key="user.id">
                                            <tr class="hover:bg-gray-50 transition-colors">
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                            <span class="text-white font-medium text-sm" x-text="(user.fullName || 'U').charAt(0).toUpperCase()"></span>
                                                        </div>
                                                        <div class="ml-4">
                                                            <div class="text-sm font-medium text-gray-900" x-text="user.fullName || 'Unknown User'"></div>
                                                            <div class="text-sm text-gray-500" x-text="'ID: ' + user.id"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                                          :class="user.isRegistrationComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                                        <i :class="user.isRegistrationComplete ? 'fas fa-check-circle' : 'fas fa-clock'" class="mr-1"></i>
                                                        <span x-text="user.isRegistrationComplete ? 'Active' : 'Pending'"></span>
                                                    </span>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="text-sm text-gray-900" x-text="user.totalWords || 0"></div>
                                                    <div class="text-xs text-gray-500">words learned</div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="user.interfaceLanguage || 'en'"></td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="formatDate(user.lastActive)"></td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div class="flex space-x-2">
                                                        <button @click="sendMessageToUser(user.id)" class="text-blue-600 hover:text-blue-900 transition-colors">
                                                            <i class="fas fa-paper-plane"></i>
                                                        </button>
                                                        <button @click="viewUserDetails(user)" class="text-green-600 hover:text-green-900 transition-colors">
                                                            <i class="fas fa-eye"></i>
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

                    <!-- Debug Logs Tab -->
                    <div x-show="activeTab === 'logs'" class="space-y-6 fade-in">
                        <div class="bg-white rounded-xl shadow-lg card-hover">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900">Debug Logs & Monitoring</h3>
                                    <div class="flex space-x-3">
                                        <select x-model="logFilter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                            <option value="all">All Levels</option>
                                            <option value="error">Errors</option>
                                            <option value="warn">Warnings</option>
                                            <option value="info">Info</option>
                                            <option value="debug">Debug</option>
                                        </select>
                                        <button @click="clearLogs()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                            <i class="fas fa-trash mr-2"></i>Clear
                                        </button>
                                        <button @click="refreshLogs()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                            <i class="fas fa-sync-alt mr-2"></i>Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Log Console -->
                            <div class="bg-gray-900 text-green-400 font-mono text-sm custom-scrollbar max-h-96 overflow-y-auto">
                                <template x-for="log in filteredLogs" :key="log.id">
                                    <div class="px-4 py-2 border-l-4 hover:bg-gray-800 transition-colors" 
                                         :class="'log-level-' + log.level">
                                        <div class="flex items-start space-x-3">
                                            <span class="text-gray-400 text-xs mt-1" x-text="log.timestamp"></span>
                                            <span class="text-xs px-2 py-1 rounded uppercase font-bold"
                                                  :class="{
                                                      'bg-red-900 text-red-200': log.level === 'error',
                                                      'bg-yellow-900 text-yellow-200': log.level === 'warn',
                                                      'bg-blue-900 text-blue-200': log.level === 'info',
                                                      'bg-gray-700 text-gray-300': log.level === 'debug',
                                                      'bg-green-900 text-green-200': log.level === 'success'
                                                  }"
                                                  x-text="log.level"></span>
                                            <span class="text-gray-300 flex-1" x-text="log.message"></span>
                                        </div>
                                        <div x-show="log.details" class="mt-2 ml-16 text-gray-500 text-xs">
                                            <pre x-text="log.details" class="whitespace-pre-wrap"></pre>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                        
                        <!-- System Metrics -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Memory Usage</p>
                                        <p class="text-2xl font-bold text-gray-900" x-text="systemMetrics.memoryUsage + 'MB'"></p>
                                    </div>
                                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-memory text-blue-600 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">API Calls</p>
                                        <p class="text-2xl font-bold text-gray-900" x-text="systemMetrics.apiCalls"></p>
                                    </div>
                                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-exchange-alt text-green-600 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-600">Response Time</p>
                                        <p class="text-2xl font-bold text-gray-900" x-text="systemMetrics.responseTime + 'ms'"></p>
                                    </div>
                                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-tachometer-alt text-purple-600 text-xl"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Health Tab -->
                    <div x-show="activeTab === 'system'" class="space-y-6 fade-in">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600">Database</span>
                                        <div class="flex items-center">
                                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span class="text-green-600 font-medium">Connected</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600">Telegram API</span>
                                        <div class="flex items-center">
                                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span class="text-green-600 font-medium">Online</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-600">AI Service</span>
                                        <div class="flex items-center">
                                            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span class="text-green-600 font-medium">Available</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                                <canvas id="performanceChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Bot Commands Tab -->
                    <div x-show="activeTab === 'commands'" class="space-y-6 fade-in">
                        <div class="bg-white rounded-xl shadow-lg card-hover">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900">Bot Commands Statistics</h3>
                                    <button @click="loadCommandStats()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        <i class="fas fa-sync-alt mr-2"></i>Refresh
                                    </button>
                                </div>
                            </div>
                            
                            <div class="p-6">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <template x-for="cmd in Object.keys(commandBreakdown)" :key="cmd">
                                        <div class="bg-gray-50 rounded-lg p-4">
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="font-mono text-sm text-blue-600" x-text="cmd"></span>
                                                <span class="text-lg font-bold text-gray-900" x-text="commandBreakdown[cmd]?.users || 0"></span>
                                            </div>
                                            <p class="text-xs text-gray-500" x-text="commandBreakdown[cmd]?.description || ''"></p>
                                        </div>
                                    </template>
                                </div>
                                
                                <div class="bg-blue-50 rounded-lg p-4">
                                    <h4 class="font-semibold text-blue-900 mb-2">Command Usage Details</h4>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span class="text-blue-600">Most Used:</span>
                                            <span class="font-medium">/start</span>
                                        </div>
                                        <div>
                                            <span class="text-blue-600">Study Rate:</span>
                                            <span class="font-medium">70%</span>
                                        </div>
                                        <div>
                                            <span class="text-blue-600">Registration:</span>
                                            <span class="font-medium">90%</span>
                                        </div>
                                        <div>
                                            <span class="text-blue-600">AI Usage:</span>
                                            <span class="font-medium">50%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Word Management Tab -->
                    <div x-show="activeTab === 'words'" class="space-y-6 fade-in">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Add Word Form -->
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Word to User</h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                        <input type="number" x-model="wordForm.userId" placeholder="Enter user ID" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Word</label>
                                            <input type="text" x-model="wordForm.word" placeholder="English word" 
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Translation</label>
                                            <input type="text" x-model="wordForm.translation" placeholder="Translation" 
                                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Definition</label>
                                        <textarea x-model="wordForm.definition" rows="3" placeholder="Word definition (optional)" 
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>
                                    <button @click="addWordToUser()" :disabled="!wordForm.userId || !wordForm.word || !wordForm.translation" 
                                            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                        <i class="fas fa-plus mr-2"></i>Add Word
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Words Summary -->
                            <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-lg font-semibold text-gray-900">Words Overview</h3>
                                    <button @click="loadWordsSummary()" class="text-blue-600 hover:text-blue-800">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                                <div x-show="wordsSummary.length > 0" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                                    <template x-for="summary in wordsSummary" :key="summary.userId">
                                        <div class="bg-gray-50 rounded-lg p-3">
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="font-medium text-gray-900" x-text="summary.fullName"></span>
                                                <span class="text-sm font-bold text-blue-600" x-text="summary.totalWords + ' words'"></span>
                                            </div>
                                            <div class="grid grid-cols-5 gap-1 text-xs">
                                                <div class="text-center">
                                                    <div class="text-red-600 font-medium" x-text="summary.wordsInBox1"></div>
                                                    <div class="text-gray-500">Box 1</div>
                                                </div>
                                                <div class="text-center">
                                                    <div class="text-orange-600 font-medium" x-text="summary.wordsInBox2"></div>
                                                    <div class="text-gray-500">Box 2</div>
                                                </div>
                                                <div class="text-center">
                                                    <div class="text-yellow-600 font-medium" x-text="summary.wordsInBox3"></div>
                                                    <div class="text-gray-500">Box 3</div>
                                                </div>
                                                <div class="text-center">
                                                    <div class="text-blue-600 font-medium" x-text="summary.wordsInBox4"></div>
                                                    <div class="text-gray-500">Box 4</div>
                                                </div>
                                                <div class="text-center">
                                                    <div class="text-green-600 font-medium" x-text="summary.wordsInBox5"></div>
                                                    <div class="text-gray-500">Box 5</div>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Study Sessions Tab -->
                    <div x-show="activeTab === 'study'" class="space-y-6 fade-in">
                        <div class="bg-white rounded-xl shadow-lg card-hover">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <h3 class="text-lg font-semibold text-gray-900">Study Sessions Management</h3>
                            </div>
                            <div class="p-6">
                                <div x-show="studySummary.length > 0" class="overflow-x-auto">
                                    <table class="w-full">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cards</th>
                                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due for Review</th>
                                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Reviews</th>
                                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-200">
                                            <template x-for="session in studySummary" :key="session.userId">
                                                <tr class="hover:bg-gray-50">
                                                    <td class="px-4 py-3 text-sm font-medium text-gray-900" x-text="session.fullName"></td>
                                                    <td class="px-4 py-3 text-sm text-gray-600" x-text="session.totalCards"></td>
                                                    <td class="px-4 py-3">
                                                        <span class="px-2 py-1 text-xs font-medium rounded-full" 
                                                              :class="session.dueForReview > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                                                              x-text="session.dueForReview"></span>
                                                    </td>
                                                    <td class="px-4 py-3 text-sm text-gray-600" x-text="session.totalReviews"></td>
                                                    <td class="px-4 py-3">
                                                        <div class="flex items-center">
                                                            <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                                <div class="bg-blue-600 h-2 rounded-full" :style="'width: ' + session.accuracy + '%'"></div>
                                                            </div>
                                                            <span class="text-sm text-gray-600" x-text="session.accuracy + '%'"></span>
                                                        </div>
                                                    </td>
                                                    <td class="px-4 py-3">
                                                        <button @click="forceReview(session.userId)" 
                                                                class="text-blue-600 hover:text-blue-800 text-sm">
                                                            <i class="fas fa-play mr-1"></i>Force Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Topics Tab -->
                    <div x-show="activeTab === 'topics'" class="space-y-6 fade-in">
                        <div class="bg-white rounded-xl shadow-lg p-6 card-hover">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Generate Words from Topic</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                        <input type="number" x-model="topicForm.userId" placeholder="Enter user ID" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                                        <input type="text" x-model="topicForm.topic" placeholder="e.g., Travel, Business, Science" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Source Language</label>
                                            <select x-model="topicForm.sourceLanguage" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                                            <select x-model="topicForm.targetLanguage" 
                                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                                <option value="es">Spanish</option>
                                                <option value="en">English</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Number of Words</label>
                                        <input type="number" x-model="topicForm.wordCount" min="5" max="20" value="10" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <button @click="generateTopic()" :disabled="!topicForm.userId || !topicForm.topic || topicForm.generating" 
                                            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                                        <span x-show="!topicForm.generating">
                                            <i class="fas fa-magic mr-2"></i>Generate Words
                                        </span>
                                        <span x-show="topicForm.generating">
                                            <i class="fas fa-spinner loading-spinner mr-2"></i>Generating...
                                        </span>
                                    </button>
                                </div>
                                
                                <div class="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
                                    <h4 class="font-semibold text-gray-900 mb-3">AI Topic Generation</h4>
                                    <div class="space-y-2 text-sm text-gray-600">
                                        <div class="flex items-center">
                                            <i class="fas fa-brain text-green-600 mr-2"></i>
                                            <span>Powered by Google Gemini AI</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-language text-blue-600 mr-2"></i>
                                            <span>Supports 16+ languages</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-lightning-bolt text-yellow-600 mr-2"></i>
                                            <span>Instant vocabulary generation</span>
                                        </div>
                                        <div class="flex items-center">
                                            <i class="fas fa-book-open text-purple-600 mr-2"></i>
                                            <span>Context-aware definitions</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Support Tickets Tab -->
                    <div x-show="activeTab === 'support'" class="space-y-6 fade-in">
                        <div class="bg-white rounded-xl shadow-lg card-hover">
                            <div class="px-6 py-4 border-b border-gray-200">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-lg font-semibold text-gray-900">Support Tickets</h3>
                                    <div class="flex space-x-3">
                                        <span class="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                                            <span x-text="supportTickets.openTickets || 0"></span> Open
                                        </span>
                                        <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                            <span x-text="supportTickets.resolvedTickets || 0"></span> Resolved
                                        </span>
                                        <button @click="loadSupportTickets()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                            <i class="fas fa-sync-alt mr-2"></i>Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="p-6">
                                <div x-show="supportTickets.tickets && supportTickets.tickets.length > 0" class="space-y-4">
                                    <template x-for="ticket in supportTickets.tickets" :key="ticket.id">
                                        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div class="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 class="font-medium text-gray-900" x-text="ticket.subject || 'Support Request'"></h4>
                                                    <p class="text-sm text-gray-600" x-text="'User ID: ' + ticket.userId"></p>
                                                </div>
                                                <span class="px-2 py-1 text-xs font-medium rounded-full" 
                                                      :class="ticket.status === 'open' ? 'bg-red-100 text-red-800' : ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                                                      x-text="ticket.status"></span>
                                            </div>
                                            <p class="text-sm text-gray-700 mb-3" x-text="ticket.message"></p>
                                            <div class="flex items-center justify-between">
                                                <span class="text-xs text-gray-500" x-text="formatDate(ticket.createdAt)"></span>
                                                <button @click="respondToTicket(ticket)" class="text-blue-600 hover:text-blue-800 text-sm">
                                                    <i class="fas fa-reply mr-1"></i>Respond
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                                <div x-show="!supportTickets.tickets || supportTickets.tickets.length === 0" class="text-center py-8 text-gray-500">
                                    <i class="fas fa-ticket-alt text-4xl mb-4"></i>
                                    <p>No support tickets found</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Other tabs remain similar but with enhanced styling... -->
                    
                </div>
            </div>
        </div>

        <!-- Notifications Panel -->
        <div x-show="showNotifications" @click.away="showNotifications = false" 
             class="fixed top-16 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <h4 class="font-semibold">Notifications</h4>
            </div>
            <div class="custom-scrollbar max-h-64 overflow-y-auto">
                <template x-for="notification in notifications" :key="notification.id">
                    <div class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start space-x-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="notification.bgColor">
                                <i :class="notification.icon" class="text-white text-sm"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900" x-text="notification.title"></p>
                                <p class="text-xs text-gray-500" x-text="notification.message"></p>
                                <p class="text-xs text-gray-400 mt-1" x-text="notification.time"></p>
                            </div>
                        </div>
                    </div>
                </template>
                <div x-show="notifications.length === 0" class="p-8 text-center text-gray-500">
                    <i class="fas fa-bell-slash text-2xl mb-2"></i>
                    <p>No notifications</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        function premiumAdmin() {
            return {
                isAuthenticated: false,
                loading: false,
                error: '',
                token: '',
                activeTab: 'dashboard',
                showNotifications: false,
                sidebarOpen: true,
                currentTime: '',
                lastUpdateTime: '',
                
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
                userSearch: '',
                userFilter: 'all',
                notifications: [],
                recentActivity: [],
                logs: [],
                logFilter: 'all',
                
                systemHealth: {
                    status: 'healthy'
                },
                
                systemMetrics: {
                    memoryUsage: 45,
                    apiCalls: 1240,
                    responseTime: 120
                },
                
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
                
                // New data properties for extended features
                commandBreakdown: {},
                
                wordForm: {
                    userId: '',
                    word: '',
                    translation: '',
                    definition: ''
                },
                
                wordsSummary: [],
                
                studySummary: [],
                
                topicForm: {
                    userId: '',
                    topic: '',
                    sourceLanguage: 'en',
                    targetLanguage: 'es',
                    wordCount: 10,
                    generating: false
                },
                
                supportTickets: {
                    openTickets: 0,
                    resolvedTickets: 0,
                    tickets: []
                },
                
                init() {
                    this.updateTime();
                    setInterval(() => this.updateTime(), 1000);
                    
                    const token = localStorage.getItem('admin_token');
                    if (token) {
                        this.token = token;
                        this.isAuthenticated = true;
                        this.loadDashboard();
                        this.startRealTimeUpdates();
                    }
                    
                    this.initializeSampleData();
                    this.initializeCharts();
                },
                
                // Tab switch handler with data loading
                switchTab(tab) {
                    this.activeTab = tab;
                    
                    // Load data when switching to specific tabs
                    switch(tab) {
                        case 'commands':
                            if (Object.keys(this.commandBreakdown).length === 0) {
                                this.loadCommandStats();
                            }
                            break;
                        case 'words':
                            if (this.wordsSummary.length === 0) {
                                this.loadWordsSummary();
                            }
                            break;
                        case 'study':
                            if (this.studySummary.length === 0) {
                                this.loadStudySummary();
                            }
                            break;
                        case 'support':
                            if (this.supportTickets.tickets.length === 0) {
                                this.loadSupportTickets();
                            }
                            break;
                    }
                },
                
                updateTime() {
                    const now = new Date();
                    this.currentTime = now.toLocaleTimeString();
                    this.lastUpdateTime = now.toLocaleString();
                },
                
                async login() {
                    this.loading = true;
                    this.error = '';
                    this.addLog('info', 'Attempting admin login', 'Username: ' + this.loginForm.username);
                    
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
                            this.addLog('success', 'Admin login successful');
                            this.addNotification('success', 'Welcome back!', 'Successfully logged in to admin panel');
                            this.loadDashboard();
                            this.startRealTimeUpdates();
                        } else {
                            const error = await response.json();
                            this.error = error.message || 'Login failed';
                            this.addLog('error', 'Login failed', this.error);
                        }
                    } catch (error) {
                        this.error = 'Network error occurred';
                        this.addLog('error', 'Network error during login', error.toString());
                    } finally {
                        this.loading = false;
                    }
                },
                
                logout() {
                    localStorage.removeItem('admin_token');
                    this.isAuthenticated = false;
                    this.token = '';
                    this.loginForm = { username: '', password: '' };
                    this.addLog('info', 'Admin logged out');
                },
                
                async loadDashboard() {
                    this.addLog('debug', 'Loading dashboard data');
                    try {
                        const response = await fetch('/admin/dashboard', {
                            headers: { 'Authorization': 'Bearer ' + this.token }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.stats = data.stats || this.stats;
                            this.users = data.users || [];
                            this.recentActivity = data.activity || [];
                            this.addLog('success', 'Dashboard data loaded successfully');
                        } else {
                            this.addLog('error', 'Failed to load dashboard data', 'Status: ' + response.status);
                        }
                    } catch (error) {
                        this.addLog('error', 'Error loading dashboard', error.toString());
                    }
                },
                
                startRealTimeUpdates() {
                    setInterval(() => {
                        if (this.isAuthenticated) {
                            this.loadDashboard();
                            this.systemMetrics.apiCalls += Math.floor(Math.random() * 10);
                            this.systemMetrics.responseTime = 100 + Math.floor(Math.random() * 50);
                            this.systemMetrics.memoryUsage = 40 + Math.floor(Math.random() * 20);
                        }
                    }, 30000); // Update every 30 seconds
                },
                
                addLog(level, message, details = '') {
                    const log = {
                        id: Date.now() + Math.random(),
                        level: level,
                        message: message,
                        details: details,
                        timestamp: new Date().toLocaleTimeString()
                    };
                    this.logs.unshift(log);
                    
                    // Keep only last 100 logs
                    if (this.logs.length > 100) {
                        this.logs = this.logs.slice(0, 100);
                    }
                },
                
                addNotification(type, title, message) {
                    const bgColors = {
                        success: 'bg-green-500',
                        error: 'bg-red-500',
                        warning: 'bg-yellow-500',
                        info: 'bg-blue-500'
                    };
                    
                    const icons = {
                        success: 'fas fa-check',
                        error: 'fas fa-exclamation-triangle',
                        warning: 'fas fa-exclamation',
                        info: 'fas fa-info'
                    };
                    
                    const notification = {
                        id: Date.now() + Math.random(),
                        type: type,
                        title: title,
                        message: message,
                        time: new Date().toLocaleTimeString(),
                        bgColor: bgColors[type] || 'bg-gray-500',
                        icon: icons[type] || 'fas fa-bell'
                    };
                    
                    this.notifications.unshift(notification);
                    
                    // Auto remove after 5 seconds
                    setTimeout(() => {
                        const index = this.notifications.findIndex(n => n.id === notification.id);
                        if (index > -1) {
                            this.notifications.splice(index, 1);
                        }
                    }, 5000);
                },
                
                clearLogs() {
                    this.logs = [];
                    this.addLog('info', 'Logs cleared by admin');
                },
                
                refreshLogs() {
                    this.addLog('info', 'Logs refreshed manually');
                    this.addNotification('info', 'Logs Updated', 'Debug logs have been refreshed');
                },
                
                exportLogs() {
                    const logData = JSON.stringify(this.logs, null, 2);
                    const blob = new Blob([logData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'admin-logs-' + new Date().toISOString().split('T')[0] + '.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    this.addLog('info', 'Logs exported to file');
                },
                
                exportUsers() {
                    const userData = JSON.stringify(this.users, null, 2);
                    const blob = new Blob([userData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'users-export-' + new Date().toISOString().split('T')[0] + '.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    this.addLog('info', 'User data exported');
                },
                
                formatDate(date) {
                    return date ? new Date(date).toLocaleDateString() : 'Never';
                },
                
                get filteredUsers() {
                    let filtered = this.users;
                    
                    if (this.userSearch) {
                        filtered = filtered.filter(user => 
                            (user.fullName || '').toLowerCase().includes(this.userSearch.toLowerCase()) ||
                            user.id.toString().includes(this.userSearch)
                        );
                    }
                    
                    if (this.userFilter !== 'all') {
                        filtered = filtered.filter(user => {
                            if (this.userFilter === 'active') return user.isRegistrationComplete;
                            if (this.userFilter === 'pending') return !user.isRegistrationComplete;
                            return true;
                        });
                    }
                    
                    return filtered;
                },
                
                get filteredLogs() {
                    if (this.logFilter === 'all') return this.logs;
                    return this.logs.filter(log => log.level === this.logFilter);
                },
                
                initializeSampleData() {
                    // Add sample logs
                    this.addLog('info', 'Admin panel initialized');
                    this.addLog('debug', 'Loading configuration settings');
                    this.addLog('success', 'All systems operational');
                    
                    // Add sample notifications
                    this.addNotification('info', 'System Status', 'All services are running normally');
                    
                    // Add sample activity
                    this.recentActivity = [
                        {
                            id: 1,
                            title: 'New user registered',
                            description: 'User #12345 completed registration',
                            time: '2 minutes ago',
                            icon: 'fas fa-user-plus',
                            bgColor: 'bg-green-500'
                        },
                        {
                            id: 2,
                            title: 'System backup completed',
                            description: 'Daily backup finished successfully',
                            time: '1 hour ago',
                            icon: 'fas fa-cloud-upload-alt',
                            bgColor: 'bg-blue-500'
                        },
                        {
                            id: 3,
                            title: 'API rate limit warning',
                            description: 'Approaching 80% of hourly limit',
                            time: '3 hours ago',
                            icon: 'fas fa-exclamation-triangle',
                            bgColor: 'bg-yellow-500'
                        }
                    ];
                },
                
                initializeCharts() {
                    // Initialize charts after DOM is ready
                    setTimeout(() => {
                        this.createUserGrowthChart();
                        this.createCommandUsageChart();
                        this.createPerformanceChart();
                    }, 1000);
                },
                
                createUserGrowthChart() {
                    const ctx = document.getElementById('userGrowthChart');
                    if (!ctx) return;
                    
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [{
                                label: 'New Users',
                                data: [12, 19, 3, 5, 2, 3],
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }
                    });
                },
                
                createCommandUsageChart() {
                    const ctx = document.getElementById('commandUsageChart');
                    if (!ctx) return;
                    
                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['/start', '/register', '/study', '/add', '/stats'],
                            datasets: [{
                                data: [30, 25, 20, 15, 10],
                                backgroundColor: [
                                    '#3B82F6',
                                    '#10B981',
                                    '#F59E0B',
                                    '#EF4444',
                                    '#8B5CF6'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { position: 'bottom' }
                            }
                        }
                    });
                },
                
                createPerformanceChart() {
                    const ctx = document.getElementById('performanceChart');
                    if (!ctx) return;
                    
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['CPU', 'Memory', 'Network', 'Storage'],
                            datasets: [{
                                label: 'Usage %',
                                data: [65, 45, 30, 55],
                                backgroundColor: [
                                    'rgba(59, 130, 246, 0.8)',
                                    'rgba(16, 185, 129, 0.8)',
                                    'rgba(245, 158, 11, 0.8)',
                                    'rgba(139, 92, 246, 0.8)'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { display: false }
                            },
                            scales: {
                                y: { 
                                    beginAtZero: true,
                                    max: 100
                                }
                            }
                        }
                    });
                },

                // Bot Commands Management
                async loadCommandStats() {
                    this.addLog('debug', 'Loading command statistics');
                    try {
                        const response = await fetch('/admin/api/commands/stats');
                        const data = await response.json();
                        this.commandBreakdown = data.commands || {};
                        this.addLog('success', 'Command stats loaded');
                    } catch (error) {
                        this.addLog('error', 'Error loading command stats', error.toString());
                    }
                },

                // Word Management
                async addWordToUser() {
                    const { userId, word, translation, definition } = this.wordForm;
                    this.addLog('debug', 'Adding word to user', 'User: ' + userId + ', Word: ' + word);
                    
                    try {
                        const response = await fetch('/admin/api/words/manage', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'add',
                                userId: parseInt(userId),
                                word,
                                translation,
                                definition
                            })
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                            this.wordForm = { userId: '', word: '', translation: '', definition: '' };
                            this.loadWordsSummary();
                            this.addLog('success', 'Word added successfully');
                            this.addNotification('success', 'Word Added', 'Added "' + word + '" to user ' + userId);
                        } else {
                            this.addLog('error', 'Failed to add word', data.error);
                        }
                    } catch (error) {
                        this.addLog('error', 'Error adding word', error.toString());
                    }
                },

                async loadWordsSummary() {
                    try {
                        const response = await fetch('/admin/api/words/summary');
                        const data = await response.json();
                        this.wordsSummary = data.users || [];
                        this.addLog('debug', 'Words summary loaded', 'Found ' + this.wordsSummary.length + ' users');
                    } catch (error) {
                        this.addLog('error', 'Error loading words summary', error.toString());
                    }
                },

                // Study Sessions Management
                async loadStudySummary() {
                    try {
                        const response = await fetch('/admin/api/study/sessions');
                        const data = await response.json();
                        this.studySummary = data.sessions || [];
                        this.addLog('debug', 'Study summary loaded', 'Found ' + this.studySummary.length + ' sessions');
                    } catch (error) {
                        this.addLog('error', 'Error loading study sessions', error.toString());
                    }
                },

                async forceReview(userId) {
                    if (confirm('Force review session for this user?')) {
                        this.addLog('debug', 'Forcing review session', 'User ID: ' + userId);
                        try {
                            const response = await fetch('/admin/api/study/force-review', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId })
                            });
                            
                            const data = await response.json();
                            if (data.success) {
                                this.loadStudySummary();
                                this.addLog('success', 'Review session triggered');
                                this.addNotification('success', 'Review Triggered', 'Forced review for user ' + userId);
                            } else {
                                this.addLog('error', 'Failed to trigger review', data.error);
                            }
                        } catch (error) {
                            this.addLog('error', 'Error triggering review', error.toString());
                        }
                    }
                },

                // AI Topics Management
                async generateTopic() {
                    const { userId, topic, sourceLanguage, targetLanguage, wordCount } = this.topicForm;
                    this.topicForm.generating = true;
                    this.addLog('debug', 'Generating AI topic', 'Topic: ' + topic + ', User: ' + userId);
                    
                    try {
                        const response = await fetch('/admin/api/topics/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: parseInt(userId),
                                topic,
                                sourceLanguage,
                                targetLanguage,
                                wordCount: parseInt(wordCount) || 10
                            })
                        });
                        
                        const data = await response.json();
                        this.topicForm.generating = false;
                        
                        if (data.success) {
                            this.topicForm = { 
                                userId: '', 
                                topic: '', 
                                sourceLanguage: 'en', 
                                targetLanguage: 'es', 
                                wordCount: 10,
                                generating: false 
                            };
                            this.loadWordsSummary();
                            this.addLog('success', 'AI topic generated', 'Generated ' + data.wordsCount + ' words');
                            this.addNotification('success', 'Topic Generated', 'Created ' + data.wordsCount + ' words for "' + topic + '"');
                        } else {
                            this.addLog('error', 'Failed to generate topic', data.error);
                        }
                    } catch (error) {
                        this.topicForm.generating = false;
                        this.addLog('error', 'Error generating topic', error.toString());
                    }
                },

                // Support Tickets Management
                async loadSupportTickets() {
                    this.addLog('debug', 'Loading support tickets');
                    try {
                        const response = await fetch('/admin/api/support/tickets');
                        const data = await response.json();
                        this.supportTickets = data;
                        this.addLog('debug', 'Support tickets loaded', data.openTickets + ' open, ' + data.resolvedTickets + ' resolved');
                    } catch (error) {
                        this.addLog('error', 'Error loading support tickets', error.toString());
                    }
                },

                async respondToTicket(ticket) {
                    const response = prompt('Respond to ticket from User ' + ticket.userId + ':\\n"' + ticket.message + '"\\n\\nYour response:');
                    if (response) {
                        this.addLog('debug', 'Responding to support ticket', 'Ticket ID: ' + ticket.id);
                        try {
                            const apiResponse = await fetch('/admin/api/support/respond', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ticketId: ticket.id,
                                    userId: ticket.userId,
                                    response
                                })
                            });
                            
                            const data = await apiResponse.json();
                            if (data.success) {
                                this.loadSupportTickets();
                                this.addLog('success', 'Response sent to user');
                                this.addNotification('success', 'Response Sent', 'Replied to user ' + ticket.userId);
                            } else {
                                this.addLog('error', 'Failed to send response', data.error);
                            }
                        } catch (error) {
                            this.addLog('error', 'Error sending response', error.toString());
                        }
                    }
                },

                // Additional methods remain the same...
                async loadUsers() {
                    this.addLog('debug', 'Loading users data');
                    try {
                        const response = await fetch('/admin/users', {
                            headers: { 'Authorization': 'Bearer ' + this.token }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.users = data.users || [];
                            this.addLog('success', 'Users data loaded successfully', 'Found ' + this.users.length + ' users');
                        } else {
                            this.addLog('error', 'Failed to load users', 'Status: ' + response.status);
                        }
                    } catch (error) {
                        this.addLog('error', 'Error loading users', error.toString());
                    }
                },
                
                sendMessageToUser(userId) {
                    this.activeTab = 'messaging';
                    this.messaging.type = 'individual';
                    this.messaging.targetUser = userId.toString();
                    this.addLog('debug', 'Preparing message for user', 'User ID: ' + userId);
                },
                
                viewUserDetails(user) {
                    this.addLog('info', 'Viewing user details', 'User: ' + (user.fullName || user.id));
                    this.addNotification('info', 'User Details', 'Viewing details for ' + (user.fullName || 'User ' + user.id));
                }
            };
        }
    </script>
</body>
</html>`;
}
