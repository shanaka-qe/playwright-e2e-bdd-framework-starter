/**
 * Playwright E2E Test Logger
 * 
 * This module provides logging integration for Playwright E2E tests
 */

interface LogData {
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
  source: 'playwright-e2e';
  component: string;
  message: string;
  metadata?: Record<string, any>;
  traceId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

class PlaywrightLogger {
  private logViewerUrl: string;
  private isEnabled: boolean;

  constructor() {
    this.logViewerUrl = process.env.LOG_VIEWER_URL || 'http://localhost:3021';
    this.isEnabled = process.env.ENABLE_PLAYWRIGHT_LOGGING !== 'false';
  }

  /**
   * Send a log to the log viewer server
   */
  private async sendLog(logData: LogData): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const response = await fetch(`${this.logViewerUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        console.warn('Failed to send log to log viewer:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('Log viewer service unavailable:', error);
    }
  }

  /**
   * Log test events
   */
  async testEvent(event: string, testInfo: any, metadata?: Record<string, any>): Promise<void> {
    const logData: LogData = {
      level: 'INFO',
      source: 'playwright-e2e',
      component: 'TestRunner',
      message: `Test ${event}`,
      metadata: {
        testFile: testInfo?.file,
        testTitle: testInfo?.title,
        testStatus: testInfo?.status,
        testDuration: testInfo?.duration,
        browser: testInfo?.browser?.name,
        ...metadata,
      },
    };

    await this.sendLog(logData);
  }

  /**
   * Log test step
   */
  async testStep(step: string, testInfo: any, metadata?: Record<string, any>): Promise<void> {
    const logData: LogData = {
      level: 'INFO',
      source: 'playwright-e2e',
      component: 'TestStep',
      message: step,
      metadata: {
        testFile: testInfo?.file,
        testTitle: testInfo?.title,
        ...metadata,
      },
    };

    await this.sendLog(logData);
  }

  /**
   * Log test error
   */
  async testError(error: Error, testInfo: any, metadata?: Record<string, any>): Promise<void> {
    const logData: LogData = {
      level: 'ERROR',
      source: 'playwright-e2e',
      component: 'TestError',
      message: error.message,
      metadata: {
        testFile: testInfo?.file,
        testTitle: testInfo?.title,
        error: error.message,
        stack: error.stack,
        ...metadata,
      },
    };

    await this.sendLog(logData);
  }

  /**
   * Log page action
   */
  async pageAction(action: string, page: any, metadata?: Record<string, any>): Promise<void> {
    const logData: LogData = {
      level: 'INFO',
      source: 'playwright-e2e',
      component: 'PageAction',
      message: action,
      metadata: {
        url: page?.url(),
        title: page?.title(),
        ...metadata,
      },
    };

    await this.sendLog(logData);
  }

  /**
   * Log network request
   */
  async networkRequest(request: any, metadata?: Record<string, any>): Promise<void> {
    const logData: LogData = {
      level: 'INFO',
      source: 'playwright-e2e',
      component: 'Network',
      message: `${request.method()} ${request.url()}`,
      metadata: {
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        ...metadata,
      },
    };

    await this.sendLog(logData);
  }

  /**
   * Log console message from browser
   */
  async consoleMessage(message: any, metadata?: Record<string, any>): Promise<void> {
    const level = message.type() === 'error' ? 'ERROR' : 
                 message.type() === 'warning' ? 'WARN' : 'INFO';

    const logData: LogData = {
      level,
      source: 'playwright-e2e',
      component: 'BrowserConsole',
      message: message.text(),
      metadata: {
        type: message.type(),
        location: message.location(),
        ...metadata,
      },
    };

    await this.sendLog(logData);
  }
}

export const playwrightLogger = new PlaywrightLogger();
export default playwrightLogger;
