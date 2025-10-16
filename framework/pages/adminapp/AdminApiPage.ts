/**
 * Admin API Page Object Model
 * 
 * Page object for testing adminapp API endpoints
 */

import { Page, APIResponse } from '@playwright/test';
import { AdminBasePage } from './AdminBasePage';

export interface LogEntry {
  id?: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
  source: 'webapp' | 'mcp' | 'docker' | 'tests' | 'system';
  component: string;
  message: string;
  metadata?: Record<string, any>;
  traceId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
}

export interface LogFilters {
  level?: string;
  source?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LogStatistics {
  total: number;
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  recentActivity: Array<{
    timestamp: string;
    count: number;
  }>;
}

export class AdminApiPage extends AdminBasePage {
  private readonly apiKey: string;

  constructor(page: Page, apiKey: string = 'default-api-key') {
    super(page);
    this.apiKey = apiKey;
  }

  /**
   * Navigate is not applicable for API page
   */
  async navigate(): Promise<void> {
    // API page doesn't have a UI to navigate to
    return;
  }

  /**
   * Test health endpoint
   */
  async getHealthStatus(): Promise<{
    status: string;
    timestamp: string;
    version?: string;
    database?: { connected: boolean };
    uptime?: number;
  }> {
    const response = await this.page.request.get(`${this.adminBaseUrl}/api/health`);
    
    if (!response.ok()) {
      throw new Error(`Health check failed: ${response.status()} ${response.statusText()}`);
    }
    
    return await response.json();
  }

  /**
   * Get logs with filters
   */
  async getLogs(filters: LogFilters = {}): Promise<{
    logs: LogEntry[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    
    if (filters.level) params.append('level', filters.level);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/logs?${params.toString()}`,
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );

    if (!response.ok()) {
      throw new Error(`Get logs failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Create a new log entry
   */
  async createLog(logEntry: LogEntry): Promise<LogEntry> {
    const response = await this.page.request.post(
      `${this.adminBaseUrl}/api/logs`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        data: logEntry
      }
    );

    if (!response.ok()) {
      throw new Error(`Create log failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Get log statistics
   */
  async getLogStatistics(): Promise<LogStatistics> {
    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/logs/stats`,
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );

    if (!response.ok()) {
      throw new Error(`Get stats failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Export logs
   */
  async exportLogs(format: 'json' | 'csv' = 'json', filters: LogFilters = {}): Promise<{
    data: string;
    contentType: string;
    filename: string;
  }> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters.level) params.append('level', filters.level);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);

    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/logs/export?${params.toString()}`,
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );

    if (!response.ok()) {
      throw new Error(`Export logs failed: ${response.status()} ${response.statusText()}`);
    }

    const data = await response.text();
    const contentType = response.headers()['content-type'] || '';
    const contentDisposition = response.headers()['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `logs.${format}`;

    return {
      data,
      contentType,
      filename
    };
  }

  /**
   * Test system endpoints
   */
  async getSystemMetrics(): Promise<{
    memory: { used: number; total: number };
    disk: { used: number; total: number };
    cpu: { usage: number };
    uptime: number;
  }> {
    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/system/metrics`,
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );

    if (!response.ok()) {
      throw new Error(`Get system metrics failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Test user management endpoints
   */
  async getUsers(): Promise<Array<{
    id: string;
    username: string;
    email: string;
    role: string;
    lastLogin?: string;
    active: boolean;
  }>> {
    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/users`,
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );

    if (!response.ok()) {
      throw new Error(`Get users failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Test configuration endpoints
   */
  async getConfiguration(): Promise<Record<string, any>> {
    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/config`,
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );

    if (!response.ok()) {
      throw new Error(`Get configuration failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Update configuration
   */
  async updateConfiguration(config: Record<string, any>): Promise<Record<string, any>> {
    const response = await this.page.request.put(
      `${this.adminBaseUrl}/api/config`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        data: config
      }
    );

    if (!response.ok()) {
      throw new Error(`Update configuration failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Test backup endpoints
   */
  async createBackup(): Promise<{
    id: string;
    filename: string;
    size: number;
    timestamp: string;
  }> {
    const response = await this.page.request.post(
      `${this.adminBaseUrl}/api/backup`,
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );

    if (!response.ok()) {
      throw new Error(`Create backup failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Get backup list
   */
  async getBackups(): Promise<Array<{
    id: string;
    filename: string;
    size: number;
    timestamp: string;
  }>> {
    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/backup`,
      {
        headers: {
          'X-API-Key': this.apiKey
        }
      }
    );

    if (!response.ok()) {
      throw new Error(`Get backups failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  }

  /**
   * Test authentication with different API keys
   */
  async testAuthentication(testApiKey: string): Promise<boolean> {
    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/logs`,
      {
        headers: {
          'X-API-Key': testApiKey
        }
      }
    );

    return response.ok();
  }

  /**
   * Test rate limiting
   */
  async testRateLimit(endpoint: string = '/api/logs', requests: number = 10): Promise<{
    successful: number;
    rateLimited: number;
    responses: APIResponse[];
  }> {
    const promises = Array.from({ length: requests }, () =>
      this.page.request.get(`${this.adminBaseUrl}${endpoint}`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      })
    );

    const responses = await Promise.all(promises);
    const successful = responses.filter(r => r.ok()).length;
    const rateLimited = responses.filter(r => r.status() === 429).length;

    return {
      successful,
      rateLimited,
      responses
    };
  }

  /**
   * Test CORS configuration
   */
  async testCors(origin: string = 'http://localhost:3001'): Promise<boolean> {
    const response = await this.page.request.get(
      `${this.adminBaseUrl}/api/health`,
      {
        headers: {
          'Origin': origin
        }
      }
    );

    const corsHeader = response.headers()['access-control-allow-origin'];
    return corsHeader === origin || corsHeader === '*';
  }
}

export default AdminApiPage;