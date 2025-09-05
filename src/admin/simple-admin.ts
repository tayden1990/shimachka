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
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Status Card -->
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

                        <!-- Create User -->
                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <button @click="showCreateUser = true" class="w-full text-left">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span class="text-white text-sm">+</span>
                                            </div>
                                        </div>
                                        <div class="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt class="text-sm font-medium text-gray-500 truncate">Create User</dt>
                                                <dd class="text-lg font-medium text-gray-900">Add New</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Test API -->
                        <div class="bg-white overflow-hidden shadow rounded-lg">
                            <div class="p-5">
                                <button @click="testAPI()" class="w-full text-left">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0">
                                            <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
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
                loginForm: {
                    username: '',
                    password: ''
                },

                init() {
                    // Check localStorage for auth
                    const token = localStorage.getItem('adminToken');
                    if (token) {
                        this.isAuthenticated = true;
                    }
                },

                async login() {
                    this.loading = true;
                    this.error = '';
                    
                    // Simple hardcoded check for now
                    if (this.loginForm.username === 'admin' && this.loginForm.password === 'Taksa4522815') {
                        this.isAuthenticated = true;
                        localStorage.setItem('adminToken', 'simple-token');
                        this.showMessage('Login successful!', 'success');
                    } else {
                        this.error = 'Invalid credentials';
                    }
                    
                    this.loading = false;
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
                        const data = await response.text();
                        this.showMessage(\`API Response: \${data}\`, response.ok ? 'success' : 'error');
                    } catch (err) {
                        this.showMessage(\`API Error: \${err.message}\`, 'error');
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
            }
        }
    </script>
</body>
</html>`;
}
