/**
 * Admin App API Types
 * 
 * Type definitions specific to the admin application API
 */

import { 
  UserProfile, 
  LogEntry, 
  LogFilter,
  PaginationRequest,
  FilterRequest,
  ServiceHealth
} from './common.types';

// User Management
export interface AdminUser extends UserProfile {
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lastPasswordChange: string;
  sessions: UserSession[];
  apiKeys?: ApiKey[];
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  DELETED = 'deleted'
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  createdAt: string;
  lastActivity: string;
  active: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  active: boolean;
}

export interface UserListRequest extends PaginationRequest, FilterRequest {
  status?: UserStatus[];
  roles?: string[];
  verified?: boolean;
  hasApiKeys?: boolean;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  stats: UserStats;
}

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  newThisMonth: number;
  withApiKeys: number;
}

export interface UserActionRequest {
  action: UserAction;
  reason?: string;
  notifyUser?: boolean;
  duration?: number; // For temporary actions
}

export enum UserAction {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  SUSPEND = 'suspend',
  DELETE = 'delete',
  RESET_PASSWORD = 'reset_password',
  REVOKE_SESSIONS = 'revoke_sessions',
  ENABLE_2FA = 'enable_2fa',
  DISABLE_2FA = 'disable_2fa'
}

// System Monitoring
export interface SystemMetrics {
  timestamp: string;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  services: ServiceMetrics[];
}

export interface CpuMetrics {
  usage: number;
  cores: number;
  loadAverage: number[];
  temperature?: number;
}

export interface MemoryMetrics {
  total: number;
  used: number;
  free: number;
  percentage: number;
  swap?: {
    total: number;
    used: number;
  };
}

export interface DiskMetrics {
  partitions: DiskPartition[];
  io?: {
    readRate: number;
    writeRate: number;
  };
}

export interface DiskPartition {
  mount: string;
  total: number;
  used: number;
  free: number;
  percentage: number;
}

export interface NetworkMetrics {
  interfaces: NetworkInterface[];
  connections: number;
  bandwidth: {
    upload: number;
    download: number;
  };
}

export interface NetworkInterface {
  name: string;
  ip: string;
  status: 'up' | 'down';
  sent: number;
  received: number;
}

export interface ServiceMetrics {
  name: string;
  status: ServiceStatus;
  uptime: number;
  memory: number;
  cpu: number;
  requests?: {
    total: number;
    rate: number;
    errors: number;
  };
}

export enum ServiceStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  STARTING = 'starting',
  STOPPING = 'stopping',
  ERROR = 'error'
}

// Logs Management
export interface LogsRequest extends LogFilter, PaginationRequest {
  realtime?: boolean;
  export?: boolean;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  stats: LogStats;
}

export interface LogStats {
  totalLogs: number;
  errorRate: number;
  warningRate: number;
  topSources: SourceCount[];
  logLevels: LevelCount[];
}

export interface SourceCount {
  source: string;
  count: number;
  percentage: number;
}

export interface LevelCount {
  level: string;
  count: number;
  percentage: number;
}

export interface LogExportRequest {
  format: 'json' | 'csv' | 'txt';
  filters: LogFilter;
  compression?: boolean;
}

export interface LogExportResponse {
  exportId: string;
  status: 'preparing' | 'ready' | 'expired';
  downloadUrl?: string;
  size?: number;
  rowCount?: number;
}

// Configuration Management
export interface SystemConfig {
  id: string;
  category: ConfigCategory;
  settings: Record<string, any>;
  updatedAt: string;
  updatedBy: string;
  version: number;
}

export enum ConfigCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  EMAIL = 'email',
  STORAGE = 'storage',
  AI_MODELS = 'ai_models',
  INTEGRATIONS = 'integrations',
  FEATURES = 'features',
  LIMITS = 'limits'
}

export interface ConfigUpdateRequest {
  category: ConfigCategory;
  settings: Record<string, any>;
  reason?: string;
  testMode?: boolean;
}

export interface ConfigValidationResponse {
  valid: boolean;
  errors?: ConfigError[];
  warnings?: ConfigWarning[];
  impact?: ConfigImpact[];
}

export interface ConfigError {
  field: string;
  message: string;
  currentValue?: any;
  expectedType?: string;
}

export interface ConfigWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ConfigImpact {
  service: string;
  impact: string;
  requiresRestart: boolean;
}

// Audit Trail
export interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    type: 'user' | 'system' | 'api';
  };
  action: AuditAction;
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  changes?: AuditChange[];
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface AuditAction {
  category: 'auth' | 'user' | 'config' | 'data' | 'system';
  type: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface AuditChange {
  field: string;
  oldValue?: any;
  newValue?: any;
}

export interface AuditLogRequest extends PaginationRequest {
  actors?: string[];
  actions?: string[];
  resources?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  severity?: string[];
}

// Backup & Restore
export interface BackupRequest {
  type: 'full' | 'incremental' | 'selective';
  components?: ('database' | 'files' | 'config' | 'logs')[];
  compression?: boolean;
  encryption?: boolean;
  schedule?: BackupSchedule;
}

export interface BackupSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retention: number;
  enabled: boolean;
}

export interface BackupResponse {
  backupId: string;
  status: BackupStatus;
  size?: number;
  duration?: number;
  location?: string;
  components?: BackupComponent[];
}

export enum BackupStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface BackupComponent {
  name: string;
  status: 'pending' | 'backing_up' | 'completed' | 'failed';
  size?: number;
  items?: number;
  error?: string;
}

export interface RestoreRequest {
  backupId: string;
  components?: string[];
  targetEnvironment?: string;
  skipValidation?: boolean;
}

export interface RestoreResponse {
  restoreId: string;
  status: RestoreStatus;
  progress?: number;
  estimated?: string;
  warnings?: string[];
}

export enum RestoreStatus {
  VALIDATING = 'validating',
  RESTORING = 'restoring',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLBACK = 'rollback'
}

// Analytics
export interface AnalyticsRequest {
  metrics: string[];
  dimensions?: string[];
  dateRange: {
    from: string;
    to: string;
  };
  granularity?: 'hour' | 'day' | 'week' | 'month';
  filters?: Record<string, any>;
}

export interface AnalyticsResponse {
  data: AnalyticsDataPoint[];
  summary: Record<string, number>;
  trends: Record<string, TrendInfo>;
}

export interface AnalyticsDataPoint {
  timestamp: string;
  dimensions?: Record<string, string>;
  metrics: Record<string, number>;
}

export interface TrendInfo {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

// Maintenance Mode
export interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  affectedServices: string[];
  allowedUsers?: string[];
  status: MaintenanceStatus;
  createdBy: string;
  createdAt: string;
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface MaintenanceRequest {
  title: string;
  description?: string;
  startTime: string;
  duration: number;
  affectedServices: string[];
  notifyUsers?: boolean;
  allowedUsers?: string[];
}