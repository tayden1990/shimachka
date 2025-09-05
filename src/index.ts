import { AdminService } from './services/admin-service';
import { AdminAPI } from './api/admin-api';
import { UserManager } from './services/user-manager';
import { getSimpleAdminHTML } from './admin/simple-admin';

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
      // Admin panel and API routes
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
        if (url.pathname === '/admin' || url.pathname === '/admin/') {
          // Serve simple admin panel HTML interface
          return new Response(getSimpleAdminHTML(), {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // Real admin API endpoints using AdminAPI class
        if (url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/admin/')) {
          const adminService = new AdminService(env.LEITNER_DB, env);
          const userManager = new UserManager(env.LEITNER_DB, env);
          const adminAPI = new AdminAPI(adminService, userManager);
          
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
              <strong>✅ Status:</strong> Running (Simplified Mode)
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
              <li>👥 Admin panel for user management</li>
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
    // Simplified scheduled handler - disabled for now
    console.log('Scheduled event triggered but disabled in simplified mode');
  }
};
