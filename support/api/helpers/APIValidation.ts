/**
 * API Validation Helpers
 * 
 * Provides validation and assertion methods for API testing
 * Includes schema validation, response validation, and custom assertions
 */

import { expect } from '@playwright/test';
import { APIResponseData } from '../BaseAPI';

export class APIValidation {
  /**
   * Validate response status code
   */
  static expectStatus(response: APIResponseData, expectedStatus: number | number[]): void {
    const validStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    expect(validStatuses).toContain(response.status);
  }

  /**
   * Validate successful response (2xx)
   */
  static expectSuccess(response: APIResponseData): void {
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
  }

  /**
   * Validate error response (4xx or 5xx)
   */
  static expectError(response: APIResponseData): void {
    expect(response.status).toBeGreaterThanOrEqual(400);
  }

  /**
   * Validate response time
   */
  static expectResponseTime(response: APIResponseData, maxMs: number): void {
    expect(response.duration).toBeLessThan(maxMs);
  }

  /**
   * Validate response headers
   */
  static expectHeaders(response: APIResponseData, expectedHeaders: Record<string, string>): void {
    for (const [key, value] of Object.entries(expectedHeaders)) {
      expect(response.headers[key.toLowerCase()]).toBe(value);
    }
  }

  /**
   * Validate content type
   */
  static expectContentType(response: APIResponseData, contentType: string): void {
    expect(response.headers['content-type']).toContain(contentType);
  }

  /**
   * Validate JSON response
   */
  static expectJSON(response: APIResponseData): void {
    this.expectContentType(response, 'application/json');
    expect(() => JSON.stringify(response.data)).not.toThrow();
  }

  /**
   * Validate response contains fields
   */
  static expectFields<T>(response: APIResponseData<T>, fields: (keyof T)[]): void {
    for (const field of fields) {
      expect(response.data).toHaveProperty(field);
    }
  }

  /**
   * Validate response matches schema
   */
  static expectSchema<T>(response: APIResponseData<T>, schema: Record<string, any>): void {
    this.validateSchema(response.data, schema);
  }

  /**
   * Validate array response
   */
  static expectArray(response: APIResponseData): void {
    expect(Array.isArray(response.data)).toBe(true);
  }

  /**
   * Validate array length
   */
  static expectArrayLength(response: APIResponseData<any[]>, length: number): void {
    this.expectArray(response);
    expect(response.data.length).toBe(length);
  }

  /**
   * Validate array min length
   */
  static expectArrayMinLength(response: APIResponseData<any[]>, minLength: number): void {
    this.expectArray(response);
    expect(response.data.length).toBeGreaterThanOrEqual(minLength);
  }

  /**
   * Validate pagination response
   */
  static expectPagination(response: APIResponseData<any>, expectedPage: {
    page?: number;
    pageSize?: number;
    total?: number;
  }): void {
    if (expectedPage.page !== undefined) {
      expect(response.data.page).toBe(expectedPage.page);
    }
    if (expectedPage.pageSize !== undefined) {
      expect(response.data.pageSize).toBe(expectedPage.pageSize);
    }
    if (expectedPage.total !== undefined) {
      expect(response.data.total).toBe(expectedPage.total);
    }
  }

  /**
   * Validate error response structure
   */
  static expectErrorResponse(response: APIResponseData, expectedError?: {
    code?: string;
    message?: string;
    field?: string;
  }): void {
    expect(response.data).toHaveProperty('error');
    
    if (expectedError?.code) {
      expect(response.data.error.code).toBe(expectedError.code);
    }
    if (expectedError?.message) {
      expect(response.data.error.message).toContain(expectedError.message);
    }
    if (expectedError?.field) {
      expect(response.data.error.field).toBe(expectedError.field);
    }
  }

  /**
   * Validate response contains text
   */
  static expectContainsText(response: APIResponseData, text: string): void {
    const responseText = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data);
    expect(responseText).toContain(text);
  }

  /**
   * Validate response does not contain text
   */
  static expectNotContainsText(response: APIResponseData, text: string): void {
    const responseText = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data);
    expect(responseText).not.toContain(text);
  }

  /**
   * Validate date field
   */
  static expectValidDate(value: any): void {
    expect(new Date(value).toString()).not.toBe('Invalid Date');
  }

  /**
   * Validate UUID format
   */
  static expectUUID(value: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(value).toMatch(uuidRegex);
  }

  /**
   * Validate email format
   */
  static expectEmail(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(value).toMatch(emailRegex);
  }

  /**
   * Validate URL format
   */
  static expectURL(value: string): void {
    expect(() => new URL(value)).not.toThrow();
  }

  /**
   * Validate enum value
   */
  static expectEnum<T>(value: T, validValues: T[]): void {
    expect(validValues).toContain(value);
  }

  /**
   * Validate numeric range
   */
  static expectInRange(value: number, min: number, max: number): void {
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  }

  /**
   * Validate string length
   */
  static expectStringLength(value: string, min?: number, max?: number): void {
    if (min !== undefined) {
      expect(value.length).toBeGreaterThanOrEqual(min);
    }
    if (max !== undefined) {
      expect(value.length).toBeLessThanOrEqual(max);
    }
  }

  /**
   * Validate object schema recursively
   */
  private static validateSchema(data: any, schema: Record<string, any>, path = ''): void {
    for (const [key, expectedType] of Object.entries(schema)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (expectedType === 'required') {
        expect(data).toHaveProperty(key);
        continue;
      }

      if (typeof expectedType === 'string') {
        if (data[key] !== undefined) {
          expect(typeof data[key]).toBe(expectedType);
        }
      } else if (typeof expectedType === 'object' && expectedType !== null) {
        if (data[key] !== undefined) {
          this.validateSchema(data[key], expectedType, currentPath);
        }
      }
    }
  }

  /**
   * Custom assertion for sorted array
   */
  static expectSorted<T>(array: T[], key?: keyof T, order: 'asc' | 'desc' = 'asc'): void {
    for (let i = 1; i < array.length; i++) {
      const prev = key ? array[i - 1][key] : array[i - 1];
      const curr = key ? array[i][key] : array[i];
      
      if (order === 'asc') {
        expect(curr >= prev).toBe(true);
      } else {
        expect(curr <= prev).toBe(true);
      }
    }
  }

  /**
   * Validate unique values in array
   */
  static expectUnique<T>(array: T[], key?: keyof T): void {
    const values = key ? array.map(item => item[key]) : array;
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  }

  /**
   * Validate all items match condition
   */
  static expectAll<T>(array: T[], condition: (item: T) => boolean): void {
    for (const item of array) {
      expect(condition(item)).toBe(true);
    }
  }

  /**
   * Validate at least one item matches condition
   */
  static expectSome<T>(array: T[], condition: (item: T) => boolean): void {
    const hasMatch = array.some(condition);
    expect(hasMatch).toBe(true);
  }

  /**
   * Validate response matches snapshot
   */
  static expectSnapshot(response: APIResponseData, snapshotName: string): void {
    // Remove dynamic fields before snapshot comparison
    const snapshot = {
      status: response.status,
      data: this.removeDynamicFields(response.data)
    };
    expect(snapshot).toMatchSnapshot(snapshotName);
  }

  /**
   * Remove dynamic fields for snapshot testing
   */
  private static removeDynamicFields(data: any): any {
    const dynamicFields = ['id', 'createdAt', 'updatedAt', 'timestamp', 'token', 'sessionId'];
    
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.removeDynamicFields(item));
    }

    const cleaned = { ...data };
    for (const field of dynamicFields) {
      delete cleaned[field];
    }

    for (const [key, value] of Object.entries(cleaned)) {
      if (typeof value === 'object' && value !== null) {
        cleaned[key] = this.removeDynamicFields(value);
      }
    }

    return cleaned;
  }
}

/**
 * Chainable API assertions
 */
export class ChainableAPIAssertion<T = any> {
  constructor(private response: APIResponseData<T>) {}

  status(expected: number | number[]): this {
    APIValidation.expectStatus(this.response, expected);
    return this;
  }

  success(): this {
    APIValidation.expectSuccess(this.response);
    return this;
  }

  error(): this {
    APIValidation.expectError(this.response);
    return this;
  }

  responseTime(maxMs: number): this {
    APIValidation.expectResponseTime(this.response, maxMs);
    return this;
  }

  headers(expected: Record<string, string>): this {
    APIValidation.expectHeaders(this.response, expected);
    return this;
  }

  contentType(type: string): this {
    APIValidation.expectContentType(this.response, type);
    return this;
  }

  json(): this {
    APIValidation.expectJSON(this.response);
    return this;
  }

  fields(fields: (keyof T)[]): this {
    APIValidation.expectFields(this.response, fields);
    return this;
  }

  schema(schema: Record<string, any>): this {
    APIValidation.expectSchema(this.response, schema);
    return this;
  }

  array(): this {
    APIValidation.expectArray(this.response);
    return this;
  }

  arrayLength(length: number): this {
    APIValidation.expectArrayLength(this.response as APIResponseData<any[]>, length);
    return this;
  }

  arrayMinLength(minLength: number): this {
    APIValidation.expectArrayMinLength(this.response as APIResponseData<any[]>, minLength);
    return this;
  }

  contains(text: string): this {
    APIValidation.expectContainsText(this.response, text);
    return this;
  }

  notContains(text: string): this {
    APIValidation.expectNotContainsText(this.response, text);
    return this;
  }

  snapshot(name: string): this {
    APIValidation.expectSnapshot(this.response, name);
    return this;
  }

  get data(): T {
    return this.response.data;
  }
}

/**
 * Create chainable assertion
 */
export function expectAPI<T = any>(response: APIResponseData<T>): ChainableAPIAssertion<T> {
  return new ChainableAPIAssertion(response);
}