import { AdminUser, SupportTicket, DirectMessage, BulkWordAssignment, UserActivity, AdminStats, User, Card } from '../types/index';

export class AdminService {
  constructor(private kv: any) {}

  // Admin Authentication
  async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    try {
      const adminKey = `admin:${username}`;
      const admin = await this.kv.get(adminKey, 'json');
      
      if (!admin) return null;
      
      // In production, use proper password hashing (bcrypt, etc.)
      // For now, simple check - replace with secure implementation
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
      createdAt: new Date().toISOString()
    };

    const adminKey = `admin:${admin.username}`;
    await this.kv.put(adminKey, JSON.stringify({ ...admin, password: adminData.password }));
    await this.kv.put(`admin_by_id:${admin.id}`, JSON.stringify({ ...admin, password: adminData.password }));
    
    return admin;
  }

  private async updateAdminLastLogin(adminId: string): Promise<void> {
    try {
      const adminData = await this.kv.get(`admin_by_id:${adminId}`, 'json');
      if (adminData) {
        adminData.lastLoginAt = new Date().toISOString();
        await this.kv.put(`admin_by_id:${adminId}`, JSON.stringify(adminData));
        await this.kv.put(`admin:${adminData.username}`, JSON.stringify(adminData));
      }
    } catch (error) {
      console.error('Error updating admin last login:', error);
    }
  }

  // User Management
  async getAllUsers(page: number = 1, limit: number = 50): Promise<{ users: User[], total: number, page: number }> {
    try {
      const usersList = await this.kv.list({ prefix: 'user:' });
      const users: User[] = [];
      
      for (const key of usersList.keys) {
        const user = await this.kv.get(key.name, 'json');
        if (user) users.push(user);
      }

      const total = users.length;
      const startIndex = (page - 1) * limit;
      const paginatedUsers = users.slice(startIndex, startIndex + limit);

      return { users: paginatedUsers, total, page };
    } catch (error) {
      console.error('Error getting all users:', error);
      return { users: [], total: 0, page };
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      return await this.kv.get(`user:${userId}`, 'json');
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
      await this.kv.put(`user:${userId}`, JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      await this.kv.delete(`user:${userId}`);
      // Also delete user's cards, topics, etc.
      const userCards = await this.kv.list({ prefix: `card:${userId}:` });
      for (const key of userCards.keys) {
        await this.kv.delete(key.name);
      }
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Bulk Word Assignment
  async createBulkWordAssignment(assignment: Omit<BulkWordAssignment, 'id' | 'assignedAt' | 'notificationSent'>): Promise<string> {
    const id = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bulkAssignment: BulkWordAssignment = {
      ...assignment,
      id,
      assignedAt: new Date().toISOString(),
      notificationSent: false
    };

    await this.kv.put(`bulk_assignment:${id}`, JSON.stringify(bulkAssignment));
    
    // Create cards for each target user
    for (const userId of assignment.targetUserIds) {
      for (const wordData of assignment.words) {
        const cardId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const card: Card = {
          id: cardId,
          userId,
          word: wordData.word,
          translation: wordData.translation,
          definition: wordData.definition,
          sourceLanguage: wordData.sourceLanguage,
          targetLanguage: wordData.targetLanguage,
          box: 1,
          nextReviewAt: new Date().toISOString(),
          reviewCount: 0,
          correctCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          topic: assignment.title || 'Admin Assignment'
        };
        
        await this.kv.put(`card:${userId}:${cardId}`, JSON.stringify(card));
      }
    }

    return id;
  }

  async getBulkAssignments(page: number = 1, limit: number = 20): Promise<{ assignments: BulkWordAssignment[], total: number }> {
    try {
      const assignmentsList = await this.kv.list({ prefix: 'bulk_assignment:' });
      const assignments: BulkWordAssignment[] = [];
      
      for (const key of assignmentsList.keys) {
        const assignment = await this.kv.get(key.name, 'json');
        if (assignment) assignments.push(assignment);
      }

      const total = assignments.length;
      const startIndex = (page - 1) * limit;
      const paginatedAssignments = assignments.slice(startIndex, startIndex + limit);

      return { assignments: paginatedAssignments, total };
    } catch (error) {
      console.error('Error getting bulk assignments:', error);
      return { assignments: [], total: 0 };
    }
  }

  // Support Tickets
  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const supportTicket: SupportTicket = {
      ...ticket,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.kv.put(`ticket:${id}`, JSON.stringify(supportTicket));
    return id;
  }

  async getSupportTickets(status?: string, page: number = 1, limit: number = 20): Promise<{ tickets: SupportTicket[], total: number }> {
    try {
      const ticketsList = await this.kv.list({ prefix: 'ticket:' });
      let tickets: SupportTicket[] = [];
      
      for (const key of ticketsList.keys) {
        const ticket = await this.kv.get(key.name, 'json');
        if (ticket) {
          if (!status || ticket.status === status) {
            tickets.push(ticket);
          }
        }
      }

      tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = tickets.length;
      const startIndex = (page - 1) * limit;
      const paginatedTickets = tickets.slice(startIndex, startIndex + limit);

      return { tickets: paginatedTickets, total };
    } catch (error) {
      console.error('Error getting support tickets:', error);
      return { tickets: [], total: 0 };
    }
  }

  async updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<boolean> {
    try {
      const ticket = await this.kv.get(`ticket:${ticketId}`, 'json');
      if (!ticket) return false;

      const updatedTicket = { 
        ...ticket, 
        ...updates, 
        updatedAt: new Date().toISOString(),
        resolvedAt: updates.status === 'resolved' || updates.status === 'closed' ? new Date().toISOString() : ticket.resolvedAt
      };
      
      await this.kv.put(`ticket:${ticketId}`, JSON.stringify(updatedTicket));
      return true;
    } catch (error) {
      console.error('Error updating support ticket:', error);
      return false;
    }
  }

  // Direct Messages
  async sendDirectMessage(message: Omit<DirectMessage, 'id' | 'sentAt' | 'isRead'>): Promise<string> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const directMessage: DirectMessage = {
      ...message,
      id,
      sentAt: new Date().toISOString(),
      isRead: false
    };

    await this.kv.put(`message:${id}`, JSON.stringify(directMessage));
    
    // Also store in user's message list for easy retrieval
    if (message.toUserId) {
      const userMessagesKey = `user_messages:${message.toUserId}`;
      const userMessages = await this.kv.get(userMessagesKey, 'json') || [];
      userMessages.push(id);
      await this.kv.put(userMessagesKey, JSON.stringify(userMessages));
    }

    return id;
  }

  async getUserMessages(userId: number, unreadOnly: boolean = false): Promise<DirectMessage[]> {
    try {
      const userMessagesKey = `user_messages:${userId}`;
      const messageIds = await this.kv.get(userMessagesKey, 'json') || [];
      const messages: DirectMessage[] = [];

      for (const messageId of messageIds) {
        const message = await this.kv.get(`message:${messageId}`, 'json');
        if (message && (!unreadOnly || !message.isRead)) {
          messages.push(message);
        }
      }

      return messages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    } catch (error) {
      console.error('Error getting user messages:', error);
      return [];
    }
  }

  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const message = await this.kv.get(`message:${messageId}`, 'json');
      if (!message) return false;

      message.isRead = true;
      message.readAt = new Date().toISOString();
      await this.kv.put(`message:${messageId}`, JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  // Activity Logging
  async logActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> {
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userActivity: UserActivity = {
      ...activity,
      id,
      timestamp: new Date().toISOString()
    };

    await this.kv.put(`activity:${activity.userId}:${id}`, JSON.stringify(userActivity));
  }

  async getUserActivity(userId: number, limit: number = 50): Promise<UserActivity[]> {
    try {
      const activitiesList = await this.kv.list({ prefix: `activity:${userId}:` });
      const activities: UserActivity[] = [];
      
      for (const key of activitiesList.keys) {
        const activity = await this.kv.get(key.name, 'json');
        if (activity) activities.push(activity);
      }

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  // Admin Statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      const usersList = await this.kv.list({ prefix: 'user:' });
      const cardsList = await this.kv.list({ prefix: 'card:' });
      const ticketsList = await this.kv.list({ prefix: 'ticket:' });
      
      let totalUsers = 0;
      let activeUsers = 0;
      let recentRegistrations = 0;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const key of usersList.keys) {
        const user = await this.kv.get(key.name, 'json');
        if (user) {
          totalUsers++;
          if (new Date(user.lastActiveAt || user.createdAt) > dayAgo) {
            activeUsers++;
          }
          if (new Date(user.createdAt) > weekAgo) {
            recentRegistrations++;
          }
        }
      }

      let openTickets = 0;
      let resolvedTickets = 0;
      
      for (const key of ticketsList.keys) {
        const ticket = await this.kv.get(key.name, 'json');
        if (ticket) {
          if (ticket.status === 'open' || ticket.status === 'in_progress') {
            openTickets++;
          } else if (ticket.status === 'resolved' || ticket.status === 'closed') {
            resolvedTickets++;
          }
        }
      }

      return {
        totalUsers,
        activeUsers,
        totalCards: cardsList.keys.length,
        totalReviews: 0, // Would need to calculate from review sessions
        openTickets,
        resolvedTickets,
        recentRegistrations,
        avgSessionTime: 0 // Would need to calculate from session data
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCards: 0,
        totalReviews: 0,
        openTickets: 0,
        resolvedTickets: 0,
        recentRegistrations: 0,
        avgSessionTime: 0
      };
    }
  }
}
