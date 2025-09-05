import { AdminService } from '../services/admin-service';
import { UserManager } from '../services/user-manager';
import { Logger } from '../services/logger';
import { HealthCheckService } from '../services/health-check';

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
      // Authentication check (except for login)
      if (!path.includes('/admin/login')) {
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

      if (path === '/admin/profile' && method === 'GET') {
        return await this.handleGetProfile(request, corsHeaders);
      }
      
      if (path === '/admin/users' && method === 'GET') {
        return await this.handleGetUsers(url, corsHeaders);
      }
      
      if (path.startsWith('/admin/users/') && method === 'GET') {
        const segments = path.split('/');
        const userId = segments[3];
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
}
