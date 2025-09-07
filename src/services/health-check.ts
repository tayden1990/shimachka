import { Env } from '../index';

// Global variable to track service start time
let serviceStartTime = Date.now();

export class HealthCheckService {
  constructor(private env: Env) {}

  async performHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
    uptime: number;
  }> {
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
    // Calculate actual service uptime since service started
    const uptime = Date.now() - serviceStartTime;

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
    uptime: number;
  }> {
    try {
      // Get system stats from KV store if available
      const stats = await this.env.LEITNER_DB.get('system_stats', 'json') as {
        memoryUsage?: number;
        requestCount?: number;
        errorCount?: number;
        lastError?: string;
      } || {};
      
      return {
        memoryUsage: stats.memoryUsage || 0,
        requestCount: stats.requestCount || 0,
        errorCount: stats.errorCount || 0,
        lastError: stats.lastError,
        uptime: Date.now() - serviceStartTime
      };
    } catch (error) {
      return {
        memoryUsage: 0,
        requestCount: 0,
        errorCount: 0,
        uptime: Date.now() - serviceStartTime
      };
    }
  }

  // Method to update system stats
  async updateSystemStats(stats: {
    requestCount?: number;
    errorCount?: number;
    lastError?: string;
  }): Promise<void> {
    try {
      const currentStats = await this.env.LEITNER_DB.get('system_stats', 'json') || {};
      const updatedStats = {
        ...currentStats,
        ...stats,
        lastUpdated: Date.now()
      };
      
      await this.env.LEITNER_DB.put('system_stats', JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Failed to update system stats:', error);
    }
  }
}