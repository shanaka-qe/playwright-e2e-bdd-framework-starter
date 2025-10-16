/**
 * Test Data Manager
 * 
 * Central manager for all test data operations
 * Coordinates seeding, isolation, and cleanup
 */

import { TestInfo, APIRequestContext } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { TestDataSeeder, SeedOptions, SeedProfiles } from './TestDataSeeder';
import { TestDataCleaner } from './DatabaseCleaner';
import { TestDataIsolation, IsolationContext } from './TestDataIsolation';
import { TestDataFactory } from '../api/builders/TestDataFactory';

export interface TestDataConfig {
  prisma?: PrismaClient;
  chromaUrl?: string;
  apiRequest?: APIRequestContext;
  autoCleanup?: boolean;
  isolationEnabled?: boolean;
  seedProfile?: SeedOptions;
}

export class TestDataManager {
  private seeder: TestDataSeeder;
  private cleaner: TestDataCleaner;
  private isolation: typeof TestDataIsolation;
  private context?: IsolationContext;
  private config: TestDataConfig;

  constructor(config: TestDataConfig = {}) {
    this.config = {
      autoCleanup: true,
      isolationEnabled: true,
      ...config
    };

    this.seeder = new TestDataSeeder(
      config.prisma,
      config.chromaUrl
    );

    this.cleaner = new TestDataCleaner(
      config.prisma,
      config.chromaUrl && config.apiRequest
        ? { url: config.chromaUrl, request: config.apiRequest }
        : undefined
    );

    this.isolation = TestDataIsolation;
  }

  /**
   * Initialize for a test
   */
  async initialize(testInfo: TestInfo): Promise<void> {
    if (this.config.isolationEnabled) {
      this.context = TestDataIsolation.createContext(testInfo);
    }

    // Seed data if profile is specified
    if (this.config.seedProfile) {
      await this.seed(this.config.seedProfile);
    }
  }

  /**
   * Get isolation context
   */
  getContext(): IsolationContext | undefined {
    return this.context;
  }

  /**
   * Create isolated test data
   */
  createTestData(options?: {
    isolated?: boolean;
    tracked?: boolean;
  }) {
    const factory = TestDataFactory;
    
    if (options?.isolated && this.context) {
      // Apply isolation to factory methods
      return {
        createFullDataSet: () => {
          const data = factory.createFullDataSet();
          return this.isolation.isolate(data, this.context!);
        },
        createProjectData: (opts?: any) => {
          const data = factory.createProjectData(opts);
          return this.isolation.isolate(data, this.context!);
        },
        createMinimalData: () => {
          const data = factory.createMinimalData();
          return this.isolation.isolate(data, this.context!);
        },
        createAuthTestData: () => {
          const data = factory.createAuthTestData();
          return this.isolation.isolate(data, this.context!);
        }
      };
    }

    return factory;
  }

  /**
   * Track created entities
   */
  track(entityType: string, ids: string | string[]): void {
    this.cleaner.track(entityType, ids);
  }

  /**
   * Track from test data
   */
  trackTestData(data: any): void {
    const ids = TestDataFactory.getCleanupIds(data);
    
    this.track('users', ids.userIds);
    this.track('projects', ids.projectIds);
    this.track('documents', ids.documentIds);
    this.track('features', ids.featureIds);
  }

  /**
   * Seed test data
   */
  async seed(options?: SeedOptions): Promise<void> {
    const profile = options || this.config.seedProfile || SeedProfiles.MINIMAL;
    await this.seeder.seed(profile);
  }

  /**
   * Verify seeded data
   */
  async verifySeeded(): Promise<boolean> {
    const result = await this.seeder.verify();
    return result.valid;
  }

  /**
   * Clean tracked data
   */
  async clean(): Promise<void> {
    if (this.config.autoCleanup) {
      await this.cleaner.clean();
    }
  }

  /**
   * Clean all test data
   */
  async cleanAll(): Promise<void> {
    await this.cleaner.cleanAll();
  }

  /**
   * Reset seeded data
   */
  async resetSeeded(): Promise<void> {
    await this.seeder.reset();
  }

  /**
   * Cleanup after test
   */
  async cleanup(): Promise<void> {
    // Clean tracked data
    await this.clean();

    // Clear isolation context
    if (this.context) {
      TestDataIsolation.cleanup(this.context.runId);
      this.context = undefined;
    }
  }

  /**
   * Disconnect from databases
   */
  async disconnect(): Promise<void> {
    await this.seeder.disconnect();
    await this.cleaner.disconnect();
  }

  /**
   * Create snapshot of current data
   */
  async createSnapshot(name: string): Promise<DataSnapshot> {
    const prisma = this.config.prisma || new PrismaClient();
    
    const snapshot: DataSnapshot = {
      name,
      timestamp: new Date(),
      data: {
        users: await prisma.user.count(),
        projects: await prisma.project.count(),
        documents: await prisma.document.count(),
        features: await prisma.featureFile.count()
      }
    };

    return snapshot;
  }

  /**
   * Compare snapshots
   */
  compareSnapshots(before: DataSnapshot, after: DataSnapshot): SnapshotDiff {
    const diff: SnapshotDiff = {
      name: `${before.name} -> ${after.name}`,
      changes: {}
    };

    for (const [key, beforeCount] of Object.entries(before.data)) {
      const afterCount = after.data[key as keyof typeof after.data];
      const change = afterCount - beforeCount;
      
      if (change !== 0) {
        diff.changes[key] = {
          before: beforeCount,
          after: afterCount,
          change
        };
      }
    }

    return diff;
  }
}

/**
 * Test data lifecycle hooks
 */
export class TestDataHooks {
  private manager: TestDataManager;

  constructor(config?: TestDataConfig) {
    this.manager = new TestDataManager(config);
  }

  /**
   * Before all tests
   */
  async beforeAll(): Promise<void> {
    // Verify or create seeded data
    const hasSeeded = await this.manager.verifySeeded();
    if (!hasSeeded) {
      console.log('Creating seeded test data...');
      await this.manager.seed(SeedProfiles.STANDARD);
    }
  }

  /**
   * Before each test
   */
  async beforeEach(testInfo: TestInfo): Promise<TestDataManager> {
    await this.manager.initialize(testInfo);
    return this.manager;
  }

  /**
   * After each test
   */
  async afterEach(): Promise<void> {
    await this.manager.cleanup();
  }

  /**
   * After all tests
   */
  async afterAll(options?: { preserveSeeded?: boolean }): Promise<void> {
    if (!options?.preserveSeeded) {
      await this.manager.cleanAll();
    }
    await this.manager.disconnect();
  }
}

/**
 * Types
 */
export interface DataSnapshot {
  name: string;
  timestamp: Date;
  data: {
    users: number;
    projects: number;
    documents: number;
    features: number;
  };
}

export interface SnapshotDiff {
  name: string;
  changes: Record<string, {
    before: number;
    after: number;
    change: number;
  }>;
}

/**
 * Test data fixtures for Playwright
 */
export const testDataFixtures = {
  testData: async ({ page }, use, testInfo) => {
    const config: TestDataConfig = {
      chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
      apiRequest: page.context().request,
      autoCleanup: true,
      isolationEnabled: true,
      seedProfile: SeedProfiles.MINIMAL
    };

    const hooks = new TestDataHooks(config);
    const manager = await hooks.beforeEach(testInfo);

    await use(manager);

    await hooks.afterEach();
  }
};

// Export for convenience
export { SeedProfiles, TestDataFactory };