/**
 * Application Manager
 * 
 * Manages application lifecycle, health checks, and service coordination
 * Ensures applications are running and accessible before tests
 */

import { ApiHelper } from './ApiHelper';
import { EnvironmentConfig } from '../../framework/config/EnvironmentConfig';

export interface ServiceHealthStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  url: string;
  responseTime?: number;
  error?: string;
}

export class ApplicationManager {
  private apiHelper: ApiHelper;
  private config: typeof EnvironmentConfig;

  constructor() {
    this.config = EnvironmentConfig;
    this.apiHelper = new ApiHelper(this.config.getApiBaseUrl());
  }

  /**
   * Ensure all required services are running
   */
  async ensureAllServicesRunning(): Promise<ServiceHealthStatus[]> {
    const services = [
      { name: 'webapp', url: this.config.getWebappBaseUrl() },
      { name: 'mcp-platform', url: this.config.getApiBaseUrl() },
      { name: 'adminapp', url: this.config.getAdminAppBaseUrl() }
    ];

    const healthChecks = services.map(service => this.checkServiceHealth(service.name, service.url));
    const results = await Promise.all(healthChecks);

    // Check if any critical services are down
    const unhealthyServices = results.filter(result => result.status === 'unhealthy');
    if (unhealthyServices.length > 0) {
      console.warn('Some services are unhealthy:', unhealthyServices);
    }

    return results;
  }

  /**
   * Check if webapp is running and accessible
   */
  async ensureWebappIsRunning(): Promise<ServiceHealthStatus> {
    const webappUrl = this.config.getWebappBaseUrl();
    return await this.checkServiceHealth('webapp', webappUrl);
  }

  /**
   * Check if admin app is running and accessible
   */
  async ensureAdminAppIsRunning(): Promise<ServiceHealthStatus> {
    const adminAppUrl = this.config.getAdminAppBaseUrl();
    return await this.checkServiceHealth('adminapp', adminAppUrl);
  }

  /**
   * Check if MCP platform is running and accessible
   */
  async ensureMcpPlatformIsRunning(): Promise<ServiceHealthStatus> {
    const mcpUrl = this.config.getApiBaseUrl();
    return await this.checkServiceHealth('mcp-platform', mcpUrl);
  }

  /**
   * Check health of a specific service
   */
  async checkServiceHealth(serviceName: string, serviceUrl: string): Promise<ServiceHealthStatus> {
    const startTime = Date.now();
    
    try {
      // Try health endpoint first
      let response;
      try {
        response = await fetch(`${serviceUrl}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
      } catch (healthError) {
        // If health endpoint fails, try root endpoint
        response = await fetch(serviceUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
      }

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          name: serviceName,
          status: 'healthy',
          url: serviceUrl,
          responseTime
        };
      } else {
        return {
          name: serviceName,
          status: 'unhealthy',
          url: serviceUrl,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        name: serviceName,
        status: 'unhealthy',
        url: serviceUrl,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Wait for service to become healthy
   */
  async waitForServiceHealth(
    serviceName: string, 
    serviceUrl: string, 
    maxRetries: number = 30,
    retryDelay: number = 2000
  ): Promise<ServiceHealthStatus> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      const healthStatus = await this.checkServiceHealth(serviceName, serviceUrl);
      
      if (healthStatus.status === 'healthy') {
        return healthStatus;
      }
      
      attempts++;
      if (attempts < maxRetries) {
        console.log(`Service ${serviceName} not healthy, retrying in ${retryDelay}ms... (${attempts}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    throw new Error(`Service ${serviceName} failed to become healthy after ${maxRetries} attempts`);
  }

  /**
   * Check database connectivity
   */
  async checkDatabaseHealth(): Promise<{ postgres: boolean; chroma: boolean }> {
    try {
      // Check if we can make API calls that would require DB access
      const postgresHealthy = await this.checkPostgresHealth();
      const chromaHealthy = await this.checkChromaHealth();
      
      return { postgres: postgresHealthy, chroma: chromaHealthy };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { postgres: false, chroma: false };
    }
  }

  /**
   * Check PostgreSQL connectivity through webapp API
   */
  private async checkPostgresHealth(): Promise<boolean> {
    try {
      const response = await this.apiHelper.get('/api/health/db');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check ChromaDB connectivity through MCP platform
   */
  private async checkChromaHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.getApiBaseUrl()}/health/chroma`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Prepare test environment
   */
  async prepareTestEnvironment(): Promise<void> {
    console.log('Preparing test environment...');
    
    // Check all services
    const serviceStatuses = await this.ensureAllServicesRunning();
    
    // Log service statuses
    serviceStatuses.forEach(status => {
      const statusIcon = status.status === 'healthy' ? '✅' : '❌';
      console.log(`${statusIcon} ${status.name}: ${status.status} (${status.responseTime}ms)`);
      if (status.error) {
        console.log(`   Error: ${status.error}`);
      }
    });

    // Check database health
    const dbHealth = await this.checkDatabaseHealth();
    console.log(`✅ PostgreSQL: ${dbHealth.postgres ? 'Connected' : 'Disconnected'}`);
    console.log(`✅ ChromaDB: ${dbHealth.chroma ? 'Connected' : 'Disconnected'}`);

    // Verify critical services are healthy
    const criticalServices = serviceStatuses.filter(s => ['webapp', 'mcp-platform'].includes(s.name));
    const unhealthyCritical = criticalServices.filter(s => s.status !== 'healthy');
    
    if (unhealthyCritical.length > 0) {
      throw new Error(`Critical services are unhealthy: ${unhealthyCritical.map(s => s.name).join(', ')}`);
    }
    
    console.log('Test environment ready! 🚀');
  }

  /**
   * Cleanup test environment
   */
  async cleanupTestEnvironment(): Promise<void> {
    console.log('Cleaning up test environment...');
    
    // Could include cleanup tasks like:
    // - Clearing test data
    // - Resetting application state
    // - Closing connections
    
    console.log('Test environment cleanup complete!');
  }

  /**
   * Get service URLs for different environments
   */
  getServiceUrls(): Record<string, string> {
    return {
      webapp: this.config.getWebappBaseUrl(),
      adminapp: this.config.getAdminAppBaseUrl(),
      mcpPlatform: this.config.getApiBaseUrl(),
      postgres: `postgresql://localhost:${this.config.get('DATABASE_PORT', '5432')}`,
      chroma: `http://localhost:${this.config.get('CHROMA_PORT', '8000')}`
    };
  }

  /**
   * Check if running in CI environment
   */
  isRunningInCI(): boolean {
    return !!(process.env.CI || process.env.GITHUB_ACTIONS);
  }

  /**
   * Get environment name
   */
  getEnvironmentName(): string {
    return this.config.getEnvironment();
  }

  /**
   * Verify required environment variables
   */
  verifyEnvironmentVariables(): void {
    const required = [
      'NEXT_PUBLIC_APP_URL',
      'DATABASE_URL',
      'API_BASE_URL'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}