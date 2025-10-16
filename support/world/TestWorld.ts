/**
 * TestWorld - Playwright-BDD Test Context
 * 
 * Provides shared state and utilities across all step definitions
 * Acts as the context in Playwright-BDD step functions
 */

const { Browser, Page, BrowserContext } = require('@playwright/test');
const { environmentConfig } = require('../../framework/config/EnvironmentConfig');

export interface TestContext {
  isAuthenticated?: boolean;
  uploadedDocuments?: string[];
  generatedFeatures?: string[];
  currentFeatureFile?: string;
  searchResults?: any[];
  selectedDocuments?: string[];
  testStartTime?: number;
  performanceMetrics?: Record<string, number>;
  apiResponses?: Record<string, any>;
  errorMessages?: string[];
  userSessions?: Record<string, any>;
}

export class TestWorld {
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public testContext: TestContext = {};
  
  // Page Objects
  public webappPages!: WebappPages;
  public adminAppPages!: AdminAppPages;
  public currentPage: any;
  
  // Helpers and Utilities
  public testDataManager!: TestDataManager;
  public apiHelper!: ApiHelper;
  public roleBasedLocators!: RoleBasedLocators;
  public navigationHelper!: NavigationHelper;
  public authenticationHelper!: AuthenticationHelper;
  public applicationManager!: ApplicationManager;
  
  // Components
  public sidebarComponent!: SidebarComponent;
  
  // Configuration
  public config: typeof environmentConfig;

  constructor() {
    this.config = environmentConfig;
    this.testContext.testStartTime = Date.now();
  }

  /**
   * Initialize browser and page context
   */
  async initializeBrowser(browser: Browser): Promise<void> {
    this.browser = browser;
    this.context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      acceptDownloads: true
    });
    this.page = await this.context.newPage();
    
    await this.setupPageHelpers();
    await this.initializePageObjects();
    await this.initializeHelpers();
  }

  /**
   * Setup page-level helpers that depend on the page instance
   */
  async setupPageHelpers(): Promise<void> {
    this.roleBasedLocators = new RoleBasedLocators(this.page);
    this.navigationHelper = new NavigationHelper(this.page);
    this.authenticationHelper = new AuthenticationHelper(this.page);
    this.sidebarComponent = new SidebarComponent(this.page, this.roleBasedLocators);
  }

  /**
   * Initialize page objects for different applications
   */
  async initializePageObjects(): Promise<void> {
    this.webappPages = new WebappPages(this.page, this.roleBasedLocators);
    this.adminAppPages = new AdminAppPages(this.page, this.roleBasedLocators);
  }

  /**
   * Initialize helper utilities
   */
  async initializeHelpers(): Promise<void> {
    this.testDataManager = new TestDataManager();
    // Use the public getApiConfig() method to get the API base URL
    this.apiHelper = new ApiHelper(this.config.getApiConfig().baseUrl);
    this.applicationManager = new ApplicationManager();
  }

  /**
   * Set the current page context for the test
   */
  setCurrentPage(applicationName: string, pageName: string): void {
    switch (applicationName.toLowerCase()) {
      case 'webapp':
        this.currentPage = this.getWebappPage(pageName);
        break;
      case 'adminapp':
        this.currentPage = this.getAdminAppPage(pageName);
        break;
      default:
        throw new Error(`Unknown application: ${applicationName}`);
    }
  }

  /**
   * Get webapp page object by name
   */
  private getWebappPage(pageName: string): any {
    const pageMap: Record<string, any> = {
      'login': this.webappPages.loginPage,
      'dashboard': this.webappPages.dashboardPage,
      'document-hub': this.webappPages.documentHubPage,
      'feature-generator': this.webappPages.featureGeneratorPage,
      'settings': this.webappPages.settingsPage
    };
    
    const page = pageMap[pageName.toLowerCase().replace(/\s+/g, '-')];
    if (!page) {
      throw new Error(`Unknown webapp page: ${pageName}`);
    }
    return page;
  }

  /**
   * Get admin app page object by name
   */
  private getAdminAppPage(pageName: string): any {
    const pageMap: Record<string, any> = {
      'dashboard': this.adminAppPages.dashboardPage,
      'user-management': this.adminAppPages.userManagementPage,
      'system-logs': this.adminAppPages.systemLogsPage,
      'system-monitoring': this.adminAppPages.systemMonitoringPage
    };
    
    const page = pageMap[pageName.toLowerCase().replace(/\s+/g, '-')];
    if (!page) {
      throw new Error(`Unknown admin app page: ${pageName}`);
    }
    return page;
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Capture screenshot
   */
  async captureScreenshot(name?: string): Promise<Buffer> {
    const screenshotName = name || `screenshot-${Date.now()}`;
    return await this.page.screenshot({ 
      path: `test-results/screenshots/${screenshotName}.png`,
      fullPage: true 
    });
  }

  /**
   * Set context data
   */
  setContextData(key: string, value: any): void {
    (this.testContext as any)[key] = value;
  }

  /**
   * Get context data
   */
  getContextData(key: string): any {
    return (this.testContext as any)[key];
  }

  /**
   * Log performance metric
   */
  logPerformanceMetric(name: string, value: number): void {
    if (!this.testContext.performanceMetrics) {
      this.testContext.performanceMetrics = {};
    }
    this.testContext.performanceMetrics[name] = value;
  }

  /**
   * Get elapsed time since test start
   */
  getElapsedTime(): number {
    return Date.now() - (this.testContext.testStartTime || Date.now());
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
  }

  /**
   * Reset test context for new scenario
   */
  resetTestContext(): void {
    this.testContext = {
      testStartTime: Date.now()
    };
  }

  /**
   * Handle application errors
   */
  async handleApplicationError(error: Error): Promise<void> {
    console.error('Application error occurred:', error.message);
    
    // Capture screenshot for debugging
    await this.captureScreenshot(`error-${Date.now()}`);
    
    // Log error to context
    if (!this.testContext.errorMessages) {
      this.testContext.errorMessages = [];
    }
    this.testContext.errorMessages.push(error.message);
    
    // Re-throw for test framework to handle
    throw error;
  }

  /**
   * Verify application is responsive
   */
  async verifyApplicationResponsive(): Promise<boolean> {
    try {
      const startTime = Date.now();
      await this.page.locator('body').waitFor({ timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      this.logPerformanceMetric('page_response_time', responseTime);
      return responseTime < 5000;
    } catch (error) {
      return false;
    }
  }

  /**
   * Switch between different applications
   */
  async switchToApplication(applicationName: string): Promise<void> {
    const baseUrls = {
      'webapp': this.config.getUIConfig().baseUrl,
      'adminapp': this.config.getAdminConfig().baseUrl,
      'mcp-platform': this.config.getApiConfig().baseUrl
    };
    
    const baseUrl = baseUrls[applicationName.toLowerCase() as keyof typeof baseUrls];
    if (!baseUrl) {
      throw new Error(`Unknown application: ${applicationName}`);
    }
    
    await this.page.goto(baseUrl);
    await this.waitForPageLoad();
  }
}

// World constructor removed - now handled by Playwright-BDD fixtures