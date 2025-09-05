import { Env } from '../index';

export class HealthCheckService {
  constructor(private env: Env) {}

  async performHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
    uptime: number;
  }> {
    const startTime = Date.now();
    const checks: Record<string, boolean> = {};

    // Check KV store connectivity
    try {
      await this.env.LEITNER_DB.put('health_check', 'ok', { expirationTtl: 60 });
      const result = await this.env.LEITNER_DB.get('health_check');
      checks.kv_store = result === 'ok';
    } catch (error) {
      checks.kv_store = false;
    }

    // Check environment variables
    checks.telegram_token = !!this.env.TELEGRAM_BOT_TOKEN && this.env.TELEGRAM_BOT_TOKEN !== 'dummy_token_for_local_testing';
    checks.gemini_api = !!this.env.GEMINI_API_KEY && this.env.GEMINI_API_KEY !== 'dummy_gemini_key_for_local_testing';
    checks.webhook_secret = !!this.env.WEBHOOK_SECRET && this.env.WEBHOOK_SECRET !== 'dummy_webhook_secret_for_local_testing';

    // Check Telegram API connectivity (optional)
    if (checks.telegram_token) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/getMe`);
        checks.telegram_api = response.ok;
      } catch (error) {
        checks.telegram_api = false;
      }
    } else {
      checks.telegram_api = false;
    }

    const allChecksPass = Object.values(checks).every(Boolean);
    const uptime = Date.now() - startTime;

    return {
      status: allChecksPass ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
      uptime
    };
  }

  async getSystemStats(): Promise<{
    memoryUsage: number;
    requestCount: number;
    errorCount: number;
    lastError?: string;
  }> {
    // Basic system stats - can be extended
    return {
      memoryUsage: 0, // Memory usage tracking would need to be implemented
      requestCount: 0, // Request counting would need to be implemented
      errorCount: 0, // Error counting would need to be implemented
    };
  }
}