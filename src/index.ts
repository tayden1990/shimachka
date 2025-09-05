import { LeitnerBot } from './bot/leitner-bot';
import { UserManager } from './services/user-manager';
import { WordExtractor } from './services/word-extractor';
import { ScheduleManager } from './services/schedule-manager';
import { AdminService } from './services/admin-service';
import { AdminAPI } from './api/admin-api';
import { initializeAdmin } from './init-admin';
import { getAdminHTML } from './admin/admin-html';
import { HealthCheckService } from './services/health-check';
import { Logger } from './services/logger';

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
      console.log('🔧 Initializing services...');
      let userManager, wordExtractor, scheduleManager, adminService, adminAPI, bot, healthCheck, logger;
      
      try {
        logger = new Logger(env);
        console.log('✅ Logger initialized');
        
        userManager = new UserManager(env.LEITNER_DB);
        console.log('✅ UserManager initialized');
        
        wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
        console.log('✅ WordExtractor initialized');
        
        scheduleManager = new ScheduleManager(env.LEITNER_DB);
        console.log('✅ ScheduleManager initialized');
        
        adminService = new AdminService(env.LEITNER_DB, env);
        console.log('✅ AdminService initialized');
        
        adminAPI = new AdminAPI(adminService, userManager);
        console.log('✅ AdminAPI initialized');
        
        healthCheck = new HealthCheckService(env);
        console.log('✅ HealthCheckService initialized');
        
        console.log('🤖 Initializing LeitnerBot...');
        bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB as any, env);
        console.log('✅ LeitnerBot initialized successfully');
      } catch (error) {
        console.error('❌ Service initialization error:', error);
        logEvent(env, 'INIT_ERROR', { 
          error: error instanceof Error ? error.message : 'Unknown initialization error',
          stack: error instanceof Error ? error.stack : undefined
        });
        return new Response('Service initialization error', { status: 500 });
      }

      // Initialize admin account on first run
      await initializeAdmin(env.LEITNER_DB);

      let response: Response;

      // Handle health check
      if (url.pathname === '/health') {
        const healthStatus = await healthCheck.performHealthCheck();
        return new Response(JSON.stringify(healthStatus), {
          headers: { 'Content-Type': 'application/json' },
          status: healthStatus.status === 'healthy' ? 200 : 503
        });
      }

      // Handle admin panel routes
      if (url.pathname.startsWith('/admin')) {
        if (url.pathname === '/admin' || url.pathname === '/admin/') {
          // Serve admin panel HTML interface
          response = new Response(getAdminHTML(), {
            headers: { 'Content-Type': 'text/html' }
          });
        } else {
          // Handle admin API routes
          response = await adminAPI.handleAdminRequest(request);
        }
      }
      // Handle Telegram webhook
      else if (url.pathname === '/webhook' && request.method === 'POST') {
        try {
          const body = await request.text();
          const update = JSON.parse(body);

          logEvent(env, 'WEBHOOK_RECEIVED', {
            updateId: update.update_id,
            messageType: update.message ? 'message' : update.callback_query ? 'callback_query' : 'unknown'
          });

          // Verify webhook signature if secret is provided
          if (env.WEBHOOK_SECRET && env.WEBHOOK_SECRET !== 'dummy_webhook_secret_for_local_testing') {
            const signature = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
            if (signature !== env.WEBHOOK_SECRET) {
              logEvent(env, 'WEBHOOK_AUTH_FAILED', { signature });
              return new Response('Unauthorized', { status: 401 });
            }
          }

          // Process the update
          await bot.handleUpdate(update);
          
          logEvent(env, 'WEBHOOK_PROCESSED', {
            updateId: update.update_id,
            success: true
          });

          response = new Response('OK');
        } catch (error) {
          logEvent(env, 'WEBHOOK_ERROR', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          
          response = new Response(`Webhook Error: ${error instanceof Error ? error.message : String(error)}`, { 
            status: 500 
          });
        }
      }
      // Handle root endpoint
      else if (url.pathname === '/') {
        response = new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Leitner Telegram Bot</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
              .healthy { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
              .unhealthy { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
              .links { margin: 20px 0; }
              .links a { display: inline-block; margin: 10px; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>🎯 Leitner Telegram Bot</h1>
            <p>A powerful Telegram bot implementing the Leitner spaced repetition system for language learning.</p>
            
            <div class="status healthy">
              <strong>✅ Status:</strong> Running
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
      const bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB as any, env);
      
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