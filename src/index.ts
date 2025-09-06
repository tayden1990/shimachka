/// <reference types="@cloudflare/workers-types" />

import { AdminService } from './services/admin-service';
import { AdminAPI } from './api/admin-api';
import { UserManager } from './services/user-manager';
import { WordExtractor } from './services/word-extractor';
import { ScheduleManager } from './services/schedule-manager';
import { getPremiumAdminHTML } from './admin/premium-admin';
import { LeitnerBot } from './bot/leitner-bot';
import { TelegramUpdate } from './types';

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  GEMINI_API_KEY: string;
  WEBHOOK_SECRET: string;
  LEITNER_DB: KVNamespace;
  AE?: AnalyticsEngineDataset;
  ADMIN_PASSWORD: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    try {
      // Telegram webhook handler
      if (url.pathname === '/webhook' && request.method === 'POST') {
        console.log('Received Telegram webhook request');
        
        try {
          // Initialize services for the bot
          const userManager = new UserManager(env.LEITNER_DB);
          const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
          const scheduleManager = new ScheduleManager(env.LEITNER_DB);
          
          // Create LeitnerBot instance with correct parameters
          const bot = new LeitnerBot(
            env.TELEGRAM_BOT_TOKEN,
            userManager,
            wordExtractor,
            scheduleManager,
            env.LEITNER_DB,
            env
          );
          
          // Let the bot handle the entire update
          return await bot.handleWebhook(request);
          
        } catch (error) {
          console.error('Webhook error:', error);
          return new Response('Error', { status: 500 });
        }
      }
      // Admin panel and API routes
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
        if (url.pathname === '/admin' || url.pathname === '/admin/') {
          // Serve new comprehensive admin panel HTML interface
          return new Response(getPremiumAdminHTML(), {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // Real admin API endpoints using AdminAPI class
        if (url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/admin/')) {
          const adminService = new AdminService(env.LEITNER_DB, env);
          const userManager = new UserManager(env.LEITNER_DB);
          const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
          const adminAPI = new AdminAPI(adminService, userManager, wordExtractor, env);
          
          return await adminAPI.handleAdminRequest(request);
        }
      }
      
      // Simple health check
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          worker: 'leitner-telegram-bot'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Handle root endpoint
      if (url.pathname === '/') {
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Leitner Telegram Bot</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .status { padding: 10px; border-radius: 5px; margin: 10px 0; background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
              .links { margin: 20px 0; }
              .links a { display: inline-block; margin: 10px; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>🎯 Leitner Telegram Bot</h1>
            <p>A powerful Telegram bot implementing the Leitner spaced repetition system for language learning.</p>
            
            <div class="status">
              <strong>✅ Status:</strong> Running (Enhanced v5.0)
            </div>
            
            <div class="links">
              <a href="/health">Health Check</a>
              <a href="/admin">Admin Panel</a>
            </div>
            
            <h3>Features:</h3>
            <ul>
              <li>🎯 Smart vocabulary learning with spaced repetition</li>
              <li>🤖 AI-powered word extraction using Google Gemini</li>
              <li>🌐 Multi-language support (19+ languages)</li>
              <li>📊 Progress tracking and statistics</li>
              <li>🔔 Smart reminders and scheduling</li>
              <li>👥 Advanced admin panel with complete management tools</li>
              <li>🎫 Support ticket system</li>
              <li>📧 Comprehensive messaging system</li>
              <li>📈 Real-time analytics and monitoring</li>
              <li>🔧 System health monitoring and debugging</li>
            </ul>
            
            <p><small>Powered by Cloudflare Workers</small></p>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Handle 404
      return new Response('Not Found', { status: 404 });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Internal Server Error: ${error instanceof Error ? error.message : String(error)}`, { 
        status: 500 
      });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Enhanced scheduled handler for reminders and maintenance
    console.log('Scheduled event triggered');
    
    try {
      const userManager = new UserManager(env.LEITNER_DB);
      const scheduleManager = new ScheduleManager(env.LEITNER_DB);
      const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
      
      // Create LeitnerBot instance for scheduled tasks
      const bot = new LeitnerBot(
        env.TELEGRAM_BOT_TOKEN,
        userManager,
        wordExtractor,
        scheduleManager,
        env.LEITNER_DB,
        env
      );
      
      // Send due reminders
      await bot.sendDailyReminders();
      
      // Perform maintenance tasks
      await this.performMaintenanceTasks(env);
      
      console.log('Scheduled tasks completed successfully');
    } catch (error) {
      console.error('Scheduled event error:', error);
    }
  },

  async performMaintenanceTasks(env: Env): Promise<void> {
    try {
      const adminService = new AdminService(env.LEITNER_DB, env);
      
      // Update system statistics
      await this.updateSystemStats(env);
      
      // Clean up old data
      await this.cleanupOldData(env);
      
      // Run system health checks
      await adminService.getSystemHealth();
      
      console.log('Maintenance tasks completed');
    } catch (error) {
      console.error('Maintenance tasks error:', error);
    }
  },

  async updateSystemStats(env: Env): Promise<void> {
    // Update user, card, and activity statistics
    // This would be implemented based on actual data
  },

  async cleanupOldData(env: Env): Promise<void> {
    // Clean up old logs, temporary data, etc.
    // This would be implemented based on retention policies
  }
};
