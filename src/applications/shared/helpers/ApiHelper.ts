/**
 * API Helper
 * 
 * Provides utilities for making HTTP requests and handling API responses
 * Used for backend API testing and data setup/cleanup
 */

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiHelper {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private authToken?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Testoria-E2E-Tests/1.0'
    };
  }

  /**
   * Set authentication token for requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = undefined;
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Make GET request
   */
  async get(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.makeRequest('GET', endpoint, undefined, options);
  }

  /**
   * Make POST request
   */
  async post(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.makeRequest('POST', endpoint, data, options);
  }

  /**
   * Make PUT request
   */
  async put(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.makeRequest('PUT', endpoint, data, options);
  }

  /**
   * Make PATCH request
   */
  async patch(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.makeRequest('PATCH', endpoint, data, options);
  }

  /**
   * Make DELETE request
   */
  async delete(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.makeRequest('DELETE', endpoint, undefined, options);
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint: string, file: File | Buffer, filename: string, options: RequestOptions = {}): Promise<ApiResponse> {
    const formData = new FormData();
    
    if (file instanceof Buffer) {
      formData.append('file', new Blob([file]), filename);
    } else {
      formData.append('file', file, filename);
    }

    const headers = { ...this.defaultHeaders, ...options.headers };
    delete headers['Content-Type']; // Let browser set multipart boundary

    return this.makeRequest('POST', endpoint, formData, { ...options, headers });
  }

  /**
   * Make HTTP request with retries and error handling
   */
  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse> {
    const { timeout = 30000, retries = 0, retryDelay = 1000 } = options;
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();
        
        const requestInit: RequestInit = {
          method,
          headers: { ...this.defaultHeaders, ...options.headers },
          signal: AbortSignal.timeout(timeout)
        };

        // Add body for non-GET requests
        if (data && method !== 'GET') {
          if (data instanceof FormData) {
            requestInit.body = data;
            // Remove Content-Type header for FormData
            const headers = requestInit.headers as Record<string, string>;
            delete headers['Content-Type'];
          } else if (typeof data === 'string') {
            requestInit.body = data;
          } else {
            requestInit.body = JSON.stringify(data);
          }
        }

        const response = await fetch(url, requestInit);
        const responseTime = Date.now() - startTime;

        // Extract response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        // Parse response data
        let responseData: any;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          try {
            responseData = await response.json();
          } catch (jsonError) {
            responseData = await response.text();
          }
        } else if (contentType.includes('text/')) {
          responseData = await response.text();
        } else {
          responseData = await response.arrayBuffer();
        }

        const apiResponse: ApiResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data: responseData,
          responseTime
        };

        // Log request details in debug mode
        if (process.env.DEBUG_API) {
          console.log(`API ${method} ${url} -> ${response.status} (${responseTime}ms)`);
        }

        return apiResponse;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < retries) {
          console.log(`API request failed, retrying in ${retryDelay}ms... (${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw new Error(`API request failed after ${retries + 1} attempts: ${lastError?.message}`);
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for API to become available
   */
  async waitForAvailability(maxRetries: number = 30, retryDelay: number = 2000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      if (await this.healthCheck()) {
        return true;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return false;
  }

  /**
   * Validate JSON response schema
   */
  validateJsonResponse(response: ApiResponse, expectedFields: string[]): boolean {
    if (typeof response.data !== 'object' || response.data === null) {
      return false;
    }

    return expectedFields.every(field => {
      const keys = field.split('.');
      let current = response.data;
      
      for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
          return false;
        }
        current = current[key];
      }
      
      return true;
    });
  }

  /**
   * Extract specific data from response
   */
  extractData(response: ApiResponse, path: string): any {
    const keys = path.split('.');
    let current = response.data;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Check if response indicates success
   */
  isSuccessResponse(response: ApiResponse): boolean {
    return response.status >= 200 && response.status < 300;
  }

  /**
   * Check if response indicates client error
   */
  isClientError(response: ApiResponse): boolean {
    return response.status >= 400 && response.status < 500;
  }

  /**
   * Check if response indicates server error
   */
  isServerError(response: ApiResponse): boolean {
    return response.status >= 500;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set custom default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Get current default headers
   */
  getDefaultHeaders(): Record<string, string> {
    return { ...this.defaultHeaders };
  }

  /**
   * Create URL with query parameters
   */
  createUrlWithParams(endpoint: string, params: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
    
    return url.toString();
  }

  /**
   * Download file from endpoint
   */
  async downloadFile(endpoint: string, options: RequestOptions = {}): Promise<{ data: ArrayBuffer; filename?: string }> {
    const response = await this.makeRequest('GET', endpoint, undefined, options);
    
    if (!this.isSuccessResponse(response)) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename: string | undefined;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    return {
      data: response.data as ArrayBuffer,
      filename
    };
  }
}