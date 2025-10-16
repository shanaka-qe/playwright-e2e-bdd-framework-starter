/**
 * Workflow Exports
 * 
 * Central export point for all workflow components
 */

// Base workflow classes
export { BaseWorkflow } from './BaseWorkflow';
export type { 
  WorkflowContext,
  WorkflowState,
  WorkflowStatus,
  WorkflowOptions,
  WorkflowStep,
  StepResult,
  WorkflowError
} from './BaseWorkflow';

// Application context
export { ApplicationContext } from './ApplicationContext';
export type { 
  ApplicationSession,
  ContextSwitchResult 
} from './ApplicationContext';

// Workflow state management
export { WorkflowStateManager } from './WorkflowStateManager';
export type {
  StateTransition,
  WorkflowMetrics,
  StateSnapshot
} from './WorkflowStateManager';

// Workflow scenarios
export { DocumentToFeatureWorkflow } from './scenarios/DocumentToFeatureWorkflow';
export type { DocumentToFeatureOptions } from './scenarios/DocumentToFeatureWorkflow';

export { FullQAWorkflow } from './scenarios/FullQAWorkflow';
export type { FullQAWorkflowOptions } from './scenarios/FullQAWorkflow';

export { AdminMonitoringWorkflow } from './scenarios/AdminMonitoringWorkflow';
export type { MonitoringWorkflowOptions } from './scenarios/AdminMonitoringWorkflow';

// Workflow factory
export class WorkflowFactory {
  /**
   * Create document to feature workflow
   */
  static createDocumentToFeature(
    browserContext: any,
    options: import('./scenarios/DocumentToFeatureWorkflow').DocumentToFeatureOptions
  ): DocumentToFeatureWorkflow {
    return new DocumentToFeatureWorkflow(browserContext, options);
  }

  /**
   * Create full QA workflow
   */
  static createFullQA(
    browserContext: any,
    options: import('./scenarios/FullQAWorkflow').FullQAWorkflowOptions
  ): FullQAWorkflow {
    return new FullQAWorkflow(browserContext, options);
  }

  /**
   * Create admin monitoring workflow
   */
  static createAdminMonitoring(
    browserContext: any,
    options?: import('./scenarios/AdminMonitoringWorkflow').MonitoringWorkflowOptions
  ): AdminMonitoringWorkflow {
    return new AdminMonitoringWorkflow(browserContext, options);
  }
}

// Workflow runner utility
export class WorkflowRunner {
  constructor(private browserContext: any) {}

  /**
   * Run workflow with error handling and reporting
   */
  async run<T extends BaseWorkflow>(
    workflow: T,
    options: {
      screenshot?: boolean;
      report?: boolean;
      stateManager?: WorkflowStateManager;
    } = {}
  ): Promise<{
    success: boolean;
    state: import('./BaseWorkflow').WorkflowState;
    report?: any;
    error?: Error;
  }> {
    let stateManager = options.stateManager;
    
    try {
      // Initialize state manager if requested
      if (!stateManager) {
        stateManager = new WorkflowStateManager(workflow['context'].id);
        await stateManager.initialize();
      }
      
      // Validate workflow
      const validation = await workflow.validate();
      if (!validation.valid) {
        throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Execute workflow
      const state = await workflow.execute();
      
      // Save state
      if (stateManager) {
        await stateManager.saveState(state);
      }
      
      // Generate report if requested
      let report;
      if (options.report && stateManager) {
        report = stateManager.generateReport(state);
      }
      
      return {
        success: state.status === import('./BaseWorkflow').WorkflowStatus.COMPLETED,
        state,
        report
      };
    } catch (error) {
      // Handle error
      const errorResult = {
        success: false,
        state: workflow.getState(),
        error: error as Error
      };
      
      // Save error state
      if (stateManager) {
        await stateManager.saveState(errorResult.state, { error: error.message });
      }
      
      return errorResult;
    }
  }

  /**
   * Run multiple workflows in sequence
   */
  async runSequence(
    workflows: BaseWorkflow[],
    options: {
      continueOnError?: boolean;
      parallel?: boolean;
    } = {}
  ): Promise<Array<{
    workflow: string;
    success: boolean;
    state: import('./BaseWorkflow').WorkflowState;
  }>> {
    const results = [];
    
    if (options.parallel) {
      // Run in parallel
      const promises = workflows.map(w => this.run(w));
      const parallelResults = await Promise.allSettled(promises);
      
      parallelResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push({
            workflow: workflows[index]['context'].name,
            ...result.value
          });
        } else {
          results.push({
            workflow: workflows[index]['context'].name,
            success: false,
            state: workflows[index].getState()
          });
        }
      });
    } else {
      // Run in sequence
      for (const workflow of workflows) {
        const result = await this.run(workflow);
        results.push({
          workflow: workflow['context'].name,
          ...result
        });
        
        if (!result.success && !options.continueOnError) {
          break;
        }
      }
    }
    
    return results;
  }
}