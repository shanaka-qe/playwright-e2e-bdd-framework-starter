/**
 * Test Data Seeder
 * 
 * Provides utilities for seeding test data before test runs
 * Creates consistent baseline data for testing
 */

import { PrismaClient } from '@prisma/client';
import { 
  UserFactory, 
  DocumentFactory, 
  ProjectFactory, 
  FeatureFactory,
  TestDataFactory 
} from '../api/builders/TestDataFactory';
import { ChromaDBSeeder } from './ChromaDBSeeder';
import { UserRole, DocumentStatus } from '../api/types';

export interface SeedOptions {
  users?: boolean;
  projects?: boolean;
  documents?: boolean;
  features?: boolean;
  vectors?: boolean;
  minimal?: boolean;
  mark?: boolean; // Mark as seeded data
}

export interface SeedResult {
  users: { count: number; ids: string[] };
  projects: { count: number; ids: string[] };
  documents: { count: number; ids: string[] };
  features: { count: number; ids: string[] };
  vectors?: { count: number; collections: string[] };
  duration: number;
}

export class TestDataSeeder {
  private prisma: PrismaClient;
  private chromaSeeder?: ChromaDBSeeder;
  private seedMarker = { seeded: true, seed_version: '1.0' };

  constructor(
    prisma?: PrismaClient,
    chromaUrl?: string
  ) {
    this.prisma = prisma || new PrismaClient();
    if (chromaUrl) {
      this.chromaSeeder = new ChromaDBSeeder(chromaUrl);
    }
  }

  /**
   * Seed all test data
   */
  async seed(options: SeedOptions = {}): Promise<SeedResult> {
    const startTime = Date.now();
    const result: SeedResult = {
      users: { count: 0, ids: [] },
      projects: { count: 0, ids: [] },
      documents: { count: 0, ids: [] },
      features: { count: 0, ids: [] },
      duration: 0
    };

    try {
      // Start transaction
      await this.prisma.$transaction(async (tx) => {
        // Seed in dependency order
        if (options.users !== false) {
          const users = await this.seedUsers(tx, options);
          result.users = users;
        }

        if (options.projects !== false && result.users.ids.length > 0) {
          const projects = await this.seedProjects(tx, result.users.ids, options);
          result.projects = projects;
        }

        if (options.documents !== false && result.users.ids.length > 0) {
          const documents = await this.seedDocuments(
            tx, 
            result.users.ids,
            result.projects.ids,
            options
          );
          result.documents = documents;
        }

        if (options.features !== false && result.projects.ids.length > 0) {
          const features = await this.seedFeatures(
            tx,
            result.projects.ids,
            result.documents.ids,
            options
          );
          result.features = features;
        }
      });

      // Seed vectors if requested (outside transaction)
      if (options.vectors && this.chromaSeeder && result.documents.ids.length > 0) {
        const vectors = await this.seedVectors(result.documents.ids, options);
        result.vectors = vectors;
      }
    } catch (error) {
      console.error('Seeding failed:', error);
      throw error;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Seed users
   */
  private async seedUsers(
    tx: any,
    options: SeedOptions
  ): Promise<{ count: number; ids: string[] }> {
    const users = options.minimal ? this.getMinimalUsers() : this.getStandardUsers();
    const ids: string[] = [];

    for (const userData of users) {
      const user = await tx.user.create({
        data: {
          ...userData,
          metadata: options.mark ? this.seedMarker : undefined
        }
      });
      ids.push(user.id);
    }

    return { count: users.length, ids };
  }

  /**
   * Seed projects
   */
  private async seedProjects(
    tx: any,
    userIds: string[],
    options: SeedOptions
  ): Promise<{ count: number; ids: string[] }> {
    const projects = options.minimal ? this.getMinimalProjects() : this.getStandardProjects();
    const ids: string[] = [];

    // Assign owners from seeded users
    const adminId = userIds[0]; // First user is admin
    const qaIds = userIds.slice(1, 3); // Next two are QA engineers

    for (let i = 0; i < projects.length; i++) {
      const projectData = projects[i];
      const ownerId = i === 0 ? adminId : qaIds[i % qaIds.length];

      const project = await tx.project.create({
        data: {
          ...projectData,
          owner: ownerId,
          metadata: options.mark ? this.seedMarker : undefined,
          members: {
            create: [
              { userId: ownerId, role: 'owner' },
              ...userIds.slice(0, 3).filter(id => id !== ownerId).map(id => ({
                userId: id,
                role: 'member' as const
              }))
            ]
          }
        }
      });
      ids.push(project.id);
    }

    return { count: projects.length, ids };
  }

  /**
   * Seed documents
   */
  private async seedDocuments(
    tx: any,
    userIds: string[],
    projectIds: string[],
    options: SeedOptions
  ): Promise<{ count: number; ids: string[] }> {
    const documents = options.minimal ? this.getMinimalDocuments() : this.getStandardDocuments();
    const ids: string[] = [];

    for (let i = 0; i < documents.length; i++) {
      const docData = documents[i];
      const uploaderId = userIds[i % userIds.length];
      const projectId = projectIds.length > 0 ? projectIds[i % projectIds.length] : undefined;

      const document = await tx.document.create({
        data: {
          ...docData,
          uploadedBy: uploaderId,
          projectId,
          metadata: options.mark 
            ? { ...docData.metadata, ...this.seedMarker }
            : docData.metadata
        }
      });
      ids.push(document.id);
    }

    return { count: documents.length, ids };
  }

  /**
   * Seed features
   */
  private async seedFeatures(
    tx: any,
    projectIds: string[],
    documentIds: string[],
    options: SeedOptions
  ): Promise<{ count: number; ids: string[] }> {
    const features = options.minimal ? this.getMinimalFeatures() : this.getStandardFeatures();
    const ids: string[] = [];

    for (let i = 0; i < features.length; i++) {
      const featureData = features[i];
      const projectId = projectIds[i % projectIds.length];
      
      // Link to some documents
      const linkedDocs = documentIds.slice(i * 2, (i * 2) + 2);

      const feature = await tx.featureFile.create({
        data: {
          ...featureData,
          projectId,
          documentIds: linkedDocs,
          metadata: options.mark
            ? { ...featureData.metadata, ...this.seedMarker }
            : featureData.metadata
        }
      });
      ids.push(feature.id);
    }

    return { count: features.length, ids };
  }

  /**
   * Seed vectors in ChromaDB
   */
  private async seedVectors(
    documentIds: string[],
    options: SeedOptions
  ): Promise<{ count: number; collections: string[] }> {
    if (!this.chromaSeeder) {
      return { count: 0, collections: [] };
    }

    const collections = ['documents', 'features'];
    let totalCount = 0;

    for (const collection of collections) {
      const count = await this.chromaSeeder.seedCollection(
        collection,
        documentIds,
        {
          mark: options.mark,
          minimal: options.minimal
        }
      );
      totalCount += count;
    }

    return { count: totalCount, collections };
  }

  /**
   * Get minimal user set
   */
  private getMinimalUsers() {
    return [
      UserFactory.admin(),
      UserFactory.qaEngineer(),
      UserFactory.viewer()
    ];
  }

  /**
   * Get standard user set
   */
  private getStandardUsers() {
    return [
      {
        ...UserFactory.admin(),
        email: 'admin.seed@example.com',
        name: 'Seeded Admin'
      },
      {
        ...UserFactory.qaEngineer(),
        email: 'qa1.seed@example.com',
        name: 'Seeded QA Engineer 1'
      },
      {
        ...UserFactory.qaEngineer(),
        email: 'qa2.seed@example.com',
        name: 'Seeded QA Engineer 2'
      },
      {
        ...UserFactory.developer(),
        email: 'dev.seed@example.com',
        name: 'Seeded Developer'
      },
      {
        ...UserFactory.viewer(),
        email: 'viewer.seed@example.com',
        name: 'Seeded Viewer'
      }
    ];
  }

  /**
   * Get minimal project set
   */
  private getMinimalProjects() {
    return [
      {
        ...ProjectFactory.simple(),
        name: 'Seeded Test Project',
        description: 'Minimal seeded project for testing'
      }
    ];
  }

  /**
   * Get standard project set
   */
  private getStandardProjects() {
    return [
      {
        ...ProjectFactory.starter(),
        name: 'Seeded Starter Project',
        description: 'Getting started with Testoria'
      },
      {
        ...ProjectFactory.active(),
        name: 'Seeded Active Project',
        description: 'Active development project'
      },
      {
        ...ProjectFactory.enterprise(),
        name: 'Seeded Enterprise Project',
        description: 'Large-scale test automation'
      }
    ];
  }

  /**
   * Get minimal document set
   */
  private getMinimalDocuments() {
    return [
      {
        ...DocumentFactory.requirements(),
        name: 'Seeded Requirements.pdf'
      },
      {
        ...DocumentFactory.testPlan(),
        name: 'Seeded Test Plan.docx'
      }
    ];
  }

  /**
   * Get standard document set
   */
  private getStandardDocuments() {
    return [
      {
        ...DocumentFactory.requirements(),
        name: 'Seeded Login Requirements.pdf',
        tags: ['authentication', 'security', 'seeded']
      },
      {
        ...DocumentFactory.requirements(),
        name: 'Seeded Payment Requirements.pdf',
        tags: ['payment', 'checkout', 'seeded']
      },
      {
        ...DocumentFactory.testPlan(),
        name: 'Seeded Regression Test Plan.docx',
        tags: ['regression', 'e2e', 'seeded']
      },
      {
        ...DocumentFactory.testPlan(),
        name: 'Seeded Performance Test Plan.docx',
        tags: ['performance', 'load', 'seeded']
      },
      {
        ...DocumentFactory.userStory(),
        name: 'Seeded User Stories Sprint 1.md',
        tags: ['sprint-1', 'agile', 'seeded']
      },
      {
        ...DocumentFactory.userStory(),
        name: 'Seeded User Stories Sprint 2.md',
        tags: ['sprint-2', 'agile', 'seeded']
      }
    ];
  }

  /**
   * Get minimal feature set
   */
  private getMinimalFeatures() {
    return [
      {
        ...FeatureFactory.authFeatureFile(),
        name: 'seeded_authentication.feature'
      }
    ];
  }

  /**
   * Get standard feature set
   */
  private getStandardFeatures() {
    return [
      {
        ...FeatureFactory.authFeatureFile(),
        name: 'seeded_user_login.feature',
        tags: ['authentication', 'smoke', 'seeded']
      },
      {
        ...FeatureFactory.authFeatureFile(),
        name: 'seeded_user_registration.feature',
        tags: ['authentication', 'registration', 'seeded']
      },
      {
        ...FeatureFactory.documentFeatureFile(),
        name: 'seeded_document_upload.feature',
        tags: ['documents', 'upload', 'seeded']
      },
      {
        ...FeatureFactory.documentFeatureFile(),
        name: 'seeded_document_search.feature',
        tags: ['documents', 'search', 'seeded']
      }
    ];
  }

  /**
   * Verify seeded data exists
   */
  async verify(): Promise<{
    users: number;
    projects: number;
    documents: number;
    features: number;
    valid: boolean;
  }> {
    const users = await this.prisma.user.count({
      where: { metadata: { path: ['seeded'], equals: true } }
    });

    const projects = await this.prisma.project.count({
      where: { metadata: { path: ['seeded'], equals: true } }
    });

    const documents = await this.prisma.document.count({
      where: { metadata: { path: ['seeded'], equals: true } }
    });

    const features = await this.prisma.featureFile.count({
      where: { metadata: { path: ['seeded'], equals: true } }
    });

    return {
      users,
      projects,
      documents,
      features,
      valid: users > 0 && projects > 0
    };
  }

  /**
   * Reset seeded data
   */
  async reset(): Promise<void> {
    // Delete in reverse dependency order
    await this.prisma.featureFile.deleteMany({
      where: { metadata: { path: ['seeded'], equals: true } }
    });

    await this.prisma.document.deleteMany({
      where: { metadata: { path: ['seeded'], equals: true } }
    });

    await this.prisma.project.deleteMany({
      where: { metadata: { path: ['seeded'], equals: true } }
    });

    await this.prisma.user.deleteMany({
      where: { metadata: { path: ['seeded'], equals: true } }
    });

    if (this.chromaSeeder) {
      await this.chromaSeeder.resetSeededData();
    }
  }

  /**
   * Disconnect from databases
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * Seed profiles for different test scenarios
 */
export class SeedProfiles {
  static readonly MINIMAL: SeedOptions = {
    minimal: true,
    mark: true
  };

  static readonly STANDARD: SeedOptions = {
    users: true,
    projects: true,
    documents: true,
    features: true,
    mark: true
  };

  static readonly FULL: SeedOptions = {
    users: true,
    projects: true,
    documents: true,
    features: true,
    vectors: true,
    mark: true
  };

  static readonly E2E_SMOKE: SeedOptions = {
    minimal: true,
    mark: true,
    users: true,
    projects: true,
    documents: true
  };

  static readonly E2E_REGRESSION: SeedOptions = {
    users: true,
    projects: true,
    documents: true,
    features: true,
    vectors: true,
    mark: true
  };

  static readonly PERFORMANCE: SeedOptions = {
    users: true,
    projects: true,
    documents: true,
    features: true,
    vectors: false, // Skip vectors for performance tests
    mark: true
  };
}