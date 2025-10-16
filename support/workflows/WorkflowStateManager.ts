/**
 * Workflow State Manager
 * 
 * Manages workflow state persistence, recovery, and analytics
 */

import { WorkflowState, WorkflowStatus, StepResult, WorkflowError } from './BaseWorkflow';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StateTransition {
  from: WorkflowStatus;
  to: WorkflowStatus;
  timestamp: Date;
  reason?: string;
}

export interface WorkflowMetrics {
  totalDuration: number;
  stepDurations: Map<string, number>;
  errorCount: number;
  retryCount: number;
  applicationSwitches: number;
  successRate: number;
}

export interface StateSnapshot {
  id: string;
  workflowId: string;
  timestamp: Date;
  state: WorkflowState;
  metadata?: Record<string, any>;
}

export class WorkflowStateManager {
  private stateHistory: StateSnapshot[] = [];
  private transitions: StateTransition[] = [];
  private checkpoints: Map<string, WorkflowState> = new Map();
  private readonly stateDir: string;

  constructor(
    private workflowId: string,
    stateDir = 'test-results/workflow-states'
  ) {
    this.stateDir = stateDir;
  }

  /**
   * Initialize state directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.stateDir, { recursive: true });
    } catch (error) {
      console.warn(`Failed to create state directory: ${error.message}`);
    }
  }

  /**
   * Save current state
   */
  async saveState(state: WorkflowState, metadata?: Record<string, any>): Promise<void> {
    const snapshot: StateSnapshot = {
      id: this.generateSnapshotId(),
      workflowId: this.workflowId,
      timestamp: new Date(),
      state: this.cloneState(state),
      metadata
    };

    this.stateHistory.push(snapshot);

    // Persist to file
    try {
      const filePath = path.join(this.stateDir, `${this.workflowId}_state.json`);
      await fs.writeFile(
        filePath,
        JSON.stringify(snapshot, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.warn(`Failed to persist state: ${error.message}`);
    }
  }

  /**
   * Load state from file
   */
  async loadState(): Promise<WorkflowState | null> {
    try {
      const filePath = path.join(this.stateDir, `${this.workflowId}_state.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const snapshot = JSON.parse(content) as StateSnapshot;
      return snapshot.state;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create checkpoint
   */
  createCheckpoint(name: string, state: WorkflowState): void {
    this.checkpoints.set(name, this.cloneState(state));
  }

  /**
   * Restore checkpoint
   */
  restoreCheckpoint(name: string): WorkflowState | null {
    const checkpoint = this.checkpoints.get(name);
    return checkpoint ? this.cloneState(checkpoint) : null;
  }

  /**
   * List checkpoints
   */
  listCheckpoints(): string[] {
    return Array.from(this.checkpoints.keys());
  }

  /**
   * Record state transition
   */
  recordTransition(from: WorkflowStatus, to: WorkflowStatus, reason?: string): void {
    this.transitions.push({
      from,
      to,
      timestamp: new Date(),
      reason
    });
  }

  /**
   * Get state at specific step
   */
  getStateAtStep(stepNumber: number): WorkflowState | null {
    for (let i = this.stateHistory.length - 1; i >= 0; i--) {
      const snapshot = this.stateHistory[i];
      if (snapshot.state.currentStep <= stepNumber) {
        return this.cloneState(snapshot.state);
      }
    }
    return null;
  }

  /**
   * Can recover from current state
   */
  canRecover(state: WorkflowState): boolean {
    // Can't recover if workflow is completed or cancelled
    if (state.status === WorkflowStatus.COMPLETED || 
        state.status === WorkflowStatus.CANCELLED) {
      return false;
    }

    // Check if there are recoverable errors
    const hasRecoverableErrors = state.errors.some(e => e.recoverable);
    
    // Can recover if failed with recoverable errors or still running
    return state.status === WorkflowStatus.RUNNING || hasRecoverableErrors;
  }

  /**
   * Get recovery point
   */
  getRecoveryPoint(state: WorkflowState): number {
    if (!this.canRecover(state)) {
      return -1;
    }

    // Find the last successful step
    for (let i = state.stepResults.length - 1; i >= 0; i--) {
      if (state.stepResults[i].status === 'completed') {
        return i + 1; // Return next step to execute
      }
    }

    return 0; // Start from beginning
  }

  /**
   * Calculate metrics
   */
  calculateMetrics(state: WorkflowState): WorkflowMetrics {
    const completedSteps = state.stepResults.filter(s => s.status === 'completed');
    const failedSteps = state.stepResults.filter(s => s.status === 'failed');
    
    // Calculate total duration
    const firstStep = state.stepResults[0];
    const lastStep = state.stepResults[state.stepResults.length - 1];
    const totalDuration = firstStep && lastStep && lastStep.endTime
      ? lastStep.endTime.getTime() - firstStep.startTime.getTime()
      : 0;

    // Calculate step durations
    const stepDurations = new Map<string, number>();
    state.stepResults.forEach(result => {
      if (result.duration) {
        stepDurations.set(result.name, result.duration);
      }
    });

    // Count retries
    const retryCount = state.stepResults.filter(s => 
      s.error && s.error.message.includes('Retrying')
    ).length;

    // Count application switches
    let applicationSwitches = 0;
    for (let i = 1; i < state.stepResults.length; i++) {
      if (state.stepResults[i].application !== state.stepResults[i - 1].application) {
        applicationSwitches++;
      }
    }

    return {
      totalDuration,
      stepDurations,
      errorCount: state.errors.length,
      retryCount,
      applicationSwitches,
      successRate: completedSteps.length / Math.max(state.totalSteps, 1)
    };
  }

  /**
   * Get failed steps
   */
  getFailedSteps(state: WorkflowState): StepResult[] {
    return state.stepResults.filter(s => s.status === 'failed');
  }

  /**
   * Get skipped steps
   */
  getSkippedSteps(state: WorkflowState): StepResult[] {
    return state.stepResults.filter(s => s.status === 'skipped');
  }

  /**
   * Get step by name
   */
  getStepByName(state: WorkflowState, name: string): StepResult | undefined {
    return state.stepResults.find(s => s.name === name);
  }

  /**
   * Update step result
   */
  updateStepResult(
    state: WorkflowState, 
    stepNumber: number, 
    updates: Partial<StepResult>
  ): void {
    const index = stepNumber - 1;
    if (index >= 0 && index < state.stepResults.length) {
      state.stepResults[index] = {
        ...state.stepResults[index],
        ...updates
      };
    }
  }

  /**
   * Add error
   */
  addError(state: WorkflowState, error: WorkflowError): void {
    state.errors.push(error);
  }

  /**
   * Clear errors
   */
  clearErrors(state: WorkflowState): void {
    state.errors = [];
  }

  /**
   * Get state summary
   */
  getStateSummary(state: WorkflowState): string {
    const metrics = this.calculateMetrics(state);
    
    return `
Workflow Status: ${state.status}
Progress: ${state.currentStep}/${state.totalSteps} steps
Success Rate: ${(metrics.successRate * 100).toFixed(1)}%
Duration: ${this.formatDuration(metrics.totalDuration)}
Errors: ${metrics.errorCount}
Retries: ${metrics.retryCount}
App Switches: ${metrics.applicationSwitches}
    `.trim();
  }

  /**
   * Export state history
   */
  async exportHistory(outputPath: string): Promise<void> {
    const historyData = {
      workflowId: this.workflowId,
      snapshots: this.stateHistory,
      transitions: this.transitions,
      metrics: this.stateHistory.length > 0
        ? this.calculateMetrics(this.stateHistory[this.stateHistory.length - 1].state)
        : null
    };

    await fs.writeFile(
      outputPath,
      JSON.stringify(historyData, null, 2),
      'utf-8'
    );
  }

  /**
   * Generate state report
   */
  generateReport(state: WorkflowState): string {
    const metrics = this.calculateMetrics(state);
    const failedSteps = this.getFailedSteps(state);
    const skippedSteps = this.getSkippedSteps(state);

    let report = `
# Workflow State Report

## Summary
${this.getStateSummary(state)}

## Step Details
`;

    // Add step details
    state.stepResults.forEach(step => {
      report += `
### Step ${step.stepNumber}: ${step.name}
- Application: ${step.application}
- Status: ${step.status}
- Duration: ${step.duration ? this.formatDuration(step.duration) : 'N/A'}
${step.error ? `- Error: ${step.error.message}` : ''}
`;
    });

    // Add failed steps
    if (failedSteps.length > 0) {
      report += `
## Failed Steps
`;
      failedSteps.forEach(step => {
        report += `- Step ${step.stepNumber}: ${step.name} - ${step.error?.message}\n`;
      });
    }

    // Add skipped steps
    if (skippedSteps.length > 0) {
      report += `
## Skipped Steps
`;
      skippedSteps.forEach(step => {
        report += `- Step ${step.stepNumber}: ${step.name}\n`;
      });
    }

    // Add transitions
    if (this.transitions.length > 0) {
      report += `
## State Transitions
`;
      this.transitions.forEach(t => {
        report += `- ${t.from} → ${t.to} at ${t.timestamp.toISOString()}${t.reason ? ` (${t.reason})` : ''}\n`;
      });
    }

    return report;
  }

  /**
   * Clone state
   */
  private cloneState(state: WorkflowState): WorkflowState {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Generate snapshot ID
   */
  private generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  /**
   * Format duration
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  /**
   * Clean old states
   */
  async cleanOldStates(daysToKeep = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let cleaned = 0;
    try {
      const files = await fs.readdir(this.stateDir);
      
      for (const file of files) {
        if (file.endsWith('_state.json')) {
          const filePath = path.join(this.stateDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            cleaned++;
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to clean old states: ${error.message}`);
    }

    return cleaned;
  }
}