export function getAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitner Bot Admin Panel - Enhanced v2.1</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Cache Buster - Updated: 2025-01-05 -->
    <style>
        .notification-badge {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body class="bg-gray-100">
    <div x-data="adminApp()" x-init="init()">
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        🎯 Leitner Bot Admin Panel
                    </h2>
                    <p class="mt-2 text-center text-sm text-gray-600">
                        Sign in to access the admin dashboard
                    </p>
                </div>
                <form @submit.prevent="login()" class="mt-8 space-y-6">
                    <div class="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input x-model="loginForm.username" type="text" required
                                   class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                   placeholder="Username">
                        </div>
                        <div>
                            <input x-model="loginForm.password" type="password" required
                                   class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                   placeholder="Password">
                        </div>
                    </div>
                    <div>
                        <button type="submit" :disabled="loading"
                                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            <span x-show="!loading">Sign in</span>
                            <span x-show="loading">Signing in...</span>
                        </button>
                    </div>
                    <div x-show="error" class="text-red-600 text-sm text-center" x-text="error"></div>
                </form>
                <div class="text-center mt-4">
                    <p class="text-sm text-gray-600">No admin account? <a href="#" @click="showCreateAdmin = true" class="text-indigo-600 hover:text-indigo-500">Create one</a></p>
                </div>
            </div>
        </div>

        <!-- Create Admin Account -->
        <div x-show="showCreateAdmin && !isAuthenticated" class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create Admin Account
                    </h2>
                </div>
                <form @submit.prevent="createAdmin()" class="mt-8 space-y-6">
                    <div class="space-y-4">
                        <input x-model="createForm.username" type="text" required
                               class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                               placeholder="Username">
                        <input x-model="createForm.email" type="email" required
                               class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                               placeholder="Email">
                        <input x-model="createForm.fullName" type="text" required
                               class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                               placeholder="Full Name">
                        <input x-model="createForm.password" type="password" required
                               class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                               placeholder="Password">
                    </div>
                    <div class="flex space-x-4">
                        <button type="submit" :disabled="loading"
                                class="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                            Create Account
                        </button>
                        <button @click="showCreateAdmin = false" type="button"
                                class="flex-1 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Back to Login
                        </button>
                    </div>
                    <div x-show="error" class="text-red-600 text-sm text-center" x-text="error"></div>
                </form>
            </div>
        </div>

        <!-- Admin Dashboard -->
        <div x-show="isAuthenticated" class="min-h-screen bg-gray-100">
            <!-- Navigation -->
            <nav class="bg-white shadow-lg">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex justify-between items-center h-16">
                        <div class="flex items-center">
                            <h1 class="text-xl font-bold text-gray-900">🎯 Leitner Bot Admin Panel</h1>
                            <span class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Enhanced v2.1</span>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div x-show="notifications.length > 0" class="relative">
                                <button @click="showNotifications = !showNotifications" class="relative p-2 text-gray-600 hover:text-gray-900">
                                    <i class="fas fa-bell text-lg"></i>
                                    <span class="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full notification-badge"></span>
                                </button>
                            </div>
                            <span class="text-gray-700" x-text="'Welcome, ' + (admin?.fullName || 'Admin')"></span>
                            <button @click="logout()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Tab Navigation -->
            <div class="bg-white border-b">
                <div class="max-w-7xl mx-auto px-4">
                    <nav class="flex space-x-8">
                        <button @click="activeTab = 'dashboard'; loadDashboard()" 
                                :class="activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                class="py-4 px-1 border-b-2 font-medium text-sm">
                            <i class="fas fa-chart-line mr-2"></i>Dashboard
                        </button>
                        <button @click="activeTab = 'users'; refreshUsers()" 
                                :class="activeTab === 'users' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                class="py-4 px-1 border-b-2 font-medium text-sm">
                            <i class="fas fa-users mr-2"></i>Users
                        </button>
                        <button @click="activeTab = 'bulk-words'" 
                                :class="activeTab === 'bulk-words' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                class="py-4 px-1 border-b-2 font-medium text-sm">
                            <i class="fas fa-magic mr-2"></i>AI Bulk Words
                        </button>
                        <button @click="activeTab = 'messages'" 
                                :class="activeTab === 'messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                class="py-4 px-1 border-b-2 font-medium text-sm">
                            <i class="fas fa-bullhorn mr-2"></i>Bulk Messaging
                        </button>
                        <button @click="activeTab = 'tickets'; refreshTickets()" 
                                :class="activeTab === 'tickets' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                class="py-4 px-1 border-b-2 font-medium text-sm">
                            <i class="fas fa-ticket-alt mr-2"></i>Support
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Content -->
            <div class="max-w-7xl mx-auto py-6 px-4">
                <!-- Dashboard Tab -->
                <div x-show="activeTab === 'dashboard'">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <i class="fas fa-users text-gray-400 text-2xl"></i>
                                    </div>
                                    <div class="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                            <dd class="text-lg font-medium text-gray-900" x-text="stats.totalUsers || 0"></dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <i class="fas fa-user-check text-green-400 text-2xl"></i>
                                    </div>
                                    <div class="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt class="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                            <dd class="text-lg font-medium text-gray-900" x-text="stats.activeUsers || 0"></dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <i class="fas fa-book text-blue-400 text-2xl"></i>
                                    </div>
                                    <div class="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt class="text-sm font-medium text-gray-500 truncate">Total Cards</dt>
                                            <dd class="text-lg font-medium text-gray-900" x-text="stats.totalCards || 0"></dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <i class="fas fa-ticket-alt text-red-400 text-2xl"></i>
                                    </div>
                                    <div class="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt class="text-sm font-medium text-gray-500 truncate">Open Tickets</dt>
                                            <dd class="text-lg font-medium text-gray-900" x-text="stats.openTickets || 0"></dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature Highlights -->
                    <div class="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg p-6 text-white mb-6">
                        <h3 class="text-lg font-semibold mb-4">🚀 Enhanced Features Available</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="flex items-center">
                                <i class="fas fa-magic mr-3 text-yellow-200"></i>
                                <span>AI-Powered Bulk Word Processing</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-bullhorn mr-3 text-yellow-200"></i>
                                <span>Advanced Bulk Messaging System</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-bell mr-3 text-yellow-200"></i>
                                <span>Real-time Notification System</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Users Tab -->
                <div x-show="activeTab === 'users'">
                    <div class="bg-white shadow overflow-hidden sm:rounded-md">
                        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">Enhanced User Management</h3>
                            <button @click="refreshUsers()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                <i class="fas fa-sync mr-2"></i>Refresh
                            </button>
                        </div>
                        <ul class="divide-y divide-gray-200">
                            <template x-for="user in users" :key="user.id">
                                <li class="px-4 py-4 sm:px-6">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0 h-10 w-10">
                                                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <i class="fas fa-user text-gray-600"></i>
                                                </div>
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900" x-text="user.fullName || user.firstName || 'No name'"></div>
                                                <div class="text-sm text-gray-500" x-text="user.email || 'No email'"></div>
                                                <div class="text-xs text-gray-400" x-text="'ID: ' + user.id + ' | Language: ' + (user.language || 'N/A')"></div>
                                                <!-- Enhanced User Stats -->
                                                <div class="mt-2 flex space-x-4 text-xs">
                                                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded" x-text="'Cards: ' + (user.totalCards || 0)"></span>
                                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded" x-text="'Level: ' + (user.level || 1)"></span>
                                                    <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded" x-text="'Progress: ' + (user.progress || 0) + '%'"></span>
                                                    <span :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded" x-text="user.isActive ? 'Active' : 'Inactive'"></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button @click="sendDirectMessageToUser(user)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">
                                                <i class="fas fa-envelope mr-1"></i>Message
                                            </button>
                                            <button @click="viewUserDetails(user)" class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs">
                                                <i class="fas fa-eye mr-1"></i>Details
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            </template>
                            <li x-show="users.length === 0" class="px-4 py-8 text-center text-gray-500">
                                No users found. Click Refresh to load users.
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- AI Bulk Words Tab -->
                <div x-show="activeTab === 'bulk-words'">
                    <div class="bg-white shadow sm:rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">🤖 AI-Powered Bulk Word Processing</h3>
                                <div class="flex items-center space-x-2">
                                    <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        <i class="fas fa-robot mr-1"></i>AI Enhanced
                                    </span>
                                </div>
                            </div>
                            
                            <form @submit.prevent="processBulkWordsWithAI()">
                                <div class="grid grid-cols-1 gap-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Source Language</label>
                                            <select x-model="bulkWordsForm.sourceLanguage" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2">
                                                <option value="en">English</option>
                                                <option value="fa">Persian/Farsi</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                                <option value="it">Italian</option>
                                                <option value="pt">Portuguese</option>
                                                <option value="ru">Russian</option>
                                                <option value="ar">Arabic</option>
                                                <option value="zh">Chinese</option>
                                                <option value="ja">Japanese</option>
                                                <option value="ko">Korean</option>
                                                <option value="tr">Turkish</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Target Language</label>
                                            <select x-model="bulkWordsForm.targetLanguage" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2">
                                                <option value="fa">Persian/Farsi</option>
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                                <option value="it">Italian</option>
                                                <option value="pt">Portuguese</option>
                                                <option value="ru">Russian</option>
                                                <option value="ar">Arabic</option>
                                                <option value="zh">Chinese</option>
                                                <option value="ja">Japanese</option>
                                                <option value="ko">Korean</option>
                                                <option value="tr">Turkish</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Target User IDs (comma-separated)</label>
                                        <input x-model="bulkWordsForm.userIds" type="text" placeholder="123,456,789 or leave empty for all users" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2">
                                        <p class="mt-1 text-xs text-gray-500">Leave empty to send to all users</p>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Words (one per line - AI will auto-translate and define)</label>
                                        <textarea x-model="bulkWordsForm.wordsText" rows="8" 
                                                  placeholder="Enter words, one per line:
hello
world
computer
artificial intelligence
learning"
                                                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 font-mono text-sm"></textarea>
                                        <p class="mt-1 text-xs text-gray-500">AI will automatically generate translations and definitions for each word</p>
                                    </div>

                                    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                                        <div class="flex">
                                            <div class="flex-shrink-0">
                                                <i class="fas fa-info-circle text-blue-400"></i>
                                            </div>
                                            <div class="ml-3">
                                                <h3 class="text-sm font-medium text-blue-800">AI Processing Features</h3>
                                                <div class="mt-2 text-sm text-blue-700">
                                                    <ul class="list-disc list-inside space-y-1">
                                                        <li>Automatic translation between 13+ languages</li>
                                                        <li>AI-generated contextual definitions</li>
                                                        <li>Smart language detection and correction</li>
                                                        <li>Batch processing for efficiency</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <button type="submit" :disabled="loading || !bulkWordsForm.wordsText.trim()" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 flex items-center">
                                            <i class="fas fa-magic mr-2"></i>
                                            <span x-show="!loading">Process with AI</span>
                                            <span x-show="loading">
                                                <i class="fas fa-spinner fa-spin mr-2"></i>AI Processing...
                                            </span>
                                        </button>
                                    </div>

                                    <!-- Processing Results -->
                                    <div x-show="bulkWordsResult" class="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                                        <h4 class="text-sm font-medium text-green-800 mb-2">Processing Results</h4>
                                        <div class="text-sm text-green-700" x-html="bulkWordsResult"></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Bulk Messaging Tab -->
                <div x-show="activeTab === 'messages'">
                    <div class="space-y-6">
                        <!-- Message Type Selector -->
                        <div class="bg-white shadow sm:rounded-lg">
                            <div class="px-4 py-5 sm:p-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">📢 Advanced Messaging System</h3>
                                <div class="flex space-x-4 mb-6">
                                    <button @click="messageType = 'direct'" :class="messageType === 'direct' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                                            class="px-4 py-2 rounded-md font-medium">
                                        <i class="fas fa-user mr-2"></i>Direct Message
                                    </button>
                                    <button @click="messageType = 'bulk'" :class="messageType === 'bulk' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'"
                                            class="px-4 py-2 rounded-md font-medium">
                                        <i class="fas fa-users mr-2"></i>Bulk Message
                                    </button>
                                    <button @click="messageType = 'broadcast'" :class="messageType === 'broadcast' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'"
                                            class="px-4 py-2 rounded-md font-medium">
                                        <i class="fas fa-bullhorn mr-2"></i>Broadcast Message
                                    </button>
                                </div>

                                <!-- Direct Message Form -->
                                <div x-show="messageType === 'direct'">
                                    <form @submit.prevent="sendDirectMessage()">
                                        <div class="grid grid-cols-1 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">User ID</label>
                                                <input x-model="directMessageForm.userId" type="number" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Message</label>
                                                <textarea x-model="directMessageForm.message" rows="4" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"></textarea>
                                            </div>
                                            <div>
                                                <button type="submit" :disabled="loading" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                                    <i class="fas fa-paper-plane mr-2"></i>
                                                    <span x-show="!loading">Send Direct Message</span>
                                                    <span x-show="loading">Sending...</span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <!-- Bulk Message Form -->
                                <div x-show="messageType === 'bulk'">
                                    <form @submit.prevent="sendBulkMessage()">
                                        <div class="grid grid-cols-1 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Target User IDs (comma-separated)</label>
                                                <input x-model="bulkMessageForm.userIds" type="text" required placeholder="123,456,789" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-2">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Message</label>
                                                <textarea x-model="bulkMessageForm.message" rows="4" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-2"></textarea>
                                            </div>
                                            <div>
                                                <button type="submit" :disabled="loading" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                                    <i class="fas fa-users mr-2"></i>
                                                    <span x-show="!loading">Send Bulk Message</span>
                                                    <span x-show="loading">Sending...</span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <!-- Broadcast Message Form -->
                                <div x-show="messageType === 'broadcast'">
                                    <form @submit.prevent="sendBroadcastMessage()">
                                        <div class="grid grid-cols-1 gap-4">
                                            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                                <div class="flex">
                                                    <div class="flex-shrink-0">
                                                        <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                                                    </div>
                                                    <div class="ml-3">
                                                        <h3 class="text-sm font-medium text-yellow-800">Broadcast Warning</h3>
                                                        <div class="mt-2 text-sm text-yellow-700">
                                                            <p>This message will be sent to ALL users in the system. Use with caution.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Broadcast Message</label>
                                                <textarea x-model="broadcastMessageForm.message" rows="6" required placeholder="Enter your broadcast message here..." class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 px-3 py-2"></textarea>
                                            </div>
                                            <div class="flex items-center">
                                                <input x-model="broadcastMessageForm.confirmed" type="checkbox" class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                                                <label class="ml-2 block text-sm text-gray-900">
                                                    I confirm that I want to send this message to ALL users
                                                </label>
                                            </div>
                                            <div>
                                                <button type="submit" :disabled="loading || !broadcastMessageForm.confirmed" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                                    <i class="fas fa-bullhorn mr-2"></i>
                                                    <span x-show="!loading">Send Broadcast Message</span>
                                                    <span x-show="loading">Broadcasting...</span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Messages -->
                        <div class="bg-white shadow sm:rounded-lg">
                            <div class="px-4 py-5 sm:px-6">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Messages</h3>
                            </div>
                            <div class="border-t border-gray-200">
                                <div class="px-4 py-4 text-sm text-gray-500">
                                    Message history will appear here after sending messages.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Support Tickets Tab -->
                <div x-show="activeTab === 'tickets'">
                    <div class="bg-white shadow overflow-hidden sm:rounded-md">
                        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">🎧 Enhanced Support System</h3>
                            <button @click="refreshTickets()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                <i class="fas fa-sync mr-2"></i>Refresh
                            </button>
                        </div>
                        <ul class="divide-y divide-gray-200">
                            <template x-for="ticket in tickets" :key="ticket.id">
                                <li class="px-4 py-4 sm:px-6">
                                    <div class="flex items-center justify-between">
                                        <div class="flex-1">
                                            <div class="flex items-center justify-between">
                                                <div class="text-sm font-medium text-gray-900" x-text="ticket.subject"></div>
                                                <div class="flex items-center space-x-2">
                                                    <span :class="getTicketStatusColor(ticket.status)" class="px-2 py-1 text-xs font-semibold rounded-full" x-text="ticket.status.toUpperCase()"></span>
                                                    <span :class="getTicketPriorityColor(ticket.priority)" class="px-2 py-1 text-xs font-semibold rounded-full" x-text="ticket.priority.toUpperCase()"></span>
                                                </div>
                                            </div>
                                            <div class="mt-1 text-sm text-gray-500" x-text="ticket.message"></div>
                                            <div class="mt-1 text-xs text-gray-400" x-text="'From: ' + (ticket.userName || 'User ID: ' + ticket.userId) + ' | ' + new Date(ticket.createdAt).toLocaleDateString()"></div>
                                            
                                            <!-- Enhanced Ticket Info -->
                                            <div class="mt-2 flex space-x-4 text-xs">
                                                <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded" x-text="'ID: ' + ticket.id"></span>
                                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded" x-text="'Category: ' + (ticket.category || 'General')"></span>
                                                <span x-show="ticket.assignedToAdmin" class="bg-green-100 text-green-800 px-2 py-1 rounded" x-text="'Assigned: ' + ticket.assignedToAdmin"></span>
                                            </div>
                                        </div>
                                        <div class="ml-4 flex space-x-2">
                                            <button @click="viewTicketConversation(ticket)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">
                                                <i class="fas fa-comments mr-1"></i>View
                                            </button>
                                            <button @click="respondToTicket(ticket)" class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs">
                                                <i class="fas fa-reply mr-1"></i>Respond
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            </template>
                            <li x-show="tickets.length === 0" class="px-4 py-8 text-center text-gray-500">
                                No support tickets found.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notifications Panel -->
        <div x-show="showNotifications" @click.away="showNotifications = false" class="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 transform transition-transform">
            <div class="p-4 border-b">
                <h3 class="text-lg font-semibold">Notifications</h3>
            </div>
            <div class="p-4 space-y-4 max-h-96 overflow-y-auto">
                <template x-for="notification in notifications" :key="notification.id">
                    <div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div class="text-sm font-medium text-blue-800" x-text="notification.title"></div>
                        <div class="text-sm text-blue-600" x-text="notification.message"></div>
                        <div class="text-xs text-blue-500 mt-1" x-text="new Date(notification.timestamp).toLocaleString()"></div>
                    </div>
                </template>
                <div x-show="notifications.length === 0" class="text-center text-gray-500">
                    No new notifications
                </div>
            </div>
        </div>

        <!-- Alert -->
        <div x-show="showAlert" x-transition class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
            <div class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto border border-gray-200">
                <div class="p-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i :class="alertType === 'success' ? 'fas fa-check-circle text-green-400' : 'fas fa-exclamation-circle text-red-400'"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-900" x-text="alertMessage"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div x-show="loading" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
                <i class="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
                <span class="text-lg font-medium">Processing...</span>
            </div>
        </div>
    </div>

    <script>
        function adminApp() {
            return {
                isAuthenticated: false,
                admin: null,
                token: null,
                activeTab: 'dashboard',
                loading: false,
                error: '',
                showAlert: false,
                alertMessage: '',
                alertType: 'success',
                showCreateAdmin: false,
                showNotifications: false,
                notifications: [],
                messageType: 'direct',
                
                // Login form
                loginForm: {
                    username: '',
                    password: ''
                },

                // Create admin form
                createForm: {
                    username: '',
                    email: '',
                    fullName: '',
                    password: ''
                },

                // Dashboard stats
                stats: {
                    totalUsers: 0,
                    activeUsers: 0,
                    totalCards: 0,
                    openTickets: 0
                },

                // Users
                users: [],

                // AI Bulk Words form
                bulkWordsForm: {
                    sourceLanguage: 'en',
                    targetLanguage: 'fa',
                    userIds: '',
                    wordsText: ''
                },
                bulkWordsResult: '',

                // Message forms
                directMessageForm: {
                    userId: '',
                    message: ''
                },
                bulkMessageForm: {
                    userIds: '',
                    message: ''
                },
                broadcastMessageForm: {
                    message: '',
                    confirmed: false
                },

                // Support tickets
                tickets: [],

                init() {
                    // Check for stored auth
                    const storedToken = localStorage.getItem('adminToken');
                    if (storedToken) {
                        this.token = storedToken;
                        this.isAuthenticated = true;
                        this.loadDashboard();
                    }
                },

                async createAdmin() {
                    this.loading = true;
                    this.error = '';
                    
                    try {
                        const response = await fetch('/admin/create-admin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(this.createForm)
                        });

                        const data = await response.json();
                        
                        if (response.ok) {
                            this.showAlertMessage('Admin account created successfully! You can now login.', 'success');
                            this.showCreateAdmin = false;
                            this.createForm = { username: '', email: '', fullName: '', password: '' };
                        } else {
                            this.error = data.error || 'Failed to create admin account';
                        }
                    } catch (err) {
                        this.error = 'Network error. Please try again.';
                    }
                    
                    this.loading = false;
                },

                async login() {
                    this.loading = true;
                    this.error = '';
                    
                    try {
                        const response = await fetch('/admin/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(this.loginForm)
                        });

                        const data = await response.json();
                        
                        if (response.ok) {
                            this.admin = data.admin;
                            this.token = data.token;
                            this.isAuthenticated = true;
                            localStorage.setItem('adminToken', this.token);
                            await this.loadDashboard();
                        } else {
                            this.error = data.error || 'Login failed';
                        }
                    } catch (err) {
                        this.error = 'Network error. Please try again.';
                    }
                    
                    this.loading = false;
                },

                logout() {
                    this.isAuthenticated = false;
                    this.admin = null;
                    this.token = null;
                    this.activeTab = 'dashboard';
                    localStorage.removeItem('adminToken');
                },

                async loadDashboard() {
                    try {
                        const response = await fetch('/admin/dashboard', {
                            headers: {
                                'Authorization': \`Bearer \${this.token}\`
                            }
                        });

                        if (response.ok) {
                            this.stats = await response.json();
                        }
                    } catch (err) {
                        console.error('Failed to load dashboard:', err);
                    }
                },

                async refreshUsers() {
                    try {
                        const response = await fetch('/admin/users', {
                            headers: {
                                'Authorization': \`Bearer \${this.token}\`
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            this.users = data.users || [];
                        }
                    } catch (err) {
                        console.error('Failed to load users:', err);
                    }
                },

                async processBulkWordsWithAI() {
                    this.loading = true;
                    this.bulkWordsResult = '';
                    
                    try {
                        const words = this.bulkWordsForm.wordsText.split('\\n')
                            .map(word => word.trim())
                            .filter(word => word.length > 0);

                        if (words.length === 0) {
                            this.showAlertMessage('Please enter at least one word', 'error');
                            this.loading = false;
                            return;
                        }

                        const userIds = this.bulkWordsForm.userIds 
                            ? this.bulkWordsForm.userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                            : [];

                        const response = await fetch('/admin/bulk-words-ai', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${this.token}\`
                            },
                            body: JSON.stringify({
                                words: words,
                                sourceLanguage: this.bulkWordsForm.sourceLanguage,
                                targetLanguage: this.bulkWordsForm.targetLanguage,
                                userIds: userIds
                            })
                        });

                        const data = await response.json();
                        
                        if (response.ok) {
                            this.bulkWordsResult = \`
                                <div class="space-y-2">
                                    <p><strong>✅ Processing Complete!</strong></p>
                                    <p>📝 Processed: \${data.processedCount} words</p>
                                    <p>👥 Sent to: \${data.targetUsers} users</p>
                                    <p>🤖 AI generated translations and definitions</p>
                                </div>
                            \`;
                            this.showAlertMessage('AI bulk word processing completed successfully!', 'success');
                            this.bulkWordsForm.wordsText = '';
                        } else {
                            this.showAlertMessage(data.error || 'Failed to process words with AI', 'error');
                        }
                    } catch (err) {
                        this.showAlertMessage('Network error during AI processing', 'error');
                    }
                    
                    this.loading = false;
                },

                async sendDirectMessage() {
                    this.loading = true;
                    try {
                        const response = await fetch('/admin/send-message', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${this.token}\`
                            },
                            body: JSON.stringify({
                                fromAdminId: this.admin.id,
                                toUserId: parseInt(this.directMessageForm.userId),
                                message: this.directMessageForm.message
                            })
                        });

                        if (response.ok) {
                            this.showAlertMessage('Direct message sent successfully!', 'success');
                            this.directMessageForm = { userId: '', message: '' };
                        } else {
                            const error = await response.json();
                            this.showAlertMessage(error.error || 'Failed to send message', 'error');
                        }
                    } catch (err) {
                        this.showAlertMessage('Network error', 'error');
                    }
                    this.loading = false;
                },

                async sendBulkMessage() {
                    this.loading = true;
                    try {
                        const userIds = this.bulkMessageForm.userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                        
                        const response = await fetch('/admin/send-bulk-message', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${this.token}\`
                            },
                            body: JSON.stringify({
                                fromAdminId: this.admin.id,
                                userIds: userIds,
                                message: this.bulkMessageForm.message
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            this.showAlertMessage(\`Bulk message sent to \${data.sentCount} users successfully!\`, 'success');
                            this.bulkMessageForm = { userIds: '', message: '' };
                        } else {
                            const error = await response.json();
                            this.showAlertMessage(error.error || 'Failed to send bulk message', 'error');
                        }
                    } catch (err) {
                        this.showAlertMessage('Network error', 'error');
                    }
                    this.loading = false;
                },

                async sendBroadcastMessage() {
                    this.loading = true;
                    try {
                        const response = await fetch('/admin/send-broadcast-message', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${this.token}\`
                            },
                            body: JSON.stringify({
                                fromAdminId: this.admin.id,
                                message: this.broadcastMessageForm.message
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            this.showAlertMessage(\`Broadcast message sent to \${data.sentCount} users successfully!\`, 'success');
                            this.broadcastMessageForm = { message: '', confirmed: false };
                        } else {
                            const error = await response.json();
                            this.showAlertMessage(error.error || 'Failed to send broadcast message', 'error');
                        }
                    } catch (err) {
                        this.showAlertMessage('Network error', 'error');
                    }
                    this.loading = false;
                },

                async refreshTickets() {
                    try {
                        const response = await fetch('/admin/tickets', {
                            headers: {
                                'Authorization': \`Bearer \${this.token}\`
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            this.tickets = data.tickets || [];
                        }
                    } catch (err) {
                        console.error('Failed to load tickets:', err);
                    }
                },

                getTicketStatusColor(status) {
                    const colors = {
                        'open': 'bg-red-100 text-red-800',
                        'in_progress': 'bg-yellow-100 text-yellow-800',
                        'resolved': 'bg-green-100 text-green-800',
                        'closed': 'bg-gray-100 text-gray-800'
                    };
                    return colors[status] || 'bg-gray-100 text-gray-800';
                },

                getTicketPriorityColor(priority) {
                    const colors = {
                        'low': 'bg-blue-100 text-blue-800',
                        'medium': 'bg-yellow-100 text-yellow-800',
                        'high': 'bg-orange-100 text-orange-800',
                        'urgent': 'bg-red-100 text-red-800'
                    };
                    return colors[priority] || 'bg-gray-100 text-gray-800';
                },

                showAlertMessage(message, type) {
                    this.alertMessage = message;
                    this.alertType = type;
                    this.showAlert = true;
                    setTimeout(() => {
                        this.showAlert = false;
                    }, 5000);
                },

                sendDirectMessageToUser(user) {
                    this.directMessageForm.userId = user.id.toString();
                    this.messageType = 'direct';
                    this.activeTab = 'messages';
                },

                viewUserDetails(user) {
                    alert(\`User Details:\\n\\nID: \${user.id}\\nName: \${user.fullName || user.firstName || 'N/A'}\\nEmail: \${user.email || 'N/A'}\\nLanguage: \${user.language || 'N/A'}\\nLevel: \${user.level || 1}\\nCards: \${user.totalCards || 0}\\nProgress: \${user.progress || 0}%\\nActive: \${user.isActive ? 'Yes' : 'No'}\`);
                },

                viewTicketConversation(ticket) {
                    alert(\`Ticket Conversation:\\n\\nTicket ID: \${ticket.id}\\nSubject: \${ticket.subject}\\nUser: \${ticket.userName || 'User ID: ' + ticket.userId}\\nStatus: \${ticket.status}\\nPriority: \${ticket.priority}\\n\\nMessage:\\n\${ticket.message}\\n\\n\${ticket.adminResponse ? 'Admin Response:\\n' + ticket.adminResponse : 'No admin response yet.'}\`);
                },

                async respondToTicket(ticket) {
                    const response = prompt('Enter your response to this ticket:');
                    if (response && response.trim()) {
                        try {
                            const updateResponse = await fetch(\`/admin/tickets/\${ticket.id}\`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': \`Bearer \${this.token}\`
                                },
                                body: JSON.stringify({
                                    status: 'resolved',
                                    adminResponse: response.trim(),
                                    assignedToAdmin: this.admin.id
                                })
                            });
                            
                            if (updateResponse.ok) {
                                this.refreshTickets();
                                this.showAlertMessage('Response sent successfully!', 'success');
                            } else {
                                this.showAlertMessage('Failed to send response', 'error');
                            }
                        } catch (err) {
                            this.showAlertMessage('Network error', 'error');
                        }
                    }
                }
            }
        }
    </script>
</body>
</html>`;
}
