/**
 * Project Builder
 * 
 * Builder pattern for creating test projects with realistic data
 */

import { 
  Project, 
  ProjectMember, 
  ProjectSettings, 
  ProjectIntegration,
  ProjectStatistics 
} from '../types';
import { faker } from '@faker-js/faker';

export class ProjectBuilder {
  private project: Partial<Project>;

  constructor() {
    // Set defaults
    this.project = {
      id: faker.string.uuid(),
      name: faker.company.name() + ' Project',
      description: faker.company.catchPhrase(),
      owner: faker.string.uuid(),
      members: [],
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString()
    };
  }

  withId(id: string): ProjectBuilder {
    this.project.id = id;
    return this;
  }

  withName(name: string): ProjectBuilder {
    this.project.name = name;
    return this;
  }

  withDescription(description: string): ProjectBuilder {
    this.project.description = description;
    return this;
  }

  withOwner(ownerId: string): ProjectBuilder {
    this.project.owner = ownerId;
    // Add owner as a member
    const ownerMember: ProjectMember = {
      userId: ownerId,
      role: 'owner',
      joinedAt: this.project.createdAt!
    };
    
    if (!this.project.members) {
      this.project.members = [];
    }
    
    // Remove any existing owner member and add new one
    this.project.members = this.project.members.filter(m => m.role !== 'owner');
    this.project.members.unshift(ownerMember);
    
    return this;
  }

  withMember(userId: string, role: ProjectMember['role'] = 'member'): ProjectBuilder {
    if (!this.project.members) {
      this.project.members = [];
    }
    
    this.project.members.push({
      userId,
      role,
      joinedAt: faker.date.between({ 
        from: this.project.createdAt!, 
        to: new Date() 
      }).toISOString()
    });
    
    return this;
  }

  withMembers(count: number): ProjectBuilder {
    for (let i = 0; i < count; i++) {
      const role = i === 0 ? 'admin' : i % 3 === 0 ? 'viewer' : 'member';
      this.withMember(faker.string.uuid(), role);
    }
    return this;
  }

  withTeam(teamSize: number = 5): ProjectBuilder {
    // Add a balanced team
    this.withMember(faker.string.uuid(), 'admin');
    
    const remainingSize = teamSize - 2; // Minus owner and admin
    const members = Math.ceil(remainingSize * 0.6);
    const viewers = remainingSize - members;
    
    for (let i = 0; i < members; i++) {
      this.withMember(faker.string.uuid(), 'member');
    }
    
    for (let i = 0; i < viewers; i++) {
      this.withMember(faker.string.uuid(), 'viewer');
    }
    
    return this;
  }

  withSettings(settings: ProjectSettings): ProjectBuilder {
    this.project.settings = settings;
    return this;
  }

  withDefaultSettings(): ProjectBuilder {
    this.project.settings = {
      defaultAiModel: 'gpt-4',
      featureGenerationSettings: {
        includeEdgeCases: true,
        includeNegativeScenarios: true,
        detailLevel: 'comprehensive'
      },
      integrations: []
    };
    return this;
  }

  withIntegration(integration: ProjectIntegration): ProjectBuilder {
    if (!this.project.settings) {
      this.project.settings = { integrations: [] };
    }
    if (!this.project.settings.integrations) {
      this.project.settings.integrations = [];
    }
    
    this.project.settings.integrations.push(integration);
    return this;
  }

  withGithubIntegration(repoUrl?: string): ProjectBuilder {
    return this.withIntegration({
      type: 'github',
      enabled: true,
      config: {
        repository: repoUrl || faker.internet.url(),
        branch: 'main',
        autoSync: true
      }
    });
  }

  withJiraIntegration(projectKey?: string): ProjectBuilder {
    return this.withIntegration({
      type: 'jira',
      enabled: true,
      config: {
        url: faker.internet.url(),
        projectKey: projectKey || faker.string.alpha({ length: 3 }).toUpperCase(),
        syncIssues: true
      }
    });
  }

  withStatistics(stats: ProjectStatistics): ProjectBuilder {
    this.project.statistics = stats;
    return this;
  }

  withRandomStatistics(): ProjectBuilder {
    this.project.statistics = {
      documentCount: faker.number.int({ min: 5, max: 50 }),
      featureCount: faker.number.int({ min: 10, max: 100 }),
      scenarioCount: faker.number.int({ min: 50, max: 500 }),
      lastActivity: faker.date.recent().toISOString()
    };
    return this;
  }

  withCreatedAt(date: Date | string): ProjectBuilder {
    this.project.createdAt = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  withUpdatedAt(date: Date | string): ProjectBuilder {
    this.project.updatedAt = typeof date === 'string' ? date : date.toISOString();
    return this;
  }

  // Preset builders
  asStarterProject(): ProjectBuilder {
    return this
      .withName('Getting Started Project')
      .withDescription('A starter project to explore Testoria features')
      .withDefaultSettings()
      .withStatistics({
        documentCount: 3,
        featureCount: 5,
        scenarioCount: 15,
        lastActivity: faker.date.recent().toISOString()
      });
  }

  asEnterpriseProject(): ProjectBuilder {
    return this
      .withName(faker.company.name() + ' QA Automation')
      .withDescription('Enterprise-level test automation project')
      .withTeam(12)
      .withDefaultSettings()
      .withGithubIntegration()
      .withJiraIntegration()
      .withStatistics({
        documentCount: faker.number.int({ min: 50, max: 200 }),
        featureCount: faker.number.int({ min: 100, max: 500 }),
        scenarioCount: faker.number.int({ min: 500, max: 2000 }),
        lastActivity: faker.date.recent().toISOString()
      });
  }

  asActiveProject(): ProjectBuilder {
    return this
      .withTeam(5)
      .withDefaultSettings()
      .withRandomStatistics()
      .withUpdatedAt(faker.date.recent({ days: 1 }));
  }

  asArchivedProject(): ProjectBuilder {
    return this
      .withName('[ARCHIVED] ' + this.project.name)
      .withUpdatedAt(faker.date.past({ years: 1 }))
      .withStatistics({
        documentCount: faker.number.int({ min: 10, max: 30 }),
        featureCount: faker.number.int({ min: 20, max: 50 }),
        scenarioCount: faker.number.int({ min: 50, max: 150 }),
        lastActivity: faker.date.past({ years: 1 }).toISOString()
      });
  }

  build(): Project {
    // Ensure owner is set
    if (!this.project.owner) {
      this.project.owner = faker.string.uuid();
    }
    
    // Ensure owner is in members list
    if (!this.project.members || this.project.members.length === 0) {
      this.withOwner(this.project.owner);
    }
    
    // Generate statistics if not provided
    if (!this.project.statistics) {
      this.withRandomStatistics();
    }
    
    if (!this.project.id) {
      this.project.id = faker.string.uuid();
    }
    
    return this.project as Project;
  }

  buildMany(count: number): Project[] {
    const projects: Project[] = [];
    
    for (let i = 0; i < count; i++) {
      const builder = new ProjectBuilder();
      
      // Vary project types
      if (i === 0) {
        projects.push(builder.asStarterProject().build());
      } else if (i % 4 === 0) {
        projects.push(builder.asEnterpriseProject().build());
      } else if (i % 5 === 0) {
        projects.push(builder.asArchivedProject().build());
      } else {
        projects.push(builder.asActiveProject().build());
      }
    }
    
    return projects;
  }
}

// Factory function
export function aProject(): ProjectBuilder {
  return new ProjectBuilder();
}

// Pre-configured factories
export const ProjectFactory = {
  // Basic projects
  simple: () => aProject().build(),
  starter: () => aProject().asStarterProject().build(),
  enterprise: () => aProject().asEnterpriseProject().build(),
  active: () => aProject().asActiveProject().build(),
  archived: () => aProject().asArchivedProject().build(),
  
  // Projects with specific configurations
  withGithub: () => aProject().asActiveProject().withGithubIntegration().build(),
  withJira: () => aProject().asActiveProject().withJiraIntegration().build(),
  fullyIntegrated: () => aProject()
    .asActiveProject()
    .withGithubIntegration()
    .withJiraIntegration()
    .build(),
  
  // Team projects
  solo: () => aProject().withDefaultSettings().build(),
  small: () => aProject().withTeam(3).withDefaultSettings().build(),
  medium: () => aProject().withTeam(8).withDefaultSettings().build(),
  large: () => aProject().withTeam(20).withDefaultSettings().build(),
  
  // Multiple projects
  portfolio: (count = 5) => aProject().buildMany(count),
  
  // Projects with specific stats
  empty: () => aProject().withStatistics({
    documentCount: 0,
    featureCount: 0,
    scenarioCount: 0,
    lastActivity: new Date().toISOString()
  }).build(),
  
  mature: () => aProject().withStatistics({
    documentCount: faker.number.int({ min: 100, max: 500 }),
    featureCount: faker.number.int({ min: 200, max: 1000 }),
    scenarioCount: faker.number.int({ min: 1000, max: 5000 }),
    lastActivity: faker.date.recent().toISOString()
  }).build()
};