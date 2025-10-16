/**
 * API Helper
 * 
 * Utility class for API interactions and testing
 */

import { APIRequestContext } from '@playwright/test';
import { ApiConfig } from '../config/EnvironmentConfig';

export interface APIResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  url: string;
  method: string;
  duration: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  ignoreHTTPSErrors?: boolean;
  followRedirects?: boolean;
}

export class APIHelper {
  private request: APIRequestContext;
  private config: ApiConfig;
  private defaultHeaders: Record<string, string>;

  constructor(request: APIRequestContext, config: ApiConfig) {
    this.request = request;
    this.config = config;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Testoria-E2E-Tests/1.0'
    };
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.makeRequest('GET', endpoint, undefined, options);
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.makeRequest('POST', endpoint, data, options);
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.makeRequest('PUT', endpoint, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.makeRequest('PATCH', endpoint, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.makeRequest('DELETE', endpoint, undefined, options);
  }

  /**
   * Generic request method with retry logic
   */
  private async makeRequest<T = any>(
    method: string, 
    endpoint: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options?.headers };
    const timeout = options?.timeout || this.config.timeout;
    const retries = options?.retries || this.config.retries;

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();
        
        const response = await this.request.fetch(url, {
          method,
          headers,
          data: data ? JSON.stringify(data) : undefined,
          timeout,
          ignoreHTTPSErrors: options?.ignoreHTTPSErrors,
          maxRedirects: options?.followRedirects ? 10 : 0
        });

        const duration = Date.now() - startTime;
        const responseHeaders = this.extractHeaders(response.headers());
        
        let responseData: T;
        try {
          responseData = await response.json();
        } catch {
          // If JSON parsing fails, try to get text
          responseData = (await response.text()) as any;
        }

        return {
          status: response.status(),
          statusText: response.statusText(),
          headers: responseHeaders,
          data: responseData,
          url: response.url(),
          method,
          duration
        };

      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retries) {
          throw new Error(`API request failed after ${retries + 1} attempts: ${lastError.message}`);
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await this.wait(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Testoria-specific API methods
   */

  // Document API
  async uploadDocument(file: { name: string; content: string; type: string }): Promise<APIResponse> {
    const formData = new FormData();
    const blob = new Blob([file.content], { type: file.type });
    formData.append('file', blob, file.name);

    return this.request.post(`${this.config.baseUrl}/api/documents/upload`, {
      data: formData,
      timeout: 60000 // File uploads can take longer
    }).then(response => ({
      status: response.status(),
      statusText: response.statusText(),
      headers: this.extractHeaders(response.headers()),
      data: response.json(),
      url: response.url(),
      method: 'POST',
      duration: 0
    }));
  }

  async getDocuments(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    type?: string 
  }): Promise<APIResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);

    const endpoint = `/api/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.get(endpoint);
  }

  async getDocument(id: string): Promise<APIResponse> {
    return this.get(`/api/documents/${id}`);
  }

  async deleteDocument(id: string): Promise<APIResponse> {
    return this.delete(`/api/documents/${id}`);
  }

  // Feature API
  async createFeature(feature: { title: string; content: string; category?: string }): Promise<APIResponse> {
    return this.post('/api/features', feature);
  }

  async getFeatures(): Promise<APIResponse> {
    return this.get('/api/features');
  }

  async getFeature(id: string): Promise<APIResponse> {
    return this.get(`/api/features/${id}`);
  }

  async updateFeature(id: string, updates: { title?: string; content?: string }): Promise<APIResponse> {
    return this.put(`/api/features/${id}`, updates);
  }

  async deleteFeature(id: string): Promise<APIResponse> {
    return this.delete(`/api/features/${id}`);
  }

  // AI/Chat API
  async askQuestion(question: string, context?: { documentIds?: string[]; featureIds?: string[] }): Promise<APIResponse> {
    return this.post('/api/ask', { question, context });
  }

  async generateFeature(prompt: string, options?: { template?: string; complexity?: string }): Promise<APIResponse> {
    return this.post('/api/ai/generate-feature', { prompt, ...options });
  }

  // Settings API
  async getModelSettings(): Promise<APIResponse> {
    return this.get('/api/settings/models');
  }

  async updateModelSettings(settings: { 
    chatModel?: string; 
    embeddingModel?: string; 
    provider?: string 
  }): Promise<APIResponse> {
    return this.put('/api/settings/models', settings);
  }

  async testApiConnection(): Promise<APIResponse> {
    return this.get('/api/health');
  }

  // Database API
  async getDatabaseStatus(): Promise<APIResponse> {
    return this.get('/api/database/status');
  }

  async runMigrations(): Promise<APIResponse> {
    return this.post('/api/database/migrate');
  }

  // Search API
  async semanticSearch(query: string, options?: { 
    documentTypes?: string[]; 
    limit?: number; 
    threshold?: number 
  }): Promise<APIResponse> {
    return this.post('/api/search', { query, ...options });
  }

  /**
   * Utility methods
   */

  async waitForApiResponse(
    endpoint: string, 
    expectedStatus: number = 200, 
    timeout: number = 30000
  ): Promise<APIResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await this.get(endpoint);
        if (response.status === expectedStatus) {
          return response;
        }
      } catch (error) {
        // Continue polling
      }
      
      await this.wait(1000); // Wait 1 second between polls
    }
    
    throw new Error(`API endpoint ${endpoint} did not return status ${expectedStatus} within ${timeout}ms`);
  }

  async waitForAsyncOperation(
    operationId: string, 
    statusEndpoint: string, 
    timeout: number = 120000
  ): Promise<APIResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const response = await this.get(`${statusEndpoint}/${operationId}`);
      
      if (response.data.status === 'completed') {
        return response;
      } else if (response.data.status === 'failed') {
        throw new Error(`Async operation ${operationId} failed: ${response.data.error}`);
      }
      
      await this.wait(2000); // Wait 2 seconds between status checks
    }
    
    throw new Error(`Async operation ${operationId} did not complete within ${timeout}ms`);
  }

  /**
   * Batch operations
   */
  async batchRequests<T = any>(requests: Array<{
    method: string;
    endpoint: string;
    data?: any;
    options?: RequestOptions;
  }>): Promise<APIResponse<T>[]> {
    const promises = requests.map(req => 
      this.makeRequest(req.method, req.endpoint, req.data, req.options)
    );
    
    return Promise.all(promises);
  }

  async parallelRequests<T = any>(
    endpoints: string[], 
    method: string = 'GET',
    options?: RequestOptions
  ): Promise<APIResponse<T>[]> {
    const promises = endpoints.map(endpoint => 
      this.makeRequest(method, endpoint, undefined, options)
    );
    
    return Promise.all(promises);
  }

  /**
   * Performance testing utilities
   */
  async loadTest(
    endpoint: string, 
    concurrency: number = 10, 
    duration: number = 60000
  ): Promise<{ 
    totalRequests: number; 
    successfulRequests: number; 
    averageResponseTime: number; 
    errors: string[] 
  }> {
    const startTime = Date.now();
    const results: { success: boolean; duration: number; error?: string }[] = [];
    const errors: string[] = [];

    const makeRequests = async (): Promise<void> => {
      while (Date.now() - startTime < duration) {
        const promises = Array(concurrency).fill(null).map(async () => {
          try {
            const requestStart = Date.now();
            await this.get(endpoint);
            return { 
              success: true, 
              duration: Date.now() - requestStart 
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(errorMessage);
            return { 
              success: false, 
              duration: 0, 
              error: errorMessage 
            };
          }
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
        
        // Small delay to prevent overwhelming the server
        await this.wait(100);
      }
    };

    await makeRequests();

    const successfulRequests = results.filter(r => r.success).length;
    const averageResponseTime = successfulRequests > 0 
      ? results.filter(r => r.success).reduce((sum, r) => sum + r.duration, 0) / successfulRequests
      : 0;

    return {
      totalRequests: results.length,
      successfulRequests,
      averageResponseTime,
      errors: [...new Set(errors)] // Remove duplicates
    };
  }

  /**
   * Helper methods
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${baseUrl}${path}`;
  }

  private extractHeaders(playwrightHeaders: any): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (typeof playwrightHeaders === 'object') {
      for (const [key, value] of Object.entries(playwrightHeaders)) {
        headers[key] = String(value);
      }
    }
    
    return headers;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Authentication helpers
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  setApiKey(apiKey: string): void {
    this.defaultHeaders['X-API-Key'] = apiKey;
  }

  removeAuth(): void {
    delete this.defaultHeaders['Authorization'];
    delete this.defaultHeaders['X-API-Key'];
  }

  /**
   * Debugging utilities
   */
  async logRequest(method: string, endpoint: string, data?: any): Promise<void> {
    console.log(`[API] ${method} ${this.buildUrl(endpoint)}`);
    if (data) {
      console.log('[API] Request data:', JSON.stringify(data, null, 2));
    }
  }

  async logResponse(response: APIResponse): Promise<void> {
    console.log(`[API] ${response.status} ${response.statusText} (${response.duration}ms)`);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
  }
}

export default APIHelper;