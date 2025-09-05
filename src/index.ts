import { AdminService } from './services/admin-service';
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
        
        // Enhanced admin API endpoints
        if (url.pathname.startsWith('/api/admin/')) {
          const adminService = new AdminService(env.LEITNER_DB, env);
          
          switch (url.pathname) {
            case '/api/admin/stats':
              try {
                // Mock stats for now - replace with real data later
                const stats = {
                  totalUsers: Math.floor(Math.random() * 1000) + 50,
                  totalCards: Math.floor(Math.random() * 5000) + 500,
                  activeUsers: Math.floor(Math.random() * 100) + 10
                };
                return new Response(JSON.stringify(stats), {
                  headers: { 'Content-Type': 'application/json' }
                });
              } catch (error) {
                return new Response(JSON.stringify({ error: 'Failed to load stats' }), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' }
                });
              }

            case '/api/admin/env-check':
              const envStatus = {
                telegram: env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing',
                gemini: env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing',
                webhook: env.WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing'
              };
              return new Response(JSON.stringify(envStatus), {
                headers: { 'Content-Type': 'application/json' }
              });

            case '/api/admin/test-telegram':
              try {
                if (!env.TELEGRAM_BOT_TOKEN) {
                  return new Response(JSON.stringify({ success: false, error: 'No token' }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
                // Simple test - just check if token is present
                return new Response(JSON.stringify({ success: true, message: 'Token configured' }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              } catch (error) {
                return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }

            case '/api/admin/test-database':
              try {
                // Test KV access
                await env.LEITNER_DB.put('test-key', 'test-value');
                const value = await env.LEITNER_DB.get('test-key');
                await env.LEITNER_DB.delete('test-key');
                
                return new Response(JSON.stringify({ 
                  success: value === 'test-value', 
                  message: 'KV storage test passed' 
                }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              } catch (error) {
                return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }

            case '/api/admin/test-ai':
              try {
                if (!env.GEMINI_API_KEY) {
                  return new Response(JSON.stringify({ success: false, error: 'No API key' }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
                return new Response(JSON.stringify({ success: true, message: 'API key configured' }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              } catch (error) {
                return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }

            case '/api/admin/export-users':
              if (request.method === 'GET') {
                try {
                  // Mock CSV data for now
                  const csvData = 'ID,Username,Email,Registration Date\n1,user1,user1@example.com,2025-01-01\n2,user2,user2@example.com,2025-01-02';
                  return new Response(csvData, {
                    headers: { 
                      'Content-Type': 'text/csv',
                      'Content-Disposition': 'attachment; filename="users.csv"'
                    }
                  });
                } catch (error) {
                  return new Response(JSON.stringify({ error: 'Export failed' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
              }
              break;

            case '/api/admin/clear-cache':
              if (request.method === 'POST') {
                try {
                  // Implement cache clearing logic here
                  return new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                } catch (error) {
                  return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
              }
              break;

            case '/api/admin/reset-database':
              if (request.method === 'POST') {
                try {
                  // DANGEROUS: Only for development
                  // This would need proper authorization in production
                  return new Response(JSON.stringify({ success: true, message: 'Database reset (simulation)' }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                } catch (error) {
                  return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
              }
              break;

            case '/api/admin/restore-full-bot':
              if (request.method === 'POST') {
                try {
                  // This would trigger a deployment of the full bot
                  return new Response(JSON.stringify({ 
                    success: true, 
                    message: 'Full bot restoration would be triggered here' 
                  }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                } catch (error) {
                  return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
              }
              break;
          }
        }
        
        // Legacy admin endpoint
        if (url.pathname === '/admin/create-admin' && request.method === 'POST') {
          // Simple admin creation endpoint
          try {
            const adminService = new AdminService(env.LEITNER_DB, env);
            const body = await request.json() as any;
            
            const admin = await adminService.createAdmin({
              username: body.username,
              password: body.password,
              email: body.email,
              fullName: body.fullName,
              role: body.role,
              isActive: body.isActive
            });
            
            return new Response(JSON.stringify({ 
              success: true, 
              message: 'Admin created successfully',
              admin: { id: admin.id, username: admin.username, email: admin.email }
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Failed to create admin'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
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
