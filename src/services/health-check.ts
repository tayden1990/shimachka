import { Env } from '../index';
import { Logger } from './logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: ComponentHealth;
    telegram: ComponentHealth;
    gemini: ComponentHealth;
    storage: ComponentHealth;
    memory: ComponentHealth;
  };
  metrics: {
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
    activeUsers: number;
  };
  version: string;
  environment: string;
}

export interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
  details?: any;
}

export class HealthCheckService {
  private logger: Logger;
  private startTime: number;

  constructor(private env: Env) {
    this.logger = new Logger(env, 'HEALTH_CHECK');
    this.startTime = Date.now();
  }

  async getFullHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();
    await this.logger.info('health_check_start', 'Starting comprehensive health check');

    const [database, telegram, gemini, storage, memory] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkTelegram(),
      this.checkGemini(),
      this.checkStorage(),
      this.checkMemory()
    ]);

    const metrics = await this.getMetrics();

    const healthStatus: HealthStatus = {
      status: this.calculateOverallStatus([
        this.getResultValue(database),
        this.getResultValue(telegram),
        this.getResultValue(gemini),
        this.getResultValue(storage),
        this.getResultValue(memory)
      ]),
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks: {
        database: this.getResultValue(database),
        telegram: this.getResultValue(telegram),
        gemini: this.getResultValue(gemini),
        storage: this.getResultValue(storage),
        memory: this.getResultValue(memory)
      },
      metrics,
      version: '1.0.0',
      environment: 'production'
    };

    await this.logger.logPerformance('health_check_complete', startTime, {
      overallStatus: healthStatus.status,
      checkCount: 5
    });

    return healthStatus;
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      // Test basic KV operations
      const testKey = `health_check_${Date.now()}`;
      const testValue = { test: true, timestamp: Date.now() };
      
      await this.env.LEITNER_DB.put(testKey, JSON.stringify(testValue));
      const retrieved = await this.env.LEITNER_DB.get(testKey, 'json') as any;
      await this.env.LEITNER_DB.delete(testKey);

      if (!retrieved || retrieved.test !== true) {
        throw new Error('KV read/write verification failed');
      }

      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime > 1000 ? 'degraded' : 'up',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          operation: 'read_write_delete',
          dataIntegrity: 'verified'
        }
      };
    } catch (error) {
      await this.logger.error('database_health_check_failed', 'Database health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkTelegram(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      if (!this.env.TELEGRAM_BOT_TOKEN) {
        throw new Error('Telegram bot token not configured');
      }

      const response = await fetch(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/getMe`);
      const data = await response.json() as any;

      if (!response.ok || !data.ok) {
        throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 2000 ? 'degraded' : 'up',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          botUsername: data.result.username,
          botId: data.result.id,
          canJoinGroups: data.result.can_join_groups,
          canReadAllGroupMessages: data.result.can_read_all_group_messages
        }
      };
    } catch (error) {
      await this.logger.error('telegram_health_check_failed', 'Telegram health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkGemini(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      if (!this.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      // Test with a simple prompt
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Health check: respond with "OK"' }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        }
      );

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
      }

      const responseTime = Date.now() - startTime;
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      return {
        status: responseTime > 5000 ? 'degraded' : 'up',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          model: 'gemini-1.5-flash',
          response: aiResponse,
          tokensUsed: data.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      await this.logger.error('gemini_health_check_failed', 'Gemini health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkStorage(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      // Check multiple storage operations
      const operations = [
        this.env.LEITNER_DB.list({ prefix: 'user:', limit: 1 }),
        this.env.LEITNER_DB.list({ prefix: 'card:', limit: 1 }),
        this.env.LEITNER_DB.list({ prefix: 'schedule:', limit: 1 })
      ];

      const results = await Promise.all(operations);
      const totalKeys = results.reduce((sum, result) => sum + result.keys.length, 0);

      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 1500 ? 'degraded' : 'up',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          operations: operations.length,
          totalKeys: totalKeys,
          storageHealth: 'accessible'
        }
      };
    } catch (error) {
      await this.logger.error('storage_health_check_failed', 'Storage health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkMemory(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      // Simple memory allocation test
      const testArray = new Array(10000).fill(0).map((_, i) => ({ id: i, data: `test_${i}` }));
      const jsonString = JSON.stringify(testArray);
      const parsed = JSON.parse(jsonString);

      if (parsed.length !== testArray.length) {
        throw new Error('Memory allocation/deallocation test failed');
      }

      const responseTime = Date.now() - startTime;

      return {
        status: responseTime > 500 ? 'degraded' : 'up',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          memoryTest: 'passed',
          allocatedObjects: testArray.length,
          memoryOperations: 'functional'
        }
      };
    } catch (error) {
      await this.logger.error('memory_health_check_failed', 'Memory health check failed', error);
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getMetrics(): Promise<HealthStatus['metrics']> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const metricsKey = `metrics:${today}`;
      const metrics = await this.env.LEITNER_DB.get(metricsKey, 'json') as any;

      if (!metrics) {
        return {
          requestsPerMinute: 0,
          errorRate: 0,
          avgResponseTime: 0,
          activeUsers: 0
        };
      }

      const errorRate = metrics.errors.total > 0 ? 
        (metrics.errors.total / metrics.requests.total) * 100 : 0;

      return {
        requestsPerMinute: metrics.requests.total / (24 * 60), // Approximate
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: Math.round(metrics.performance.avgResponseTime * 100) / 100,
        activeUsers: metrics.users.active || 0
      };
    } catch (error) {
      await this.logger.error('metrics_retrieval_failed', 'Failed to retrieve metrics', error);
      return {
        requestsPerMinute: 0,
        errorRate: 0,
        avgResponseTime: 0,
        activeUsers: 0
      };
    }
  }

  private calculateOverallStatus(checks: ComponentHealth[]): HealthStatus['status'] {
    const downCount = checks.filter(check => check.status === 'down').length;
    const degradedCount = checks.filter(check => check.status === 'degraded').length;

    if (downCount > 0) return 'unhealthy';
    if (degradedCount > 1) return 'degraded';
    return 'healthy';
  }

  private getResultValue<T>(result: PromiseSettledResult<T>): T {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: result.reason?.message || 'Promise rejected'
      } as T;
    }
  }
}
