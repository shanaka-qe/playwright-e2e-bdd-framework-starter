/**
 * Base Workflow
 * 
 * Abstract base class for all cross-application E2E workflows
 * Provides common functionality for workflow execution and state management
 */

import { Page, BrowserContext, APIRequestContext } from '@playwright/test';
import { getConfigManager, ApplicationType } from '../config';
import { TestDataManager } from '../data/TestDataManager';

export interface WorkflowContext {
  id: string;
  name: string;
  startTime: Date;
  currentApp: ApplicationType;
  pages: Map<ApplicationType, Page>;
  apis: Map<ApplicationType, APIRequestContext>;
  state: WorkflowState;
  metadata: Record<string, any>;
}

export interface WorkflowState {
  currentStep: number;
  totalSteps: number;
  stepResults: StepResult[];
  data: Record<string, any>;
  errors: WorkflowError[];
  status: WorkflowStatus;
}

export interface StepResult {
  stepNumber: number;
  name: string;
  application: ApplicationType;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  data?: any;
  error?: WorkflowError;
  screenshots?: string[];
}

export interface WorkflowError {
  step: number;
  message: string;
  application?: ApplicationType;
  stack?: string;
  screenshot?: string;
  recoverable: boolean;
}

export enum WorkflowStatus {
  NOT_STARTED = 'not_started',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface WorkflowOptions {
  continueOnError?: boolean;
  captureScreenshots?: boolean;
  captureTrace?: boolean;
  timeout?: number;
  retryFailedSteps?: number;
  parallel?: boolean;
}

export abstract class BaseWorkflow {
  protected context: WorkflowContext;
  protected options: WorkflowOptions;
  protected configManager = getConfigManager();
  protected dataManager?: TestDataManager;
  protected steps: WorkflowStep[] = [];

  constructor(
    protected browserContext: BrowserContext,
    name: string,
    options: WorkflowOptions = {}
  ) {
    this.options = {
      continueOnError: false,
      captureScreenshots: true,
      captureTrace: true,
      timeout: 300000, // 5 minutes default
      retryFailedSteps: 0,
      parallel: false,
      ...options
    };

    this.context = {
      id: this.generateWorkflowId(),
      name,
      startTime: new Date(),
      currentApp: 'webapp',
      pages: new Map(),
      apis: new Map(),
      state: {
        currentStep: 0,
        totalSteps: 0,
        stepResults: [],
        data: {},
        errors: [],
        status: WorkflowStatus.NOT_STARTED
      },
      metadata: {}
    };

    this.defineSteps();
    this.context.state.totalSteps = this.steps.length;
  }

  /**
   * Define workflow steps - must be implemented by subclasses
   */
  protected abstract defineSteps(): void;

  /**
   * Generate unique workflow ID
   */
  protected generateWorkflowId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `workflow_${timestamp}_${random}`;
  }

  /**
   * Set test data manager
   */
  setDataManager(dataManager: TestDataManager): void {
    this.dataManager = dataManager;
  }

  /**
   * Execute the workflow
   */
  async execute(): Promise<WorkflowState> {
    console.log(`Starting workflow: ${this.context.name} (${this.context.id})`);
    this.context.state.status = WorkflowStatus.RUNNING;

    try {
      // Initialize pages for all applications
      await this.initializeApplications();

      // Execute steps
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        this.context.state.currentStep = i + 1;

        const result = await this.executeStep(step, i + 1);
        this.context.state.stepResults.push(result);

        if (result.status === 'failed' && !this.options.continueOnError) {
          throw new Error(`Step ${i + 1} failed: ${result.error?.message}`);
        }
      }

      this.context.state.status = WorkflowStatus.COMPLETED;
    } catch (error) {
      this.context.state.status = WorkflowStatus.FAILED;
      this.context.state.errors.push({
        step: this.context.state.currentStep,
        message: error.message,
        stack: error.stack,
        recoverable: false
      });
    } finally {
      await this.cleanup();
    }

    return this.context.state;
  }

  /**
   * Initialize pages for all required applications
   */
  protected async initializeApplications(): Promise<void> {
    const requiredApps = this.getRequiredApplications();

    for (const app of requiredApps) {
      const page = await this.browserContext.newPage();
      this.context.pages.set(app, page);

      // Set up API context
      const api = page.context().request;
      this.context.apis.set(app, api);

      // Configure page based on app
      const config = this.configManager.getConfig(app);
      await page.goto(config.getBaseUrl());
    }
  }

  /**
   * Get required applications from steps
   */
  protected getRequiredApplications(): Set<ApplicationType> {
    const apps = new Set<ApplicationType>();
    for (const step of this.steps) {
      apps.add(step.application);
    }
    return apps;
  }

  /**
   * Execute a single step
   */
  protected async executeStep(step: WorkflowStep, stepNumber: number): Promise<StepResult> {
    const result: StepResult = {
      stepNumber,
      name: step.name,
      application: step.application,
      startTime: new Date(),
      status: 'running'
    };

    console.log(`Executing step ${stepNumber}: ${step.name} (${step.application})`);

    // Switch to correct application
    await this.switchToApplication(step.application);

    let attempts = 0;
    const maxAttempts = 1 + (this.options.retryFailedSteps || 0);

    while (attempts < maxAttempts) {
      try {
        // Execute step
        const stepData = await step.execute(this.context);
        
        result.endTime = new Date();
        result.duration = result.endTime.getTime() - result.startTime.getTime();
        result.status = 'completed';
        result.data = stepData;

        // Store step data in workflow state
        if (step.storeAs) {
          this.context.state.data[step.storeAs] = stepData;
        }

        // Capture screenshot if enabled
        if (this.options.captureScreenshots) {
          const screenshot = await this.captureScreenshot(step);
          if (screenshot) {
            result.screenshots = [screenshot];
          }
        }

        break; // Success, exit retry loop
      } catch (error) {
        attempts++;
        
        if (attempts >= maxAttempts) {
          result.status = 'failed';
          result.error = {
            step: stepNumber,
            message: error.message,
            application: step.application,
            stack: error.stack,
            recoverable: step.recoverable || false
          };

          // Capture error screenshot
          if (this.options.captureScreenshots) {
            const screenshot = await this.captureScreenshot(step, true);
            if (screenshot) {
              result.error.screenshot = screenshot;
            }
          }

          if (!this.options.continueOnError) {
            throw error;
          }
        } else {
          console.log(`Retrying step ${stepNumber} (attempt ${attempts + 1}/${maxAttempts})`);
          await this.page.waitForTimeout(2000); // Wait before retry
        }
      }
    }

    return result;
  }

  /**
   * Switch to a different application
   */
  protected async switchToApplication(app: ApplicationType): Promise<void> {
    if (this.context.currentApp === app) {
      return; // Already on correct app
    }

    this.context.currentApp = app;
    const page = this.context.pages.get(app);
    
    if (!page) {
      throw new Error(`Application ${app} not initialized`);
    }

    // Bring page to front
    await page.bringToFront();
  }

  /**
   * Get current page
   */
  protected get page(): Page {
    const page = this.context.pages.get(this.context.currentApp);
    if (!page) {
      throw new Error(`No page for application ${this.context.currentApp}`);
    }
    return page;
  }

  /**
   * Get page for specific application
   */
  protected getPage(app: ApplicationType): Page {
    const page = this.context.pages.get(app);
    if (!page) {
      throw new Error(`No page for application ${app}`);
    }
    return page;
  }

  /**
   * Get API context for specific application
   */
  protected getAPI(app: ApplicationType): APIRequestContext {
    const api = this.context.apis.get(app);
    if (!api) {
      throw new Error(`No API context for application ${app}`);
    }
    return api;
  }

  /**
   * Capture screenshot
   */
  protected async captureScreenshot(step: WorkflowStep, isError = false): Promise<string | undefined> {
    try {
      const page = this.getPage(step.application);
      const filename = `${this.context.id}_step${step.name.replace(/\s+/g, '_')}${isError ? '_error' : ''}.png`;
      
      await page.screenshot({
        path: `test-results/workflows/${filename}`,
        fullPage: true
      });

      return filename;
    } catch (error) {
      console.warn(`Failed to capture screenshot: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Add custom step
   */
  protected addStep(step: WorkflowStep): void {
    this.steps.push(step);
  }

  /**
   * Get workflow state
   */
  getState(): WorkflowState {
    return { ...this.context.state };
  }

  /**
   * Get workflow data
   */
  getData<T = any>(key?: string): T {
    if (key) {
      return this.context.state.data[key];
    }
    return this.context.state.data as T;
  }

  /**
   * Set workflow data
   */
  setData(key: string, value: any): void {
    this.context.state.data[key] = value;
  }

  /**
   * Cleanup after workflow
   */
  protected async cleanup(): Promise<void> {
    // Close all pages except the first one
    for (const [app, page] of this.context.pages) {
      if (!page.isClosed()) {
        // Don't close the first page as it's managed by Playwright
        if (app !== 'webapp') {
          await page.close();
        }
      }
    }
  }

  /**
   * Validate workflow can execute
   */
  async validate(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check required applications are configured
    const requiredApps = this.getRequiredApplications();
    for (const app of requiredApps) {
      const config = this.configManager.getConfig(app);
      const validation = config.validate();
      
      if (!validation.valid) {
        errors.push(`${app} configuration invalid: ${validation.errors?.map(e => e.message).join(', ')}`);
      }
    }

    // Check steps are defined
    if (this.steps.length === 0) {
      errors.push('No steps defined in workflow');
    }

    // Validate each step
    for (const step of this.steps) {
      if (step.validate) {
        const stepValidation = await step.validate(this.context);
        if (!stepValidation.valid) {
          errors.push(...(stepValidation.errors || []));
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  name: string;
  application: ApplicationType;
  execute: (context: WorkflowContext) => Promise<any>;
  validate?: (context: WorkflowContext) => Promise<{ valid: boolean; errors?: string[] }>;
  storeAs?: string;
  recoverable?: boolean;
  timeout?: number;
}