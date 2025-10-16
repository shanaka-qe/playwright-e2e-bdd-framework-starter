/**
 * Webapp API Types
 * 
 * Type definitions specific to the webapp application API
 */

import { 
  Document, 
  FeatureGenerationRequest, 
  FeatureGenerationResponse,
  UserProfile,
  PaginationRequest,
  FilterRequest
} from './common.types';

// Document Management
export interface DocumentUploadRequest {
  file: File | Buffer;
  name: string;
  description?: string;
  tags?: string[];
  projectId?: string;
}

export interface DocumentUploadResponse {
  document: Document;
  uploadUrl?: string;
  processingStarted: boolean;
}

export interface DocumentListRequest extends PaginationRequest, FilterRequest {
  status?: string[];
  type?: string[];
  projectId?: string;
  uploadedBy?: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DocumentUpdateRequest {
  name?: string;
  description?: string;
  tags?: string[];
  status?: string;
}

// Feature Generation
export interface FeatureGenerationWebappRequest extends FeatureGenerationRequest {
  projectId: string;
  templateId?: string;
  customPrompt?: string;
}

export interface FeatureGenerationWebappResponse extends FeatureGenerationResponse {
  project: Project;
  savedFeatureIds: string[];
}

export interface FeatureFile {
  id: string;
  name: string;
  content: string;
  projectId: string;
  documentIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  tags?: string[];
  metadata?: FeatureFileMetadata;
}

export interface FeatureFileMetadata {
  scenarioCount: number;
  stepCount: number;
  coverage?: number;
  complexity?: 'low' | 'medium' | 'high';
  framework?: string;
}

// Projects
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner: string;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
  settings?: ProjectSettings;
  statistics?: ProjectStatistics;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface ProjectSettings {
  defaultAiModel?: string;
  featureGenerationSettings?: Record<string, any>;
  integrations?: ProjectIntegration[];
}

export interface ProjectIntegration {
  type: 'github' | 'gitlab' | 'jira' | 'slack';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface ProjectStatistics {
  documentCount: number;
  featureCount: number;
  scenarioCount: number;
  lastActivity: string;
}

// Chat/Q&A
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  metadata?: ChatMetadata;
}

export interface ChatAttachment {
  type: 'document' | 'feature' | 'code' | 'image';
  id: string;
  name: string;
  preview?: string;
}

export interface ChatMetadata {
  model?: string;
  tokensUsed?: number;
  responseTime?: number;
  sources?: string[];
}

export interface ChatRequest {
  message: string;
  context?: ChatContext;
  attachments?: string[];
  stream?: boolean;
}

export interface ChatContext {
  projectId?: string;
  documentIds?: string[];
  featureIds?: string[];
  previousMessageIds?: string[];
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
  relatedDocuments?: Document[];
  confidence?: number;
}

// Search
export interface SearchRequest {
  query: string;
  types?: ('document' | 'feature' | 'project' | 'chat')[];
  projectIds?: string[];
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
}

export interface SearchFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  tags?: string[];
  authors?: string[];
  status?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets?: SearchFacets;
  suggestions?: string[];
}

export interface SearchResult {
  type: 'document' | 'feature' | 'project' | 'chat';
  id: string;
  title: string;
  excerpt: string;
  highlights?: string[];
  score: number;
  metadata: Record<string, any>;
}

export interface SearchFacets {
  types: FacetCount[];
  tags: FacetCount[];
  authors: FacetCount[];
  dates: DateFacet[];
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface DateFacet {
  period: string;
  count: number;
}

// Settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  editor: EditorSettings;
  ai: AISettings;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  documentProcessed: boolean;
  featureGenerated: boolean;
  mentions: boolean;
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  lineNumbers: boolean;
  wordWrap: boolean;
  theme: string;
  autoSave: boolean;
  autoFormat: boolean;
}

export interface AISettings {
  defaultModel: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Collaboration
export interface Comment {
  id: string;
  targetType: 'document' | 'feature' | 'project';
  targetId: string;
  content: string;
  author: UserProfile;
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
  reactions?: Reaction[];
}

export interface Reaction {
  type: string;
  userId: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  actor: UserProfile;
  target: {
    type: string;
    id: string;
    name: string;
  };
  timestamp: string;
  details?: Record<string, any>;
}

export enum ActivityType {
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_PROCESSED = 'document_processed',
  FEATURE_GENERATED = 'feature_generated',
  FEATURE_EDITED = 'feature_edited',
  COMMENT_ADDED = 'comment_added',
  MEMBER_ADDED = 'member_added',
  SETTINGS_UPDATED = 'settings_updated'
}

// Export/Import
export interface ExportRequest {
  type: 'project' | 'features' | 'documents';
  format: 'zip' | 'json' | 'gherkin';
  ids: string[];
  options?: ExportOptions;
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includeComments?: boolean;
  includeHistory?: boolean;
  flatten?: boolean;
}

export interface ExportResponse {
  exportId: string;
  status: 'preparing' | 'ready' | 'expired';
  downloadUrl?: string;
  expiresAt?: string;
  size?: number;
}

export interface ImportRequest {
  type: 'project' | 'features' | 'documents';
  format: 'zip' | 'json' | 'gherkin';
  file: File | Buffer;
  options?: ImportOptions;
}

export interface ImportOptions {
  overwrite?: boolean;
  projectId?: string;
  mappings?: Record<string, string>;
}

export interface ImportResponse {
  importId: string;
  status: 'processing' | 'completed' | 'failed';
  summary?: ImportSummary;
  errors?: ImportError[];
}

export interface ImportSummary {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
}

export interface ImportError {
  item: string;
  error: string;
  line?: number;
}