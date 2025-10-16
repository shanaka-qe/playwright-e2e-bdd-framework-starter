/**
 * Feature Builder
 * 
 * Builder pattern for creating test features and scenarios with realistic Gherkin content
 */

import { 
  FeatureFile, 
  GeneratedFeature, 
  Scenario, 
  Step, 
  Example,
  FeatureFileMetadata 
} from '../types';
import { faker } from '@faker-js/faker';

export class StepBuilder {
  private step: Step;

  constructor(keyword: Step['keyword'] = 'Given') {
    this.step = {
      keyword,
      text: ''
    };
  }

  given(text: string): StepBuilder {
    this.step.keyword = 'Given';
    this.step.text = text;
    return this;
  }

  when(text: string): StepBuilder {
    this.step.keyword = 'When';
    this.step.text = text;
    return this;
  }

  then(text: string): StepBuilder {
    this.step.keyword = 'Then';
    this.step.text = text;
    return this;
  }

  and(text: string): StepBuilder {
    this.step.keyword = 'And';
    this.step.text = text;
    return this;
  }

  but(text: string): StepBuilder {
    this.step.keyword = 'But';
    this.step.text = text;
    return this;
  }

  withDocString(docString: string): StepBuilder {
    this.step.docString = docString;
    return this;
  }

  withDataTable(dataTable: string[][]): StepBuilder {
    this.step.dataTable = dataTable;
    return this;
  }

  build(): Step {
    if (!this.step.text) {
      this.step.text = faker.lorem.sentence();
    }
    return this.step;
  }
}

export class ScenarioBuilder {
  private scenario: Partial<Scenario>;
  private steps: Step[] = [];

  constructor() {
    this.scenario = {
      id: faker.string.uuid(),
      name: faker.lorem.sentence(),
      type: 'normal',
      tags: []
    };
  }

  withId(id: string): ScenarioBuilder {
    this.scenario.id = id;
    return this;
  }

  withName(name: string): ScenarioBuilder {
    this.scenario.name = name;
    return this;
  }

  asOutline(): ScenarioBuilder {
    this.scenario.type = 'outline';
    return this;
  }

  asBackground(): ScenarioBuilder {
    this.scenario.type = 'background';
    return this;
  }

  withTags(...tags: string[]): ScenarioBuilder {
    this.scenario.tags = tags;
    return this;
  }

  withStep(step: Step | StepBuilder): ScenarioBuilder {
    if (step instanceof StepBuilder) {
      this.steps.push(step.build());
    } else {
      this.steps.push(step);
    }
    return this;
  }

  withSteps(...steps: (Step | StepBuilder)[]): ScenarioBuilder {
    for (const step of steps) {
      this.withStep(step);
    }
    return this;
  }

  withExamples(examples: Example[]): ScenarioBuilder {
    this.scenario.examples = examples;
    return this;
  }

  withExample(headers: string[], ...rows: string[][]): ScenarioBuilder {
    if (!this.scenario.examples) {
      this.scenario.examples = [];
    }
    this.scenario.examples.push({ headers, rows });
    return this;
  }

  // Preset scenarios
  asLoginScenario(): ScenarioBuilder {
    return this
      .withName('Successful user login')
      .withTags('@smoke', '@authentication')
      .withSteps(
        new StepBuilder().given('I am on the login page'),
        new StepBuilder().when('I enter valid credentials'),
        new StepBuilder().and('I click the login button'),
        new StepBuilder().then('I should be redirected to the dashboard'),
        new StepBuilder().and('I should see a welcome message')
      );
  }

  asDocumentUploadScenario(): ScenarioBuilder {
    return this
      .withName('Upload PDF document')
      .withTags('@documents', '@upload')
      .withSteps(
        new StepBuilder().given('I am logged in as a QA engineer'),
        new StepBuilder().and('I am on the document hub page'),
        new StepBuilder().when('I select a PDF file "requirements.pdf"'),
        new StepBuilder().and('I click the upload button'),
        new StepBuilder().then('I should see the upload progress'),
        new StepBuilder().and('the document should appear in the document list'),
        new StepBuilder().and('the document status should be "Processing"')
      );
  }

  asParameterizedScenario(): ScenarioBuilder {
    return this
      .withName('Login with different user roles')
      .asOutline()
      .withTags('@authentication', '@roles')
      .withSteps(
        new StepBuilder().given('I am on the login page'),
        new StepBuilder().when('I login as "<role>"'),
        new StepBuilder().then('I should see the <role> dashboard'),
        new StepBuilder().and('I should have <permissions> permissions')
      )
      .withExample(
        ['role', 'permissions'],
        ['admin', 'full'],
        ['qa_engineer', 'read_write'],
        ['viewer', 'read_only']
      );
  }

  build(): Scenario {
    this.scenario.steps = this.steps;
    if (!this.scenario.id) {
      this.scenario.id = faker.string.uuid();
    }
    return this.scenario as Scenario;
  }
}

export class FeatureBuilder {
  private feature: Partial<GeneratedFeature>;
  private scenarios: Scenario[] = [];

  constructor() {
    this.feature = {
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      description: faker.lorem.paragraph(),
      tags: [],
      gherkinContent: ''
    };
  }

  withId(id: string): FeatureBuilder {
    this.feature.id = id;
    return this;
  }

  withName(name: string): FeatureBuilder {
    this.feature.name = name;
    return this;
  }

  withDescription(description: string): FeatureBuilder {
    this.feature.description = description;
    return this;
  }

  withTags(...tags: string[]): FeatureBuilder {
    this.feature.tags = tags;
    return this;
  }

  withScenario(scenario: Scenario | ScenarioBuilder): FeatureBuilder {
    if (scenario instanceof ScenarioBuilder) {
      this.scenarios.push(scenario.build());
    } else {
      this.scenarios.push(scenario);
    }
    return this;
  }

  withScenarios(...scenarios: (Scenario | ScenarioBuilder)[]): FeatureBuilder {
    for (const scenario of scenarios) {
      this.withScenario(scenario);
    }
    return this;
  }

  private generateGherkinContent(): string {
    const lines: string[] = [];
    
    // Feature header
    if (this.feature.tags && this.feature.tags.length > 0) {
      lines.push(this.feature.tags.map(tag => `@${tag}`).join(' '));
    }
    lines.push(`Feature: ${this.feature.name}`);
    if (this.feature.description) {
      lines.push(`  ${this.feature.description}`);
    }
    lines.push('');

    // Scenarios
    for (const scenario of this.scenarios) {
      if (scenario.tags && scenario.tags.length > 0) {
        lines.push('  ' + scenario.tags.map(tag => `@${tag}`).join(' '));
      }
      
      const keyword = scenario.type === 'outline' ? 'Scenario Outline' : 
                     scenario.type === 'background' ? 'Background' : 'Scenario';
      lines.push(`  ${keyword}: ${scenario.name}`);
      
      // Steps
      for (const step of scenario.steps) {
        lines.push(`    ${step.keyword} ${step.text}`);
        
        if (step.docString) {
          lines.push('      """');
          lines.push('      ' + step.docString);
          lines.push('      """');
        }
        
        if (step.dataTable) {
          for (const row of step.dataTable) {
            lines.push('      | ' + row.join(' | ') + ' |');
          }
        }
      }
      
      // Examples for scenario outlines
      if (scenario.examples && scenario.examples.length > 0) {
        lines.push('');
        lines.push('    Examples:');
        for (const example of scenario.examples) {
          if (example.name) {
            lines.push(`      ${example.name}`);
          }
          lines.push('      | ' + example.headers.join(' | ') + ' |');
          for (const row of example.rows) {
            lines.push('      | ' + row.join(' | ') + ' |');
          }
        }
      }
      
      lines.push('');
    }

    return lines.join('\n');
  }

  // Preset features
  asAuthenticationFeature(): FeatureBuilder {
    return this
      .withName('User Authentication')
      .withDescription('As a user, I want to authenticate so that I can access the application')
      .withTags('authentication', 'security')
      .withScenarios(
        new ScenarioBuilder().asLoginScenario(),
        new ScenarioBuilder()
          .withName('Failed login with invalid credentials')
          .withTags('@negative')
          .withSteps(
            new StepBuilder().given('I am on the login page'),
            new StepBuilder().when('I enter invalid credentials'),
            new StepBuilder().then('I should see an error message'),
            new StepBuilder().and('I should remain on the login page')
          ),
        new ScenarioBuilder()
          .withName('Logout')
          .withSteps(
            new StepBuilder().given('I am logged in'),
            new StepBuilder().when('I click the logout button'),
            new StepBuilder().then('I should be logged out'),
            new StepBuilder().and('I should be redirected to the login page')
          )
      );
  }

  asDocumentManagementFeature(): FeatureBuilder {
    return this
      .withName('Document Management')
      .withDescription('Manage requirements documents and specifications')
      .withTags('documents', 'core-functionality')
      .withScenarios(
        new ScenarioBuilder().asDocumentUploadScenario(),
        new ScenarioBuilder()
          .withName('View document details')
          .withSteps(
            new StepBuilder().given('I have uploaded a document'),
            new StepBuilder().when('I click on the document'),
            new StepBuilder().then('I should see the document details'),
            new StepBuilder().and('I should see the extracted content')
          ),
        new ScenarioBuilder()
          .withName('Delete document')
          .withTags('@destructive')
          .withSteps(
            new StepBuilder().given('I have a document in my library'),
            new StepBuilder().when('I click the delete button'),
            new StepBuilder().and('I confirm the deletion'),
            new StepBuilder().then('the document should be removed')
          )
      );
  }

  build(): GeneratedFeature {
    this.feature.scenarios = this.scenarios;
    this.feature.gherkinContent = this.generateGherkinContent();
    
    if (!this.feature.id) {
      this.feature.id = faker.string.uuid();
    }
    return this.feature as GeneratedFeature;
  }
}

export class FeatureFileBuilder {
  private featureFile: Partial<FeatureFile>;

  constructor() {
    this.featureFile = {
      id: faker.string.uuid(),
      name: faker.system.fileName({ extensionCount: 0 }) + '.feature',
      content: '',
      projectId: faker.string.uuid(),
      documentIds: [],
      createdBy: faker.string.uuid(),
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      version: 1,
      tags: []
    };
  }

  withId(id: string): FeatureFileBuilder {
    this.featureFile.id = id;
    return this;
  }

  withName(name: string): FeatureFileBuilder {
    this.featureFile.name = name;
    return this;
  }

  withContent(content: string): FeatureFileBuilder {
    this.featureFile.content = content;
    return this;
  }

  withFeature(feature: GeneratedFeature | FeatureBuilder): FeatureFileBuilder {
    const generatedFeature = feature instanceof FeatureBuilder ? feature.build() : feature;
    this.featureFile.content = generatedFeature.gherkinContent;
    this.featureFile.name = generatedFeature.name.replace(/\s+/g, '_') + '.feature';
    return this;
  }

  withProjectId(projectId: string): FeatureFileBuilder {
    this.featureFile.projectId = projectId;
    return this;
  }

  withDocumentIds(...documentIds: string[]): FeatureFileBuilder {
    this.featureFile.documentIds = documentIds;
    return this;
  }

  withTags(...tags: string[]): FeatureFileBuilder {
    this.featureFile.tags = tags;
    return this;
  }

  withMetadata(metadata: FeatureFileMetadata): FeatureFileBuilder {
    this.featureFile.metadata = metadata;
    return this;
  }

  withAutoMetadata(): FeatureFileBuilder {
    if (this.featureFile.content) {
      const scenarios = (this.featureFile.content.match(/Scenario:/g) || []).length;
      const steps = (this.featureFile.content.match(/(Given|When|Then|And|But)/g) || []).length;
      
      this.featureFile.metadata = {
        scenarioCount: scenarios,
        stepCount: steps,
        coverage: faker.number.int({ min: 70, max: 95 }),
        complexity: scenarios > 10 ? 'high' : scenarios > 5 ? 'medium' : 'low',
        framework: 'playwright'
      };
    }
    return this;
  }

  build(): FeatureFile {
    if (!this.featureFile.id) {
      this.featureFile.id = faker.string.uuid();
    }
    
    // Auto-generate metadata if content exists but metadata doesn't
    if (this.featureFile.content && !this.featureFile.metadata) {
      this.withAutoMetadata();
    }
    
    return this.featureFile as FeatureFile;
  }
}

// Factory functions
export function aStep(): StepBuilder {
  return new StepBuilder();
}

export function aScenario(): ScenarioBuilder {
  return new ScenarioBuilder();
}

export function aFeature(): FeatureBuilder {
  return new FeatureBuilder();
}

export function aFeatureFile(): FeatureFileBuilder {
  return new FeatureFileBuilder();
}

// Pre-configured factories
export const FeatureFactory = {
  // Steps
  givenStep: (text: string) => aStep().given(text).build(),
  whenStep: (text: string) => aStep().when(text).build(),
  thenStep: (text: string) => aStep().then(text).build(),
  
  // Scenarios
  loginScenario: () => aScenario().asLoginScenario().build(),
  uploadScenario: () => aScenario().asDocumentUploadScenario().build(),
  parameterizedScenario: () => aScenario().asParameterizedScenario().build(),
  
  // Features
  authFeature: () => aFeature().asAuthenticationFeature().build(),
  documentFeature: () => aFeature().asDocumentManagementFeature().build(),
  
  // Feature files
  authFeatureFile: () => aFeatureFile().withFeature(aFeature().asAuthenticationFeature()).build(),
  documentFeatureFile: () => aFeatureFile().withFeature(aFeature().asDocumentManagementFeature()).build(),
  
  // Custom feature with scenarios
  customFeature: (name: string, scenarioCount: number) => {
    const builder = aFeature().withName(name);
    for (let i = 0; i < scenarioCount; i++) {
      builder.withScenario(
        aScenario()
          .withName(`Scenario ${i + 1}`)
          .withSteps(
            aStep().given('a precondition'),
            aStep().when('an action occurs'),
            aStep().then('an outcome is expected')
          )
      );
    }
    return builder.build();
  }
};