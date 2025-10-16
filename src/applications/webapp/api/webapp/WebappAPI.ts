/**
 * Webapp API Class
 * 
 * Provides API testing capabilities for the webapp application
 * Includes authentication, document management, feature generation, and more
 */

import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../BaseAPI';
import {
  AuthRequest,
  AuthResponse,
  DocumentUploadRequest,
  DocumentUploadResponse,
  DocumentListRequest,
  DocumentListResponse,
  Document,
  DocumentUpdateRequest,
  FeatureGenerationWebappRequest,
  FeatureGenerationWebappResponse,
  FeatureFile,
  Project,
  ChatRequest,
  ChatResponse,
  SearchRequest,
  SearchResponse,
  UserSettings,
  ExportRequest,
  ExportResponse,
  ImportRequest,
  ImportResponse,
  Activity
} from '../types';

export class WebappAPI extends BaseAPI {
  constructor(request: APIRequestContext, config?: {
    baseURL?: string;
    authToken?: string;
  }) {
    super(request, {
      baseURL: config?.baseURL || process.env.WEBAPP_API_URL || 'http://localhost:3001/api',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      authToken: config?.authToken
    });
  }

  // ============= Authentication =============

  /**
   * Login user
   */
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', {
      data: credentials
    });
    
    // Automatically set auth token for subsequent requests
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.post('/auth/logout');
    this.clearAuthToken();
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/refresh', {
      data: { refreshToken }
    });
    
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await this.get<AuthResponse['user']>('/auth/me');
    return response.data;
  }

  // ============= Document Management =============

  /**
   * Upload document
   */
  async uploadDocument(request: DocumentUploadRequest): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('name', request.name);
    
    if (request.description) {
      formData.append('description', request.description);
    }
    
    if (request.tags) {
      formData.append('tags', JSON.stringify(request.tags));
    }
    
    if (request.projectId) {
      formData.append('projectId', request.projectId);
    }

    const response = await this.post<DocumentUploadResponse>('/documents/upload', {
      multipart: formData as any,
      headers: {
        // Remove Content-Type to let browser set it with boundary
        'Content-Type': undefined as any
      }
    });

    return response.data;
  }

  /**
   * List documents
   */
  async listDocuments(params?: DocumentListRequest): Promise<DocumentListResponse> {
    const response = await this.get<DocumentListResponse>('/documents', {
      params: params as any
    });
    return response.data;
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<Document> {
    const response = await this.get<Document>(`/documents/${documentId}`);
    return response.data;
  }

  /**
   * Update document
   */
  async updateDocument(documentId: string, updates: DocumentUpdateRequest): Promise<Document> {
    const response = await this.patch<Document>(`/documents/${documentId}`, {
      data: updates
    });
    return response.data;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.delete(`/documents/${documentId}`);
  }

  /**
   * Get document processing status
   */
  async getDocumentStatus(documentId: string): Promise<Document['status']> {
    const response = await this.get<{ status: Document['status'] }>(
      `/documents/${documentId}/status`
    );
    return response.data.status;
  }

  /**
   * Wait for document processing completion
   */
  async waitForDocumentProcessing(documentId: string, timeout = 60000): Promise<Document> {
    return await this.waitForCondition(
      () => this.getDocument(documentId),
      (doc) => doc.status === 'PROCESSED' || doc.status === 'FAILED',
      {
        timeout,
        interval: 2000,
        errorMessage: `Document ${documentId} processing timeout`
      }
    );
  }

  // ============= Feature Generation =============

  /**
   * Generate features from documents
   */
  async generateFeatures(request: FeatureGenerationWebappRequest): Promise<FeatureGenerationWebappResponse> {
    const response = await this.post<FeatureGenerationWebappResponse>('/features/generate', {
      data: request
    });
    return response.data;
  }

  /**
   * Get generation status
   */
  async getGenerationStatus(generationId: string): Promise<FeatureGenerationWebappResponse> {
    const response = await this.get<FeatureGenerationWebappResponse>(
      `/features/generation/${generationId}`
    );
    return response.data;
  }

  /**
   * List feature files
   */
  async listFeatures(projectId?: string): Promise<FeatureFile[]> {
    const response = await this.get<FeatureFile[]>('/features', {
      params: projectId ? { projectId } : undefined
    });
    return response.data;
  }

  /**
   * Get feature file
   */
  async getFeature(featureId: string): Promise<FeatureFile> {
    const response = await this.get<FeatureFile>(`/features/${featureId}`);
    return response.data;
  }

  /**
   * Update feature file
   */
  async updateFeature(featureId: string, content: string): Promise<FeatureFile> {
    const response = await this.put<FeatureFile>(`/features/${featureId}`, {
      data: { content }
    });
    return response.data;
  }

  /**
   * Delete feature file
   */
  async deleteFeature(featureId: string): Promise<void> {
    await this.delete(`/features/${featureId}`);
  }

  // ============= Projects =============

  /**
   * Create project
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    const response = await this.post<Project>('/projects', {
      data: project
    });
    return response.data;
  }

  /**
   * List projects
   */
  async listProjects(): Promise<Project[]> {
    const response = await this.get<Project[]>('/projects');
    return response.data;
  }

  /**
   * Get project
   */
  async getProject(projectId: string): Promise<Project> {
    const response = await this.get<Project>(`/projects/${projectId}`);
    return response.data;
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const response = await this.patch<Project>(`/projects/${projectId}`, {
      data: updates
    });
    return response.data;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    await this.delete(`/projects/${projectId}`);
  }

  // ============= Chat/Q&A =============

  /**
   * Send chat message
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.post<ChatResponse>('/chat', {
      data: request
    });
    return response.data;
  }

  /**
   * Get chat history
   */
  async getChatHistory(projectId?: string, limit = 50): Promise<ChatResponse[]> {
    const response = await this.get<ChatResponse[]>('/chat/history', {
      params: { projectId, limit }
    });
    return response.data;
  }

  /**
   * Clear chat history
   */
  async clearChatHistory(projectId?: string): Promise<void> {
    await this.delete('/chat/history', {
      params: projectId ? { projectId } : undefined
    });
  }

  // ============= Search =============

  /**
   * Search across resources
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    const response = await this.post<SearchResponse>('/search', {
      data: request
    });
    return response.data;
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    const response = await this.get<string[]>('/search/suggestions', {
      params: { query }
    });
    return response.data;
  }

  // ============= Settings =============

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<UserSettings> {
    const response = await this.get<UserSettings>('/settings');
    return response.data;
  }

  /**
   * Update user settings
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await this.patch<UserSettings>('/settings', {
      data: settings
    });
    return response.data;
  }

  // ============= Export/Import =============

  /**
   * Export data
   */
  async exportData(request: ExportRequest): Promise<ExportResponse> {
    const response = await this.post<ExportResponse>('/export', {
      data: request
    });
    return response.data;
  }

  /**
   * Check export status
   */
  async getExportStatus(exportId: string): Promise<ExportResponse> {
    const response = await this.get<ExportResponse>(`/export/${exportId}`);
    return response.data;
  }

  /**
   * Import data
   */
  async importData(request: ImportRequest): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('type', request.type);
    formData.append('format', request.format);
    
    if (request.options) {
      formData.append('options', JSON.stringify(request.options));
    }

    const response = await this.post<ImportResponse>('/import', {
      multipart: formData as any,
      headers: {
        'Content-Type': undefined as any
      }
    });

    return response.data;
  }

  /**
   * Get import status
   */
  async getImportStatus(importId: string): Promise<ImportResponse> {
    const response = await this.get<ImportResponse>(`/import/${importId}`);
    return response.data;
  }

  // ============= Activity =============

  /**
   * Get recent activity
   */
  async getRecentActivity(projectId?: string, limit = 20): Promise<Activity[]> {
    const response = await this.get<Activity[]>('/activity', {
      params: { projectId, limit }
    });
    return response.data;
  }

  // ============= Health Check =============

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  }

  // ============= Helper Methods =============

  /**
   * Quick login helper
   */
  async quickLogin(email: string = 'test@example.com', password: string = 'TestPass123!'): Promise<AuthResponse> {
    return await this.login({ email, password });
  }

  /**
   * Upload and wait for processing
   */
  async uploadAndWaitForDocument(
    file: File | Buffer,
    name: string,
    projectId?: string
  ): Promise<Document> {
    const upload = await this.uploadDocument({
      file,
      name,
      projectId
    });
    
    return await this.waitForDocumentProcessing(upload.document.id);
  }

  /**
   * Generate features and wait for completion
   */
  async generateAndWaitForFeatures(
    documentIds: string[],
    projectId: string,
    aiModel: string = 'gpt-4'
  ): Promise<FeatureGenerationWebappResponse> {
    const generation = await this.generateFeatures({
      documentIds,
      projectId,
      aiModel,
      settings: {
        includeEdgeCases: true,
        includeNegativeScenarios: true,
        detailLevel: 'comprehensive'
      }
    });

    return await this.waitForCondition(
      () => this.getGenerationStatus(generation.id),
      (status) => status.status === 'COMPLETED' || status.status === 'FAILED',
      {
        timeout: 120000,
        interval: 3000,
        errorMessage: `Feature generation ${generation.id} timeout`
      }
    );
  }
}