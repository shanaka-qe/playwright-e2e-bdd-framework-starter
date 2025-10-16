/**
 * Database Cleaner
 * 
 * Provides utilities for cleaning up test data from databases
 * Ensures data isolation between test runs
 */

import { PrismaClient } from '@prisma/client';
import { APIRequestContext } from '@playwright/test';

export interface CleanupOptions {
  preserveSeededData?: boolean;
  cleanupOrder?: string[];
  timeout?: number;
}

export interface CleanupResult {
  tablesCleared: string[];
  recordsDeleted: Record<string, number>;
  duration: number;
  errors?: string[];
}

export class DatabaseCleaner {
  private prisma: PrismaClient;
  private createdIds: Map<string, Set<string>>;
  private cleanupMarker = '__test__';

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.createdIds = new Map();
  }

  /**
   * Track created entity for cleanup
   */
  trackCreated(entityType: string, id: string): void {
    if (!this.createdIds.has(entityType)) {
      this.createdIds.set(entityType, new Set());
    }
    this.createdIds.get(entityType)!.add(id);
  }

  /**
   * Track multiple created entities
   */
  trackCreatedBatch(entityType: string, ids: string[]): void {
    ids.forEach(id => this.trackCreated(entityType, id));
  }

  /**
   * Clean all tracked entities
   */
  async cleanTracked(): Promise<CleanupResult> {
    const startTime = Date.now();
    const result: CleanupResult = {
      tablesCleared: [],
      recordsDeleted: {},
      duration: 0
    };

    try {
      // Clean in reverse order of creation (handle dependencies)
      const cleanupOrder = [
        'featureFileVersions',
        'featureFiles',
        'documents',
        'projectMembers',
        'projects',
        'sessions',
        'users'
      ];

      for (const entityType of cleanupOrder) {
        const ids = this.createdIds.get(entityType);
        if (ids && ids.size > 0) {
          const count = await this.cleanEntity(entityType, Array.from(ids));
          if (count > 0) {
            result.tablesCleared.push(entityType);
            result.recordsDeleted[entityType] = count;
          }
        }
      }

      // Clear tracking
      this.createdIds.clear();
    } catch (error) {
      result.errors = [error.message];
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Clean specific entity type by IDs
   */
  private async cleanEntity(entityType: string, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    switch (entityType) {
      case 'users':
        const userResult = await this.prisma.user.deleteMany({
          where: { id: { in: ids } }
        });
        return userResult.count;

      case 'projects':
        const projectResult = await this.prisma.project.deleteMany({
          where: { id: { in: ids } }
        });
        return projectResult.count;

      case 'documents':
        const docResult = await this.prisma.document.deleteMany({
          where: { id: { in: ids } }
        });
        return docResult.count;

      case 'featureFiles':
        const featureResult = await this.prisma.featureFile.deleteMany({
          where: { id: { in: ids } }
        });
        return featureResult.count;

      case 'featureFileVersions':
        const versionResult = await this.prisma.featureFileVersion.deleteMany({
          where: { featureFileId: { in: ids } }
        });
        return versionResult.count;

      case 'sessions':
        const sessionResult = await this.prisma.session.deleteMany({
          where: { id: { in: ids } }
        });
        return sessionResult.count;

      case 'projectMembers':
        // Handle composite key
        const memberResult = await this.prisma.projectMember.deleteMany({
          where: { projectId: { in: ids } }
        });
        return memberResult.count;

      default:
        console.warn(`Unknown entity type for cleanup: ${entityType}`);
        return 0;
    }
  }

  /**
   * Clean all test data (identified by marker)
   */
  async cleanAllTestData(options?: CleanupOptions): Promise<CleanupResult> {
    const startTime = Date.now();
    const result: CleanupResult = {
      tablesCleared: [],
      recordsDeleted: {},
      duration: 0,
      errors: []
    };

    try {
      // Define cleanup order to handle foreign key constraints
      const cleanupOrder = options?.cleanupOrder || [
        'ingestions',
        'featureFileVersions',
        'featureFiles',
        'documents',
        'projectMembers',
        'projects',
        'sessions',
        'users'
      ];

      for (const table of cleanupOrder) {
        try {
          const count = await this.cleanTestDataFromTable(table, options);
          if (count > 0) {
            result.tablesCleared.push(table);
            result.recordsDeleted[table] = count;
          }
        } catch (error) {
          result.errors!.push(`Error cleaning ${table}: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors!.push(`General cleanup error: ${error.message}`);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Clean test data from specific table
   */
  private async cleanTestDataFromTable(
    table: string, 
    options?: CleanupOptions
  ): Promise<number> {
    const preserveSeeded = options?.preserveSeededData ?? false;
    
    // Build where clause based on test marker
    const whereClause = preserveSeeded
      ? {
          OR: [
            { name: { contains: this.cleanupMarker } },
            { email: { contains: this.cleanupMarker } },
            { description: { contains: this.cleanupMarker } }
          ],
          AND: {
            NOT: {
              metadata: {
                path: ['seeded'],
                equals: true
              }
            }
          }
        }
      : {
          OR: [
            { name: { contains: this.cleanupMarker } },
            { email: { contains: this.cleanupMarker } },
            { description: { contains: this.cleanupMarker } }
          ]
        };

    switch (table) {
      case 'users':
        const users = await this.prisma.user.deleteMany({
          where: whereClause as any
        });
        return users.count;

      case 'projects':
        const projects = await this.prisma.project.deleteMany({
          where: whereClause as any
        });
        return projects.count;

      case 'documents':
        const documents = await this.prisma.document.deleteMany({
          where: whereClause as any
        });
        return documents.count;

      case 'featureFiles':
        const features = await this.prisma.featureFile.deleteMany({
          where: whereClause as any
        });
        return features.count;

      default:
        return 0;
    }
  }

  /**
   * Clean by timestamp (remove data created after a certain time)
   */
  async cleanByTimestamp(since: Date, options?: CleanupOptions): Promise<CleanupResult> {
    const startTime = Date.now();
    const result: CleanupResult = {
      tablesCleared: [],
      recordsDeleted: {},
      duration: 0,
      errors: []
    };

    const tables = [
      'featureFileVersions',
      'featureFiles', 
      'documents',
      'projectMembers',
      'projects',
      'sessions',
      'users'
    ];

    for (const table of tables) {
      try {
        let count = 0;
        
        switch (table) {
          case 'users':
            const users = await this.prisma.user.deleteMany({
              where: { createdAt: { gte: since } }
            });
            count = users.count;
            break;

          case 'projects':
            const projects = await this.prisma.project.deleteMany({
              where: { createdAt: { gte: since } }
            });
            count = projects.count;
            break;

          case 'documents':
            const documents = await this.prisma.document.deleteMany({
              where: { uploadedAt: { gte: since } }
            });
            count = documents.count;
            break;

          case 'featureFiles':
            const features = await this.prisma.featureFile.deleteMany({
              where: { createdAt: { gte: since } }
            });
            count = features.count;
            break;
        }

        if (count > 0) {
          result.tablesCleared.push(table);
          result.recordsDeleted[table] = count;
        }
      } catch (error) {
        result.errors!.push(`Error cleaning ${table}: ${error.message}`);
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * ChromaDB Cleaner for vector database
 */
export class ChromaDBCleaner {
  constructor(
    private chromaUrl: string,
    private request: APIRequestContext
  ) {}

  /**
   * Delete collection
   */
  async deleteCollection(collectionName: string): Promise<void> {
    await this.request.delete(`${this.chromaUrl}/api/v1/collections/${collectionName}`);
  }

  /**
   * Delete documents by metadata filter
   */
  async deleteDocumentsByMetadata(
    collectionName: string,
    metadataFilter: Record<string, any>
  ): Promise<number> {
    // Get documents matching filter
    const response = await this.request.post(
      `${this.chromaUrl}/api/v1/collections/${collectionName}/query`,
      {
        data: {
          where: metadataFilter,
          n_results: 10000
        }
      }
    );

    const result = await response.json();
    const ids = result.ids?.[0] || [];

    if (ids.length > 0) {
      // Delete documents
      await this.request.post(
        `${this.chromaUrl}/api/v1/collections/${collectionName}/delete`,
        {
          data: { ids }
        }
      );
    }

    return ids.length;
  }

  /**
   * Clean test vectors
   */
  async cleanTestVectors(options?: { marker?: string }): Promise<{
    collectionsCleared: string[];
    vectorsDeleted: number;
  }> {
    const marker = options?.marker || '__test__';
    const collections = ['documents', 'features'];
    let totalDeleted = 0;
    const clearedCollections: string[] = [];

    for (const collection of collections) {
      try {
        const count = await this.deleteDocumentsByMetadata(collection, {
          test_marker: marker
        });
        
        if (count > 0) {
          totalDeleted += count;
          clearedCollections.push(collection);
        }
      } catch (error) {
        console.warn(`Failed to clean collection ${collection}:`, error);
      }
    }

    return {
      collectionsCleared: clearedCollections,
      vectorsDeleted: totalDeleted
    };
  }
}

/**
 * Composite cleaner for all databases
 */
export class TestDataCleaner {
  private dbCleaner: DatabaseCleaner;
  private chromaCleaner?: ChromaDBCleaner;

  constructor(
    prisma?: PrismaClient,
    chromaConfig?: { url: string; request: APIRequestContext }
  ) {
    this.dbCleaner = new DatabaseCleaner(prisma);
    if (chromaConfig) {
      this.chromaCleaner = new ChromaDBCleaner(
        chromaConfig.url,
        chromaConfig.request
      );
    }
  }

  /**
   * Track created entities
   */
  track(entityType: string, ids: string | string[]): void {
    if (Array.isArray(ids)) {
      this.dbCleaner.trackCreatedBatch(entityType, ids);
    } else {
      this.dbCleaner.trackCreated(entityType, ids);
    }
  }

  /**
   * Clean all tracked data
   */
  async clean(): Promise<{
    database: CleanupResult;
    vectors?: { collectionsCleared: string[]; vectorsDeleted: number };
  }> {
    const dbResult = await this.dbCleaner.cleanTracked();
    
    let vectorResult;
    if (this.chromaCleaner) {
      vectorResult = await this.chromaCleaner.cleanTestVectors();
    }

    return {
      database: dbResult,
      vectors: vectorResult
    };
  }

  /**
   * Clean all test data by marker
   */
  async cleanAll(options?: CleanupOptions): Promise<{
    database: CleanupResult;
    vectors?: { collectionsCleared: string[]; vectorsDeleted: number };
  }> {
    const dbResult = await this.dbCleaner.cleanAllTestData(options);
    
    let vectorResult;
    if (this.chromaCleaner) {
      vectorResult = await this.chromaCleaner.cleanTestVectors();
    }

    return {
      database: dbResult,
      vectors: vectorResult
    };
  }

  /**
   * Disconnect cleaners
   */
  async disconnect(): Promise<void> {
    await this.dbCleaner.disconnect();
  }
}