import { AdminService } from '../services/admin-service';
import { UserManager } from '../services/user-manager';

export class AdminAPI {
  constructor(
    private adminService: AdminService,
    private userManager: UserManager
  ) {}

  async handleAdminRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

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

      if (path === '/admin/bulk-words-ai' && method === 'POST') {
        return await this.handleBulkWordsAI(request, corsHeaders);
      }

      if (path.startsWith('/admin/bulk-words-progress/') && method === 'GET') {
        const jobId = path.split('/')[3];
        return await this.handleBulkWordsProgress(jobId, corsHeaders);
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
    const messageData: any = await request.json();
    
    const messageId = await this.adminService.sendDirectMessage(messageData);
    
    return new Response(JSON.stringify({ 
      message: 'Message sent successfully',
      messageId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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

  private async handleBulkWordsAI(request: Request, corsHeaders: any): Promise<Response> {
    try {
      const body: any = await request.json();
      const { words, meaningLanguage, definitionLanguage, assignUsers } = body;
      
      // Start the AI processing job
      const jobResult = await this.adminService.processBulkWordsWithAI(words, meaningLanguage, definitionLanguage, assignUsers);
      
      return new Response(JSON.stringify({ 
        jobId: jobResult.jobId,
        status: 'started',
        totalWords: jobResult.totalWords
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error processing bulk words with AI:', error);
      return new Response(JSON.stringify({ error: 'Failed to start AI processing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleBulkWordsProgress(jobId: string, corsHeaders: any): Promise<Response> {
    try {
      const progress = await this.adminService.getBulkWordsProgress(jobId);
      return new Response(JSON.stringify(progress), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error getting bulk words progress:', error);
      return new Response(JSON.stringify({ error: 'Failed to get progress' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
}
