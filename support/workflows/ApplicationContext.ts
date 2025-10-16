/**
 * Application Context
 * 
 * Manages application context switching and state during workflows
 */

import { Page, BrowserContext } from '@playwright/test';
import { ApplicationType } from '../config';
import { WebappAPI } from '../api/webapp/WebappAPI';
import { AdminAPI } from '../api/adminapp/AdminAPI';
import { McpAPI } from '../api/mcp-platform/McpAPI';
import { LoginPage } from '../pages/webapp/LoginPage';
import { RoleBasedLocators } from '../helpers/RoleBasedLocators';

export interface ApplicationSession {
  page: Page;
  api: WebappAPI | AdminAPI | McpAPI;
  authenticated: boolean;
  authToken?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  locators: RoleBasedLocators;
}

export interface ContextSwitchResult {
  previousApp: ApplicationType;
  currentApp: ApplicationType;
  switchTime: number;
  success: boolean;
  error?: string;
}

export class ApplicationContext {
  private sessions: Map<ApplicationType, ApplicationSession> = new Map();
  private currentApp: ApplicationType = 'webapp';
  private browserContext: BrowserContext;
  private switchHistory: ContextSwitchResult[] = [];

  constructor(browserContext: BrowserContext) {
    this.browserContext = browserContext;
  }

  /**
   * Initialize application session
   */
  async initializeApp(app: ApplicationType, baseUrl?: string): Promise<ApplicationSession> {
    // Check if already initialized
    if (this.sessions.has(app)) {
      return this.sessions.get(app)!;
    }

    // Create new page
    const page = await this.browserContext.newPage();
    const locators = new RoleBasedLocators(page);

    // Create API client
    let api: WebappAPI | AdminAPI | McpAPI;
    switch (app) {
      case 'webapp':
        api = new WebappAPI(page.context().request, { baseURL: baseUrl });
        break;
      case 'admin':
        api = new AdminAPI(page.context().request, { baseURL: baseUrl });
        break;
      case 'mcp':
        api = new McpAPI(page.context().request, { baseURL: baseUrl });
        break;
    }

    const session: ApplicationSession = {
      page,
      api,
      authenticated: false,
      locators
    };

    this.sessions.set(app, session);
    return session;
  }

  /**
   * Switch to different application
   */
  async switchTo(app: ApplicationType): Promise<ContextSwitchResult> {
    const startTime = Date.now();
    const previousApp = this.currentApp;

    const result: ContextSwitchResult = {
      previousApp,
      currentApp: app,
      switchTime: 0,
      success: false
    };

    try {
      // Initialize if not exists
      if (!this.sessions.has(app)) {
        await this.initializeApp(app);
      }

      const session = this.sessions.get(app)!;
      
      // Bring page to front
      await session.page.bringToFront();
      
      // Wait for page to be ready
      await session.page.waitForLoadState('domcontentloaded');

      this.currentApp = app;
      result.success = true;
    } catch (error) {
      result.error = error.message;
    }

    result.switchTime = Date.now() - startTime;
    this.switchHistory.push(result);
    
    return result;
  }

  /**
   * Get current application
   */
  getCurrentApp(): ApplicationType {
    return this.currentApp;
  }

  /**
   * Get current session
   */
  getCurrentSession(): ApplicationSession {
    const session = this.sessions.get(this.currentApp);
    if (!session) {
      throw new Error(`No session for current app: ${this.currentApp}`);
    }
    return session;
  }

  /**
   * Get session for specific app
   */
  getSession(app: ApplicationType): ApplicationSession | undefined {
    return this.sessions.get(app);
  }

  /**
   * Get current page
   */
  get page(): Page {
    return this.getCurrentSession().page;
  }

  /**
   * Get current API
   */
  get api(): WebappAPI | AdminAPI | McpAPI {
    return this.getCurrentSession().api;
  }

  /**
   * Get current locators
   */
  get locators(): RoleBasedLocators {
    return this.getCurrentSession().locators;
  }

  /**
   * Authenticate application
   */
  async authenticate(app: ApplicationType, credentials: {
    email: string;
    password: string;
  }): Promise<void> {
    await this.switchTo(app);
    const session = this.sessions.get(app)!;

    if (session.authenticated) {
      return; // Already authenticated
    }

    try {
      // API authentication
      let authResponse: any;
      if (app === 'webapp') {
        authResponse = await (session.api as WebappAPI).login(credentials);
      } else if (app === 'admin') {
        authResponse = await (session.api as AdminAPI).login(credentials);
      }

      if (authResponse) {
        session.authenticated = true;
        session.authToken = authResponse.token;
        session.user = authResponse.user;
      }

      // UI authentication if needed
      const currentUrl = session.page.url();
      if (currentUrl.includes('/login')) {
        const loginPage = new LoginPage(session.page, session.locators);
        await loginPage.login(credentials.email, credentials.password);
      }
    } catch (error) {
      throw new Error(`Authentication failed for ${app}: ${error.message}`);
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(app?: ApplicationType): boolean {
    const targetApp = app || this.currentApp;
    const session = this.sessions.get(targetApp);
    return session?.authenticated || false;
  }

  /**
   * Get auth token
   */
  getAuthToken(app?: ApplicationType): string | undefined {
    const targetApp = app || this.currentApp;
    const session = this.sessions.get(targetApp);
    return session?.authToken;
  }

  /**
   * Get authenticated user
   */
  getUser(app?: ApplicationType): ApplicationSession['user'] | undefined {
    const targetApp = app || this.currentApp;
    const session = this.sessions.get(targetApp);
    return session?.user;
  }

  /**
   * Navigate to URL in current app
   */
  async navigateTo(path: string): Promise<void> {
    const session = this.getCurrentSession();
    const baseUrl = session.page.url().split('/').slice(0, 3).join('/');
    const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;
    await session.page.goto(fullUrl);
  }

  /**
   * Execute in app context
   */
  async executeInApp<T>(
    app: ApplicationType,
    fn: (session: ApplicationSession) => Promise<T>
  ): Promise<T> {
    const previousApp = this.currentApp;
    
    try {
      await this.switchTo(app);
      const session = this.sessions.get(app)!;
      return await fn(session);
    } finally {
      // Switch back to previous app
      if (previousApp !== app) {
        await this.switchTo(previousApp);
      }
    }
  }

  /**
   * Execute in all apps
   */
  async executeInAllApps<T>(
    fn: (app: ApplicationType, session: ApplicationSession) => Promise<T>
  ): Promise<Map<ApplicationType, T>> {
    const results = new Map<ApplicationType, T>();

    for (const [app, session] of this.sessions) {
      await this.switchTo(app);
      const result = await fn(app, session);
      results.set(app, result);
    }

    return results;
  }

  /**
   * Wait for condition across apps
   */
  async waitForConditionAcrossApps(
    condition: (app: ApplicationType, session: ApplicationSession) => Promise<boolean>,
    options: {
      timeout?: number;
      interval?: number;
      apps?: ApplicationType[];
    } = {}
  ): Promise<ApplicationType | null> {
    const timeout = options.timeout || 30000;
    const interval = options.interval || 1000;
    const apps = options.apps || Array.from(this.sessions.keys());
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      for (const app of apps) {
        const session = this.sessions.get(app);
        if (session) {
          await this.switchTo(app);
          if (await condition(app, session)) {
            return app;
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    return null;
  }

  /**
   * Take screenshots from all apps
   */
  async takeScreenshotsFromAllApps(prefix: string): Promise<Map<ApplicationType, string>> {
    const screenshots = new Map<ApplicationType, string>();

    for (const [app, session] of this.sessions) {
      try {
        const filename = `${prefix}_${app}_${Date.now()}.png`;
        await session.page.screenshot({
          path: `test-results/screenshots/${filename}`,
          fullPage: true
        });
        screenshots.set(app, filename);
      } catch (error) {
        console.warn(`Failed to capture screenshot for ${app}: ${error.message}`);
      }
    }

    return screenshots;
  }

  /**
   * Get switch history
   */
  getSwitchHistory(): ContextSwitchResult[] {
    return [...this.switchHistory];
  }

  /**
   * Clear switch history
   */
  clearSwitchHistory(): void {
    this.switchHistory = [];
  }

  /**
   * Close application session
   */
  async closeApp(app: ApplicationType): Promise<void> {
    const session = this.sessions.get(app);
    if (session && !session.page.isClosed()) {
      await session.page.close();
      this.sessions.delete(app);
      
      // Switch to another app if closing current
      if (this.currentApp === app && this.sessions.size > 0) {
        const nextApp = this.sessions.keys().next().value;
        await this.switchTo(nextApp);
      }
    }
  }

  /**
   * Close all sessions
   */
  async closeAll(): Promise<void> {
    for (const [app, session] of this.sessions) {
      if (!session.page.isClosed()) {
        await session.page.close();
      }
    }
    this.sessions.clear();
    this.switchHistory = [];
  }

  /**
   * Get metrics
   */
  getMetrics(): {
    totalSwitches: number;
    averageSwitchTime: number;
    successRate: number;
    sessionCount: number;
  } {
    const totalSwitches = this.switchHistory.length;
    const successfulSwitches = this.switchHistory.filter(s => s.success).length;
    const totalSwitchTime = this.switchHistory.reduce((sum, s) => sum + s.switchTime, 0);

    return {
      totalSwitches,
      averageSwitchTime: totalSwitches > 0 ? totalSwitchTime / totalSwitches : 0,
      successRate: totalSwitches > 0 ? successfulSwitches / totalSwitches : 1,
      sessionCount: this.sessions.size
    };
  }
}