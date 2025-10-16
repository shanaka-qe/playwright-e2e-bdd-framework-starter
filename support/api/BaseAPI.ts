/**
 * Base API Class
 * 
 * Provides common HTTP methods and request handling for API testing
 * All application-specific API classes should extend this base class
 */

import { APIRequestContext, APIResponse, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface APIRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
  data?: any;
  form?: Record<string, string | number | boolean>;
  multipart?: Record<string, string | number | boolean | ReadStream | {
    name: string;
    mimeType: string;
    buffer: Buffer;
  }>;
  failOnStatusCode?: boolean;
  ignoreHTTPSErrors?: boolean;
}

export interface APIResponseData<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  duration: number;
}

export class BaseAPI {
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;
  protected authToken?: string;

  constructor(
    protected request: APIRequestContext,
    protected config: {
      baseURL: string;
      defaultHeaders?: Record<string, string>;
      authToken?: string;
    }
  ) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.defaultHeaders || {};
    this.authToken = config.authToken;
  }

  /**
   * Set authentication token
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
   * Build full URL from path
   */
  protected buildURL(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return `${this.baseURL}${path.startsWith('/') ? path : '/' + path}`;
  }

  /**
   * Merge headers with defaults
   */
  protected mergeHeaders(headers?: Record<string, string>): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...(headers || {})
    };
  }

  /**
   * Make GET request
   */
  async get<T = any>(path: string, options?: APIRequestOptions): Promise<APIResponseData<T>> {
    const startTime = Date.now();
    const response = await this.request.get(this.buildURL(path), {
      headers: this.mergeHeaders(options?.headers),
      params: options?.params,
      timeout: options?.timeout,
      failOnStatusCode: options?.failOnStatusCode ?? true,
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors
    });

    return this.handleResponse<T>(response, startTime);
  }

  /**
   * Make POST request
   */
  async post<T = any>(path: string, options?: APIRequestOptions): Promise<APIResponseData<T>> {
    const startTime = Date.now();
    const response = await this.request.post(this.buildURL(path), {
      headers: this.mergeHeaders(options?.headers),
      params: options?.params,
      data: options?.data,
      form: options?.form,
      multipart: options?.multipart,
      timeout: options?.timeout,
      failOnStatusCode: options?.failOnStatusCode ?? true,
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors
    });

    return this.handleResponse<T>(response, startTime);
  }

  /**
   * Make PUT request
   */
  async put<T = any>(path: string, options?: APIRequestOptions): Promise<APIResponseData<T>> {
    const startTime = Date.now();
    const response = await this.request.put(this.buildURL(path), {
      headers: this.mergeHeaders(options?.headers),
      params: options?.params,
      data: options?.data,
      form: options?.form,
      timeout: options?.timeout,
      failOnStatusCode: options?.failOnStatusCode ?? true,
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors
    });

    return this.handleResponse<T>(response, startTime);
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(path: string, options?: APIRequestOptions): Promise<APIResponseData<T>> {
    const startTime = Date.now();
    const response = await this.request.patch(this.buildURL(path), {
      headers: this.mergeHeaders(options?.headers),
      params: options?.params,
      data: options?.data,
      timeout: options?.timeout,
      failOnStatusCode: options?.failOnStatusCode ?? true,
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors
    });

    return this.handleResponse<T>(response, startTime);
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(path: string, options?: APIRequestOptions): Promise<APIResponseData<T>> {
    const startTime = Date.now();
    const response = await this.request.delete(this.buildURL(path), {
      headers: this.mergeHeaders(options?.headers),
      params: options?.params,
      timeout: options?.timeout,
      failOnStatusCode: options?.failOnStatusCode ?? true,
      ignoreHTTPSErrors: options?.ignoreHTTPSErrors
    });

    return this.handleResponse<T>(response, startTime);
  }

  /**
   * Handle API response
   */
  protected async handleResponse<T>(response: APIResponse, startTime: number): Promise<APIResponseData<T>> {
    const duration = Date.now() - startTime;
    const headers: Record<string, string> = {};
    
    // Convert headers to object
    response.headers().forEach((value: string, key: string) => {
      headers[key] = value;
    });

    let data: T;
    const contentType = headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = await response.text() as any;
    } else {
      data = await response.body() as any;
    }

    return {
      status: response.status(),
      statusText: response.statusText(),
      headers,
      data,
      duration
    };
  }

  /**
   * Wait for condition with polling
   */
  async waitForCondition<T>(
    fn: () => Promise<T>,
    condition: (result: T) => boolean,
    options: {
      timeout?: number;
      interval?: number;
      errorMessage?: string;
    } = {}
  ): Promise<T> {
    const timeout = options.timeout || 30000;
    const interval = options.interval || 1000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await fn();
      if (condition(result)) {
        return result;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(options.errorMessage || `Condition not met within ${timeout}ms`);
  }

  /**
   * Validate response status
   */
  validateStatus(response: APIResponseData, expectedStatus: number | number[]): void {
    const validStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    expect(validStatuses).toContain(response.status);
  }

  /**
   * Validate response contains expected data
   */
  validateResponseContains<T>(response: APIResponseData<T>, expected: Partial<T>): void {
    expect(response.data).toMatchObject(expected);
  }

  /**
   * Validate response time
   */
  validateResponseTime(response: APIResponseData, maxDuration: number): void {
    expect(response.duration).toBeLessThan(maxDuration);
  }

  /**
   * Extract value from response using path
   */
  extractValue<T = any>(response: APIResponseData, path: string): T {
    const keys = path.split('.');
    let value: any = response.data;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        throw new Error(`Path "${path}" not found in response`);
      }
    }

    return value as T;
  }

  /**
   * Create a new API context from page
   */
  static async fromPage(page: Page, config: {
    baseURL: string;
    defaultHeaders?: Record<string, string>;
    authToken?: string;
  }): Promise<BaseAPI> {
    const context = page.context();
    const request = await context.request;
    return new BaseAPI(request, config);
  }
}