/**
 * Test Data Factory
 * 
 * Central factory for creating test data across all domains
 * Provides convenient methods for creating related data sets
 */

import { DocumentFactory, aDocument } from './DocumentBuilder';
import { UserFactory, aUser, anAdminUser } from './UserBuilder';
import { FeatureFactory, aFeature, aFeatureFile } from './FeatureBuilder';
import { ProjectFactory, aProject } from './ProjectBuilder';
import { 
  Document, 
  UserProfile, 
  Project, 
  FeatureFile,
  DocumentStatus,
  UserRole 
} from '../types';
import { faker } from '@faker-js/faker';

export interface TestDataSet {
  users: UserProfile[];
  projects: Project[];
  documents: Document[];
  features: FeatureFile[];
}

export interface ProjectTestData {
  project: Project;
  owner: UserProfile;
  members: UserProfile[];
  documents: Document[];
  features: FeatureFile[];
}

export class TestDataFactory {
  /**
   * Create a complete test data set with related entities
   */
  static createFullDataSet(): TestDataSet {
    // Create users
    const users = UserFactory.team(5);
    const owner = users.find(u => u.role === UserRole.ADMIN)!;
    const qaEngineers = users.filter(u => u.role === UserRole.QA_ENGINEER);
    
    // Create projects
    const projects = [
      aProject()
        .withOwner(owner.id)
        .withMembers(users.length - 1)
        .asActiveProject()
        .build(),
      aProject()
        .withOwner(qaEngineers[0].id)
        .withTeam(3)
        .build()
    ];
    
    // Create documents for each project
    const documents: Document[] = [];
    for (const project of projects) {
      documents.push(
        aDocument()
          .asRequirementsDoc()
          .withUploadedBy(owner.id)
          .build(),
        aDocument()
          .asTestPlan()
          .withUploadedBy(qaEngineers[0].id)
          .build(),
        aDocument()
          .asUserStory()
          .withUploadedBy(qaEngineers[1]?.id || owner.id)
          .build()
      );
    }
    
    // Create features from documents
    const features: FeatureFile[] = [];
    for (let i = 0; i < projects.length; i++) {
      const projectDocs = documents.slice(i * 3, (i + 1) * 3);
      features.push(
        aFeatureFile()
          .withFeature(aFeature().asAuthenticationFeature())
          .withProjectId(projects[i].id)
          .withDocumentIds(...projectDocs.map(d => d.id))
          .build(),
        aFeatureFile()
          .withFeature(aFeature().asDocumentManagementFeature())
          .withProjectId(projects[i].id)
          .withDocumentIds(...projectDocs.map(d => d.id))
          .build()
      );
    }
    
    return {
      users,
      projects,
      documents,
      features
    };
  }

  /**
   * Create test data for a single project
   */
  static createProjectData(options?: {
    teamSize?: number;
    documentCount?: number;
    featureCount?: number;
  }): ProjectTestData {
    const teamSize = options?.teamSize || 5;
    const documentCount = options?.documentCount || 10;
    const featureCount = options?.featureCount || 5;
    
    // Create team
    const owner = aUser().asAdmin().build();
    const members = [
      aUser().asQAEngineer().build(),
      aUser().asQAEngineer().build(),
      aUser().asDeveloper().build(),
      ...Array(Math.max(0, teamSize - 4)).fill(null).map(() => 
        aUser().withRole(faker.helpers.arrayElement([UserRole.DEVELOPER, UserRole.VIEWER])).build()
      )
    ];
    
    // Create project
    const project = aProject()
      .withOwner(owner.id)
      .withDefaultSettings()
      .build();
    
    // Add members to project
    for (const member of members) {
      project.members.push({
        userId: member.id,
        role: member.role === UserRole.VIEWER ? 'viewer' : 'member',
        joinedAt: faker.date.between({ 
          from: project.createdAt, 
          to: new Date() 
        }).toISOString()
      });
    }
    
    // Create documents
    const documents: Document[] = [];
    const uploaders = [owner, ...members.filter(m => m.role !== UserRole.VIEWER)];
    
    for (let i = 0; i < documentCount; i++) {
      const uploader = faker.helpers.arrayElement(uploaders);
      const docBuilder = aDocument().withUploadedBy(uploader.id);
      
      // Vary document types and status
      if (i === 0) {
        documents.push(docBuilder.asRequirementsDoc().build());
      } else if (i === 1) {
        documents.push(docBuilder.asTestPlan().build());
      } else if (i % 3 === 0) {
        documents.push(docBuilder.asUserStory().build());
      } else if (i % 4 === 0) {
        documents.push(docBuilder.asFailed().build());
      } else {
        documents.push(docBuilder.asProcessed().build());
      }
    }
    
    // Create features from processed documents
    const processedDocs = documents.filter(d => d.status === DocumentStatus.PROCESSED);
    const features: FeatureFile[] = [];
    
    for (let i = 0; i < Math.min(featureCount, processedDocs.length); i++) {
      const relatedDocs = faker.helpers.arrayElements(processedDocs, { min: 1, max: 3 });
      const creator = faker.helpers.arrayElement(uploaders);
      
      features.push(
        aFeatureFile()
          .withFeature(
            i % 2 === 0 
              ? aFeature().asAuthenticationFeature()
              : aFeature().asDocumentManagementFeature()
          )
          .withProjectId(project.id)
          .withDocumentIds(...relatedDocs.map(d => d.id))
          .build()
      );
    }
    
    // Update project statistics
    project.statistics = {
      documentCount: documents.length,
      featureCount: features.length,
      scenarioCount: features.reduce((sum, f) => 
        sum + (f.metadata?.scenarioCount || 0), 0
      ),
      lastActivity: new Date().toISOString()
    };
    
    return {
      project,
      owner,
      members,
      documents,
      features
    };
  }

  /**
   * Create minimal test data for quick tests
   */
  static createMinimalData() {
    const user = UserFactory.qaEngineer;
    const project = ProjectFactory.simple;
    const document = DocumentFactory.processedPDF;
    const feature = FeatureFactory.authFeatureFile;
    
    return {
      user,
      project,
      document,
      feature
    };
  }

  /**
   * Create data for authentication testing
   */
  static createAuthTestData() {
    return {
      validUser: aUser()
        .withEmail('test@example.com')
        .withName('Test User')
        .build(),
      adminUser: aUser()
        .withEmail('admin@example.com')
        .withName('Admin User')
        .asAdmin()
        .build(),
      suspendedUser: anAdminUser()
        .withEmail('suspended@example.com')
        .asSuspended()
        .build(),
      unverifiedUser: anAdminUser()
        .withEmail('unverified@example.com')
        .asPending()
        .build()
    };
  }

  /**
   * Create data for document upload testing
   */
  static createDocumentTestData() {
    const user = UserFactory.qaEngineer;
    const project = ProjectFactory.simple;
    
    return {
      user,
      project,
      validPDF: {
        name: 'requirements.pdf',
        content: Buffer.from('PDF content'),
        type: 'application/pdf'
      },
      validWord: {
        name: 'test-plan.docx',
        content: Buffer.from('Word content'),
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      invalidFile: {
        name: 'executable.exe',
        content: Buffer.from('EXE content'),
        type: 'application/x-msdownload'
      },
      largeFile: {
        name: 'large-doc.pdf',
        content: Buffer.alloc(50 * 1024 * 1024), // 50MB
        type: 'application/pdf'
      }
    };
  }

  /**
   * Create data for feature generation testing
   */
  static createFeatureGenerationData() {
    const projectData = TestDataFactory.createProjectData({
      documentCount: 5,
      featureCount: 0
    });
    
    const processedDocs = projectData.documents.filter(
      d => d.status === DocumentStatus.PROCESSED
    );
    
    return {
      ...projectData,
      processedDocuments: processedDocs,
      documentIds: processedDocs.map(d => d.id),
      aiModels: ['gpt-4', 'gpt-3.5-turbo', 'claude-2'],
      settings: {
        basic: {
          includeEdgeCases: false,
          includeNegativeScenarios: false,
          detailLevel: 'basic' as const
        },
        comprehensive: {
          includeEdgeCases: true,
          includeNegativeScenarios: true,
          detailLevel: 'comprehensive' as const
        }
      }
    };
  }

  /**
   * Create data for search testing
   */
  static createSearchTestData() {
    const dataSet = TestDataFactory.createFullDataSet();
    
    // Add search-specific attributes
    dataSet.documents[0].name = 'Login Requirements Specification.pdf';
    dataSet.documents[1].name = 'Payment Processing Test Plan.docx';
    dataSet.documents[2].name = 'User Registration Flow.md';
    
    dataSet.features[0].name = 'user_authentication.feature';
    dataSet.features[1].name = 'payment_checkout.feature';
    
    return {
      ...dataSet,
      searchQueries: {
        exact: 'Login Requirements Specification',
        partial: 'payment',
        fuzzy: 'registraton', // Intentional typo
        empty: '',
        special: 'user*.feature'
      }
    };
  }

  /**
   * Create data for performance testing
   */
  static createPerformanceTestData(scale: 'small' | 'medium' | 'large') {
    const counts = {
      small: { users: 10, projects: 5, documents: 50, features: 25 },
      medium: { users: 50, projects: 20, documents: 500, features: 250 },
      large: { users: 200, projects: 100, documents: 5000, features: 2500 }
    };
    
    const config = counts[scale];
    
    return {
      users: Array(config.users).fill(null).map(() => UserFactory.user()),
      projects: ProjectFactory.portfolio(config.projects),
      documents: DocumentFactory.mixed(config.documents),
      features: Array(config.features).fill(null).map(() => 
        FeatureFactory.authFeatureFile()
      )
    };
  }

  /**
   * Clean up test data (for use in afterEach hooks)
   */
  static getCleanupIds(data: TestDataSet | ProjectTestData): {
    userIds: string[];
    projectIds: string[];
    documentIds: string[];
    featureIds: string[];
  } {
    if ('project' in data) {
      // ProjectTestData
      return {
        userIds: [data.owner.id, ...data.members.map(m => m.id)],
        projectIds: [data.project.id],
        documentIds: data.documents.map(d => d.id),
        featureIds: data.features.map(f => f.id)
      };
    } else {
      // TestDataSet
      return {
        userIds: data.users.map(u => u.id),
        projectIds: data.projects.map(p => p.id),
        documentIds: data.documents.map(d => d.id),
        featureIds: data.features.map(f => f.id)
      };
    }
  }
}

// Export all factories for convenience
export {
  DocumentFactory,
  UserFactory,
  FeatureFactory,
  ProjectFactory,
  aDocument,
  aUser,
  anAdminUser,
  aFeature,
  aFeatureFile,
  aProject
};