import { LeitnerBot } from './bot/leitner-bot';
import { UserManager } from './services/user-manager';
import { WordExtractor } from './services/word-extractor';
import { ScheduleManager } from './services/schedule-manager';
import { AdminService } from './services/admin-service';
import { AdminAPI } from './api/admin-api';
import { initializeAdmin } from './init-admin';

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  GEMINI_API_KEY: string;
  WEBHOOK_SECRET: string;
  LEITNER_DB: KVNamespace;
  AE?: AnalyticsEngineDataset;
}

// Enhanced logging function
function logEvent(env: Env, eventType: string, data: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${eventType}:`, JSON.stringify(data, null, 2));
  
  // Log to Analytics Engine if available
  if (env.AE) {
    env.AE.writeDataPoint({
      blobs: [eventType, JSON.stringify(data)],
      doubles: [Date.now()],
      indexes: [eventType]
    });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const startTime = Date.now();
    
    try {
      logEvent(env, 'REQUEST_START', {
        method: request.method,
        url: url.pathname,
        userAgent: request.headers.get('User-Agent'),
        cf: request.cf
      });

      // Validate environment variables
      if (!env.TELEGRAM_BOT_TOKEN) {
        logEvent(env, 'ERROR', { error: 'TELEGRAM_BOT_TOKEN not set' });
        return new Response('Configuration Error: Bot token not set', { status: 500 });
      }
      
      if (!env.GEMINI_API_KEY) {
        logEvent(env, 'ERROR', { error: 'GEMINI_API_KEY not set' });
        return new Response('Configuration Error: Gemini API key not set', { status: 500 });
      }

      // Initialize services with error handling
      const userManager = new UserManager(env.LEITNER_DB);
      const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
      const scheduleManager = new ScheduleManager(env.LEITNER_DB);
      const adminService = new AdminService(env.LEITNER_DB);
      const adminAPI = new AdminAPI(adminService, userManager);
      const bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB as any);

      // Initialize admin account on first run
      await initializeAdmin(env.LEITNER_DB);

      let response: Response;

      // Handle admin panel routes
      if (url.pathname.startsWith('/admin')) {
        if (url.pathname === '/admin' || url.pathname === '/admin/') {
          // Serve full admin panel HTML interface
          const adminHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitner Bot Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
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
                            <h1 class="text-xl font-bold text-gray-900">🎯 Leitner Bot Admin</h1>
                        </div>
                        <div class="flex items-center space-x-4">
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
                            <i class="fas fa-book mr-2"></i>Bulk Words
                        </button>
                        <button @click="activeTab = 'messages'" 
                                :class="activeTab === 'messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                                class="py-4 px-1 border-b-2 font-medium text-sm">
                            <i class="fas fa-envelope mr-2"></i>Messages
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
                </div>

                <!-- Users Tab -->
                <div x-show="activeTab === 'users'">
                    <div class="bg-white shadow overflow-hidden sm:rounded-md">
                        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">User Management</h3>
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
                                            </div>
                                        </div>
                                        <div class="flex space-x-2">
                                            <button @click="sendMessageToUser(user)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">
                                                Message
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

                <!-- Bulk Words Tab -->
                <div x-show="activeTab === 'bulk-words'">
                    <div class="bg-white shadow sm:rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Bulk Word Assignment</h3>
                            
                            <form @submit.prevent="createBulkAssignment()">
                                <div class="grid grid-cols-1 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Assignment Title</label>
                                        <input x-model="bulkForm.title" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea x-model="bulkForm.description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"></textarea>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Target User IDs (comma-separated)</label>
                                        <input x-model="bulkForm.userIds" type="text" placeholder="123,456,789" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Words (JSON format)</label>
                                        <textarea x-model="bulkForm.words" rows="10" 
                                                  placeholder='[{"word":"hello","translation":"سلام","definition":"A greeting","sourceLanguage":"en","targetLanguage":"fa"}]'
                                                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 font-mono text-sm"></textarea>
                                    </div>

                                    <div>
                                        <button type="submit" :disabled="loading" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                            <span x-show="!loading">Create Assignment</span>
                                            <span x-show="loading">Creating...</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Messages Tab -->
                <div x-show="activeTab === 'messages'">
                    <div class="bg-white shadow sm:rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Send Direct Message</h3>
                            
                            <form @submit.prevent="sendDirectMessage()">
                                <div class="grid grid-cols-1 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">User ID</label>
                                        <input x-model="messageForm.userId" type="number" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Message</label>
                                        <textarea x-model="messageForm.message" rows="4" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2"></textarea>
                                    </div>

                                    <div>
                                        <button type="submit" :disabled="loading" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                                            <span x-show="!loading">Send Message</span>
                                            <span x-show="loading">Sending...</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Support Tickets Tab -->
                <div x-show="activeTab === 'tickets'">
                    <div class="bg-white shadow overflow-hidden sm:rounded-md">
                        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">Support Tickets</h3>
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
                                        </div>
                                        <div class="ml-4">
                                            <button @click="respondToTicket(ticket)" class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs">
                                                Respond
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

                // Bulk assignment form
                bulkForm: {
                    title: '',
                    description: '',
                    userIds: '',
                    words: JSON.stringify([{
                        "word": "hello",
                        "translation": "سلام",
                        "definition": "A greeting",
                        "sourceLanguage": "en",
                        "targetLanguage": "fa"
                    }], null, 2)
                },

                // Message form
                messageForm: {
                    userId: '',
                    message: ''
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

                async createBulkAssignment() {
                    this.loading = true;
                    try {
                        const userIds = this.bulkForm.userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                        const words = JSON.parse(this.bulkForm.words);

                        const response = await fetch('/admin/bulk-assignment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': \`Bearer \${this.token}\`
                            },
                            body: JSON.stringify({
                                adminId: this.admin.id,
                                targetUserIds: userIds,
                                words: words,
                                title: this.bulkForm.title,
                                description: this.bulkForm.description
                            })
                        });

                        if (response.ok) {
                            this.showAlertMessage('Bulk assignment created successfully!', 'success');
                            this.bulkForm.title = '';
                            this.bulkForm.description = '';
                            this.bulkForm.userIds = '';
                        } else {
                            const error = await response.json();
                            this.showAlertMessage(error.error || 'Failed to create assignment', 'error');
                        }
                    } catch (err) {
                        this.showAlertMessage('Invalid JSON format or network error', 'error');
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
                                toUserId: parseInt(this.messageForm.userId),
                                message: this.messageForm.message
                            })
                        });

                        if (response.ok) {
                            this.showAlertMessage('Message sent successfully!', 'success');
                            this.messageForm = { userId: '', message: '' };
                        } else {
                            const error = await response.json();
                            this.showAlertMessage(error.error || 'Failed to send message', 'error');
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

                sendMessageToUser(user) {
                    this.messageForm.userId = user.id.toString();
                    this.activeTab = 'messages';
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
          response = new Response(adminHTML, {
            headers: { 'Content-Type': 'text/html' }
          });
        } else {
          // Handle admin API routes
          response = await adminAPI.handleAdminRequest(request);
        }
      }
      // Handle Telegram webhook
      else if (url.pathname === '/webhook' && request.method === 'POST') {
        logEvent(env, 'WEBHOOK_RECEIVED', { contentType: request.headers.get('Content-Type') });
        response = await bot.handleWebhook(request);
      }
      // Handle cron triggers for daily reminders
      else if (url.pathname === '/cron') {
        logEvent(env, 'CRON_TRIGGERED', { timestamp: new Date().toISOString() });
        await bot.sendDailyReminders();
        response = new Response('OK', { status: 200 });
      }
      // Health check
      else if (url.pathname === '/health') {
        response = new Response(JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: {
            botTokenSet: !!env.TELEGRAM_BOT_TOKEN,
            geminiKeySet: !!env.GEMINI_API_KEY,
            kvSet: !!env.LEITNER_DB
          }
        }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Debug endpoint for logs
      else if (url.pathname === '/debug' && request.method === 'GET') {
        const requestHeaders: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          requestHeaders[key] = value;
        });
        
        response = new Response(JSON.stringify({
          timestamp: new Date().toISOString(),
          environment: {
            botTokenSet: !!env.TELEGRAM_BOT_TOKEN,
            geminiKeySet: !!env.GEMINI_API_KEY,
            kvSet: !!env.LEITNER_DB,
            aeSet: !!env.AE
          },
          headers: requestHeaders,
          cf: request.cf
        }, null, 2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      else {
        response = new Response('Not Found', { status: 404 });
      }

      const duration = Date.now() - startTime;
      logEvent(env, 'REQUEST_COMPLETE', {
        status: response.status,
        duration: `${duration}ms`,
        path: url.pathname
      });

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      logEvent(env, 'REQUEST_ERROR', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        path: url.pathname
      });

      return new Response(`Internal Server Error: ${error instanceof Error ? error.message : String(error)}`, { 
        status: 500 
      });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      logEvent(env, 'SCHEDULED_START', {
        cron: event.cron,
        scheduledTime: new Date(event.scheduledTime).toISOString()
      });

      const userManager = new UserManager(env.LEITNER_DB);
      const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
      const scheduleManager = new ScheduleManager(env.LEITNER_DB);
      const bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB as any);
      
      await bot.sendDailyReminders();

      logEvent(env, 'SCHEDULED_COMPLETE', {
        cron: event.cron,
        completedAt: new Date().toISOString()
      });

    } catch (error) {
      logEvent(env, 'SCHEDULED_ERROR', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        cron: event.cron
      });
      throw error;
    }
  }
};
