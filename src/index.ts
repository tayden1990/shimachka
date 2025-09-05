import { LeitnerBot } from './bot/leitner-bot';
import { UserManager } from './services/user-manager';
import { WordExtractor } from './services/word-extractor';
import { ScheduleManager } from './services/schedule-manager';
import { AdminService } from './services/admin-service';
import { AdminAPI } from './api/admin-api';
import { Logger } from './services/logger';
import { initializeAdmin } from './init-admin';

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
    const logger = new Logger(env, 'MAIN_HANDLER');
    
    try {
      await logger.info('request_start', `${request.method} ${url.pathname}`, {
        method: request.method,
        url: url.pathname,
        userAgent: request.headers.get('User-Agent'),
        cf: request.cf,
        ip: request.headers.get('CF-Connecting-IP')
      });

      // Validate environment variables
      if (!env.TELEGRAM_BOT_TOKEN) {
        await logger.error('config_error', 'TELEGRAM_BOT_TOKEN not set');
        return new Response('Configuration Error: Bot token not set', { status: 500 });
      }
      
      if (!env.GEMINI_API_KEY) {
        logEvent(env, 'ERROR', { error: 'GEMINI_API_KEY not set' });
        return new Response('Configuration Error: Gemini API key not set', { status: 500 });
      }

      // Initialize services with error handling
      const userManager = new UserManager(env.LEITNER_DB);
      const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
      const scheduleManager = new ScheduleManager(env.LEITNER_DB);
      const adminService = new AdminService(env.LEITNER_DB, env);
      const adminAPI = new AdminAPI(adminService, userManager, env);
      const bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB as any, env);

      // Initialize admin account on first run
      await initializeAdmin(env.LEITNER_DB);

      let response: Response;

      // Handle admin panel routes
      if (url.pathname.startsWith('/admin')) {
        // Delegate all admin routes to AdminAPI
        response = await adminAPI.handleAdminRequest(request, ctx);
      }
      // Handle Telegram webhook
      else if (url.pathname === '/webhook' && request.method === 'POST') {
        await logger.info('webhook_received', 'Telegram webhook received', { 
          contentType: request.headers.get('Content-Type'),
          contentLength: request.headers.get('Content-Length')
        });
        response = await bot.handleWebhook(request);
      }
      // Handle cron triggers for daily reminders
      else if (url.pathname === '/cron') {
        await logger.info('cron_triggered', 'Daily reminder cron triggered');
        await bot.sendDailyReminders();
        response = new Response('OK', { status: 200 });
      }
      // Health check
      else if (url.pathname === '/health') {
        await logger.debug('health_check_simple', 'Simple health check requested');
        response = new Response(JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: {
            botTokenSet: !!env.TELEGRAM_BOT_TOKEN,
            geminiKeySet: !!env.GEMINI_API_KEY,
            kvSet: !!env.LEITNER_DB
          }
        }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Debug endpoint for logs
      else if (url.pathname === '/debug' && request.method === 'GET') {
        const requestHeaders: Record<string, string> = {};
        request.headers.forEach((value, key) => {
          requestHeaders[key] = value;
        });
        
        response = new Response(JSON.stringify({
          timestamp: new Date().toISOString(),
          environment: {
            botTokenSet: !!env.TELEGRAM_BOT_TOKEN,
            geminiKeySet: !!env.GEMINI_API_KEY,
            kvSet: !!env.LEITNER_DB,
            aeSet: !!env.AE
          },
          headers: requestHeaders,
          cf: request.cf
        }, null, 2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      else {
        await logger.warn('not_found', `Path not found: ${url.pathname}`);
        response = new Response('Not Found', { status: 404 });
      }

      const duration = Date.now() - startTime;
      await logger.logPerformance('request_complete', startTime, {
        status: response.status,
        path: url.pathname,
        method: request.method
      });

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      await logger.critical('request_error', 'Unhandled request error', error, undefined);

      return new Response(`Internal Server Error: ${error instanceof Error ? error.message : String(error)}`, { 
        status: 500 
      });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const logger = new Logger(env, 'SCHEDULED_HANDLER');
    
    try {
      await logger.info('scheduled_start', 'Scheduled event triggered', {
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
