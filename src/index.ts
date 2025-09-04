import { LeitnerBot } from './bot/leitner-bot';
import { UserManager } from './services/user-manager';
import { WordExtractor } from './services/word-extractor';
import { ScheduleManager } from './services/schedule-manager';

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  GEMINI_API_KEY: string;
  WEBHOOK_SECRET: string;
  LEITNER_DB: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Initialize services
  const userManager = new UserManager(env.LEITNER_DB);
  const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
  const scheduleManager = new ScheduleManager(env.LEITNER_DB);
  const bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB);

    // Handle Telegram webhook
    if (url.pathname === '/webhook' && request.method === 'POST') {
      return bot.handleWebhook(request);
    }

    // Handle cron triggers for daily reminders
    if (url.pathname === '/cron') {
      await bot.sendDailyReminders();
      return new Response('OK', { status: 200 });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  const userManager = new UserManager(env.LEITNER_DB);
  const wordExtractor = new WordExtractor(env.GEMINI_API_KEY);
  const scheduleManager = new ScheduleManager(env.LEITNER_DB);
  const bot = new LeitnerBot(env.TELEGRAM_BOT_TOKEN, userManager, wordExtractor, scheduleManager, env.LEITNER_DB);
    
    await bot.sendDailyReminders();
  }
};
