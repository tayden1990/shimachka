import { Env } from '../index';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: number;
  adminId?: string;
  requestId?: string;
}

export class Logger {
  private env: Env;
  private logLevel: LogLevel;

  constructor(env: Env, logLevel: LogLevel = LogLevel.INFO) {
    this.env = env;
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    // Write to console
    console.log(`[${entry.timestamp}] ${LogLevel[entry.level]}: ${entry.message}`, entry.data || '');

    // Write to Analytics Engine if available
    if (this.env.AE) {
      try {
        this.env.AE.writeDataPoint({
          blobs: [LogLevel[entry.level], entry.message, JSON.stringify(entry.data || {})],
          doubles: [Date.now(), entry.userId || 0],
          indexes: [LogLevel[entry.level], entry.adminId || '', entry.requestId || '']
        });
      } catch (error) {
        console.error('Failed to write to Analytics Engine:', error);
      }
    }

    // Store critical logs in KV for later analysis
    if (entry.level >= LogLevel.ERROR) {
      try {
        const logKey = `log:error:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        await this.env.LEITNER_DB.put(logKey, JSON.stringify(entry), { expirationTtl: 86400 * 7 }); // 7 days
      } catch (error) {
        console.error('Failed to store error log:', error);
      }
    }
  }

  debug(message: string, data?: any, context?: { userId?: number; adminId?: string; requestId?: string }): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        message,
        data,
        ...context
      };
      this.writeLog(entry);
    }
  }

  info(message: string, data?: any, context?: { userId?: number; adminId?: string; requestId?: string }): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        message,
        data,
        ...context
      };
      this.writeLog(entry);
    }
  }

  warn(message: string, data?: any, context?: { userId?: number; adminId?: string; requestId?: string }): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        message,
        data,
        ...context
      };
      this.writeLog(entry);
    }
  }

  error(message: string, error?: Error | any, context?: { userId?: number; adminId?: string; requestId?: string }): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        message,
        data: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        ...context
      };
      this.writeLog(entry);
    }
  }

  async getRecentErrors(limit: number = 50): Promise<LogEntry[]> {
    try {
      const list = await this.env.LEITNER_DB.list({ prefix: 'log:error:' });
      const errors: LogEntry[] = [];

      for (const key of list.keys.slice(0, limit)) {
        const data = await this.env.LEITNER_DB.get(key.name);
        if (data) {
          errors.push(JSON.parse(data));
        }
      }

      return errors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to retrieve error logs:', error);
      return [];
    }
  }
}