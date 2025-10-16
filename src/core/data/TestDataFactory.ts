/**
 * Test Data Factory
 * 
 * Centralized system for generating test data across all test suites
 */

import { faker } from '@faker-js/faker';

export interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface DocumentData {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  content: string;
  size: number;
  uploadDate: Date;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  metadata: Record<string, any>;
}

export interface FeatureFileData {
  id: string;
  title: string;
  content: string;
  category: 'generated' | 'imported' | 'manual';
  tags: string[];
  scenarios: number;
  createdDate: Date;
  lastModified: Date;
  author: string;
}

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId: string;
  tokens: number;
  model: string;
}

export interface ModelConfigData {
  id: string;
  name: string;
  provider: 'openai' | 'ollama' | 'anthropic';
  type: 'chat' | 'embedding';
  endpoint: string;
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  cost: number;
  description: string;
}

export interface ApiTestData {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: any;
  expectedStatus: number;
  expectedResponse?: any;
}

export class TestDataFactory {
  private static instance: TestDataFactory;
  private seedValue: number;

  private constructor() {
    this.seedValue = Date.now();
    faker.seed(this.seedValue);
  }

  public static getInstance(): TestDataFactory {
    if (!TestDataFactory.instance) {
      TestDataFactory.instance = new TestDataFactory();
    }
    return TestDataFactory.instance;
  }

  /**
   * Reset seed for reproducible tests
   */
  public setSeed(seed: number): void {
    this.seedValue = seed;
    faker.seed(seed);
  }

  public getSeed(): number {
    return this.seedValue;
  }

  /**
   * User Data Generation
   */
  public createUser(overrides?: Partial<UserData>): UserData {
    const defaultUser: UserData = {
      id: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'TestPassword123!',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: faker.helpers.arrayElement(['admin', 'user', 'viewer'])
    };

    return { ...defaultUser, ...overrides };
  }

  public createMultipleUsers(count: number, overrides?: Partial<UserData>): UserData[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  /**
   * Document Data Generation
   */
  public createDocument(overrides?: Partial<DocumentData>): DocumentData {
    const type = faker.helpers.arrayElement(['pdf', 'docx', 'txt', 'md'] as const);
    const defaultDocument: DocumentData = {
      id: faker.string.uuid(),
      name: `${faker.lorem.words(3).replace(/\s/g, '_')}.${type}`,
      type,
      content: this.generateDocumentContent(type),
      size: faker.number.int({ min: 1024, max: 10485760 }), // 1KB to 10MB
      uploadDate: faker.date.recent({ days: 30 }),
      status: faker.helpers.arrayElement(['uploaded', 'processing', 'ready', 'error']),
      metadata: {
        author: faker.person.fullName(),
        version: faker.system.semver(),
        keywords: faker.lorem.words(5).split(' ')
      }
    };

    return { ...defaultDocument, ...overrides };
  }

  public createMultipleDocuments(count: number, overrides?: Partial<DocumentData>): DocumentData[] {
    return Array.from({ length: count }, () => this.createDocument(overrides));
  }

  private generateDocumentContent(type: DocumentData['type']): string {
    switch (type) {
      case 'md':
        return this.generateMarkdownContent();
      case 'txt':
        return faker.lorem.paragraphs(faker.number.int({ min: 3, max: 10 }));
      case 'pdf':
      case 'docx':
        return this.generateStructuredContent();
      default:
        return faker.lorem.paragraphs(5);
    }
  }

  private generateMarkdownContent(): string {
    return `# ${faker.lorem.words(3)}

## Overview
${faker.lorem.paragraph()}

## Requirements
${Array.from({ length: faker.number.int({ min: 3, max: 7 }) }, (_, i) => 
  `${i + 1}. ${faker.lorem.sentence()}`
).join('\n')}

## Implementation
${faker.lorem.paragraphs(2)}

### Code Example
\`\`\`javascript
${faker.lorem.words(10)}
\`\`\`

## Conclusion
${faker.lorem.paragraph()}`;
  }

  private generateStructuredContent(): string {
    return `Title: ${faker.lorem.words(4)}

Abstract:
${faker.lorem.paragraph()}

Section 1: Introduction
${faker.lorem.paragraphs(2)}

Section 2: Methodology
${faker.lorem.paragraphs(2)}

Section 3: Results
${faker.lorem.paragraphs(2)}

Conclusion:
${faker.lorem.paragraph()}`;
  }

  /**
   * Feature File Data Generation
   */
  public createFeatureFile(overrides?: Partial<FeatureFileData>): FeatureFileData {
    const scenarioCount = faker.number.int({ min: 1, max: 5 });
    const defaultFeature: FeatureFileData = {
      id: faker.string.uuid(),
      title: `${faker.hacker.verb()} ${faker.hacker.noun()}`,
      content: this.generateGherkinContent(scenarioCount),
      category: faker.helpers.arrayElement(['generated', 'imported', 'manual']),
      tags: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => 
        faker.helpers.arrayElement(['@smoke', '@regression', '@api', '@ui', '@integration'])
      ),
      scenarios: scenarioCount,
      createdDate: faker.date.recent({ days: 7 }),
      lastModified: faker.date.recent({ days: 1 }),
      author: faker.person.fullName()
    };

    return { ...defaultFeature, ...overrides };
  }

  public createMultipleFeatureFiles(count: number, overrides?: Partial<FeatureFileData>): FeatureFileData[] {
    return Array.from({ length: count }, () => this.createFeatureFile(overrides));
  }

  private generateGherkinContent(scenarioCount: number): string {
    const feature = faker.hacker.verb();
    const noun = faker.hacker.noun();
    
    let content = `Feature: ${feature} ${noun}
  As a user
  I want to ${feature} ${noun}
  So that I can ${faker.hacker.phrase()}

`;

    for (let i = 1; i <= scenarioCount; i++) {
      content += `  Scenario: ${faker.hacker.verb()} ${faker.hacker.adjective()} ${noun} ${i}
    Given I am on the ${faker.lorem.word()} page
    When I ${faker.hacker.verb()} the ${faker.lorem.word()}
    And I ${faker.hacker.verb()} "${faker.lorem.words(2)}"
    Then I should see "${faker.lorem.sentence()}"
    And the ${faker.lorem.word()} should be ${faker.hacker.adjective()}

`;
    }

    return content;
  }

  /**
   * Chat Message Data Generation
   */
  public createChatMessage(overrides?: Partial<ChatMessageData>): ChatMessageData {
    const role = faker.helpers.arrayElement(['user', 'assistant'] as const);
    const defaultMessage: ChatMessageData = {
      id: faker.string.uuid(),
      role,
      content: role === 'user' ? this.generateUserMessage() : this.generateAssistantMessage(),
      timestamp: faker.date.recent({ days: 1 }),
      sessionId: faker.string.uuid(),
      tokens: faker.number.int({ min: 10, max: 1000 }),
      model: faker.helpers.arrayElement(['gpt-4', 'gpt-3.5-turbo', 'llama2', 'mistral'])
    };

    return { ...defaultMessage, ...overrides };
  }

  public createChatConversation(messageCount: number, sessionId?: string): ChatMessageData[] {
    const session = sessionId || faker.string.uuid();
    const messages: ChatMessageData[] = [];
    
    for (let i = 0; i < messageCount; i++) {
      const role = i % 2 === 0 ? 'user' : 'assistant';
      messages.push(this.createChatMessage({
        role,
        sessionId: session,
        timestamp: new Date(Date.now() + i * 60000) // 1 minute apart
      }));
    }
    
    return messages;
  }

  private generateUserMessage(): string {
    const prompts = [
      'Generate a test scenario for login functionality',
      'Create a feature file for user registration',
      'Help me write tests for API endpoints',
      'Can you create Gherkin scenarios for checkout process?',
      'Write acceptance criteria for search functionality',
      'Generate test cases for file upload feature'
    ];
    
    return faker.helpers.arrayElement(prompts);
  }

  private generateAssistantMessage(): string {
    return `Here's a test scenario for ${faker.lorem.words(2)}:

${this.generateGherkinContent(1)}

This scenario covers ${faker.lorem.sentence()}`;
  }

  /**
   * Model Configuration Data Generation
   */
  public createModelConfig(overrides?: Partial<ModelConfigData>): ModelConfigData {
    const provider = faker.helpers.arrayElement(['openai', 'ollama', 'anthropic'] as const);
    const type = faker.helpers.arrayElement(['chat', 'embedding'] as const);
    
    const defaultConfig: ModelConfigData = {
      id: faker.string.uuid(),
      name: `${provider}-${type}-${faker.string.alphanumeric(6)}`,
      provider,
      type,
      endpoint: this.generateEndpoint(provider),
      apiKey: provider !== 'ollama' ? faker.string.alphanumeric(32) : undefined,
      model: this.generateModelName(provider, type),
      temperature: faker.number.float({ min: 0, max: 2, fractionDigits: 1 }),
      maxTokens: faker.helpers.arrayElement([1024, 2048, 4096, 8192]),
      cost: faker.number.float({ min: 0.001, max: 0.1, fractionDigits: 4 }),
      description: faker.lorem.sentence()
    };

    return { ...defaultConfig, ...overrides };
  }

  private generateEndpoint(provider: ModelConfigData['provider']): string {
    switch (provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      case 'ollama':
        return 'http://localhost:11434/v1';
      default:
        return 'https://api.example.com/v1';
    }
  }

  private generateModelName(provider: ModelConfigData['provider'], type: ModelConfigData['type']): string {
    if (provider === 'openai') {
      return type === 'chat' 
        ? faker.helpers.arrayElement(['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'])
        : faker.helpers.arrayElement(['text-embedding-3-small', 'text-embedding-3-large']);
    } else if (provider === 'ollama') {
      return type === 'chat'
        ? faker.helpers.arrayElement(['llama2', 'mistral', 'codellama'])
        : faker.helpers.arrayElement(['nomic-embed-text', 'all-minilm']);
    } else if (provider === 'anthropic') {
      return faker.helpers.arrayElement(['claude-3-sonnet', 'claude-3-haiku']);
    }
    
    return faker.lorem.word();
  }

  /**
   * API Test Data Generation
   */
  public createApiTestData(overrides?: Partial<ApiTestData>): ApiTestData {
    const method = faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const);
    const defaultApiData: ApiTestData = {
      endpoint: `/api/${faker.lorem.word()}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${faker.string.alphanumeric(32)}`
      },
      body: method !== 'GET' ? this.generateApiRequestBody(method) : undefined,
      expectedStatus: this.getExpectedStatus(method),
      expectedResponse: this.generateApiResponse(method)
    };

    return { ...defaultApiData, ...overrides };
  }

  private generateApiRequestBody(method: string): any {
    switch (method) {
      case 'POST':
        return {
          title: faker.lorem.words(3),
          content: faker.lorem.paragraph(),
          tags: faker.lorem.words(3).split(' ')
        };
      case 'PUT':
      case 'PATCH':
        return {
          id: faker.string.uuid(),
          title: faker.lorem.words(3),
          content: faker.lorem.paragraph()
        };
      default:
        return {};
    }
  }

  private getExpectedStatus(method: string): number {
    switch (method) {
      case 'POST':
        return 201;
      case 'DELETE':
        return 204;
      case 'GET':
      case 'PUT':
      case 'PATCH':
        return 200;
      default:
        return 200;
    }
  }

  private generateApiResponse(method: string): any {
    if (method === 'DELETE') {
      return null;
    }
    
    return {
      success: true,
      data: {
        id: faker.string.uuid(),
        title: faker.lorem.words(3),
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.recent().toISOString()
      }
    };
  }

  /**
   * File Data Generation
   */
  public generateTestFile(type: 'text' | 'pdf' | 'docx' | 'feature', size: 'small' | 'medium' | 'large' = 'medium'): {
    name: string;
    content: string;
    mimeType: string;
    sizeBytes: number;
  } {
    const sizeMap = {
      small: { min: 100, max: 1000 },
      medium: { min: 1000, max: 10000 },
      large: { min: 10000, max: 100000 }
    };

    const { min, max } = sizeMap[size];
    const targetSize = faker.number.int({ min, max });
    
    let content = '';
    let mimeType = '';
    let extension = '';

    switch (type) {
      case 'text':
        content = this.generateTextContent(targetSize);
        mimeType = 'text/plain';
        extension = 'txt';
        break;
      case 'pdf':
        content = this.generatePdfContent(targetSize);
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
      case 'docx':
        content = this.generateDocxContent(targetSize);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        extension = 'docx';
        break;
      case 'feature':
        content = this.generateGherkinContent(faker.number.int({ min: 1, max: 5 }));
        mimeType = 'text/plain';
        extension = 'feature';
        break;
      default:
        content = faker.lorem.paragraphs(5);
        mimeType = 'text/plain';
        extension = 'txt';
    }

    return {
      name: `${faker.lorem.word()}_${faker.string.alphanumeric(6)}.${extension}`,
      content,
      mimeType,
      sizeBytes: content.length
    };
  }

  private generateTextContent(targetSize: number): string {
    let content = '';
    while (content.length < targetSize) {
      content += faker.lorem.paragraph() + '\n\n';
    }
    return content.substring(0, targetSize);
  }

  private generatePdfContent(targetSize: number): string {
    // Simplified PDF-like content (in real scenario, you'd generate actual PDF)
    return this.generateTextContent(targetSize);
  }

  private generateDocxContent(targetSize: number): string {
    // Simplified DOCX-like content (in real scenario, you'd generate actual DOCX)
    return this.generateTextContent(targetSize);
  }

  /**
   * Utility methods
   */
  public generateRandomString(length: number): string {
    return faker.string.alphanumeric(length);
  }

  public generateRandomEmail(domain?: string): string {
    return faker.internet.email({ provider: domain });
  }

  public generateRandomUrl(): string {
    return faker.internet.url();
  }

  public generateRandomDate(days: number = 30): Date {
    return faker.date.recent({ days });
  }

  public generateRandomNumber(min: number, max: number): number {
    return faker.number.int({ min, max });
  }

  public pickRandom<T>(array: T[]): T {
    return faker.helpers.arrayElement(array);
  }

  public pickRandomMultiple<T>(array: T[], count: number): T[] {
    return faker.helpers.arrayElements(array, count);
  }
}

// Export singleton instance
export const testDataFactory = TestDataFactory.getInstance();
export default testDataFactory;