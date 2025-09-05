import { Env } from '../index';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  component: string;
  action: string;
  message: string;
  data?: any;
  userId?: number;
  duration?: number;
  stack?: string;
  requestId?: string;
}

export interface SystemMetrics {
  timestamp: string;
  requests: {
    total: number;
    webhook: number;
    admin: number;
    health: number;
  };
  errors: {
    total: number;
    byComponent: Record<string, number>;
    byLevel: Record<string, number>;
  };
  performance: {
    avgResponseTime: number;
    slowestEndpoint: string;
    fastestEndpoint: string;
  };
  users: {
    active: number;
    total: number;
    newToday: number;
  };
  storage: {
    kvOperations: number;
    kvErrors: number;
  };
}

export class Logger {
  private requestId: string;
  private startTime: number;
  
  constructor(
    private env: Env,
    private component: string = 'UNKNOWN',
    requestId?: string
  ) {
    this.requestId = requestId || this.generateRequestId();
    this.startTime = Date.now();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async debug(action: string, message: string, data?: any, userId?: number): Promise<void> {
    await this.log('DEBUG', action, message, data, userId);
  }

  async info(action: string, message: string, data?: any, userId?: number): Promise<void> {
    await this.log('INFO', action, message, data, userId);
  }

  async warn(action: string, message: string, data?: any, userId?: number): Promise<void> {
    await this.log('WARN', action, message, data, userId);
  }

  async error(action: string, message: string, error?: any, userId?: number): Promise<void> {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    await this.log('ERROR', action, message, errorData, userId, undefined, error?.stack);
  }

  async critical(action: string, message: string, error?: any, userId?: number): Promise<void> {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    await this.log('CRITICAL', action, message, errorData, userId, undefined, error?.stack);
  }

  async logPerformance(action: string, startTime: number, additionalData?: any): Promise<void> {
    const duration = Date.now() - startTime;
    await this.log('INFO', action, `Performance: ${duration}ms`, additionalData, undefined, duration);
  }

  private async log(
    level: LogEntry['level'],
    action: string,
    message: string,
    data?: any,
    userId?: number,
    duration?: number,
    stack?: string
  ): Promise<void> {
    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      action,
      message,
      data,
      userId,
      duration,
      stack,
      requestId: this.requestId
    };

    // Console logging for immediate debugging
    const logColor = this.getLogColor(level);
    const prefix = `[${logEntry.timestamp}] [${level}] [${this.component}:${action}]`;
    
    if (level === 'ERROR' || level === 'CRITICAL') {
      console.error(`${prefix} ${message}`, data || '');
      if (stack) console.error('Stack:', stack);
    } else if (level === 'WARN') {
      console.warn(`${prefix} ${message}`, data || '');
    } else {
      console.log(`${prefix} ${message}`, data || '');
    }

    // Store in KV for persistence
    try {
      await this.env.LEITNER_DB.put(
        `log:${logEntry.id}`,
        JSON.stringify(logEntry),
        { expirationTtl: 7 * 24 * 60 * 60 } // 7 days
      );

      // Store in Analytics Engine if available
      if (this.env.AE) {
        this.env.AE.writeDataPoint({
          blobs: [level, this.component, action, message, JSON.stringify(data || {})],
          doubles: [Date.now(), duration || 0, userId || 0],
          indexes: [level, this.component, action, this.requestId]
        });
      }

      // Update metrics
      await this.updateMetrics(level, action, duration);
    } catch (error) {
      console.error('Failed to store log entry:', error);
    }
  }

  private getLogColor(level: LogEntry['level']): string {
    switch (level) {
      case 'DEBUG': return '\x1b[36m'; // Cyan
      case 'INFO': return '\x1b[32m';  // Green
      case 'WARN': return '\x1b[33m';  // Yellow
      case 'ERROR': return '\x1b[31m'; // Red
      case 'CRITICAL': return '\x1b[35m'; // Magenta
      default: return '\x1b[0m';       // Reset
    }
  }

  private async updateMetrics(level: string, action: string, duration?: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const metricsKey = `metrics:${today}`;
      
      const existingMetrics = await this.env.LEITNER_DB.get(metricsKey, 'json') as SystemMetrics || {
        timestamp: new Date().toISOString(),
        requests: { total: 0, webhook: 0, admin: 0, health: 0 },
        errors: { total: 0, byComponent: {}, byLevel: {} },
        performance: { avgResponseTime: 0, slowestEndpoint: '', fastestEndpoint: '' },
        users: { active: 0, total: 0, newToday: 0 },
        storage: { kvOperations: 0, kvErrors: 0 }
      };

      // Update request counts
      existingMetrics.requests.total++;
      if (action.includes('webhook')) existingMetrics.requests.webhook++;
      if (action.includes('admin')) existingMetrics.requests.admin++;
      if (action.includes('health')) existingMetrics.requests.health++;

      // Update error counts
      if (level === 'ERROR' || level === 'CRITICAL') {
        existingMetrics.errors.total++;
        existingMetrics.errors.byComponent[this.component] = (existingMetrics.errors.byComponent[this.component] || 0) + 1;
        existingMetrics.errors.byLevel[level] = (existingMetrics.errors.byLevel[level] || 0) + 1;
      }

      // Update performance metrics
      if (duration) {
        const currentAvg = existingMetrics.performance.avgResponseTime;
        const currentTotal = existingMetrics.requests.total;
        existingMetrics.performance.avgResponseTime = (currentAvg * (currentTotal - 1) + duration) / currentTotal;
      }

      existingMetrics.timestamp = new Date().toISOString();

      await this.env.LEITNER_DB.put(metricsKey, JSON.stringify(existingMetrics));
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }

  getRequestId(): string {
    return this.requestId;
  }

  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }
}

export class LoggerFactory {
  static create(env: Env, component: string, requestId?: string): Logger {
    return new Logger(env, component, requestId);
  }
}
