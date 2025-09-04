import { LeitnerBot } from './bot/leitner-bot';
import { UserManager } from './services/user-manager';
import { WordExtractor } from './services/word-extractor';
import { ScheduleManager } from './services/schedule-manager';

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
      const userManager = new UserManager(env.LEITNER_DB);
      const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
      const scheduleManager = new ScheduleManager(env.LEITNER_DB);
      const bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB as any);

      let response: Response;

      // Handle Telegram webhook
      if (url.pathname === '/webhook' && request.method === 'POST') {
        logEvent(env, 'WEBHOOK_RECEIVED', { contentType: request.headers.get('Content-Type') });
        response = await bot.handleWebhook(request);
      }
      // Handle cron triggers for daily reminders
      else if (url.pathname === '/cron') {
        logEvent(env, 'CRON_TRIGGERED', { timestamp: new Date().toISOString() });
        await bot.sendDailyReminders();
        response = new Response('OK', { status: 200 });
      }
      // Health check
      else if (url.pathname === '/health') {
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
      const bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB as any);
      
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
