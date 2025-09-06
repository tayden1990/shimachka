/// <reference types="@cloudflare/workers-types" />

import { AdminService } from './services/admin-service';
import { AdminAPI } from './api/admin-api';
import { UserManager } from './services/user-manager';
import { WordExtractor } from './services/word-extractor';
import { ScheduleManager } from './services/schedule-manager';
import { getAdminPanelHTML } from './admin/admin-panel';
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
          const update: TelegramUpdate = await request.json();
          console.log('Webhook update received:', JSON.stringify(update, null, 2));
          
          // Handle messages directly for immediate bot functionality
          if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text;
            const userId = message.from?.id;
            
            console.log(`Processing message: ${text} from user ${userId} in chat ${chatId}`);
            
            // Handle /start command
            if (text === '/start') {
              console.log('Processing /start command');
              
              const welcomeMessage = `🎯 *Welcome to Leitner Bot!*

This bot helps you learn languages using the proven Leitner spaced repetition system.

*Available Commands:*
/start - Show this welcome message
/register - Register and set up your learning profile
/study - Start studying your flashcards
/add - Add new words to learn
/stats - View your learning statistics
/settings - Configure your preferences
/help - Get help and support

Choose an option below to get started:`;

              const keyboard = {
                inline_keyboard: [
                  [{ text: '🆕 Register', callback_data: 'register' }],
                  [{ text: '📚 Study Words', callback_data: 'study' }],
                  [{ text: '➕ Add Words', callback_data: 'add_words' }],
                  [{ text: '📊 Statistics', callback_data: 'stats' }],
                  [{ text: '⚙️ Settings', callback_data: 'settings' }],
                  [{ text: '❓ Help', callback_data: 'help' }]
                ]
              };
              
              // Send welcome message with error handling
              try {
                const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: welcomeMessage,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                  })
                });
                
                if (telegramResponse.ok) {
                  console.log('✅ Welcome message sent successfully');
                } else {
                  const errorText = await telegramResponse.text();
                  console.error('❌ Failed to send message:', errorText);
                }
              } catch (telegramError) {
                console.error('❌ Telegram API error:', telegramError);
              }
            }
            // Handle other commands
            else if (text === '/help') {
              const helpMessage = `🆘 *Leitner Bot Help*

*How it works:*
The Leitner system uses spaced repetition to help you learn efficiently. Words you know well are reviewed less frequently, while difficult words are practiced more often.

*Commands:*
/start - Welcome and main menu
/register - Set up your learning profile
/study - Practice your flashcards
/add - Add new words to learn
/stats - View your progress
/settings - Configure preferences

*Need more help?*
Contact support: @your_support_channel`;

              try {
                await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: helpMessage,
                    parse_mode: 'Markdown'
                  })
                });
                console.log('✅ Help message sent');
              } catch (telegramError) {
                console.error('❌ Telegram API error sending help:', telegramError);
              }
            }
            // Handle other basic commands
            else {
              const unknownMessage = `❓ Unknown command: ${text}

Use /start to see available commands or /help for more information.`;

              try {
                await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: unknownMessage
                  })
                });
                console.log('✅ Unknown command response sent');
              } catch (telegramError) {
                console.error('❌ Telegram API error sending unknown command response:', telegramError);
              }
            }
          }
          
          // Handle callback queries (button presses)
          if (update.callback_query) {
            const callbackQuery = update.callback_query;
            const chatId = callbackQuery.message?.chat.id;
            const data = callbackQuery.data;
            
            console.log(`Processing callback: ${data} in chat ${chatId}`);
            
            // Answer the callback query to remove loading state
            try {
              await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callback_query_id: callbackQuery.id,
                  text: `Processing ${data}...`
                })
              });
              console.log('✅ Callback query answered');
            } catch (telegramError) {
              console.error('❌ Error answering callback query:', telegramError);
            }
            
            // Handle different callback data
            let responseMessage = '';
            switch (data) {
              case 'register':
                responseMessage = '🆕 *Registration*\n\nTo register, please use the /register command or contact admin for setup.';
                break;
              case 'study':
                responseMessage = '📚 *Study Mode*\n\nUse /study to start learning your flashcards.';
                break;
              case 'add_words':
                responseMessage = '➕ *Add Words*\n\nUse /add to add new words to your learning collection.';
                break;
              case 'stats':
                responseMessage = '📊 *Statistics*\n\nUse /stats to view your learning progress.';
                break;
              case 'settings':
                responseMessage = '⚙️ *Settings*\n\nUse /settings to configure your preferences.';
                break;
              case 'help':
                responseMessage = '❓ *Help*\n\nUse /help for detailed information about using this bot.';
                break;
              default:
                responseMessage = `Processing: ${data}`;
            }
            
            if (chatId) {
              try {
                await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: responseMessage,
                    parse_mode: 'Markdown'
                  })
                });
                console.log('✅ Callback response sent');
              } catch (telegramError) {
                console.error('❌ Error sending callback response:', telegramError);
              }
            }
          }
          
          return new Response('OK', { status: 200 });
          
        } catch (error) {
          console.error('Webhook error:', error);
          return new Response(`Webhook Error: ${error instanceof Error ? error.message : String(error)}`, { 
            status: 500 
          });
        }
      }
      // Admin panel and API routes
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin')) {
        if (url.pathname === '/admin' || url.pathname === '/admin/') {
          // Serve new comprehensive admin panel HTML interface
          return new Response(getAdminPanelHTML(), {
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
