export function getSimpleAdminHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</head>
<body class="bg-gray-50">
    <div x-data="simpleAdmin()" x-init="init()">
        <!-- Login Screen -->
        <div x-show="!isAuthenticated" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-900">Admin Login</h2>
                    <p class="text-gray-600 mt-2">Leitner Bot Admin Panel</p>
                </div>
                <form @submit.prevent="login()" class="space-y-6">
                    <div>
                        <input x-model="loginForm.username" type="text" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               placeholder="Username">
                    </div>
                    <div>
                        <input x-model="loginForm.password" type="password" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               placeholder="Password">
                    </div>
                    <button type="submit" :disabled="loading"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50">
                        <span x-show="!loading">Sign In</span>
                        <span x-show="loading">Signing In...</span>
                    </button>
                    <div x-show="error" class="text-red-600 text-sm text-center" x-text="error"></div>
                </form>
                
                <!-- Create Admin Button -->
                <div class="mt-6 text-center">
                    <button @click="createAdminUser()" :disabled="loading"
                            class="text-blue-600 hover:text-blue-700 text-sm">
                        Create Admin Account
                    </button>
                </div>
            </div>
        </div>

        <!-- Dashboard -->
        <div x-show="isAuthenticated" class="min-h-screen bg-gray-100">
            <nav class="bg-white shadow">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <h1 class="text-xl font-bold text-gray-900">🎯 Leitner Bot Admin</h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="text-gray-700">Welcome, Admin</span>
                            <button @click="logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div class="px-4 py-6 sm:px-0">
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <!-- System Status -->
                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <span class="text-white text-sm">✓</span>
                                        </div>
                                    </div>
                                    <div class="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt class="text-sm font-medium text-gray-500 truncate">System Status</dt>
                                            <dd class="text-lg font-medium text-gray-900">Running</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Users Count -->
                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span class="text-white text-sm">👥</span>
                                        </div>
                                    </div>
                                    <div class="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                            <dd class="text-lg font-medium text-gray-900" x-text="stats.totalUsers || 'Loading...'"></dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Active Cards -->
                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                            <span class="text-white text-sm">📚</span>
                                        </div>
                                    </div>
                                    <div class="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt class="text-sm font-medium text-gray-500 truncate">Total Cards</dt>
                                            <dd class="text-lg font-medium text-gray-900" x-text="stats.totalCards || 'Loading...'"></dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Test API -->
                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <button @click="testAPI()" class="w-full text-left">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                                <span class="text-white text-sm">🔧</span>
                                            </div>
                                        </div>
                                        <div class="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Test API</dt>
                                                <dd class="text-lg font-medium text-gray-900">Health Check</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Action Tabs -->
                    <div class="bg-white shadow rounded-lg">
                        <div class="border-b border-gray-200">
                            <nav class="flex space-x-8 px-6" aria-label="Tabs">
                                <button @click="activeTab = 'overview'" 
                                        :class="activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                        class="py-4 px-1 border-b-2 font-medium text-sm">
                                    📊 Overview
                                </button>
                                <button @click="activeTab = 'users'" 
                                        :class="activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                        class="py-4 px-1 border-b-2 font-medium text-sm">
                                    👥 Users
                                </button>
                                <button @click="activeTab = 'settings'" 
                                        :class="activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                        class="py-4 px-1 border-b-2 font-medium text-sm">
                                    ⚙️ Settings
                                </button>
                                <button @click="activeTab = 'tools'" 
                                        :class="activeTab === 'tools' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                                        class="py-4 px-1 border-b-2 font-medium text-sm">
                                    🔨 Tools
                                </button>
                            </nav>
                        </div>

                        <div class="p-6">
                            <!-- Overview Tab -->
                            <div x-show="activeTab === 'overview'">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h4 class="font-medium text-gray-900 mb-2">🤖 Bot Status</h4>
                                        <p class="text-sm text-gray-600">Telegram bot is running in simplified mode</p>
                                        <button @click="testTelegramBot()" class="mt-2 text-blue-600 hover:text-blue-700 text-sm">Test Bot Connection</button>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h4 class="font-medium text-gray-900 mb-2">💾 Database</h4>
                                        <p class="text-sm text-gray-600">Cloudflare KV storage active</p>
                                        <button @click="testDatabase()" class="mt-2 text-blue-600 hover:text-blue-700 text-sm">Test Database</button>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h4 class="font-medium text-gray-900 mb-2">🧠 AI Service</h4>
                                        <p class="text-sm text-gray-600">Google Gemini API integration</p>
                                        <button @click="testAI()" class="mt-2 text-blue-600 hover:text-blue-700 text-sm">Test AI Connection</button>
                                    </div>
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <h4 class="font-medium text-gray-900 mb-2">📈 Analytics</h4>
                                        <p class="text-sm text-gray-600">Performance monitoring active</p>
                                        <button @click="viewAnalytics()" class="mt-2 text-blue-600 hover:text-blue-700 text-sm">View Analytics</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Users Tab -->
                            <div x-show="activeTab === 'users'">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">User Management</h3>
                                <div class="space-y-4">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-medium text-gray-900">👤 Create Admin Account</h4>
                                            <p class="text-sm text-gray-600">Set up a new admin user in the database</p>
                                        </div>
                                        <button @click="createAdminUser()" 
                                                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                            Create Admin
                                        </button>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-medium text-gray-900">📊 Load User Stats</h4>
                                            <p class="text-sm text-gray-600">Fetch current user statistics</p>
                                        </div>
                                        <button @click="loadUserStats()" 
                                                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                                            Load Stats
                                        </button>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h4 class="font-medium text-gray-900">📝 Export Users</h4>
                                            <p class="text-sm text-gray-600">Download user data as CSV</p>
                                        </div>
                                        <button @click="exportUsers()" 
                                                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                                            Export CSV
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Settings Tab -->
                            <div x-show="activeTab === 'settings'">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
                                <div class="space-y-6">
                                    <div>
                                        <h4 class="font-medium text-gray-900 mb-2">🔑 Environment Variables</h4>
                                        <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                                            <div class="flex justify-between">
                                                <span class="text-sm text-gray-600">TELEGRAM_BOT_TOKEN:</span>
                                                <span class="text-sm font-mono" x-text="envStatus.telegram || 'Checking...'"></span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-sm text-gray-600">GEMINI_API_KEY:</span>
                                                <span class="text-sm font-mono" x-text="envStatus.gemini || 'Checking...'"></span>
                                            </div>
                                            <div class="flex justify-between">
                                                <span class="text-sm text-gray-600">WEBHOOK_SECRET:</span>
                                                <span class="text-sm font-mono" x-text="envStatus.webhook || 'Checking...'"></span>
                                            </div>
                                        </div>
                                        <button @click="checkEnvironment()" 
                                                class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                            Check Environment
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Tools Tab -->
                            <div x-show="activeTab === 'tools'">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Admin Tools</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button @click="clearCache()" 
                                            class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-left">
                                        <div class="text-lg mb-2">🗑️ Clear Cache</div>
                                        <p class="text-sm text-gray-600">Clear all cached data</p>
                                    </button>
                                    <button @click="resetDatabase()" 
                                            class="p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-400 text-left">
                                        <div class="text-lg mb-2">⚠️ Reset Database</div>
                                        <p class="text-sm text-gray-600">Danger: Clear all data</p>
                                    </button>
                                    <button @click="viewLogs()" 
                                            class="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-left">
                                        <div class="text-lg mb-2">📋 View Logs</div>
                                        <p class="text-sm text-gray-600">Check worker logs</p>
                                    </button>
                                    <button @click="restoreFullBot()" 
                                            class="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 text-left">
                                        <div class="text-lg mb-2">🚀 Restore Full Bot</div>
                                        <p class="text-sm text-gray-600">Enable full functionality</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div x-show="message" class="mt-6 p-4 rounded-lg" :class="messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                        <p x-text="message"></p>
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
                message: '',
                messageType: 'success',
                showCreateUser: false,
                activeTab: 'overview',
                stats: {
                    totalUsers: 'Loading...',
                    totalCards: 'Loading...',
                    activeUsers: 'Loading...'
                },
                envStatus: {
                    telegram: 'Checking...',
                    gemini: 'Checking...',
                    webhook: 'Checking...'
                },
                loginForm: {
                    username: '',
                    password: ''
                },

                init() {
                    // Check localStorage for auth
                    const token = localStorage.getItem('adminToken');
                    if (token) {
                        this.isAuthenticated = true;
                        this.loadUserStats();
                        this.checkEnvironment();
                    }
                },

                async login() {
                    this.loading = true;
                    this.error = '';
                    
                    try {
                        // Use real admin login API
                        const response = await fetch('/admin/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                username: this.loginForm.username,
                                password: this.loginForm.password
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            this.isAuthenticated = true;
                            localStorage.setItem('adminToken', data.token);
                            this.showMessage('✅ Login successful!', 'success');
                            this.loadUserStats();
                            this.checkEnvironment();
                        } else {
                            const errorData = await response.json();
                            this.error = errorData.error || 'Login failed';
                        }
                    } catch (err) {
                        this.error = 'Network error: ' + err.message;
                    }
                    
                    this.loading = false;
                },

                async loadUserStats() {
                    try {
                        const token = localStorage.getItem('adminToken');
                        const response = await fetch('/admin/dashboard', {
                            headers: {
                                'Authorization': \`Bearer \${token}\`
                            }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            this.stats = {
                                totalUsers: data.totalUsers || 0,
                                totalCards: data.totalCards || 0,
                                activeUsers: data.activeUsers || 0
                            };
                        } else {
                            this.stats = {
                                totalUsers: 'Error loading',
                                totalCards: 'Error loading',
                                activeUsers: 'Error loading'
                            };
                        }
                        }
                    } catch (error) {
                        this.stats = {
                            totalUsers: 'Error',
                            totalCards: 'Error',
                            activeUsers: 'Error'
                        };
                    }
                },

                async checkEnvironment() {
                    try {
                        const response = await fetch('/api/admin/env-check');
                        if (response.ok) {
                            const data = await response.json();
                            this.envStatus = data;
                        } else {
                            this.envStatus = {
                                telegram: '❌ Not checked',
                                gemini: '❌ Not checked',
                                webhook: '❌ Not checked'
                            };
                        }
                    } catch (error) {
                        this.envStatus = {
                            telegram: '❌ Error',
                            gemini: '❌ Error',
                            webhook: '❌ Error'
                        };
                    }
                },

                async createAdminUser() {
                    this.loading = true;
                    this.error = '';
                    
                    try {
                        const response = await fetch('/admin/create-admin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                username: 'admin',
                                email: 'admin@leitnerbot.com',
                                fullName: 'System Administrator',
                                password: 'Taksa4522815',
                                role: 'super_admin',
                                isActive: true
                            })
                        });

                        if (response.ok) {
                            this.showMessage('Admin account created successfully!', 'success');
                        } else {
                            const errorData = await response.text();
                            this.error = \`Failed to create admin: \${errorData}\`;
                        }
                    } catch (err) {
                        this.error = \`Network error: \${err.message}\`;
                    }
                    
                    this.loading = false;
                },

                async testAPI() {
                    try {
                        const response = await fetch('/health');
                        if (response.ok) {
                            const data = await response.json();
                            this.showMessage('API Health Check: ✅ ' + JSON.stringify(data), 'success');
                        } else {
                            this.showMessage('API Health Check Failed: ' + response.status, 'error');
                        }
                    } catch (error) {
                        this.showMessage('API Test Error: ' + error.message, 'error');
                    }
                },

                async testTelegramBot() {
                    try {
                        const response = await fetch('/api/admin/test-telegram');
                        if (response.ok) {
                            const data = await response.json();
                            this.showMessage('🤖 Telegram Bot: ' + (data.success ? '✅ Connected' : '❌ Failed'), data.success ? 'success' : 'error');
                        } else {
                            this.showMessage('❌ Telegram test failed', 'error');
                        }
                    } catch (error) {
                        this.showMessage('❌ Telegram test error: ' + error.message, 'error');
                    }
                },

                async testDatabase() {
                    try {
                        const response = await fetch('/api/admin/test-database');
                        if (response.ok) {
                            const data = await response.json();
                            this.showMessage('💾 Database: ' + (data.success ? '✅ Connected' : '❌ Failed'), data.success ? 'success' : 'error');
                        } else {
                            this.showMessage('❌ Database test failed', 'error');
                        }
                    } catch (error) {
                        this.showMessage('❌ Database test error: ' + error.message, 'error');
                    }
                },

                async testAI() {
                    try {
                        const response = await fetch('/api/admin/test-ai');
                        if (response.ok) {
                            const data = await response.json();
                            this.showMessage('🧠 AI Service: ' + (data.success ? '✅ Connected' : '❌ Failed'), data.success ? 'success' : 'error');
                        } else {
                            this.showMessage('❌ AI test failed', 'error');
                        }
                    } catch (error) {
                        this.showMessage('❌ AI test error: ' + error.message, 'error');
                    }
                },

                async exportUsers() {
                    try {
                        const token = localStorage.getItem('adminToken');
                        const response = await fetch('/admin/export-users', {
                            headers: {
                                'Authorization': \`Bearer \${token}\`
                            }
                        });
                        
                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'users-' + new Date().toISOString().split('T')[0] + '.csv';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                            this.showMessage('✅ Users exported successfully', 'success');
                        } else {
                            this.showMessage('❌ Export failed', 'error');
                        }
                    } catch (error) {
                        this.showMessage('❌ Export error: ' + error.message, 'error');
                    }
                },

                async clearCache() {
                    if (confirm('Are you sure you want to clear all cache?')) {
                        try {
                            const response = await fetch('/api/admin/clear-cache', { method: 'POST' });
                            if (response.ok) {
                                this.showMessage('✅ Cache cleared successfully', 'success');
                            } else {
                                this.showMessage('❌ Failed to clear cache', 'error');
                            }
                        } catch (error) {
                            this.showMessage('❌ Clear cache error: ' + error.message, 'error');
                        }
                    }
                },

                async resetDatabase() {
                    if (confirm('⚠️ WARNING: This will delete ALL data! Are you absolutely sure?')) {
                        if (confirm('🚨 FINAL WARNING: This action cannot be undone! Type "DELETE" to confirm:') && 
                            prompt('Type "DELETE" to confirm:') === 'DELETE') {
                            try {
                                const response = await fetch('/api/admin/reset-database', { method: 'POST' });
                                if (response.ok) {
                                    this.showMessage('⚠️ Database reset successfully', 'success');
                                } else {
                                    this.showMessage('❌ Failed to reset database', 'error');
                                }
                            } catch (error) {
                                this.showMessage('❌ Reset error: ' + error.message, 'error');
                            }
                        }
                    }
                },

                viewLogs() {
                    window.open('https://dash.cloudflare.com/', '_blank');
                    this.showMessage('📋 Opening Cloudflare dashboard for logs...', 'success');
                },

                viewAnalytics() {
                    this.showMessage('📈 Analytics feature coming soon...', 'success');
                },

                async restoreFullBot() {
                    if (confirm('Restore full bot functionality? This may cause the admin panel to become unavailable if there are initialization issues.')) {
                        try {
                            const response = await fetch('/api/admin/restore-full-bot', { method: 'POST' });
                            if (response.ok) {
                                this.showMessage('🚀 Full bot restoration initiated. Please monitor the system.', 'success');
                            } else {
                                this.showMessage('❌ Failed to restore full bot', 'error');
                            }
                        } catch (error) {
                            this.showMessage('❌ Restoration error: ' + error.message, 'error');
                        }
                    }
                },

                logout() {
                    this.isAuthenticated = false;
                    localStorage.removeItem('adminToken');
                    this.loginForm = { username: '', password: '' };
                },

                showMessage(msg, type) {
                    this.message = msg;
                    this.messageType = type;
                    setTimeout(() => {
                        this.message = '';
                    }, 5000);
                }
            };
        }
    </script>
</body>
</html>`;
}
