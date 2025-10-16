/**
 * Admin API Class
 * 
 * Provides API testing capabilities for the admin application
 * Includes user management, system monitoring, logs, configuration, and more
 */

import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../BaseAPI';
import {
  AuthRequest,
  AuthResponse,
  AdminUser,
  UserListRequest,
  UserListResponse,
  UserActionRequest,
  SystemMetrics,
  LogsRequest,
  LogsResponse,
  LogExportRequest,
  LogExportResponse,
  SystemConfig,
  ConfigUpdateRequest,
  ConfigValidationResponse,
  AuditLogRequest,
  AuditLog,
  BackupRequest,
  BackupResponse,
  RestoreRequest,
  RestoreResponse,
  AnalyticsRequest,
  AnalyticsResponse,
  MaintenanceWindow,
  MaintenanceRequest,
  ServiceHealth,
  HealthCheckResponse
} from '../types';

export class AdminAPI extends BaseAPI {
  constructor(request: APIRequestContext, config?: {
    baseURL?: string;
    authToken?: string;
  }) {
    super(request, {
      baseURL: config?.baseURL || process.env.ADMIN_API_URL || 'http://localhost:3001/api/admin',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Admin-Request': 'true'
      },
      authToken: config?.authToken
    });
  }

  // ============= Authentication =============

  /**
   * Admin login
   */
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', {
      data: credentials
    });
    
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    
    // Validate admin role
    if (response.data.user.role !== 'admin') {
      throw new Error('User does not have admin privileges');
    }
    
    return response.data;
  }

  /**
   * Verify admin privileges
   */
  async verifyAdminAccess(): Promise<boolean> {
    try {
      const response = await this.get('/auth/verify');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // ============= User Management =============

  /**
   * List users with admin details
   */
  async listUsers(params?: UserListRequest): Promise<UserListResponse> {
    const response = await this.get<UserListResponse>('/users', {
      params: params as any
    });
    return response.data;
  }

  /**
   * Get user details
   */
  async getUser(userId: string): Promise<AdminUser> {
    const response = await this.get<AdminUser>(`/users/${userId}`);
    return response.data;
  }

  /**
   * Perform action on user
   */
  async performUserAction(userId: string, action: UserActionRequest): Promise<AdminUser> {
    const response = await this.post<AdminUser>(`/users/${userId}/actions`, {
      data: action
    });
    return response.data;
  }

  /**
   * Create new user
   */
  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    const response = await this.post<AdminUser>('/users', {
      data: userData
    });
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const response = await this.patch<AdminUser>(`/users/${userId}`, {
      data: updates
    });
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, reassignTo?: string): Promise<void> {
    await this.delete(`/users/${userId}`, {
      params: reassignTo ? { reassignTo } : undefined
    });
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<AdminUser['sessions']> {
    const response = await this.get<AdminUser['sessions']>(`/users/${userId}/sessions`);
    return response.data;
  }

  /**
   * Revoke user session
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await this.delete(`/users/${userId}/sessions/${sessionId}`);
  }

  // ============= System Monitoring =============

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await this.get<SystemMetrics>('/system/metrics');
    return response.data;
  }

  /**
   * Get service health
   */
  async getServiceHealth(): Promise<ServiceHealth[]> {
    const response = await this.get<HealthCheckResponse>('/system/health');
    return response.data.services;
  }

  /**
   * Restart service
   */
  async restartService(serviceName: string): Promise<void> {
    await this.post(`/system/services/${serviceName}/restart`);
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<HealthCheckResponse> {
    const response = await this.get<HealthCheckResponse>('/system/status');
    return response.data;
  }

  // ============= Logs Management =============

  /**
   * Query logs
   */
  async queryLogs(params: LogsRequest): Promise<LogsResponse> {
    const response = await this.post<LogsResponse>('/logs/query', {
      data: params
    });
    return response.data;
  }

  /**
   * Stream logs (WebSocket connection info)
   */
  async streamLogs(filters?: LogsRequest): Promise<{ url: string; token: string }> {
    const response = await this.post<{ url: string; token: string }>('/logs/stream', {
      data: filters
    });
    return response.data;
  }

  /**
   * Export logs
   */
  async exportLogs(request: LogExportRequest): Promise<LogExportResponse> {
    const response = await this.post<LogExportResponse>('/logs/export', {
      data: request
    });
    return response.data;
  }

  /**
   * Get export status
   */
  async getLogExportStatus(exportId: string): Promise<LogExportResponse> {
    const response = await this.get<LogExportResponse>(`/logs/export/${exportId}`);
    return response.data;
  }

  /**
   * Clear logs
   */
  async clearLogs(before: string, source?: string): Promise<{ deleted: number }> {
    const response = await this.delete<{ deleted: number }>('/logs', {
      params: { before, source }
    });
    return response.data;
  }

  // ============= Configuration Management =============

  /**
   * Get all configurations
   */
  async getConfigurations(): Promise<SystemConfig[]> {
    const response = await this.get<SystemConfig[]>('/config');
    return response.data;
  }

  /**
   * Get configuration by category
   */
  async getConfiguration(category: string): Promise<SystemConfig> {
    const response = await this.get<SystemConfig>(`/config/${category}`);
    return response.data;
  }

  /**
   * Update configuration
   */
  async updateConfiguration(update: ConfigUpdateRequest): Promise<SystemConfig> {
    // Validate first
    const validation = await this.validateConfiguration(update);
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${JSON.stringify(validation.errors)}`);
    }

    const response = await this.put<SystemConfig>(`/config/${update.category}`, {
      data: update
    });
    return response.data;
  }

  /**
   * Validate configuration
   */
  async validateConfiguration(config: ConfigUpdateRequest): Promise<ConfigValidationResponse> {
    const response = await this.post<ConfigValidationResponse>('/config/validate', {
      data: config
    });
    return response.data;
  }

  /**
   * Reset configuration to defaults
   */
  async resetConfiguration(category: string): Promise<SystemConfig> {
    const response = await this.post<SystemConfig>(`/config/${category}/reset`);
    return response.data;
  }

  // ============= Audit Trail =============

  /**
   * Query audit logs
   */
  async queryAuditLogs(params: AuditLogRequest): Promise<{ logs: AuditLog[]; total: number }> {
    const response = await this.post<{ logs: AuditLog[]; total: number }>('/audit/query', {
      data: params
    });
    return response.data;
  }

  /**
   * Get audit log details
   */
  async getAuditLog(auditId: string): Promise<AuditLog> {
    const response = await this.get<AuditLog>(`/audit/${auditId}`);
    return response.data;
  }

  // ============= Backup & Restore =============

  /**
   * Create backup
   */
  async createBackup(request: BackupRequest): Promise<BackupResponse> {
    const response = await this.post<BackupResponse>('/backup', {
      data: request
    });
    return response.data;
  }

  /**
   * List backups
   */
  async listBackups(): Promise<BackupResponse[]> {
    const response = await this.get<BackupResponse[]>('/backup');
    return response.data;
  }

  /**
   * Get backup status
   */
  async getBackupStatus(backupId: string): Promise<BackupResponse> {
    const response = await this.get<BackupResponse>(`/backup/${backupId}`);
    return response.data;
  }

  /**
   * Restore from backup
   */
  async restoreBackup(request: RestoreRequest): Promise<RestoreResponse> {
    const response = await this.post<RestoreResponse>('/restore', {
      data: request
    });
    return response.data;
  }

  /**
   * Get restore status
   */
  async getRestoreStatus(restoreId: string): Promise<RestoreResponse> {
    const response = await this.get<RestoreResponse>(`/restore/${restoreId}`);
    return response.data;
  }

  // ============= Analytics =============

  /**
   * Get analytics data
   */
  async getAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse> {
    const response = await this.post<AnalyticsResponse>('/analytics', {
      data: request
    });
    return response.data;
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<{
    users: any;
    system: any;
    activity: any;
    alerts: any;
  }> {
    const response = await this.get('/analytics/dashboard');
    return response.data;
  }

  // ============= Maintenance Mode =============

  /**
   * Schedule maintenance
   */
  async scheduleMaintenance(request: MaintenanceRequest): Promise<MaintenanceWindow> {
    const response = await this.post<MaintenanceWindow>('/maintenance', {
      data: request
    });
    return response.data;
  }

  /**
   * List maintenance windows
   */
  async listMaintenanceWindows(): Promise<MaintenanceWindow[]> {
    const response = await this.get<MaintenanceWindow[]>('/maintenance');
    return response.data;
  }

  /**
   * Update maintenance window
   */
  async updateMaintenanceWindow(
    maintenanceId: string, 
    updates: Partial<MaintenanceWindow>
  ): Promise<MaintenanceWindow> {
    const response = await this.patch<MaintenanceWindow>(`/maintenance/${maintenanceId}`, {
      data: updates
    });
    return response.data;
  }

  /**
   * Cancel maintenance
   */
  async cancelMaintenance(maintenanceId: string): Promise<void> {
    await this.delete(`/maintenance/${maintenanceId}`);
  }

  /**
   * Enable maintenance mode immediately
   */
  async enableMaintenanceMode(message?: string): Promise<void> {
    await this.post('/maintenance/enable', {
      data: { message }
    });
  }

  /**
   * Disable maintenance mode
   */
  async disableMaintenanceMode(): Promise<void> {
    await this.post('/maintenance/disable');
  }

  // ============= Helper Methods =============

  /**
   * Quick admin login
   */
  async quickLogin(
    email: string = 'admin@example.com', 
    password: string = 'AdminPass123!'
  ): Promise<AuthResponse> {
    return await this.login({ email, password });
  }

  /**
   * Wait for service to be healthy
   */
  async waitForServiceHealth(serviceName: string, timeout = 30000): Promise<void> {
    await this.waitForCondition(
      async () => {
        const services = await this.getServiceHealth();
        return services.find(s => s.name === serviceName);
      },
      (service) => service?.status === 'up',
      {
        timeout,
        interval: 2000,
        errorMessage: `Service ${serviceName} did not become healthy`
      }
    );
  }

  /**
   * Wait for backup completion
   */
  async waitForBackupCompletion(backupId: string, timeout = 300000): Promise<BackupResponse> {
    return await this.waitForCondition(
      () => this.getBackupStatus(backupId),
      (backup) => backup.status === 'COMPLETED' || backup.status === 'FAILED',
      {
        timeout,
        interval: 5000,
        errorMessage: `Backup ${backupId} timeout`
      }
    );
  }

  /**
   * Perform safe configuration update
   */
  async safeConfigUpdate(update: ConfigUpdateRequest): Promise<SystemConfig> {
    // Validate configuration
    const validation = await this.validateConfiguration(update);
    
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${JSON.stringify(validation.errors)}`);
    }
    
    // Create backup before update
    const backup = await this.createBackup({
      type: 'selective',
      components: ['config']
    });
    
    try {
      // Apply configuration
      const result = await this.updateConfiguration(update);
      
      // Verify services are healthy
      const health = await this.getSystemStatus();
      if (health.status !== 'healthy') {
        throw new Error('System unhealthy after configuration update');
      }
      
      return result;
    } catch (error) {
      // Restore from backup on failure
      await this.restoreBackup({
        backupId: backup.backupId,
        components: ['config']
      });
      throw error;
    }
  }
}