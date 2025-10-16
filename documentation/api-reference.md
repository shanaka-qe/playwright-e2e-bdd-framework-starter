# API Reference and Utilities

**Complete Technical Reference for Framework Components**

## 🎯 Overview

This document provides comprehensive technical documentation for all classes, utilities, helpers, and APIs within the Playwright E2E Testing Framework, serving as a complete reference for developers working with or extending the framework.

## 📚 Table of Contents

1. [Core Framework APIs](#-core-framework-apis)
2. [Application-Specific APIs](#-application-specific-apis)
3. [Shared Utilities](#-shared-utilities)
4. [Helper Classes](#-helper-classes)
5. [Configuration APIs](#-configuration-apis)
6. [Test Data Management](#-test-data-management)
7. [Reporting APIs](#-reporting-apis)

---

## 🏗️ Core Framework APIs

### **TestWorld Class**

**Location**: `src/core/base/TestWorld.ts`

**Purpose**: Central test context and state management for BDD scenarios.

#### **Class Definition**

```typescript
export class TestWorld {
  public readonly page: Page;
  public readonly browser: Browser;
  public readonly context: BrowserContext;
  
  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
    this.browser = this.context.browser()!;
  }
}
```

#### **Methods**

##### `initialize(): Promise<void>`
Initializes the test world with necessary configurations and helpers.

```typescript
/**
 * Initializes the test world with configurations and helpers
 * @returns Promise that resolves when initialization is complete
 * @throws Error if initialization fails
 */
async initialize(): Promise<void> {
  await this.loadConfigurations();
  await this.setupHelpers();
  await this.seedTestData();
}
```

**Usage:**
```typescript
const testWorld = new TestWorld(page);
await testWorld.initialize();
```

##### `cleanup(): Promise<void>`
Cleans up test world resources and data.

```typescript
/**
 * Cleans up test world resources and data
 * @returns Promise that resolves when cleanup is complete
 */
async cleanup(): Promise<void> {
  await this.cleanupTestData();
  await this.closeConnections();
}
```

##### `waitForPageLoad(timeout?: number): Promise<void>`
Waits for page to fully load with network idle state.

```typescript
/**
 * Waits for page to fully load
 * @param timeout - Optional timeout in milliseconds (default: 30000)
 * @returns Promise that resolves when page is fully loaded
 */
async waitForPageLoad(timeout: number = 30000): Promise<void> {
  await this.page.waitForLoadState('networkidle', { timeout });
  await this.page.waitForLoadState('domcontentloaded', { timeout });
}
```

##### `getTestFilePath(fileName: string): string`
Gets the absolute path for a test file.

```typescript
/**
 * Gets the absolute path for a test file
 * @param fileName - Name of the test file
 * @returns Absolute path to the test file
 * @throws Error if file does not exist
 */
getTestFilePath(fileName: string): string {
  const filePath = path.join(this.testDataPath, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test file not found: ${fileName}`);
  }
  return filePath;
}
```

##### `getExpectedUrl(pageName: string): string`
Gets expected URL pattern for a given page name.

```typescript
/**
 * Gets expected URL pattern for a page name
 * @param pageName - Human-readable page name
 * @returns URL pattern for the page
 * @example
 * testWorld.getExpectedUrl('Document Hub') // Returns '/documents'
 */
getExpectedUrl(pageName: string): string {
  const urlMap = {
    'Document Hub': '/documents',
    'Feature Generator': '/features',
    'User Profile': '/profile',
    'Admin Dashboard': '/admin/dashboard'
  };
  return urlMap[pageName] || '/';
}
```

#### **Properties**

```typescript
// Configuration access
public readonly webappConfig: WebappConfig;
public readonly adminappConfig: AdminappConfig; 
public readonly mcpServerConfig: McpServerConfig;

// Helper instances
public readonly authenticationHelper: AuthenticationHelper;
public readonly navigationHelper: NavigationHelper;
public readonly testDataManager: TestDataManager;

// Paths
public readonly testDataPath: string;
public readonly reportsPath: string;
```

---

### **ApplicationManager Class**

**Location**: `src/core/managers/ApplicationManager.ts`

**Purpose**: Manages application lifecycle and state across different applications.

#### **Class Definition**

```typescript
export class ApplicationManager {
  private applications: Map<string, ApplicationInstance> = new Map();
  
  constructor(private testWorld: TestWorld) {}
}
```

#### **Methods**

##### `startApplication(appName: string): Promise<ApplicationInstance>`
Starts a specific application and returns its instance.

```typescript
/**
 * Starts an application and returns its instance
 * @param appName - Name of the application ('webapp', 'adminapp', 'mcp-server')
 * @returns Promise resolving to ApplicationInstance
 * @throws Error if application fails to start
 */
async startApplication(appName: string): Promise<ApplicationInstance> {
  const config = this.getApplicationConfig(appName);
  const instance = new ApplicationInstance(appName, config);
  
  await instance.start();
  this.applications.set(appName, instance);
  
  return instance;
}
```

##### `stopApplication(appName: string): Promise<void>`
Stops a specific application.

```typescript
/**
 * Stops an application
 * @param appName - Name of the application to stop
 * @returns Promise that resolves when application is stopped
 */
async stopApplication(appName: string): Promise<void> {
  const instance = this.applications.get(appName);
  if (instance) {
    await instance.stop();
    this.applications.delete(appName);
  }
}
```

##### `getApplication(appName: string): ApplicationInstance | null`
Gets a running application instance.

```typescript
/**
 * Gets a running application instance
 * @param appName - Name of the application
 * @returns ApplicationInstance or null if not running
 */
getApplication(appName: string): ApplicationInstance | null {
  return this.applications.get(appName) || null;
}
```

---

## 🎯 Application-Specific APIs

### **WebApp APIs**

#### **WebappBasePage Class**

**Location**: `src/applications/webapp/pages/WebappBasePage.ts`

**Purpose**: Base page class for all WebApp pages with common functionality.

```typescript
export abstract class WebappBasePage {
  protected readonly baseUrl: string;
  protected readonly timeout: number;
  
  constructor(protected page: Page) {
    this.baseUrl = webappConfig.baseUrl;
    this.timeout = webappConfig.timeout;
  }
  
  /**
   * Navigates to the page
   * @returns Promise that resolves when navigation is complete
   */
  abstract navigate(): Promise<void>;
  
  /**
   * Waits for page to be ready
   * @returns Promise that resolves when page is ready
   */
  abstract waitForPageReady(): Promise<void>;
}
```

#### **DocumentHubPage Class**

**Location**: `src/applications/webapp/pages/DocumentHubPage.ts`

```typescript
export class DocumentHubPage extends WebappBasePage {
  // Locators
  private readonly uploadButton = this.page.locator('[data-testid="upload-button"]');
  private readonly fileInput = this.page.locator('[data-testid="file-input"]');
  private readonly documentList = this.page.locator('[data-testid="document-list"]');
  
  /**
   * Navigates to Document Hub page
   */
  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/documents`);
    await this.waitForPageReady();
  }
  
  /**
   * Uploads a document
   * @param filePath - Absolute path to the file to upload
   * @returns Promise that resolves when upload is complete
   */
  async uploadDocument(filePath: string): Promise<void> {
    await this.uploadButton.click();
    await this.fileInput.setInputFiles(filePath);
    await this.page.locator('[data-testid="upload-submit"]').click();
    await this.waitForUploadComplete();
  }
  
  /**
   * Gets list of uploaded documents
   * @returns Array of document names
   */
  async getDocumentList(): Promise<string[]> {
    await this.documentList.waitFor();
    const documents = await this.documentList.locator('.document-item').all();
    
    return Promise.all(
      documents.map(doc => doc.locator('.document-name').textContent())
    ).then(names => names.filter(name => name !== null) as string[]);
  }
  
  /**
   * Deletes a document by name
   * @param documentName - Name of document to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteDocument(documentName: string): Promise<void> {
    const documentItem = this.page.locator(`[data-testid="document-${documentName}"]`);
    await documentItem.locator('[data-testid="delete-button"]').click();
    await this.page.locator('[data-testid="confirm-delete"]').click();
    await this.waitForDeletionComplete(documentName);
  }
}
```

#### **WebappAPI Class**

**Location**: `src/applications/webapp/api/WebappAPI.ts`

**Purpose**: API client for WebApp backend services.

```typescript
export class WebappAPI extends BaseAPI {
  constructor(baseURL: string, page: Page) {
    super(baseURL, page);
  }
  
  /**
   * Authenticates user and returns token
   * @param credentials - User credentials
   * @returns Promise resolving to authentication response
   */
  async authenticate(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request.post('/api/auth/login', {
      data: credentials
    });
    
    this.validateResponse(response, 200);
    return response.json();
  }
  
  /**
   * Uploads a document
   * @param file - File to upload
   * @param metadata - Optional document metadata
   * @returns Promise resolving to upload response
   */
  async uploadDocument(file: Buffer, metadata?: DocumentMetadata): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await this.request.post('/api/documents/upload', {
      data: formData
    });
    
    this.validateResponse(response, 201);
    return response.json();
  }
  
  /**
   * Gets list of user documents
   * @returns Promise resolving to document list
   */
  async getDocuments(): Promise<Document[]> {
    const response = await this.request.get('/api/documents');
    this.validateResponse(response, 200);
    return response.json();
  }
}
```

### **AdminApp APIs**

#### **AdminDashboardPage Class**

**Location**: `src/applications/adminapp/pages/AdminDashboardPage.ts`

```typescript
export class AdminDashboardPage extends AdminBasePage {
  // Locators
  private readonly userCountMetric = this.page.locator('[data-testid="user-count"]');
  private readonly systemStatusIndicator = this.page.locator('[data-testid="system-status"]');
  
  /**
   * Gets current user count from dashboard
   * @returns Promise resolving to user count number
   */
  async getUserCount(): Promise<number> {
    const text = await this.userCountMetric.textContent();
    return parseInt(text?.replace(/\D/g, '') || '0', 10);
  }
  
  /**
   * Gets system status
   * @returns Promise resolving to system status
   */
  async getSystemStatus(): Promise<'healthy' | 'warning' | 'error'> {
    const statusClass = await this.systemStatusIndicator.getAttribute('class');
    
    if (statusClass?.includes('healthy')) return 'healthy';
    if (statusClass?.includes('warning')) return 'warning';
    return 'error';
  }
  
  /**
   * Navigates to user management
   * @returns Promise that resolves when navigation is complete
   */
  async navigateToUserManagement(): Promise<void> {
    await this.page.click('[data-testid="user-management-link"]');
    await this.page.waitForURL('**/admin/users');
  }
}
```

#### **AdminAPI Class**

**Location**: `src/applications/adminapp/api/AdminAPI.ts`

```typescript
export class AdminAPI extends BaseAPI {
  /**
   * Gets system metrics
   * @returns Promise resolving to system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await this.request.get('/api/admin/metrics');
    this.validateResponse(response, 200);
    return response.json();
  }
  
  /**
   * Gets all users with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of users per page
   * @returns Promise resolving to paginated user list
   */
  async getUsers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    const response = await this.request.get('/api/admin/users', {
      params: { page, limit }
    });
    
    this.validateResponse(response, 200);
    return response.json();
  }
  
  /**
   * Creates a new user
   * @param userData - User data to create
   * @returns Promise resolving to created user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.request.post('/api/admin/users', {
      data: userData
    });
    
    this.validateResponse(response, 201);
    return response.json();
  }
}
```

### **MCP Server APIs**

#### **McpAPI Class**

**Location**: `src/applications/mcp-server/api/McpAPI.ts`

```typescript
export class McpAPI extends BaseAPI {
  /**
   * Generates text using AI model
   * @param prompt - Text prompt for generation
   * @param options - Generation options
   * @returns Promise resolving to generated text response
   */
  async generateText(prompt: string, options: GenerationOptions = {}): Promise<TextGenerationResponse> {
    const response = await this.request.post('/api/generate', {
      data: {
        prompt,
        model: options.model || 'ollama',
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      }
    });
    
    this.validateResponse(response, 200);
    return response.json();
  }
  
  /**
   * Gets available AI models
   * @returns Promise resolving to list of available models
   */
  async getModels(): Promise<Model[]> {
    const response = await this.request.get('/api/models');
    this.validateResponse(response, 200);
    return response.json();
  }
  
  /**
   * Creates embeddings for text
   * @param text - Text to create embeddings for
   * @param model - Model to use for embeddings
   * @returns Promise resolving to embeddings response
   */
  async createEmbeddings(text: string, model: string = 'ollama'): Promise<EmbeddingsResponse> {
    const response = await this.request.post('/api/embeddings', {
      data: { text, model }
    });
    
    this.validateResponse(response, 200);
    return response.json();
  }
}
```

---

## 🔧 Shared Utilities

### **NavigationHelper Class**

**Location**: `src/shared/helpers/NavigationHelper.ts`

**Purpose**: Provides navigation utilities across applications.

```typescript
export class NavigationHelper {
  constructor(private page: Page, private testWorld: TestWorld) {}
  
  /**
   * Navigates to a page by name
   * @param pageName - Human-readable page name
   * @returns Promise that resolves when navigation is complete
   */
  async navigateTo(pageName: string): Promise<void> {
    const url = this.testWorld.getExpectedUrl(pageName);
    await this.page.goto(url);
    await this.testWorld.waitForPageLoad();
  }
  
  /**
   * Clicks on a navigation tab
   * @param tabName - Name of the tab to click
   * @returns Promise that resolves when tab is clicked and active
   */
  async clickTab(tabName: string): Promise<void> {
    const tabSelector = `[data-testid="${tabName.toLowerCase().replace(' ', '-')}-tab"]`;
    await this.page.click(tabSelector);
    await this.waitForTabActive(tabName);
  }
  
  /**
   * Navigates to Document Hub
   * @returns Promise that resolves when navigation is complete
   */
  async navigateToDocumentHub(): Promise<void> {
    await this.navigateTo('Document Hub');
  }
  
  /**
   * Navigates to user profile
   * @param userId - Optional user ID, defaults to current user
   * @returns Promise that resolves when navigation is complete
   */
  async navigateToUserProfile(userId?: string): Promise<void> {
    const url = userId ? `/profile/${userId}` : '/profile';
    await this.page.goto(url);
    await this.testWorld.waitForPageLoad();
  }
}
```

### **AuthenticationHelper Class**

**Location**: `src/shared/helpers/AuthenticationHelper.ts`

```typescript
export class AuthenticationHelper {
  constructor(private page: Page, private testWorld: TestWorld) {}
  
  /**
   * Logs in with a specific role
   * @param role - User role ('admin', 'user', 'manager', etc.)
   * @returns Promise that resolves when login is complete
   */
  async loginWithRole(role: string): Promise<void> {
    const credentials = this.getCredentialsForRole(role);
    await this.login(credentials.email, credentials.password);
  }
  
  /**
   * Logs in as administrator
   * @returns Promise that resolves when login is complete
   */
  async loginAsAdmin(): Promise<void> {
    await this.loginWithRole('admin');
  }
  
  /**
   * Performs login with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise that resolves when login is complete
   */
  async login(email: string, password: string): Promise<void> {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await this.page.waitForURL('**/dashboard');
    await this.testWorld.waitForPageLoad();
  }
  
  /**
   * Logs out current user
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout"]');
    await this.page.waitForURL('**/login');
  }
  
  /**
   * Gets test credentials for a specific role
   * @param role - User role
   * @returns Test credentials for the role
   */
  private getCredentialsForRole(role: string): LoginCredentials {
    const credentialsMap = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      user: { email: 'user@example.com', password: 'user123' },
      manager: { email: 'manager@example.com', password: 'manager123' }
    };
    
    return credentialsMap[role] || credentialsMap.user;
  }
}
```

### **RoleBasedLocators Class**

**Location**: `src/shared/helpers/RoleBasedLocators.ts`

```typescript
export class RoleBasedLocators {
  constructor(private page: Page, private testWorld: TestWorld) {}
  
  /**
   * Gets locators based on user role
   * @param role - User role
   * @returns Role-specific locators
   */
  getLocatorsForRole(role: string): RoleLocators {
    const baseLocators = {
      navigation: this.page.locator('[data-testid="main-nav"]'),
      userMenu: this.page.locator('[data-testid="user-menu"]')
    };
    
    switch (role) {
      case 'admin':
        return {
          ...baseLocators,
          adminPanel: this.page.locator('[data-testid="admin-panel"]'),
          userManagement: this.page.locator('[data-testid="user-management"]'),
          systemSettings: this.page.locator('[data-testid="system-settings"]')
        };
      
      case 'manager':
        return {
          ...baseLocators,
          teamDashboard: this.page.locator('[data-testid="team-dashboard"]'),
          reports: this.page.locator('[data-testid="reports"]')
        };
        
      default:
        return baseLocators;
    }
  }
}
```

---

## 📊 Configuration APIs

### **ConfigManager Class**

**Location**: `src/core/managers/ConfigManager.ts`

```typescript
export class ConfigManager {
  private static instance: ConfigManager;
  private configurations: Map<string, any> = new Map();
  
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
  
  /**
   * Loads configuration for a specific environment
   * @param environment - Target environment
   * @returns Promise that resolves when configuration is loaded
   */
  async loadEnvironmentConfig(environment: string): Promise<void> {
    const configPath = `./config/environments/${environment}.config.ts`;
    const config = await import(configPath);
    this.configurations.set(`env:${environment}`, config);
  }
  
  /**
   * Gets configuration value by key
   * @param key - Configuration key
   * @param defaultValue - Default value if key not found
   * @returns Configuration value or default
   */
  get<T>(key: string, defaultValue?: T): T {
    const [scope, ...path] = key.split('.');
    const config = this.configurations.get(scope);
    
    if (!config) return defaultValue as T;
    
    return this.getNestedValue(config, path, defaultValue);
  }
  
  /**
   * Sets configuration value
   * @param key - Configuration key
   * @param value - Value to set
   */
  set(key: string, value: any): void {
    const [scope, ...path] = key.split('.');
    let config = this.configurations.get(scope) || {};
    
    this.setNestedValue(config, path, value);
    this.configurations.set(scope, config);
  }
}
```

---

## 🗃️ Test Data Management

### **TestDataManager Class**

**Location**: `src/core/managers/TestDataManager.ts`

```typescript
export class TestDataManager {
  private testDataCache: Map<string, any> = new Map();
  
  constructor(private environment: string) {}
  
  /**
   * Gets test user data
   * @param userType - Type of test user needed
   * @returns Test user data
   */
  getTestUser(userType: string): TestUser {
    const cacheKey = `user:${userType}`;
    
    if (!this.testDataCache.has(cacheKey)) {
      const userData = this.generateTestUser(userType);
      this.testDataCache.set(cacheKey, userData);
    }
    
    return this.testDataCache.get(cacheKey);
  }
  
  /**
   * Gets test document data
   * @param documentType - Type of document needed
   * @returns Test document data
   */
  getTestDocument(documentType: string): TestDocument {
    const documents = {
      pdf: {
        name: 'test-document.pdf',
        path: './test-data/documents/sample.pdf',
        type: 'application/pdf',
        size: 1024000
      },
      docx: {
        name: 'test-document.docx',
        path: './test-data/documents/sample.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000
      }
    };
    
    return documents[documentType] || documents.pdf;
  }
  
  /**
   * Seeds test data for environment
   * @returns Promise that resolves when seeding is complete
   */
  async seedTestData(): Promise<void> {
    await this.seedUsers();
    await this.seedDocuments();
    await this.seedSystemData();
  }
  
  /**
   * Cleans up test data
   * @returns Promise that resolves when cleanup is complete
   */
  async cleanupTestData(): Promise<void> {
    await this.cleanupUsers();
    await this.cleanupDocuments();
    await this.cleanupSystemData();
    this.testDataCache.clear();
  }
}
```

### **TestDataSeeder Class**

**Location**: `src/data/TestDataSeeder.ts`

```typescript
export class TestDataSeeder {
  constructor(private environment: string) {}
  
  /**
   * Seeds database with test data
   * @returns Promise that resolves when seeding is complete
   */
  async seed(): Promise<void> {
    await this.seedUsers();
    await this.seedDocuments();
    await this.seedFeatures();
  }
  
  /**
   * Seeds test users
   * @returns Promise that resolves when user seeding is complete
   */
  async seedUsers(): Promise<void> {
    const users = [
      { email: 'admin@example.com', role: 'admin', name: 'Test Admin' },
      { email: 'user@example.com', role: 'user', name: 'Test User' },
      { email: 'manager@example.com', role: 'manager', name: 'Test Manager' }
    ];
    
    for (const user of users) {
      await this.createUser(user);
    }
  }
  
  /**
   * Creates a test user
   * @param userData - User data to create
   * @returns Promise that resolves when user is created
   */
  private async createUser(userData: any): Promise<void> {
    // Implementation depends on your backend API
    // This is a placeholder for the actual implementation
  }
}
```

---

## 📈 Reporting APIs

### **CustomReporter Class**

**Location**: `src/core/reporters/CustomReporter.ts`

```typescript
export class CustomReporter implements Reporter {
  private startTime: number = 0;
  private results: TestResult[] = [];
  
  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    console.log('🚀 Starting E2E Test Suite');
  }
  
  onTestEnd(test: TestCase, result: TestResult): void {
    this.results.push(result);
    
    const status = this.getStatusEmoji(result.status);
    const duration = (result.duration / 1000).toFixed(1);
    
    console.log(`${status} ${test.title} - ${result.status.toUpperCase()} (${duration}s)`);
  }
  
  onEnd(): void {
    const duration = (Date.now() - this.startTime) / 1000;
    const summary = this.generateSummary();
    
    console.log('\n📊 Test Results Summary:');
    console.log(`   Total: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed} (${summary.passRate}%)`);
    console.log(`   ❌ Failed: ${summary.failed} (${summary.failRate}%)`);
    console.log(`   ⏭️  Skipped: ${summary.skipped}`);
    console.log(`   🔄 Flaky: ${summary.flaky}`);
    console.log(`   ⏱️  Duration: ${duration.toFixed(1)}s`);
    
    this.generateDetailedReport();
  }
  
  /**
   * Generates test summary statistics
   * @returns Summary object with test statistics
   */
  private generateSummary(): TestSummary {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const flaky = this.results.filter(r => r.status === 'flaky').length;
    
    return {
      total,
      passed,
      failed,
      skipped,
      flaky,
      passRate: Math.round((passed / total) * 100),
      failRate: Math.round((failed / total) * 100)
    };
  }
}
```

---

## 🔌 Extension Points

### **Creating Custom Page Objects**

```typescript
// Extend WebappBasePage for WebApp pages
export class CustomFeaturePage extends WebappBasePage {
  async navigate(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/custom-feature`);
    await this.waitForPageReady();
  }
  
  async waitForPageReady(): Promise<void> {
    await this.page.waitForSelector('[data-testid="custom-feature-container"]');
  }
}

// Extend AdminBasePage for AdminApp pages
export class CustomAdminPage extends AdminBasePage {
  // Implementation
}
```

### **Creating Custom API Clients**

```typescript
// Extend BaseAPI for new API clients
export class CustomAPI extends BaseAPI {
  async customEndpoint(data: any): Promise<any> {
    const response = await this.request.post('/api/custom', { data });
    this.validateResponse(response, 200);
    return response.json();
  }
}
```

### **Creating Custom Helpers**

```typescript
// Create application-specific helpers
export class CustomHelper {
  constructor(private page: Page, private testWorld: TestWorld) {}
  
  async performCustomWorkflow(): Promise<void> {
    // Custom workflow implementation
  }
}
```

This comprehensive API reference provides complete documentation for all framework components, enabling developers to effectively use, extend, and maintain the Playwright E2E Testing Framework.