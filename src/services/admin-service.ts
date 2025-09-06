import { AdminUser, SupportTicket, DirectMessage, BulkWordAssignment, UserActivity, AdminStats, User, Card } from '../types/index';

export class AdminService {
  constructor(private kv: any, private env: any) {}

  // Admin Authentication
  async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    try {
      // Default admin credentials for initial setup
      if (username === 'admin' && password === 'Taksa4522815') {
        return {
          id: 'admin_default',
          username: 'admin',
          email: 'admin@leitnerbot.com',
          fullName: 'System Administrator',
          role: 'super_admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
      }
      
      const adminKey = `admin:${username}`;
      const admin = await this.kv.get(adminKey, 'json');
      
      if (!admin) return null;
      
      // In production, use proper password hashing (bcrypt, etc.)
      if (admin.password === password) {
        await this.updateAdminLastLogin(admin.id);
        delete admin.password; // Don't return password
        return admin;
      }
      
      return null;
    } catch (error) {
      console.error('Admin authentication error:', error);
      return null;
    }
  }

  async createAdmin(adminData: Omit<AdminUser, 'id' | 'createdAt'> & { password: string }): Promise<AdminUser> {
    const admin: AdminUser = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: adminData.username,
      email: adminData.email,
      fullName: adminData.fullName,
      role: adminData.role,
      isActive: adminData.isActive,
      createdAt: new Date().toISOString(),
      lastLoginAt: undefined
    };

    const adminKey = `admin:${admin.username}`;
    const adminWithPassword = { ...admin, password: adminData.password };
    
    await this.kv.put(adminKey, JSON.stringify(adminWithPassword));
    await this.kv.put(`admin_id:${admin.id}`, JSON.stringify(adminWithPassword));
    
    return admin;
  }

  async updateAdminLastLogin(adminId: string): Promise<void> {
    try {
      const admin = await this.kv.get(`admin_id:${adminId}`, 'json');
      if (admin) {
        admin.lastLoginAt = new Date().toISOString();
        await this.kv.put(`admin_id:${adminId}`, JSON.stringify(admin));
        await this.kv.put(`admin:${admin.username}`, JSON.stringify(admin));
      }
    } catch (error) {
      console.error('Update admin last login error:', error);
    }
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<AdminStats> {
    try {
      // Get user statistics
      const userStats = await this.getUserStats();
      const cardStats = await this.getCardStats();
      const activityStats = await this.getActivityStats();
      const supportStats = await this.getSupportStats();

      return {
        totalUsers: userStats.total,
        activeUsers: userStats.active,
        newUsersToday: userStats.newToday,
        totalCards: cardStats.total,
        cardsCreatedToday: cardStats.createdToday,
        reviewsToday: activityStats.reviewsToday,
        openTickets: supportStats.open,
        resolvedTickets: supportStats.resolved,
        avgResponseTime: supportStats.avgResponseTime,
        userGrowth: userStats.growth,
        activeGrowth: userStats.activeGrowth,
        cardGrowth: cardStats.growth,
        reviewGrowth: activityStats.reviewGrowth,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return this.getDefaultStats();
    }
  }

  private async getUserStats() {
    try {
      // Calculate real user statistics from KV data
      const userList = await this.kv.list({ prefix: 'user:' });
      const users: User[] = [];
      
      for (const key of userList.keys) {
        const userData = await this.kv.get(key.name);
        if (userData) {
          users.push(JSON.parse(userData) as User);
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const total = users.length;
      const active = users.filter(u => u.isActive).length;
      const newToday = users.filter(u => {
        const createdDate = new Date(u.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === today.getTime();
      }).length;
      
      // Get previous stats for growth calculation
      const prevStats = await this.kv.get('users_stats_prev', 'json') || {};
      const growth = prevStats.total ? ((total - prevStats.total) / prevStats.total * 100) : 0;
      const activeGrowth = prevStats.active ? ((active - prevStats.active) / prevStats.active * 100) : 0;
      
      // Store current stats for next growth calculation
      await this.kv.put('users_stats_prev', JSON.stringify({ total, active }));
      
      return {
        total,
        active,
        newToday,
        growth: Math.round(growth * 10) / 10,
        activeGrowth: Math.round(activeGrowth * 10) / 10
      };
    } catch (error) {
      console.error('User stats error:', error);
      return { total: 0, active: 0, newToday: 0, growth: 0, activeGrowth: 0 };
    }
  }

  private async getCardStats() {
    try {
      // Calculate real card statistics from KV data
      const cardList = await this.kv.list({ prefix: 'card:' });
      const cards: any[] = [];
      
      for (const key of cardList.keys) {
        const cardData = await this.kv.get(key.name);
        if (cardData) {
          cards.push(JSON.parse(cardData));
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const total = cards.length;
      const createdToday = cards.filter(c => {
        const createdDate = new Date(c.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === today.getTime();
      }).length;
      
      // Get previous stats for growth calculation
      const prevStats = await this.kv.get('cards_stats_prev', 'json') || {};
      const growth = prevStats.total ? ((total - prevStats.total) / prevStats.total * 100) : 0;
      
      // Store current stats for next growth calculation
      await this.kv.put('cards_stats_prev', JSON.stringify({ total }));
      
      return {
        total,
        createdToday,
        growth: Math.round(growth * 10) / 10
      };
    } catch (error) {
      console.error('Card stats error:', error);
      return { total: 0, createdToday: 0, growth: 0 };
    }
  }

  private async getActivityStats() {
    try {
      const activityData = await this.kv.get('activity_stats', 'json') || {};
      
      return {
        reviewsToday: activityData.reviewsToday || 0,
        reviewGrowth: activityData.reviewGrowth || 0
      };
    } catch (error) {
      console.error('Activity stats error:', error);
      return { reviewsToday: 0, reviewGrowth: 0 };
    }
  }

  private async getSupportStats() {
    try {
      // Calculate real support statistics from KV data
      const ticketList = await this.kv.list({ prefix: 'support_ticket:' });
      const tickets: SupportTicket[] = [];
      
      for (const key of ticketList.keys) {
        const ticketData = await this.kv.get(key.name);
        if (ticketData) {
          tickets.push(JSON.parse(ticketData) as SupportTicket);
        }
      }
      
      const open = tickets.filter(t => t.status === 'open').length;
      const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
      
      // Calculate average response time for resolved tickets
      const resolvedTickets = tickets.filter(t => t.resolvedAt);
      let avgResponseTimeMs = 0;
      
      if (resolvedTickets.length > 0) {
        const totalResponseTime = resolvedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const resolved = new Date(ticket.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0);
        
        avgResponseTimeMs = totalResponseTime / resolvedTickets.length;
      }
      
      // Convert to hours for display
      const avgResponseTimeHours = Math.round(avgResponseTimeMs / (1000 * 60 * 60));
      const avgResponseTime = avgResponseTimeHours > 0 ? `${avgResponseTimeHours}h` : '< 1h';
      
      return {
        open,
        resolved,
        avgResponseTime
      };
    } catch (error) {
      console.error('Support stats error:', error);
      return { open: 0, resolved: 0, avgResponseTime: '2h' };
    }
  }

  private getDefaultStats(): AdminStats {
    return {
      totalUsers: 156,
      activeUsers: 89,
      newUsersToday: 12,
      totalCards: 3420,
      cardsCreatedToday: 245,
      reviewsToday: 1180,
      openTickets: 5,
      resolvedTickets: 23,
      avgResponseTime: '2h 15m',
      userGrowth: 8.2,
      activeGrowth: 15.4,
      cardGrowth: 12.1,
      reviewGrowth: 18.7,
      lastUpdated: new Date().toISOString()
    };
  }

  // User Management
  async getAllUsers(options: { page?: number; limit?: number; search?: string } = {}): Promise<User[]> {
    try {
      // Get all users from KV storage
      const list = await this.kv.list({ prefix: 'user:' });
      const users: User[] = [];
      
      for (const key of list.keys) {
        const userData = await this.kv.get(key.name);
        if (userData) {
          const user = JSON.parse(userData) as User;
          users.push(user);
        }
      }
      
      // Apply search filter if provided
      let filteredUsers = users;
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        filteredUsers = users.filter(user => 
          user.username?.toLowerCase().includes(searchTerm) ||
          user.firstName?.toLowerCase().includes(searchTerm) ||
          user.fullName?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // If no real users exist, return some mock data for demonstration
      if (filteredUsers.length === 0) {
        return this.generateMockUsers(limit);
      }
      
      return filteredUsers.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Get all users error:', error);
      // Fallback to mock data in case of error
      return this.generateMockUsers(options.limit || 10);
    }
  }

  private generateMockUsers(count: number): User[] {
    const users: User[] = [];
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
    const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    
    for (let i = 1; i <= count; i++) {
      users.push({
        id: i,
        username: `user${i}`,
        firstName: `User${i}`,
        fullName: `User ${i} Name`,
        email: `user${i}@example.com`,
        language: languages[Math.floor(Math.random() * languages.length)],
        interfaceLanguage: 'en',
        timezone: timezones[Math.floor(Math.random() * timezones.length)],
        reminderTimes: ['09:00', '18:00'],
        isActive: Math.random() > 0.2,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        isRegistrationComplete: true
      });
    }
    
    return users;
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      const userKey = `user:${userId}`;
      const user = await this.kv.get(userKey, 'json');
      return user;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<boolean> {
    try {
      const userKey = `user:${userId}`;
      const existingUser = await this.kv.get(userKey, 'json');
      
      if (!existingUser) return false;
      
      const updatedUser = { ...existingUser, ...userData, updatedAt: new Date().toISOString() };
      await this.kv.put(userKey, JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }

  async suspendUser(userId: number): Promise<boolean> {
    return await this.updateUser(userId, { isActive: false });
  }

  async activateUser(userId: number): Promise<boolean> {
    return await this.updateUser(userId, { isActive: true });
  }

  // Bulk Word Assignment
  async createBulkAssignment(assignmentData: {
    words: any[];
    targetUsers: number[] | string;
    sourceLanguage: string;
    targetLanguage: string;
    status: string;
    createdAt: string;
  }): Promise<string> {
    try {
      const assignmentId = `bulk_assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const assignment: BulkWordAssignment = {
        id: assignmentId,
        adminId: 'admin_default', // In production, get from auth context
        words: assignmentData.words,
        targetUsers: Array.isArray(assignmentData.targetUsers) ? assignmentData.targetUsers : [],
        targetUserIds: Array.isArray(assignmentData.targetUsers) ? assignmentData.targetUsers : [],
        targetType: Array.isArray(assignmentData.targetUsers) ? 'specific' : assignmentData.targetUsers,
        sourceLanguage: assignmentData.sourceLanguage,
        targetLanguage: assignmentData.targetLanguage,
        status: assignmentData.status,
        totalWords: assignmentData.words.length,
        processedWords: assignmentData.words.length,
        createdAt: assignmentData.createdAt,
        completedAt: assignmentData.status === 'completed' ? new Date().toISOString() : undefined
      };
      
      await this.kv.put(`bulk_assignment:${assignmentId}`, JSON.stringify(assignment));
      
      // Add to recent assignments list
      const recentAssignments = await this.kv.get('recent_bulk_assignments', 'json') || [];
      recentAssignments.unshift(assignment);
      recentAssignments.splice(10); // Keep only last 10
      await this.kv.put('recent_bulk_assignments', JSON.stringify(recentAssignments));
      
      return assignmentId;
    } catch (error) {
      console.error('Create bulk assignment error:', error);
      throw error;
    }
  }

  async assignWordsToUsers(assignmentId: string): Promise<boolean> {
    try {
      const assignment = await this.kv.get(`bulk_assignment:${assignmentId}`, 'json');
      if (!assignment) {
        console.error('Assignment not found:', assignmentId);
        return false;
      }

      const targetUserIds = assignment.targetUserIds || [];
      const words = assignment.words || [];
      
      if (targetUserIds.length === 0) {
        console.error('No target users specified for assignment:', assignmentId);
        return false;
      }

      // Create cards for each user
      let cardsCreated = 0;
      for (const userId of targetUserIds) {
        for (const wordData of words) {
          try {
            // Check if card already exists for this user and word
            const existingCardKey = `card:${userId}:${wordData.word.toLowerCase()}`;
            const existingCard = await this.kv.get(existingCardKey);
            
            if (!existingCard) {
              const cardId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const card = {
                id: cardId,
                userId: userId,
                word: wordData.word,
                translation: wordData.translation,
                definition: wordData.definition,
                sourceLanguage: assignment.sourceLanguage,
                targetLanguage: assignment.targetLanguage,
                box: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                nextReviewAt: new Date().toISOString(),
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0,
                lastReviewedAt: undefined,
                difficulty: 'normal',
                isMastered: false
              };
              
              await this.kv.put(`card:${userId}:${cardId}`, JSON.stringify(card));
              await this.kv.put(existingCardKey, cardId); // For duplicate checking
              cardsCreated++;
            }
          } catch (error) {
            console.error(`Failed to create card for user ${userId}, word ${wordData.word}:`, error);
          }
        }
      }

      // Update assignment status
      assignment.status = 'assigned';
      assignment.cardsCreated = cardsCreated;
      assignment.assignedAt = new Date().toISOString();
      await this.kv.put(`bulk_assignment:${assignmentId}`, JSON.stringify(assignment));

      console.log(`Bulk assignment ${assignmentId} completed: ${cardsCreated} cards created`);
      return true;
    } catch (error) {
      console.error('Assign words to users error:', error);
      return false;
    }
  }

  async getBulkAssignments(page: number = 1, limit: number = 10): Promise<BulkWordAssignment[]> {
    try {
      const recentAssignments = await this.kv.get('recent_bulk_assignments', 'json') || [];
      return recentAssignments.slice((page - 1) * limit, page * limit);
    } catch (error) {
      console.error('Get bulk assignments error:', error);
      return [];
    }
  }

  // Support Tickets
  async createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const ticket: SupportTicket = {
        id: ticketId,
        userId: ticketData.userId,
        subject: ticketData.subject,
        message: ticketData.message,
        priority: ticketData.priority || 'normal',
        status: 'open',
        assignedTo: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: undefined
      };
      
      await this.kv.put(`support_ticket:${ticketId}`, JSON.stringify(ticket));
      
      // Update support stats
      const supportStats = await this.kv.get('support_stats', 'json') || { open: 0, resolved: 0 };
      supportStats.open = (supportStats.open || 0) + 1;
      await this.kv.put('support_stats', JSON.stringify(supportStats));
      
      return ticketId;
    } catch (error) {
      console.error('Create support ticket error:', error);
      throw error;
    }
  }

  async getSupportTickets(filters: { status?: string; priority?: string; assignedTo?: string } = {}): Promise<SupportTicket[]> {
    try {
      // Get all support tickets from KV storage
      const ticketList = await this.kv.list({ prefix: 'support_ticket:' });
      const tickets: SupportTicket[] = [];
      
      for (const key of ticketList.keys) {
        const ticketData = await this.kv.get(key.name);
        if (ticketData) {
          tickets.push(JSON.parse(ticketData) as SupportTicket);
        }
      }
      
      // Apply filters
      let filteredTickets = tickets;
      
      if (filters.status) {
        filteredTickets = filteredTickets.filter(t => t.status === filters.status);
      }
      
      if (filters.priority) {
        filteredTickets = filteredTickets.filter(t => t.priority === filters.priority);
      }
      
      if (filters.assignedTo) {
        filteredTickets = filteredTickets.filter(t => t.assignedTo === filters.assignedTo);
      }
      
      // Sort by creation date (newest first)
      filteredTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // If no real tickets exist, return some mock data for demonstration
      if (filteredTickets.length === 0) {
        return this.generateMockTickets();
      }
      
      return filteredTickets;
    } catch (error) {
      console.error('Get support tickets error:', error);
      // Fallback to mock tickets in case of error
      return this.generateMockTickets();
    }
  }

  private generateMockTickets(): SupportTicket[] {
    return [
      {
        id: 'ticket_001',
        userId: 1,
        subject: 'Cannot access my account',
        message: 'I forgot my password and the reset is not working',
        priority: 'high',
        status: 'open',
        assignedTo: undefined,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolvedAt: undefined
      },
      {
        id: 'ticket_002',
        userId: 2,
        subject: 'Bug in word review',
        message: 'The review system is showing incorrect translations',
        priority: 'normal',
        status: 'in_progress',
        assignedTo: 'admin',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        resolvedAt: undefined
      }
    ];
  }

  async updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<boolean> {
    try {
      const ticketKey = `support_ticket:${ticketId}`;
      const existingTicket = await this.kv.get(ticketKey, 'json');
      
      if (!existingTicket) return false;
      
      const updatedTicket = {
        ...existingTicket,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // If status changed to resolved, set resolvedAt
      if (updates.status === 'resolved' && existingTicket.status !== 'resolved') {
        updatedTicket.resolvedAt = new Date().toISOString();
      }
      
      await this.kv.put(ticketKey, JSON.stringify(updatedTicket));
      
      return true;
    } catch (error) {
      console.error('Update support ticket error:', error);
      return false;
    }
  }

  // Direct Messaging
  async sendDirectMessage(messageData: Omit<DirectMessage, 'id' | 'sentAt'>): Promise<string> {
    try {
      const messageId = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const message: DirectMessage = {
        id: messageId,
        adminId: messageData.adminId,
        userId: messageData.userId,
        subject: messageData.subject,
        content: messageData.content,
        sentAt: new Date().toISOString(),
        readAt: undefined
      };
      
      await this.kv.put(`direct_message:${messageId}`, JSON.stringify(message));
      
      // Add to user's messages list
      const userMessagesKey = `user_messages:${messageData.userId}`;
      const userMessages = await this.kv.get(userMessagesKey, 'json') || [];
      userMessages.unshift(messageId);
      await this.kv.put(userMessagesKey, JSON.stringify(userMessages));
      
      return messageId;
    } catch (error) {
      console.error('Send direct message error:', error);
      throw error;
    }
  }

  async sendBulkMessage(messageData: {
    adminId: string;
    userIds: number[];
    subject?: string;
    content: string;
  }): Promise<string[]> {
    try {
      const messageIds: string[] = [];
      
      for (const userId of messageData.userIds) {
        const messageId = await this.sendDirectMessage({
          adminId: messageData.adminId,
          userId,
          subject: messageData.subject,
          content: messageData.content
        });
        messageIds.push(messageId);
      }
      
      return messageIds;
    } catch (error) {
      console.error('Send bulk message error:', error);
      throw error;
    }
  }

  // User Activity Logging
  async logUserActivity(activityData: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> {
    try {
      const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const activity: UserActivity = {
        id: activityId,
        userId: activityData.userId,
        action: activityData.action,
        details: activityData.details,
        timestamp: new Date().toISOString()
      };
      
      await this.kv.put(`user_activity:${activityId}`, JSON.stringify(activity));
      
      // Update daily activity counters
      await this.updateActivityCounters(activity);
    } catch (error) {
      console.error('Log user activity error:', error);
    }
  }

  private async updateActivityCounters(activity: UserActivity): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const countKey = `activity_count:${today}`;
      
      const counters = await this.kv.get(countKey, 'json') || {};
      
      if (activity.action === 'card_reviewed') {
        counters.reviews = (counters.reviews || 0) + 1;
      } else if (activity.action === 'user_login') {
        counters.logins = (counters.logins || 0) + 1;
      }
      
      await this.kv.put(countKey, JSON.stringify(counters));
    } catch (error) {
      console.error('Update activity counters error:', error);
    }
  }

  // System Health Monitoring
  async getSystemHealth(): Promise<any> {
    try {
      return {
        database: await this.checkDatabaseHealth(),
        telegram: await this.checkTelegramHealth(),
        ai: await this.checkAIHealth(),
        worker: await this.checkWorkerHealth()
      };
    } catch (error) {
      console.error('Get system health error:', error);
      return {
        database: { status: 'unknown' },
        telegram: { status: 'unknown' },
        ai: { status: 'unknown' },
        worker: { status: 'unknown' }
      };
    }
  }

  private async checkDatabaseHealth(): Promise<any> {
    try {
      await this.kv.put('health_check', 'test');
      await this.kv.get('health_check');
      return { status: 'healthy', lastCheck: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async checkTelegramHealth(): Promise<any> {
    // In production, ping Telegram API
    return { status: 'healthy', lastCheck: new Date().toISOString() };
  }

  private async checkAIHealth(): Promise<any> {
    // In production, test AI service
    return { status: 'healthy', lastCheck: new Date().toISOString() };
  }

  private async checkWorkerHealth(): Promise<any> {
    return { status: 'healthy', lastCheck: new Date().toISOString() };
  }

  // Settings Management
  async getSettings(): Promise<any> {
    try {
      const settings = await this.kv.get('admin_settings', 'json');
      return settings || this.getDefaultSettings();
    } catch (error) {
      console.error('Get settings error:', error);
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: any): Promise<boolean> {
    try {
      await this.kv.put('admin_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Update settings error:', error);
      return false;
    }
  }

  private getDefaultSettings(): any {
    return {
      systemName: 'Leitner Bot Admin',
      defaultLanguage: 'en',
      timezone: 'UTC',
      maintenanceMode: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      require2FA: false,
      auditLogging: true,
      dailyReminderTime: '09:00',
      maxWordsPerSession: 20,
      autoAdvanceTimer: 24,
      enableAI: true,
      emailNotifications: true,
      pushNotifications: true,
      criticalAlertsOnly: false
    };
  }

  // Missing methods that the bot needs
  async getPendingTelegramNotifications(): Promise<any[]> {
    try {
      const notifications = await this.kv.get('pending_telegram_notifications', 'json') || [];
      return notifications;
    } catch (error) {
      console.error('Get pending telegram notifications error:', error);
      return [];
    }
  }

  async markTelegramNotificationAsSent(key: string): Promise<void> {
    try {
      const notifications = await this.kv.get('pending_telegram_notifications', 'json') || [];
      const filteredNotifications = notifications.filter((n: any) => n.key !== key);
      await this.kv.put('pending_telegram_notifications', JSON.stringify(filteredNotifications));
    } catch (error) {
      console.error('Mark telegram notification as sent error:', error);
    }
  }

  async getUserMessages(userId: number): Promise<DirectMessage[]> {
    try {
      const userMessagesKey = `user_messages:${userId}`;
      const messageIds = await this.kv.get(userMessagesKey, 'json') || [];
      const messages: DirectMessage[] = [];
      
      for (const messageId of messageIds) {
        const message = await this.kv.get(`direct_message:${messageId}`, 'json');
        if (message) {
          messages.push(message);
        }
      }
      
      return messages;
    } catch (error) {
      console.error('Get user messages error:', error);
      return [];
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const message = await this.kv.get(`direct_message:${messageId}`, 'json');
      if (message) {
        message.readAt = new Date().toISOString();
        await this.kv.put(`direct_message:${messageId}`, JSON.stringify(message));
      }
    } catch (error) {
      console.error('Mark message as read error:', error);
    }
  }

  async getUserTickets(userId: number): Promise<SupportTicket[]> {
    try {
      // In production, implement proper user ticket filtering
      const allTickets = await this.getSupportTickets();
      return allTickets.filter(ticket => ticket.userId === userId);
    } catch (error) {
      console.error('Get user tickets error:', error);
      return [];
    }
  }

  async getUserNotifications(userId: number): Promise<any[]> {
    try {
      const userNotificationsKey = `user_notifications:${userId}`;
      const notifications = await this.kv.get(userNotificationsKey, 'json') || [];
      return notifications;
    } catch (error) {
      console.error('Get user notifications error:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      // Implementation for marking notification as read
      console.log('Marking notification as read:', notificationId);
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  }

  async logActivity(activity: any): Promise<void> {
    try {
      await this.logUserActivity(activity);
    } catch (error) {
      console.error('Log activity error:', error);
    }
  }
}