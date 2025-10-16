/**
 * Common API Types
 * 
 * Shared type definitions for API requests and responses
 */

// Generic response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version?: string;
  pagination?: PaginationMetadata;
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Common request types
export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterRequest {
  filters?: Record<string, any>;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Authentication types
export interface AuthRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: string[];
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
  QA_ENGINEER = 'qa_engineer',
  DEVELOPER = 'developer'
}

// Document types
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
  processedAt?: string;
  metadata?: DocumentMetadata;
  tags?: string[];
}

export enum DocumentType {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
  MD = 'md',
  HTML = 'html'
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

export interface DocumentMetadata {
  pageCount?: number;
  wordCount?: number;
  language?: string;
  extractedText?: string;
  summary?: string;
}

// Feature generation types
export interface FeatureGenerationRequest {
  documentIds: string[];
  aiModel: string;
  settings: FeatureGenerationSettings;
}

export interface FeatureGenerationSettings {
  includeEdgeCases: boolean;
  includeNegativeScenarios: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  targetFramework?: 'playwright' | 'cypress' | 'selenium';
  language?: string;
}

export interface FeatureGenerationResponse {
  id: string;
  status: GenerationStatus;
  features: GeneratedFeature[];
  generatedAt: string;
  duration: number;
  tokensUsed?: number;
}

export enum GenerationStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface GeneratedFeature {
  id: string;
  name: string;
  description: string;
  scenarios: Scenario[];
  tags?: string[];
  gherkinContent: string;
}

export interface Scenario {
  id: string;
  name: string;
  type: 'normal' | 'outline' | 'background';
  steps: Step[];
  examples?: Example[];
  tags?: string[];
}

export interface Step {
  keyword: 'Given' | 'When' | 'Then' | 'And' | 'But';
  text: string;
  docString?: string;
  dataTable?: string[][];
}

export interface Example {
  name?: string;
  headers: string[];
  rows: string[][];
}

// Log types
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  details?: Record<string, any>;
  stackTrace?: string;
  userId?: string;
  requestId?: string;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogFilter {
  levels?: LogLevel[];
  sources?: string[];
  timeRange?: TimeRange;
  search?: string;
  userId?: string;
  requestId?: string;
}

export interface TimeRange {
  from: string;
  to: string;
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: ServiceHealth[];
  uptime: number;
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  details?: Record<string, any>;
}

// Error response types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

export interface ErrorResponse {
  error: {
    type: string;
    message: string;
    code?: string;
    validationErrors?: ValidationError[];
    trace?: string;
  };
  timestamp: string;
  path: string;
  requestId?: string;
}

// Batch operation types
export interface BatchRequest<T> {
  operations: BatchOperation<T>[];
  stopOnError?: boolean;
}

export interface BatchOperation<T> {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: T;
}

export interface BatchResponse<T> {
  successful: BatchResult<T>[];
  failed: BatchFailure[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

export interface BatchResult<T> {
  id: string;
  operation: string;
  result: T;
}

export interface BatchFailure {
  id: string;
  operation: string;
  error: ApiError;
}

// WebSocket types
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

export interface WebSocketEvent {
  connected: boolean;
  connectionId?: string;
  timestamp: string;
}