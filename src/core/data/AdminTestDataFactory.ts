/**
 * Admin Test Data Factory
 * 
 * Factory for generating test data specific to adminapp testing
 */

import { LogEntry } from '../pages/adminapp/AdminApiPage';

export class AdminTestDataFactory {
  private static logCounter = 0;

  /**
   * Generate a sample log entry
   */
  static createLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
    this.logCounter++;
    
    return {
      level: 'INFO',
      source: 'webapp',
      component: 'auth',
      message: `Test log entry ${this.logCounter}`,
      metadata: {
        testId: `test-${this.logCounter}`,
        timestamp: new Date().toISOString()
      },
      traceId: `trace-${this.logCounter}-${Date.now()}`,
      userId: 'test-user',
      sessionId: `session-${this.logCounter}`,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Test Agent)',
      ...overrides
    };
  }

  /**
   * Create multiple log entries with different levels
   */
  static createLogEntriesWithLevels(): LogEntry[] {
    const levels: LogEntry['level'][] = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    
    return levels.map(level => this.createLogEntry({
      level,
      message: `${level} level test message`,
      component: `${level.toLowerCase()}-component`
    }));
  }

  /**
   * Create multiple log entries with different sources
   */
  static createLogEntriesWithSources(): LogEntry[] {
    const sources: LogEntry['source'][] = ['webapp', 'mcp', 'docker', 'tests', 'system'];
    
    return sources.map(source => this.createLogEntry({
      source,
      message: `Log from ${source} source`,
      component: `${source}-component`
    }));
  }

  /**
   * Create error logs for testing error scenarios
   */
  static createErrorLogs(count: number = 5): LogEntry[] {
    return Array.from({ length: count }, (_, i) => this.createLogEntry({
      level: 'ERROR',
      source: 'webapp',
      component: 'error-test',
      message: `Error message ${i + 1}: ${this.getRandomErrorMessage()}`,
      metadata: {
        errorCode: `E00${i + 1}`,
        stackTrace: this.getRandomStackTrace(),
        userId: `user-${i + 1}`
      }
    }));
  }

  /**
   * Create warning logs for testing
   */
  static createWarningLogs(count: number = 3): LogEntry[] {
    return Array.from({ length: count }, (_, i) => this.createLogEntry({
      level: 'WARN',
      source: 'mcp',
      component: 'warning-test',
      message: `Warning message ${i + 1}: ${this.getRandomWarningMessage()}`,
      metadata: {
        warningCode: `W00${i + 1}`,
        context: 'test-context'
      }
    }));
  }

  /**
   * Create info logs for general testing
   */
  static createInfoLogs(count: number = 10): LogEntry[] {
    return Array.from({ length: count }, (_, i) => this.createLogEntry({
      level: 'INFO',
      source: ['webapp', 'mcp', 'tests'][i % 3] as LogEntry['source'],
      component: 'info-test',
      message: `Info message ${i + 1}: ${this.getRandomInfoMessage()}`,
      metadata: {
        requestId: `req-${i + 1}`,
        action: this.getRandomAction()
      }
    }));
  }

  /**
   * Create logs with specific search terms for search testing
   */
  static createSearchableLogs(searchTerm: string, count: number = 5): LogEntry[] {
    return Array.from({ length: count }, (_, i) => this.createLogEntry({
      level: ['INFO', 'WARN', 'ERROR'][i % 3] as LogEntry['level'],
      source: 'tests',
      component: 'search-test',
      message: `Message ${i + 1} containing ${searchTerm} for search testing`,
      metadata: {
        searchable: true,
        term: searchTerm
      }
    }));
  }

  /**
   * Create logs for performance testing
   */
  static createPerformanceLogs(count: number = 100): LogEntry[] {
    return Array.from({ length: count }, (_, i) => this.createLogEntry({
      level: ['INFO', 'DEBUG'][i % 2] as LogEntry['level'],
      source: 'webapp',
      component: 'performance-test',
      message: `Performance test log ${i + 1}`,
      metadata: {
        batchId: Math.floor(i / 10),
        sequence: i + 1,
        timestamp: new Date(Date.now() - (count - i) * 1000).toISOString()
      }
    }));
  }

  /**
   * Create logs with different timestamps for time-based testing
   */
  static createTimeBasedLogs(): LogEntry[] {
    const now = Date.now();
    const timeOffsets = [
      0,           // Now
      -60000,      // 1 minute ago
      -300000,     // 5 minutes ago
      -3600000,    // 1 hour ago
      -86400000,   // 1 day ago
      -604800000   // 1 week ago
    ];

    return timeOffsets.map((offset, i) => this.createLogEntry({
      level: 'INFO',
      source: 'tests',
      component: 'time-test',
      message: `Time-based log ${i + 1}`,
      timestamp: new Date(now + offset).toISOString(),
      metadata: {
        timeOffset: offset,
        relativeTo: 'now'
      }
    }));
  }

  /**
   * Create logs for real-time streaming testing
   */
  static createRealtimeLogs(interval: number = 1000): LogEntry[] {
    const logs: LogEntry[] = [];
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      logs.push(this.createLogEntry({
        level: 'INFO',
        source: 'tests',
        component: 'realtime-test',
        message: `Real-time log ${i + 1}`,
        timestamp: new Date(startTime + (i * interval)).toISOString(),
        metadata: {
          realtimeTest: true,
          sequence: i + 1
        }
      }));
    }

    return logs;
  }

  /**
   * Create a comprehensive test dataset
   */
  static createComprehensiveTestDataset(): LogEntry[] {
    return [
      ...this.createLogEntriesWithLevels(),
      ...this.createLogEntriesWithSources(),
      ...this.createErrorLogs(3),
      ...this.createWarningLogs(2),
      ...this.createInfoLogs(5),
      ...this.createSearchableLogs('unique-search-term', 2),
      ...this.createTimeBasedLogs()
    ];
  }

  /**
   * Create logs for filtering tests
   */
  static createFilterTestLogs(): {
    errorLogs: LogEntry[];
    webappLogs: LogEntry[];
    authLogs: LogEntry[];
    recentLogs: LogEntry[];
  } {
    const now = Date.now();
    
    return {
      errorLogs: Array.from({ length: 5 }, (_, i) => this.createLogEntry({
        level: 'ERROR',
        source: 'webapp',
        component: 'filter-test',
        message: `Error for filtering test ${i + 1}`
      })),
      
      webappLogs: Array.from({ length: 5 }, (_, i) => this.createLogEntry({
        level: 'INFO',
        source: 'webapp',
        component: 'filter-test',
        message: `Webapp log for filtering test ${i + 1}`
      })),
      
      authLogs: Array.from({ length: 5 }, (_, i) => this.createLogEntry({
        level: 'INFO',
        source: 'webapp',
        component: 'auth',
        message: `Auth log for filtering test ${i + 1}`
      })),
      
      recentLogs: Array.from({ length: 5 }, (_, i) => this.createLogEntry({
        level: 'INFO',
        source: 'tests',
        component: 'recent-test',
        message: `Recent log ${i + 1}`,
        timestamp: new Date(now - (i * 60000)).toISOString()
      }))
    };
  }

  /**
   * Reset the log counter for testing
   */
  static resetCounter(): void {
    this.logCounter = 0;
  }

  // Private helper methods

  private static getRandomErrorMessage(): string {
    const messages = [
      'Database connection failed',
      'Authentication token expired',
      'File not found',
      'Permission denied',
      'Network timeout occurred',
      'Invalid user input',
      'Service unavailable'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private static getRandomWarningMessage(): string {
    const messages = [
      'High memory usage detected',
      'Slow database query',
      'Deprecated API usage',
      'Cache miss occurred',
      'Rate limit approaching',
      'SSL certificate expires soon'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private static getRandomInfoMessage(): string {
    const messages = [
      'User login successful',
      'Document uploaded successfully',
      'Background job completed',
      'Cache refreshed',
      'Health check passed',
      'Configuration updated',
      'Feature toggle activated'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private static getRandomAction(): string {
    const actions = [
      'user_login',
      'file_upload',
      'data_query',
      'cache_refresh',
      'config_update',
      'health_check',
      'feature_toggle'
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  private static getRandomStackTrace(): string {
    return [
      'at Object.authenticate (/app/auth.js:42:15)',
      'at Layer.handle [as handle_request] (/app/router.js:176:5)',
      'at next (/app/router.js:137:13)',
      'at Function.process_params (/app/router.js:410:3)',
      'at next (/app/router.js:131:10)'
    ].join('\n');
  }
}

export default AdminTestDataFactory;