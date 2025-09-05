import { AdminService } from '../services/admin-service';
import { UserManager } from '../services/user-manager';
import { Logger } from '../services/logger';
import { HealthCheckService } from '../services/health-check';

// Input validation utilities
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateString(value: any, fieldName: string, minLength = 1, maxLength = 255): ValidationResult {
  const errors: string[] = [];
  
  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
  } else {
    if (value.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters`);
    }
    if (value.length > maxLength) {
      errors.push(`${fieldName} must be at most ${maxLength} characters`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>\"'&]/g, '');
}

export class AdminAPI {
  private logger: Logger;
  private healthCheckService: HealthCheckService;
  
  constructor(
    private adminService: AdminService,
    private userManager: UserManager,
    private env: any
  ) {
    this.logger = new Logger(env, 'ADMIN_API');
    this.healthCheckService = new HealthCheckService(env);
  }

  async handleAdminRequest(request: Request, ctx?: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    await this.logger.info('admin_request_start', `Admin request received`, {
      method,
      path,
      userAgent: request.headers.get('User-Agent'),
      ip: request.headers.get('CF-Connecting-IP'),
      referer: request.headers.get('Referer')
    });

    // CORS headers for admin panel
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Authentication check - all admin endpoints require authentication except login and main panel
      if (!path.includes('/admin/login') && path !== '/admin') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        // In production, verify JWT token here
      }

      // Route handling
      if (path === '/admin/login' && method === 'POST') {
        return await this.handleLogin(request, corsHeaders);
      }
      
      if (path === '/admin/create-admin' && method === 'POST') {
        return await this.handleCreateAdmin(request, corsHeaders);
      }
      
      if (path === '/admin/dashboard' && method === 'GET') {
        return await this.handleDashboard(corsHeaders);
      }

      if (path === '/admin' && method === 'GET') {
        return await this.handleAdminPanelHTML(corsHeaders);
      }

      if (path === '/admin/profile' && method === 'GET') {
        return await this.handleGetProfile(request, corsHeaders);
      }
      
      if (path === '/admin/users' && method === 'GET') {
        return await this.handleGetUsers(url, corsHeaders);
      }
      
      if (path.startsWith('/admin/users/') && method === 'GET') {
        const segments = path.split('/');
        const userId = segments[3];
        if (!userId) {
          return new Response(JSON.stringify({ error: 'User ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        if (segments[4] === 'stats') {
          return await this.handleGetUserStats(userId, corsHeaders);
        } else if (segments[4] === 'details') {
          return await this.handleGetUserDetails(userId, corsHeaders);
        } else {
          return await this.handleGetUser(path, corsHeaders);
        }
      }
      
      if (path.startsWith('/admin/users/') && method === 'PUT') {
        return await this.handleUpdateUser(request, path, corsHeaders);
      }
      
      if (path === '/admin/bulk-assignment' && method === 'POST') {
        return await this.handleBulkAssignment(request, corsHeaders);
      }
      
      if (path === '/admin/bulk-assignments' && method === 'GET') {
        return await this.handleGetBulkAssignments(url, corsHeaders);
      }
      
      if (path === '/admin/tickets' && method === 'GET') {
        return await this.handleGetTickets(url, corsHeaders);
      }
      
      if (path.startsWith('/admin/tickets/') && method === 'PUT') {
        return await this.handleUpdateTicket(request, path, corsHeaders);
      }
      
      if (path === '/admin/send-message' && method === 'POST') {
        return await this.handleSendMessage(request, corsHeaders);
      }

      if (path === '/admin/send-bulk-message' && method === 'POST') {
        return await this.handleSendBulkMessage(request, corsHeaders);
      }

      if (path === '/admin/send-broadcast-message' && method === 'POST') {
        return await this.handleSendBroadcastMessage(request, corsHeaders);
      }

      if (path === '/admin/bulk-words-ai' && method === 'POST') {
        return await this.handleBulkWordsAI(request, corsHeaders, ctx);
      }

      if (path.startsWith('/admin/bulk-words-progress/') && method === 'GET') {
        const jobId = path.split('/')[3];
        return await this.handleBulkWordsProgress(jobId, corsHeaders);
      }
      
      if (path === '/admin/health' && method === 'GET') {
        return await this.handleHealthCheck(corsHeaders);
      }
      
      if (path === '/admin/logs' && method === 'GET') {
        return await this.handleGetLogs(url, corsHeaders);
      }
      
      if (path === '/admin/metrics' && method === 'GET') {
        return await this.handleGetMetrics(corsHeaders);
      }
      
      if (path.startsWith('/admin/user-messages/')) {
        return await this.handleGetUserMessages(path, corsHeaders);
      }

      if (path.startsWith('/admin/users/') && path.includes('/cards') && method === 'GET') {
        const userId = path.split('/')[3];
        return await this.handleGetUserCards(userId, url, corsHeaders);
      }

      if (path.startsWith('/admin/users/') && path.includes('/words') && method === 'GET') {
        const userId = path.split('/')[3];
        return await this.handleGetUserWords(userId, url, corsHeaders);
      }

      if (path === '/admin/all-cards' && method === 'GET') {
        return await this.handleGetAllCards(url, corsHeaders);
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Admin API error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleLogin(request: Request, corsHeaders: any): Promise<Response> {
    const body: any = await request.json();
    const { username, password } = body;
    const admin = await this.adminService.authenticateAdmin(username, password);
    
    if (!admin) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // In production, generate JWT token
    const token = `admin_token_${admin.id}_${Date.now()}`;
    
    return new Response(JSON.stringify({ 
      admin, 
      token,
      message: 'Login successful' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleAdminPanelHTML(corsHeaders: any): Promise<Response> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leitner Telegram Bot - Admin Panel</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .header h1 {
            color: #333;
            font-size: 2rem;
            margin-bottom: 10px;
        }

        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .status-card {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }

        .status-card:hover {
            transform: translateY(-5px);
        }

        .status-card h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-ok { background: #10b981; }
        .status-warning { background: #f59e0b; }
        .status-error { background: #ef4444; }

        .tabs {
            display: flex;
            background: rgba(255,255,255,0.9);
            border-radius: 15px;
            padding: 5px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }

        .tab {
            flex: 1;
            background: none;
            border: none;
            padding: 15px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1rem;
            color: #666;
            transition: all 0.3s ease;
        }

        .tab.active {
            background: #667eea;
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .tab-content {
            display: none;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .tab-content.active {
            display: block;
        }

        .monitoring-section {
            margin-bottom: 30px;
        }

        .monitoring-section h4 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.1rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }

        .logs-container {
            background: #1f2937;
            border-radius: 10px;
            padding: 20px;
            max-height: 400px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }

        .log-entry {
            margin-bottom: 5px;
            padding: 5px 0;
            border-bottom: 1px solid #374151;
        }

        .log-timestamp {
            color: #9ca3af;
            margin-right: 10px;
        }

        .log-level {
            margin-right: 10px;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
        }

        .log-level-info { background: #3b82f6; color: white; }
        .log-level-warn { background: #f59e0b; color: white; }
        .log-level-error { background: #ef4444; color: white; }
        .log-level-debug { background: #6b7280; color: white; }

        .log-message {
            color: #f3f4f6;
        }

        .bulk-words-form {
            background: #f8fafc;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #374151;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 1rem;
        }

        .form-group textarea {
            height: 100px;
            resize: vertical;
        }

        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }

        .btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
        }

        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }

        .progress-fill {
            height: 100%;
            background: #10b981;
            transition: width 0.3s ease;
        }

        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }

        .alert-success {
            background: #dcfce7;
            border: 1px solid #bbf7d0;
            color: #166534;
        }

        .alert-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
        }

        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .metric-card {
            background: #f8fafc;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
        }

        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }

        .metric-label {
            color: #6b7280;
            font-size: 0.9rem;
        }

        .refresh-btn {
            background: none;
            border: 1px solid #667eea;
            color: #667eea;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-left: 10px;
        }

        .refresh-btn:hover {
            background: #667eea;
            color: white;
        }

        .hidden {
            display: none;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .spinner {
            border: 2px solid #f3f4f6;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Leitner Telegram Bot - Admin Panel</h1>
            <p>Complete monitoring, logging, and management dashboard</p>
        </div>

        <div class="status-grid">
            <div class="status-card">
                <h3><span class="status-indicator status-ok"></span>System Health</h3>
                <div id="systemStatus">Loading...</div>
            </div>
            <div class="status-card">
                <h3><span class="status-indicator status-ok"></span>Active Users</h3>
                <div id="activeUsers">Loading...</div>
            </div>
            <div class="status-card">
                <h3><span class="status-indicator status-ok"></span>Total Cards</h3>
                <div id="totalCards">Loading...</div>
            </div>
            <div class="status-card">
                <h3><span class="status-indicator status-ok"></span>Processing Jobs</h3>
                <div id="processingJobs">0 active</div>
            </div>
        </div>

        <div class="tabs">
            <button class="tab active" onclick="showTab('monitoring')">📊 Monitoring</button>
            <button class="tab" onclick="showTab('logs')">📝 Logs</button>
            <button class="tab" onclick="showTab('bulk-words')">🔄 Bulk Words</button>
            <button class="tab" onclick="showTab('users')">👥 Users</button>
            <button class="tab" onclick="showTab('cards')">🎴 All Cards</button>
            <button class="tab" onclick="showTab('health')">🏥 Health Check</button>
        </div>

        <div id="monitoring" class="tab-content active">
            <div class="monitoring-section">
                <h4>📈 System Metrics <button class="refresh-btn" onclick="refreshMetrics()">🔄 Refresh</button></h4>
                <div class="metric-grid" id="metricsGrid">
                    <!-- Metrics will be loaded here -->
                </div>
            </div>
            
            <div class="monitoring-section">
                <h4>⚡ Real-time Activity</h4>
                <div class="logs-container" id="realtimeLogs">
                    <div class="log-entry">
                        <span class="log-timestamp">[Loading...]</span>
                        <span class="log-level log-level-info">INFO</span>
                        <span class="log-message">Initializing monitoring dashboard...</span>
                    </div>
                </div>
            </div>
        </div>

        <div id="logs" class="tab-content">
            <div class="monitoring-section">
                <h4>🔍 System Logs <button class="refresh-btn" onclick="refreshLogs()">🔄 Refresh</button></h4>
                <div class="logs-container" id="systemLogs">
                    <!-- Logs will be loaded here -->
                </div>
            </div>
        </div>

        <div id="bulk-words" class="tab-content">
            <div class="monitoring-section">
                <h4>🚀 AI Bulk Words Processing</h4>
                
                <div class="bulk-words-form">
                    <div class="form-group">
                        <label>Words to Process (comma-separated):</label>
                        <textarea id="wordsInput" placeholder="apple,book,computer,happiness"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Meaning Language:</label>
                        <select id="meaningLanguage">
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Persian">Persian</option>
                            <option value="Arabic">Arabic</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Definition Language:</label>
                        <select id="definitionLanguage">
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Persian">Persian</option>
                            <option value="Arabic">Arabic</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Assign to Specific Users (optional, comma-separated user IDs):</label>
                        <input type="text" id="assignUsers" placeholder="235552633,123456789">
                    </div>
                    
                    <button class="btn" id="processBulkWords" onclick="processBulkWords()">
                        🎯 Process Words with AI
                    </button>
                </div>
                
                <div id="bulkProgress" class="hidden">
                    <h4>📊 Processing Progress</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    </div>
                    <div id="progressText">Initializing...</div>
                    <div id="processingLogs" class="logs-container" style="max-height: 200px;">
                        <!-- Processing logs will appear here -->
                    </div>
                </div>
                
                <div id="bulkResults" class="hidden">
                    <!-- Results will appear here -->
                </div>
            </div>
        </div>

        <div id="users" class="tab-content">
            <div class="monitoring-section">
                <h4>👥 User Management <button class="refresh-btn" onclick="refreshUsers()">🔄 Refresh</button></h4>
                <div id="usersTable">
                    <!-- Users table will be loaded here -->
                </div>
            </div>
        </div>

        <div id="cards" class="tab-content">
            <div class="monitoring-section">
                <h4>🎴 All Cards Management <button class="refresh-btn" onclick="refreshCards()">🔄 Refresh</button></h4>
                
                <div style="margin-bottom: 15px;">
                    <input type="text" id="cardSearch" placeholder="Search cards by word, meaning, or user..." style="width: 300px; padding: 8px; margin-right: 10px;">
                    <button onclick="searchCards()" style="padding: 8px 15px;">🔍 Search</button>
                    <button onclick="clearCardSearch()" style="padding: 8px 15px; margin-left: 10px;">✖ Clear</button>
                </div>
                
                <div id="cardsStats" style="margin-bottom: 15px;">
                    <!-- Cards statistics will be loaded here -->
                </div>
                
                <div id="cardsTable">
                    <!-- Cards table will be loaded here -->
                </div>
                
                <div id="cardsPagination" style="margin-top: 15px; text-align: center;">
                    <!-- Pagination will be loaded here -->
                </div>
            </div>
        </div>

        <div id="health" class="tab-content">
            <div class="monitoring-section">
                <h4>🏥 Health Check <button class="refresh-btn" onclick="refreshHealthCheck()">🔄 Refresh</button></h4>
                <div id="healthStatus">
                    <!-- Health status will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentJobId = null;
        let progressInterval = null;
        let logsInterval = null;

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboardData();
            startRealtimeUpdates();
        });

        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
            
            // Load tab-specific data
            if (tabName === 'logs') refreshLogs();
            if (tabName === 'users') refreshUsers();
            if (tabName === 'health') refreshHealthCheck();
        }

        async function loadDashboardData() {
            try {
                // Load system stats
                const response = await fetch('/admin/dashboard', {
                    headers: { 'Authorization': 'Bearer admin:password' }
                });
                const stats = await response.json();
                
                document.getElementById('activeUsers').textContent = stats.totalUsers || '0';
                document.getElementById('totalCards').textContent = stats.totalCards || '0';
                document.getElementById('systemStatus').textContent = 'Online';
                
                // Load metrics
                refreshMetrics();
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                document.getElementById('systemStatus').textContent = 'Error';
            }
        }

        async function refreshMetrics() {
            try {
                const response = await fetch('/admin/metrics', {
                    headers: { 'Authorization': 'Bearer admin:password' }
                });
                const metrics = await response.json();
                
                const grid = document.getElementById('metricsGrid');
                grid.innerHTML = \`
                    <div class="metric-card">
                        <div class="metric-value">\${metrics.requestCount || 0}</div>
                        <div class="metric-label">Total Requests</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${metrics.errorCount || 0}</div>
                        <div class="metric-label">Errors</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${metrics.averageResponseTime || 0}ms</div>
                        <div class="metric-label">Avg Response Time</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${metrics.uptime || 'N/A'}</div>
                        <div class="metric-label">Uptime</div>
                    </div>
                \`;
            } catch (error) {
                console.error('Error refreshing metrics:', error);
            }
        }

        async function refreshLogs() {
            try {
                const response = await fetch('/admin/logs?limit=50', {
                    headers: { 'Authorization': 'Bearer admin:password' }
                });
                const data = await response.json();
                
                const container = document.getElementById('systemLogs');
                container.innerHTML = '';
                
                if (data.logs && data.logs.length > 0) {
                    data.logs.forEach(log => {
                        const entry = document.createElement('div');
                        entry.className = 'log-entry';
                        
                        const timestamp = new Date(log.timestamp).toLocaleTimeString();
                        entry.innerHTML = \`
                            <span class="log-timestamp">[\${timestamp}]</span>
                            <span class="log-level log-level-\${log.level.toLowerCase()}">\${log.level}</span>
                            <span class="log-message">\${log.message}</span>
                        \`;
                        container.appendChild(entry);
                    });
                } else {
                    container.innerHTML = '<div class="log-entry"><span class="log-message">No logs available</span></div>';
                }
                
                container.scrollTop = container.scrollHeight;
            } catch (error) {
                console.error('Error refreshing logs:', error);
            }
        }

        async function refreshUsers() {
            try {
                const response = await fetch('/admin/users', {
                    headers: { 'Authorization': 'Bearer admin:password' }
                });
                const data = await response.json();
                
                const container = document.getElementById('usersTable');
                let html = '<table style="width: 100%; border-collapse: collapse;">';
                html += '<tr style="background: #f3f4f6;"><th style="padding: 10px; border: 1px solid #d1d5db;">ID</th><th style="padding: 10px; border: 1px solid #d1d5db;">Username</th><th style="padding: 10px; border: 1px solid #d1d5db;">Name</th><th style="padding: 10px; border: 1px solid #d1d5db;">Cards</th><th style="padding: 10px; border: 1px solid #d1d5db;">Active</th></tr>';
                
                if (data.users && data.users.length > 0) {
                    data.users.forEach(user => {
                        html += \`<tr>
                            <td style="padding: 10px; border: 1px solid #d1d5db;">\${user.id}</td>
                            <td style="padding: 10px; border: 1px solid #d1d5db;">\${user.username || 'N/A'}</td>
                            <td style="padding: 10px; border: 1px solid #d1d5db;">\${user.firstName || 'N/A'}</td>
                            <td style="padding: 10px; border: 1px solid #d1d5db;">\${user.cardCount || 0}</td>
                            <td style="padding: 10px; border: 1px solid #d1d5db;">\${user.isActive ? '✅' : '❌'}</td>
                        </tr>\`;
                    });
                } else {
                    html += '<tr><td colspan="5" style="padding: 20px; text-align: center;">No users found</td></tr>';
                }
                
                html += '</table>';
                container.innerHTML = html;
            } catch (error) {
                console.error('Error refreshing users:', error);
            }
        }

        async function refreshHealthCheck() {
            try {
                const response = await fetch('/admin/health', {
                    headers: { 'Authorization': 'Bearer admin:password' }
                });
                const health = await response.json();
                
                const container = document.getElementById('healthStatus');
                let html = '<div class="metric-grid">';
                
                Object.entries(health).forEach(([key, value]) => {
                    const status = value === true || value === 'OK' ? 'status-ok' : 'status-warning';
                    html += \`
                        <div class="metric-card">
                            <div class="metric-value"><span class="status-indicator \${status}"></span></div>
                            <div class="metric-label">\${key}: \${value}</div>
                        </div>
                    \`;
                });
                
                html += '</div>';
                container.innerHTML = html;
            } catch (error) {
                console.error('Error refreshing health check:', error);
                document.getElementById('healthStatus').innerHTML = '<div class="alert alert-error">❌ Health check failed</div>';
            }
        }

        async function processBulkWords() {
            const words = document.getElementById('wordsInput').value.trim();
            if (!words) {
                alert('Please enter some words to process');
                return;
            }

            const button = document.getElementById('processBulkWords');
            const progressDiv = document.getElementById('bulkProgress');
            const resultsDiv = document.getElementById('bulkResults');

            // Show loading state
            button.disabled = true;
            button.innerHTML = '<span class="spinner"></span>Processing...';
            progressDiv.classList.remove('hidden');
            resultsDiv.classList.add('hidden');

            try {
                const requestData = {
                    words: words,
                    meaningLanguage: document.getElementById('meaningLanguage').value,
                    definitionLanguage: document.getElementById('definitionLanguage').value,
                    assignUsers: document.getElementById('assignUsers').value.split(',').filter(id => id.trim()).map(id => id.trim())
                };

                const response = await fetch('/admin/bulk-words-ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer admin:password'
                    },
                    body: JSON.stringify(requestData)
                });

                const result = await response.json();
                
                if (response.ok) {
                    currentJobId = result.jobId;
                    document.getElementById('progressText').textContent = \`Job started: \${result.jobId}\`;
                    
                    // Start monitoring progress
                    monitorProgress();
                } else {
                    throw new Error(result.error || 'Failed to start processing');
                }
            } catch (error) {
                console.error('Error processing bulk words:', error);
                progressDiv.classList.add('hidden');
                resultsDiv.innerHTML = \`<div class="alert alert-error">❌ Error: \${error.message}</div>\`;
                resultsDiv.classList.remove('hidden');
            } finally {
                button.disabled = false;
                button.innerHTML = '🎯 Process Words with AI';
            }
        }

        async function monitorProgress() {
            if (!currentJobId) return;

            try {
                const response = await fetch(\`/admin/bulk-words-progress/\${currentJobId}\`, {
                    headers: { 'Authorization': 'Bearer admin:password' }
                });
                const progress = await response.json();

                // Update progress bar
                const percentage = progress.totalWords > 0 ? (progress.processedWords / progress.totalWords) * 100 : 0;
                document.getElementById('progressFill').style.width = percentage + '%';
                document.getElementById('progressText').textContent = 
                    \`\${progress.status.toUpperCase()}: \${progress.processedWords}/\${progress.totalWords} words processed (\${progress.successCount} success, \${progress.errorCount} errors)\`;

                // Update processing logs
                const logsContainer = document.getElementById('processingLogs');
                if (progress.logs && progress.logs.length > 0) {
                    logsContainer.innerHTML = '';
                    progress.logs.slice(-10).forEach(logMsg => {
                        const logEntry = document.createElement('div');
                        logEntry.className = 'log-entry';
                        logEntry.innerHTML = \`<span class="log-message">\${logMsg}</span>\`;
                        logsContainer.appendChild(logEntry);
                    });
                    logsContainer.scrollTop = logsContainer.scrollHeight;
                }

                // Check if completed
                if (progress.status === 'completed' || progress.status === 'failed') {
                    clearInterval(progressInterval);
                    
                    const resultsDiv = document.getElementById('bulkResults');
                    const alertClass = progress.status === 'completed' ? 'alert-success' : 'alert-error';
                    const icon = progress.status === 'completed' ? '✅' : '❌';
                    
                    resultsDiv.innerHTML = \`
                        <div class="alert \${alertClass}">
                            \${icon} Processing \${progress.status}!
                            <br>Successfully processed: \${progress.successCount}/\${progress.totalWords} words
                            \${progress.errorCount > 0 ? \`<br>Errors: \${progress.errorCount}\` : ''}
                        </div>
                    \`;
                    resultsDiv.classList.remove('hidden');
                    
                    currentJobId = null;
                } else {
                    // Continue monitoring
                    setTimeout(monitorProgress, 2000);
                }
            } catch (error) {
                console.error('Error monitoring progress:', error);
                clearInterval(progressInterval);
            }
        }

        function startRealtimeUpdates() {
            // Refresh logs every 10 seconds
            logsInterval = setInterval(() => {
                if (document.getElementById('monitoring').classList.contains('active')) {
                    refreshLogs().then(() => {
                        const realtimeLogs = document.getElementById('realtimeLogs');
                        const systemLogs = document.getElementById('systemLogs');
                        realtimeLogs.innerHTML = systemLogs.innerHTML;
                    });
                }
            }, 10000);
            
            // Refresh metrics every 30 seconds
            setInterval(refreshMetrics, 30000);
        }

        // Cards management functions
        let currentCardsPage = 1;
        let currentCardsSearch = '';

        async function refreshCards() {
            currentCardsPage = 1;
            currentCardsSearch = '';
            document.getElementById('cardSearch').value = '';
            await loadCards();
        }

        async function searchCards() {
            currentCardsSearch = document.getElementById('cardSearch').value;
            currentCardsPage = 1;
            await loadCards();
        }

        async function clearCardSearch() {
            currentCardsSearch = '';
            currentCardsPage = 1;
            document.getElementById('cardSearch').value = '';
            await loadCards();
        }

        async function loadCards(page = 1) {
            try {
                currentCardsPage = page;
                let url = \`/admin/all-cards?page=\${page}&limit=20\`;
                if (currentCardsSearch) {
                    url += \`&search=\${encodeURIComponent(currentCardsSearch)}\`;
                }

                const response = await fetch(url, {
                    headers: { 'Authorization': 'Bearer admin:password' }
                });
                const data = await response.json();

                // Update statistics
                const statsContainer = document.getElementById('cardsStats');
                statsContainer.innerHTML = \`
                    <div class="metric-grid">
                        <div class="metric-card">
                            <div class="metric-value">\${data.stats.totalCards}</div>
                            <div class="metric-label">Total Cards</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${data.stats.totalUsers}</div>
                            <div class="metric-label">Active Users</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${Object.values(data.stats.boxDistribution).reduce((a, b) => a + b, 0)}</div>
                            <div class="metric-label">Cards in System</div>
                        </div>
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>Box Distribution:</strong>
                        \${Object.entries(data.stats.boxDistribution).map(([box, count]) => 
                            \`Box \${box}: \${count} cards\`
                        ).join(' | ')}
                    </div>
                \`;

                // Update cards table
                const container = document.getElementById('cardsTable');
                let html = '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
                html += \`<tr style="background: #f3f4f6;">
                    <th style="padding: 8px; border: 1px solid #d1d5db;">Word</th>
                    <th style="padding: 8px; border: 1px solid #d1d5db;">Meaning</th>
                    <th style="padding: 8px; border: 1px solid #d1d5db;">User</th>
                    <th style="padding: 8px; border: 1px solid #d1d5db;">Box</th>
                    <th style="padding: 8px; border: 1px solid #d1d5db;">Reviews</th>
                    <th style="padding: 8px; border: 1px solid #d1d5db;">Accuracy</th>
                    <th style="padding: 8px; border: 1px solid #d1d5db;">Created</th>
                    <th style="padding: 8px; border: 1px solid #d1d5db;">Actions</th>
                </tr>\`;

                if (data.cards && data.cards.length > 0) {
                    data.cards.forEach(card => {
                        const accuracy = card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0;
                        const createdDate = new Date(card.createdAt).toLocaleDateString();
                        html += \`<tr>
                            <td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold;">\${card.word}</td>
                            <td style="padding: 8px; border: 1px solid #d1d5db; max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="\${card.meaning}">\${card.meaning.substring(0, 50)}\${card.meaning.length > 50 ? '...' : ''}</td>
                            <td style="padding: 8px; border: 1px solid #d1d5db;">\${card.username}</td>
                            <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">
                                <span style="background: \${getBoxColor(card.box)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">Box \${card.box}</span>
                            </td>
                            <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">\${card.reviewCount || 0}</td>
                            <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">
                                <span style="color: \${accuracy >= 70 ? 'green' : accuracy >= 50 ? 'orange' : 'red'}; font-weight: bold;">\${accuracy}%</span>
                            </td>
                            <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">\${createdDate}</td>
                            <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center;">
                                <button onclick="viewUserCards('\${card.userId}')" style="padding: 4px 8px; font-size: 11px; background: #3b82f6; color: white; border: none; border-radius: 3px; cursor: pointer;">View User Cards</button>
                            </td>
                        </tr>\`;
                    });
                } else {
                    html += '<tr><td colspan="8" style="padding: 20px; text-align: center;">No cards found</td></tr>';
                }

                html += '</table>';
                container.innerHTML = html;

                // Update pagination
                const paginationContainer = document.getElementById('cardsPagination');
                let paginationHtml = '';
                
                if (data.pagination.totalPages > 1) {
                    // Previous button
                    if (data.pagination.page > 1) {
                        paginationHtml += \`<button onclick="loadCards(\${data.pagination.page - 1})" style="margin: 0 5px; padding: 5px 10px;">← Previous</button>\`;
                    }
                    
                    // Page numbers
                    for (let i = Math.max(1, data.pagination.page - 2); i <= Math.min(data.pagination.totalPages, data.pagination.page + 2); i++) {
                        if (i === data.pagination.page) {
                            paginationHtml += \`<button style="margin: 0 2px; padding: 5px 10px; background: #3b82f6; color: white;">\${i}</button>\`;
                        } else {
                            paginationHtml += \`<button onclick="loadCards(\${i})" style="margin: 0 2px; padding: 5px 10px;">\${i}</button>\`;
                        }
                    }
                    
                    // Next button
                    if (data.pagination.page < data.pagination.totalPages) {
                        paginationHtml += \`<button onclick="loadCards(\${data.pagination.page + 1})" style="margin: 0 5px; padding: 5px 10px;">Next →</button>\`;
                    }
                    
                    paginationHtml += \`<span style="margin-left: 15px;">Page \${data.pagination.page} of \${data.pagination.totalPages} (Total: \${data.pagination.total} cards)</span>\`;
                }
                
                paginationContainer.innerHTML = paginationHtml;

            } catch (error) {
                console.error('Error loading cards:', error);
                document.getElementById('cardsTable').innerHTML = '<div class="alert alert-error">❌ Failed to load cards</div>';
            }
        }

        function getBoxColor(box) {
            const colors = {
                1: '#ef4444', // red
                2: '#f97316', // orange  
                3: '#eab308', // yellow
                4: '#22c55e', // green
                5: '#3b82f6'  // blue
            };
            return colors[box] || '#6b7280';
        }

        async function viewUserCards(userId) {
            try {
                const response = await fetch(\`/admin/users/\${userId}/cards\`, {
                    headers: { 'Authorization': 'Bearer admin:password' }
                });
                const data = await response.json();
                
                // Create a modal or new window to display user cards
                const popup = window.open('', 'UserCards', 'width=800,height=600,scrollbars=yes');
                popup.document.write(\`
                    <html>
                    <head><title>User \${userId} Cards</title></head>
                    <body style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Cards for User \${userId}</h2>
                        <p><strong>Total Cards:</strong> \${data.stats.totalCards}</p>
                        <p><strong>Due Cards:</strong> \${data.stats.dueCards}</p>
                        <p><strong>Box Distribution:</strong> \${Object.entries(data.stats.boxDistribution).map(([box, count]) => \`Box \${box}: \${count}\`).join(', ')}</p>
                        <hr>
                        <table border="1" style="width: 100%; border-collapse: collapse;">
                            <tr style="background: #f0f0f0;">
                                <th style="padding: 10px;">Word</th>
                                <th style="padding: 10px;">Meaning</th>
                                <th style="padding: 10px;">Box</th>
                                <th style="padding: 10px;">Reviews</th>
                                <th style="padding: 10px;">Accuracy</th>
                            </tr>
                            \${data.cards.map(card => {
                                const accuracy = card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0;
                                return \`<tr>
                                    <td style="padding: 8px;">\${card.word}</td>
                                    <td style="padding: 8px;">\${card.meaning}</td>
                                    <td style="padding: 8px; text-align: center;">Box \${card.box}</td>
                                    <td style="padding: 8px; text-align: center;">\${card.reviewCount || 0}</td>
                                    <td style="padding: 8px; text-align: center;">\${accuracy}%</td>
                                </tr>\`;
                            }).join('')}
                        </table>
                    </body>
                    </html>
                \`);
            } catch (error) {
                console.error('Error viewing user cards:', error);
                alert('Failed to load user cards');
            }
        }

        // Cleanup intervals when page unloads
        window.addEventListener('beforeunload', function() {
            if (progressInterval) clearInterval(progressInterval);
            if (logsInterval) clearInterval(logsInterval);
        });
    </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  }

  private async handleDashboard(corsHeaders: any): Promise<Response> {
    const stats = await this.adminService.getAdminStats();
    
    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleGetProfile(request: Request, corsHeaders: any): Promise<Response> {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // For now, return a basic admin profile since we don't have token-based admin lookup
      // In a real implementation, you'd validate the token and get the actual admin
      const adminProfile = {
        id: 'admin_001',
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'System Administrator',
        role: 'admin',
        isActive: true
      };
      
      return new Response(JSON.stringify(adminProfile), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error getting admin profile:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetUsers(url: URL, corsHeaders: any): Promise<Response> {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    const result = await this.adminService.getAllUsers(page, limit);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleGetUser(path: string, corsHeaders: any): Promise<Response> {
    const userId = parseInt(path.split('/')[3]);
    const user = await this.adminService.getUserById(userId);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's cards and activity
    const cards = await this.userManager.getUserCards(userId);
    const activity = await this.adminService.getUserActivity(userId, 20);
    
    return new Response(JSON.stringify({ 
      user, 
      cards: cards.slice(0, 10), // Latest 10 cards
      activity 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleUpdateUser(request: Request, path: string, corsHeaders: any): Promise<Response> {
    const userId = parseInt(path.split('/')[3]);
    const updates: any = await request.json();
    
    const success = await this.adminService.updateUser(userId, updates);
    
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to update user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'User updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleBulkAssignment(request: Request, corsHeaders: any): Promise<Response> {
    const assignmentData: any = await request.json();
    
    const assignmentId = await this.adminService.createBulkWordAssignment(assignmentData);
    
    return new Response(JSON.stringify({ 
      message: 'Bulk assignment created successfully',
      assignmentId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleGetBulkAssignments(url: URL, corsHeaders: any): Promise<Response> {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const result = await this.adminService.getBulkAssignments(page, limit);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleGetTickets(url: URL, corsHeaders: any): Promise<Response> {
    const status = url.searchParams.get('status') || undefined;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    const result = await this.adminService.getSupportTickets(status, page, limit);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleUpdateTicket(request: Request, path: string, corsHeaders: any): Promise<Response> {
    const ticketId = path.split('/')[3];
    const updates: any = await request.json();
    
    const success = await this.adminService.updateSupportTicket(ticketId, updates);
    
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to update ticket' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'Ticket updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleSendMessage(request: Request, corsHeaders: any): Promise<Response> {
    try {
      const messageData: any = await request.json();
      const { userId, message } = messageData;
      
      if (!userId || !message) {
        return new Response(JSON.stringify({ 
          error: 'User ID and message are required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const success = await this.adminService.sendAdminMessage(userId, message, 'direct');
      
      if (success) {
        return new Response(JSON.stringify({ 
          message: 'Message sent successfully',
          success: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ 
          error: 'Failed to send message' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleSendBulkMessage(request: Request, corsHeaders: any): Promise<Response> {
    try {
      const messageData: any = await request.json();
      const { userIds, message } = messageData;
      
      if (!Array.isArray(userIds) || userIds.length === 0 || !message) {
        return new Response(JSON.stringify({ 
          error: 'User IDs array and message are required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const result = await this.adminService.sendBulkMessage(userIds, message);
      
      return new Response(JSON.stringify({ 
        message: 'Bulk message processing completed',
        success: result.success,
        failed: result.failed,
        total: userIds.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error sending bulk message:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleSendBroadcastMessage(request: Request, corsHeaders: any): Promise<Response> {
    try {
      const messageData: any = await request.json();
      const { message } = messageData;
      
      if (!message) {
        return new Response(JSON.stringify({ 
          error: 'Message is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const result = await this.adminService.sendBroadcastMessage(message);
      
      return new Response(JSON.stringify({ 
        message: 'Broadcast message sent',
        success: result.success,
        failed: result.failed
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error sending broadcast message:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetUserMessages(path: string, corsHeaders: any): Promise<Response> {
    const userId = parseInt(path.split('/')[3]);
    const messages = await this.adminService.getUserMessages(userId);
    
    return new Response(JSON.stringify({ messages }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async handleCreateAdmin(request: Request, corsHeaders: any): Promise<Response> {
    try {
      const body: any = await request.json();
      const { username, email, password, fullName, role } = body;

      if (!username || !email || !password || !fullName) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const adminData = {
        username,
        email,
        fullName,
        role: role || 'admin',
        isActive: true,
        password
      };

      const newAdmin = await this.adminService.createAdmin(adminData);

      return new Response(JSON.stringify({ 
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          email: newAdmin.email,
          fullName: newAdmin.fullName,
          role: newAdmin.role,
          isActive: newAdmin.isActive,
          createdAt: newAdmin.createdAt
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      return new Response(JSON.stringify({ error: 'Failed to create admin' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetUserStats(userId: string, corsHeaders: any): Promise<Response> {
    try {
      const stats = await this.adminService.getUserStats(userId);
      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      return new Response(JSON.stringify({ error: 'Failed to get user stats' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetUserDetails(userId: string, corsHeaders: any): Promise<Response> {
    try {
      const details = await this.adminService.getUserDetails(userId);
      return new Response(JSON.stringify(details), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error getting user details:', error);
      return new Response(JSON.stringify({ error: 'Failed to get user details' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleBulkWordsAI(request: Request, corsHeaders: any, ctx?: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    
    try {
      const body: any = await request.json();
      const { words, meaningLanguage, definitionLanguage, assignUsers } = body;
      
      await this.logger.info('bulk_words_ai_request', 'Processing bulk words AI request', {
        wordsType: Array.isArray(words) ? 'array' : 'string',
        wordsCount: Array.isArray(words) ? words.length : words.split('\n').length,
        meaningLanguage,
        definitionLanguage,
        assignUsersCount: assignUsers?.length || 0
      });
      
      // Start the AI processing job
      const jobResult = await this.adminService.processBulkWordsWithAI(words, meaningLanguage, definitionLanguage, assignUsers, ctx);
      
      await this.logger.logPerformance('bulk_words_ai_started', startTime, {
        jobId: jobResult.jobId,
        totalWords: jobResult.totalWords
      });
      
      return new Response(JSON.stringify({ 
        jobId: jobResult.jobId,
        status: 'started',
        totalWords: jobResult.totalWords
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      await this.logger.error('bulk_words_ai_failed', 'Error processing bulk words with AI', error);
      
      return new Response(JSON.stringify({ error: 'Failed to start AI processing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleBulkWordsProgress(jobId: string, corsHeaders: any): Promise<Response> {
    try {
      await this.logger.debug('bulk_words_progress_request', `Getting progress for job ${jobId}`, { jobId });
      
      const progress = await this.adminService.getBulkWordsProgress(jobId);
      return new Response(JSON.stringify(progress), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      await this.logger.error('bulk_words_progress_failed', 'Error getting bulk words progress', error);
      
      return new Response(JSON.stringify({ error: 'Failed to get progress' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleHealthCheck(corsHeaders: any): Promise<Response> {
    try {
      await this.logger.debug('health_check_request', 'Health check requested');
      
      const healthStatus = await this.healthCheckService.getFullHealthStatus();
      
      const statusCode = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;
      
      return new Response(JSON.stringify(healthStatus), {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      await this.logger.error('health_check_failed', 'Health check failed', error);
      
      return new Response(JSON.stringify({ 
        status: 'unhealthy',
        error: 'Health check service failed',
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetLogs(url: URL, corsHeaders: any): Promise<Response> {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const level = url.searchParams.get('level') || '';
      const component = url.searchParams.get('component') || '';
      const startDate = url.searchParams.get('startDate') || '';
      const endDate = url.searchParams.get('endDate') || '';
      
      await this.logger.debug('logs_request', 'Logs requested', {
        limit,
        level,
        component,
        startDate,
        endDate
      });
      
      // Get logs from KV store
      const logsResult = await this.env.LEITNER_DB.list({ prefix: 'log:' });
      const logs: any[] = [];
      
      for (const key of logsResult.keys.slice(0, limit)) {
        try {
          const logEntry = await this.env.LEITNER_DB.get(key.name, 'json') as any;
          if (logEntry) {
            // Apply filters
            if (level && logEntry.level !== level) continue;
            if (component && logEntry.component !== component) continue;
            if (startDate && new Date(logEntry.timestamp) < new Date(startDate)) continue;
            if (endDate && new Date(logEntry.timestamp) > new Date(endDate)) continue;
            
            logs.push(logEntry);
          }
        } catch (error) {
          // Skip invalid log entries
        }
      }
      
      // Sort by timestamp (newest first)
      logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return new Response(JSON.stringify({
        logs: logs.slice(0, limit),
        total: logs.length,
        filters: { limit, level, component, startDate, endDate }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      await this.logger.error('get_logs_failed', 'Failed to retrieve logs', error);
      
      return new Response(JSON.stringify({ error: 'Failed to retrieve logs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetMetrics(corsHeaders: any): Promise<Response> {
    try {
      await this.logger.debug('metrics_request', 'Metrics requested');
      
      const today = new Date().toISOString().split('T')[0];
      const metricsKey = `metrics:${today}`;
      const metrics = await this.env.LEITNER_DB.get(metricsKey, 'json');
      
      // Get additional metrics
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const yesterdayMetrics = await this.env.LEITNER_DB.get(`metrics:${yesterday}`, 'json');
      
      const response = {
        today: metrics || {
          timestamp: new Date().toISOString(),
          requests: { total: 0, webhook: 0, admin: 0, health: 0 },
          errors: { total: 0, byComponent: {}, byLevel: {} },
          performance: { avgResponseTime: 0, slowestEndpoint: '', fastestEndpoint: '' },
          users: { active: 0, total: 0, newToday: 0 },
          storage: { kvOperations: 0, kvErrors: 0 }
        },
        yesterday: yesterdayMetrics,
        trends: {
          requestGrowth: metrics && yesterdayMetrics ? 
            ((metrics.requests.total - yesterdayMetrics.requests.total) / yesterdayMetrics.requests.total * 100).toFixed(2) + '%' : 'N/A',
          errorRateChange: metrics && yesterdayMetrics ?
            ((metrics.errors.total - yesterdayMetrics.errors.total) / Math.max(yesterdayMetrics.errors.total, 1) * 100).toFixed(2) + '%' : 'N/A'
        }
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      await this.logger.error('get_metrics_failed', 'Failed to retrieve metrics', error);
      
      return new Response(JSON.stringify({ error: 'Failed to retrieve metrics' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetUserCards(userId: string, url: URL, corsHeaders: any): Promise<Response> {
    try {
      await this.logger.info('get_user_cards_start', `Getting cards for user ${userId}`);
      
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';
      const box = url.searchParams.get('box');
      
      // Get user cards from KV store
      const cards = await this.env.LEITNER_DB.get(`user_cards:${userId}`, 'json') || [];
      
      // Filter cards based on search and box
      let filteredCards = cards;
      if (search) {
        filteredCards = cards.filter((card: any) => 
          card.word.toLowerCase().includes(search.toLowerCase()) ||
          card.meaning.toLowerCase().includes(search.toLowerCase()) ||
          card.definition.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (box) {
        filteredCards = filteredCards.filter((card: any) => card.box === parseInt(box));
      }
      
      // Pagination
      const total = filteredCards.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCards = filteredCards.slice(startIndex, endIndex);
      
      // Calculate statistics
      const boxStats = cards.reduce((acc: any, card: any) => {
        acc[card.box] = (acc[card.box] || 0) + 1;
        return acc;
      }, {});
      
      const dueCards = cards.filter((card: any) => new Date(card.nextReview) <= new Date()).length;
      
      const response = {
        cards: paginatedCards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          totalCards: cards.length,
          dueCards,
          boxDistribution: boxStats
        },
        filters: { search, box }
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      await this.logger.error('get_user_cards_failed', `Failed to get cards for user ${userId}`, error);
      
      return new Response(JSON.stringify({ error: 'Failed to retrieve user cards' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetUserWords(userId: string, url: URL, corsHeaders: any): Promise<Response> {
    try {
      await this.logger.info('get_user_words_start', `Getting words for user ${userId}`);
      
      const cards = await this.env.LEITNER_DB.get(`user_cards:${userId}`, 'json') || [];
      
      // Extract just the words with basic info
      const words = cards.map((card: any) => ({
        id: card.id,
        word: card.word,
        meaning: card.meaning,
        box: card.box,
        createdAt: card.createdAt,
        reviewCount: card.reviewCount,
        correctCount: card.correctCount,
        accuracy: card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0
      }));
      
      const response = {
        words,
        count: words.length,
        stats: {
          totalWords: words.length,
          averageAccuracy: words.reduce((sum: number, w: any) => sum + w.accuracy, 0) / words.length || 0,
          boxDistribution: words.reduce((acc: any, w: any) => {
            acc[w.box] = (acc[w.box] || 0) + 1;
            return acc;
          }, {})
        }
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      await this.logger.error('get_user_words_failed', `Failed to get words for user ${userId}`, error);
      
      return new Response(JSON.stringify({ error: 'Failed to retrieve user words' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleGetAllCards(url: URL, corsHeaders: any): Promise<Response> {
    try {
      await this.logger.info('get_all_cards_start', 'Getting all cards across all users');
      
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';
      
      // Get all users first
      const usersResult = await this.adminService.getAllUsers();
      const allCards: any[] = [];
      
      // Collect cards from all users
      for (const user of usersResult.users) {
        try {
          const userCards = await this.env.LEITNER_DB.get(`user_cards:${user.id}`, 'json') || [];
          userCards.forEach((card: any) => {
            allCards.push({
              ...card,
              userId: user.id,
              username: user.username || `User ${user.id}`,
              userFullName: user.fullName || user.firstName || `User ${user.id}`
            });
          });
        } catch (error) {
          console.warn(`Failed to get cards for user ${user.id}:`, error);
        }
      }
      
      // Filter by search
      let filteredCards = allCards;
      if (search) {
        filteredCards = allCards.filter((card: any) => 
          card.word.toLowerCase().includes(search.toLowerCase()) ||
          card.meaning.toLowerCase().includes(search.toLowerCase()) ||
          card.username.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Sort by creation date (newest first)
      filteredCards.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Pagination
      const total = filteredCards.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCards = filteredCards.slice(startIndex, endIndex);
      
      // Calculate statistics
      const boxStats = allCards.reduce((acc: any, card: any) => {
        acc[card.box] = (acc[card.box] || 0) + 1;
        return acc;
      }, {});
      
      const userStats = allCards.reduce((acc: any, card: any) => {
        acc[card.userId] = (acc[card.userId] || 0) + 1;
        return acc;
      }, {});
      
      const response = {
        cards: paginatedCards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          totalCards: allCards.length,
          totalUsers: Object.keys(userStats).length,
          boxDistribution: boxStats,
          topUsers: Object.entries(userStats)
            .sort(([,a]: any, [,b]: any) => b - a)
            .slice(0, 10)
            .map(([userId, count]) => ({
              userId,
              username: usersResult.users.find((u: any) => u.id.toString() === userId)?.username || `User ${userId}`,
              cardCount: count
            }))
        },
        filters: { search }
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      await this.logger.error('get_all_cards_failed', 'Failed to get all cards', error);
      
      return new Response(JSON.stringify({ error: 'Failed to retrieve all cards' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
}
