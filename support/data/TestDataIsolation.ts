/**
 * Test Data Isolation
 * 
 * Provides mechanisms for isolating test data between test runs
 * Ensures tests don't interfere with each other
 */

import { v4 as uuidv4 } from 'uuid';
import { TestInfo } from '@playwright/test';

export interface IsolationContext {
  testId: string;
  suiteId: string;
  runId: string;
  timestamp: Date;
  namespace: string;
  tags: Map<string, string>;
}

export interface IsolatedData<T> {
  data: T;
  context: IsolationContext;
  metadata: Record<string, any>;
}

export class TestDataIsolation {
  private static runId = uuidv4();
  private static contexts = new Map<string, IsolationContext>();

  /**
   * Create isolation context for a test
   */
  static createContext(testInfo: TestInfo): IsolationContext {
    const testId = this.generateTestId(testInfo);
    const suiteId = this.generateSuiteId(testInfo);
    
    const context: IsolationContext = {
      testId,
      suiteId,
      runId: this.runId,
      timestamp: new Date(),
      namespace: this.generateNamespace(testInfo),
      tags: new Map([
        ['test_title', testInfo.title],
        ['test_file', testInfo.file],
        ['worker_index', testInfo.workerIndex.toString()],
        ['parallel_index', testInfo.parallelIndex.toString()],
        ['retry', testInfo.retry.toString()]
      ])
    };

    this.contexts.set(testId, context);
    return context;
  }

  /**
   * Get existing context
   */
  static getContext(testId: string): IsolationContext | undefined {
    return this.contexts.get(testId);
  }

  /**
   * Generate unique test ID
   */
  private static generateTestId(testInfo: TestInfo): string {
    const components = [
      testInfo.project.name,
      testInfo.file,
      testInfo.title,
      testInfo.retry.toString()
    ];
    return this.hashString(components.join('::'));
  }

  /**
   * Generate suite ID
   */
  private static generateSuiteId(testInfo: TestInfo): string {
    const components = [
      testInfo.project.name,
      testInfo.file
    ];
    return this.hashString(components.join('::'));
  }

  /**
   * Generate namespace for data isolation
   */
  private static generateNamespace(testInfo: TestInfo): string {
    const timestamp = Date.now().toString(36);
    const worker = testInfo.workerIndex.toString(36);
    const retry = testInfo.retry.toString(36);
    
    return `test_${timestamp}_${worker}_${retry}`;
  }

  /**
   * Hash string to create consistent ID
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Isolate data with context
   */
  static isolate<T>(data: T, context: IsolationContext): IsolatedData<T> {
    return {
      data: this.applyIsolation(data, context),
      context,
      metadata: {
        isolated_at: new Date().toISOString(),
        isolation_version: '1.0'
      }
    };
  }

  /**
   * Apply isolation to data
   */
  private static applyIsolation<T>(data: T, context: IsolationContext): T {
    if (typeof data === 'string') {
      return this.isolateString(data, context) as any;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.applyIsolation(item, context)) as any;
    }
    
    if (data && typeof data === 'object') {
      const isolated: any = {};
      for (const [key, value] of Object.entries(data)) {
        isolated[key] = this.shouldIsolateField(key) 
          ? this.applyIsolation(value, context)
          : value;
      }
      return isolated;
    }
    
    return data;
  }

  /**
   * Isolate string value
   */
  private static isolateString(value: string, context: IsolationContext): string {
    // Add namespace prefix to certain patterns
    const patterns = [
      { regex: /^(test|user|admin|qa)@/, replacement: `${context.namespace}_$1@` },
      { regex: /^(Test|Demo|Sample)\s+/, replacement: `${context.namespace} $1 ` },
      { regex: /__test__/, replacement: `__test_${context.namespace}__` }
    ];

    let isolated = value;
    for (const pattern of patterns) {
      isolated = isolated.replace(pattern.regex, pattern.replacement);
    }

    return isolated;
  }

  /**
   * Check if field should be isolated
   */
  private static shouldIsolateField(fieldName: string): boolean {
    const isolatableFields = [
      'name', 'title', 'email', 'username', 'description',
      'projectName', 'fileName', 'featureName'
    ];
    
    return isolatableFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  /**
   * Create isolated email
   */
  static createIsolatedEmail(baseEmail: string, context: IsolationContext): string {
    const [localPart, domain] = baseEmail.split('@');
    return `${context.namespace}_${localPart}@${domain}`;
  }

  /**
   * Create isolated name
   */
  static createIsolatedName(baseName: string, context: IsolationContext): string {
    return `[${context.namespace}] ${baseName}`;
  }

  /**
   * Extract namespace from isolated value
   */
  static extractNamespace(value: string): string | null {
    const patterns = [
      /^(test_[a-z0-9]+_[a-z0-9]+_[a-z0-9]+)_/,
      /\[(test_[a-z0-9]+_[a-z0-9]+_[a-z0-9]+)\]/,
      /__test_(test_[a-z0-9]+_[a-z0-9]+_[a-z0-9]+)__/
    ];

    for (const pattern of patterns) {
      const match = value.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Clean up contexts for a run
   */
  static cleanup(runId?: string): void {
    if (runId) {
      for (const [key, context] of this.contexts.entries()) {
        if (context.runId === runId) {
          this.contexts.delete(key);
        }
      }
    } else {
      this.contexts.clear();
    }
  }
}

/**
 * Data isolation decorators for test data builders
 */
export class IsolationDecorator {
  constructor(private context: IsolationContext) {}

  /**
   * Decorate string value
   */
  string(value: string): string {
    return TestDataIsolation.isolateString(value, this.context);
  }

  /**
   * Decorate email
   */
  email(baseEmail: string): string {
    return TestDataIsolation.createIsolatedEmail(baseEmail, this.context);
  }

  /**
   * Decorate name
   */
  name(baseName: string): string {
    return TestDataIsolation.createIsolatedName(baseName, this.context);
  }

  /**
   * Decorate object
   */
  object<T extends object>(obj: T): T {
    return TestDataIsolation.applyIsolation(obj, this.context);
  }

  /**
   * Add test marker to object
   */
  withTestMarker<T extends object>(obj: T): T & { __testMarker: string } {
    return {
      ...obj,
      __testMarker: `${this.context.namespace}_${this.context.testId}`
    };
  }
}

/**
 * Isolated test data builder base class
 */
export abstract class IsolatedBuilder<T> {
  protected isolator: IsolationDecorator;
  protected data: Partial<T> = {};

  constructor(protected context: IsolationContext) {
    this.isolator = new IsolationDecorator(context);
  }

  /**
   * Build isolated data
   */
  build(): T {
    const isolated = this.isolator.object(this.data);
    return this.isolator.withTestMarker(isolated) as T;
  }

  /**
   * Get isolation context
   */
  getContext(): IsolationContext {
    return this.context;
  }
}

/**
 * Test data namespace manager
 */
export class NamespaceManager {
  private static namespaces = new Map<string, Set<string>>();

  /**
   * Register entity in namespace
   */
  static register(namespace: string, entityType: string, entityId: string): void {
    const key = `${namespace}:${entityType}`;
    if (!this.namespaces.has(key)) {
      this.namespaces.set(key, new Set());
    }
    this.namespaces.get(key)!.add(entityId);
  }

  /**
   * Get entities in namespace
   */
  static getEntities(namespace: string, entityType: string): string[] {
    const key = `${namespace}:${entityType}`;
    const entities = this.namespaces.get(key);
    return entities ? Array.from(entities) : [];
  }

  /**
   * Get all entities in namespace
   */
  static getAllInNamespace(namespace: string): Map<string, string[]> {
    const result = new Map<string, string[]>();
    
    for (const [key, entities] of this.namespaces.entries()) {
      if (key.startsWith(`${namespace}:`)) {
        const entityType = key.split(':')[1];
        result.set(entityType, Array.from(entities));
      }
    }
    
    return result;
  }

  /**
   * Clear namespace
   */
  static clearNamespace(namespace: string): void {
    for (const key of this.namespaces.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        this.namespaces.delete(key);
      }
    }
  }

  /**
   * Clear all namespaces
   */
  static clearAll(): void {
    this.namespaces.clear();
  }
}

/**
 * Test transaction manager for rollback capability
 */
export class TestTransaction {
  private operations: Array<() => Promise<void>> = [];
  private rollbacks: Array<() => Promise<void>> = [];

  /**
   * Add operation with rollback
   */
  addOperation(
    operation: () => Promise<void>,
    rollback: () => Promise<void>
  ): void {
    this.operations.push(operation);
    this.rollbacks.push(rollback);
  }

  /**
   * Execute all operations
   */
  async execute(): Promise<void> {
    const executedCount = 0;
    
    try {
      for (let i = 0; i < this.operations.length; i++) {
        await this.operations[i]();
      }
    } catch (error) {
      // Rollback in reverse order
      for (let i = executedCount - 1; i >= 0; i--) {
        try {
          await this.rollbacks[i]();
        } catch (rollbackError) {
          console.error(`Rollback failed at index ${i}:`, rollbackError);
        }
      }
      throw error;
    }
  }

  /**
   * Clear transaction
   */
  clear(): void {
    this.operations = [];
    this.rollbacks = [];
  }
}