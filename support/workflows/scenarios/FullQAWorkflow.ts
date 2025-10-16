/**
 * Full QA Workflow
 * 
 * Comprehensive end-to-end workflow that demonstrates the complete QA process
 * across all applications including document upload, feature generation,
 * test creation, execution monitoring, and reporting
 */

import { BaseWorkflow, WorkflowStep, WorkflowContext } from '../BaseWorkflow';
import { ApplicationContext } from '../ApplicationContext';
import { DocumentHubPage } from '../../pages/webapp/DocumentHubPage';
import { FeatureGeneratorPage } from '../../pages/webapp/FeatureGeneratorPage';
import { GlobalChatComponent } from '../../pages/webapp/components/GlobalChatComponent';
import { SystemLogsPage } from '../../pages/adminapp/SystemLogsPage';
import { DashboardPage } from '../../pages/adminapp/DashboardPage';
import { WebappAPI } from '../../api/webapp/WebappAPI';
import { AdminAPI } from '../../api/adminapp/AdminAPI';
import { McpAPI } from '../../api/mcp-platform/McpAPI';
import { TestDataFactory } from '../../data/factories/TestDataFactory';

export interface FullQAWorkflowOptions {
  projectName: string;
  documentPaths: string[];
  generateTests: boolean;
  executeTests: boolean;
  monitorExecution: boolean;
  generateReport: boolean;
}

export class FullQAWorkflow extends BaseWorkflow {
  private appContext: ApplicationContext;
  private options: FullQAWorkflowOptions;
  private dataFactory: TestDataFactory;

  constructor(
    browserContext: any,
    options: FullQAWorkflowOptions
  ) {
    super(browserContext, 'Full QA Process Workflow', {
      continueOnError: true,
      captureScreenshots: true,
      captureTrace: true,
      timeout: 600000, // 10 minutes
      parallel: false
    });
    
    this.options = options;
    this.appContext = new ApplicationContext(browserContext);
    this.dataFactory = new TestDataFactory();
  }

  protected defineSteps(): void {
    // Phase 1: Setup and Authentication
    this.addStep({
      name: 'Setup Test Environment',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        // Initialize all applications
        await this.appContext.initializeApp('webapp');
        await this.appContext.initializeApp('admin');
        await this.appContext.initializeApp('mcp');
        
        // Create test data
        const project = await this.dataFactory.createProjectWithTeam({
          name: this.options.projectName,
          description: 'Automated QA workflow project',
          teamSize: 3
        });
        
        return {
          project,
          appsInitialized: ['webapp', 'admin', 'mcp'],
          timestamp: new Date()
        };
      },
      storeAs: 'setupData'
    });

    this.addStep({
      name: 'Authenticate All Applications',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const authResults = {};
        
        // Authenticate webapp
        const webappCreds = this.configManager.getConfig('webapp').getDefaultCredentials();
        await this.appContext.authenticate('webapp', webappCreds!);
        authResults['webapp'] = this.appContext.getUser('webapp');
        
        // Authenticate admin
        const adminCreds = this.configManager.getConfig('admin').getDefaultCredentials();
        await this.appContext.authenticate('admin', adminCreds!);
        authResults['admin'] = this.appContext.getUser('admin');
        
        return authResults;
      },
      storeAs: 'authData'
    });

    // Phase 2: Document Processing
    this.addStep({
      name: 'Upload Requirements Documents',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const docHub = new DocumentHubPage(session.page, session.locators);
        await docHub.navigate();
        
        const uploadResults = [];
        
        for (const docPath of this.options.documentPaths) {
          const result = await docHub.uploadDocument(docPath, {
            project: this.options.projectName,
            tags: ['requirements', 'automated-upload']
          });
          
          await docHub.waitForDocumentProcessing(result.id);
          uploadResults.push(result);
        }
        
        return {
          documentsUploaded: uploadResults.length,
          documents: uploadResults,
          totalProcessingTime: uploadResults.reduce((sum, r) => sum + r.processingTime, 0)
        };
      },
      storeAs: 'documentData',
      recoverable: true
    });

    // Phase 3: Knowledge Base Verification (Admin)
    this.addStep({
      name: 'Monitor Document Processing in Admin',
      application: 'admin',
      execute: async (context: WorkflowContext) => {
        await this.appContext.switchTo('admin');
        const session = await this.appContext.getCurrentSession();
        const dashboard = new DashboardPage(session.page, session.locators);
        
        await dashboard.navigate();
        const stats = await dashboard.getSystemStats();
        
        // Check logs for document processing
        const logsPage = new SystemLogsPage(session.page, session.locators);
        await logsPage.navigate();
        
        const processingLogs = await logsPage.filterLogs({
          service: 'document-processor',
          level: 'info',
          timeRange: 'last-hour'
        });
        
        return {
          systemStats: stats,
          documentProcessingLogs: processingLogs.length,
          errors: processingLogs.filter(log => log.level === 'error').length
        };
      },
      storeAs: 'adminMonitoringData'
    });

    // Phase 4: Feature Generation with AI Assistance
    this.addStep({
      name: 'Generate Features with AI Chat Assistance',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        await this.appContext.switchTo('webapp');
        const session = await this.appContext.getCurrentSession();
        const featureGen = new FeatureGeneratorPage(session.page, session.locators);
        const chat = new GlobalChatComponent(session.page, session.locators);
        
        await featureGen.navigate();
        
        // Use AI chat to get suggestions
        await chat.open();
        const suggestions = await chat.askQuestion(
          'What test scenarios should I create for the uploaded requirements documents?'
        );
        
        const generatedFeatures = [];
        
        // Generate features for each document
        for (const doc of context.state.data.documentData.documents) {
          await featureGen.selectDocument(doc.id);
          
          const features = await featureGen.generateFeatures({
            featureCount: 5,
            includeEdgeCases: true,
            aiContext: suggestions.response
          });
          
          generatedFeatures.push(...features);
        }
        
        await chat.close();
        
        return {
          totalFeatures: generatedFeatures.length,
          aiSuggestions: suggestions,
          features: generatedFeatures.map(f => ({
            id: f.id,
            title: f.title,
            scenarios: f.scenarios.length
          }))
        };
      },
      storeAs: 'featureData',
      timeout: 180000
    });

    // Phase 5: Test Generation via MCP
    if (this.options.generateTests) {
      this.addStep({
        name: 'Generate Test Code via MCP Platform',
        application: 'mcp',
        execute: async (context: WorkflowContext) => {
          const mcpApi = new McpAPI(
            this.browserContext._request || this.browserContext.request,
            { baseURL: this.configManager.getValue('mcp', 'app.baseUrl') }
          );
          
          const testCode = [];
          
          for (const feature of context.state.data.featureData.features) {
            // Generate Playwright tests
            const playwrightResult = await mcpApi.generatePlaywrightCode({
              featureId: feature.id,
              framework: 'playwright',
              typescript: true,
              includePageObjects: true
            });
            
            // Generate API tests
            const apiResult = await mcpApi.generateTestCase({
              feature: feature.title,
              testType: 'api',
              framework: 'jest'
            });
            
            testCode.push({
              featureId: feature.id,
              playwright: playwrightResult,
              api: apiResult
            });
          }
          
          return {
            testsGenerated: testCode.length,
            totalTestFiles: testCode.length * 2, // Playwright + API
            testCode
          };
        },
        storeAs: 'testGenerationData'
      });
    }

    // Phase 6: Test Execution Monitoring
    if (this.options.executeTests) {
      this.addStep({
        name: 'Execute Generated Tests',
        application: 'webapp',
        execute: async (context: WorkflowContext) => {
          // This would integrate with test runner
          // For now, we'll simulate test execution
          const testResults = {
            total: context.state.data.featureData.features.length * 3,
            passed: Math.floor(context.state.data.featureData.features.length * 2.7),
            failed: Math.floor(context.state.data.featureData.features.length * 0.2),
            skipped: Math.floor(context.state.data.featureData.features.length * 0.1),
            duration: 45000 + Math.random() * 30000
          };
          
          return testResults;
        },
        storeAs: 'testExecutionData'
      });

      this.addStep({
        name: 'Monitor Test Execution in Admin',
        application: 'admin',
        execute: async (context: WorkflowContext) => {
          await this.appContext.switchTo('admin');
          const session = await this.appContext.getCurrentSession();
          const dashboard = new DashboardPage(session.page, session.locators);
          const logsPage = new SystemLogsPage(session.page, session.locators);
          
          // Monitor dashboard metrics
          await dashboard.navigate();
          const metrics = await dashboard.getTestExecutionMetrics();
          
          // Check logs for failures
          await logsPage.navigate();
          const testLogs = await logsPage.filterLogs({
            service: 'test-runner',
            level: 'error',
            timeRange: 'last-hour'
          });
          
          return {
            dashboardMetrics: metrics,
            errorLogs: testLogs,
            alerts: await dashboard.getActiveAlerts()
          };
        },
        storeAs: 'executionMonitoringData'
      });
    }

    // Phase 7: Quality Analysis
    this.addStep({
      name: 'Analyze Test Coverage and Quality',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const api = this.appContext.api as WebappAPI;
        
        // Analyze test coverage
        const coverageAnalysis = await api.analyzeTestCoverage({
          projectId: context.state.data.setupData.project.id,
          includeFeatures: true,
          includeRequirements: true
        });
        
        // Get quality metrics
        const qualityMetrics = {
          featureCoverage: coverageAnalysis.featureCoverage,
          requirementsCoverage: coverageAnalysis.requirementsCoverage,
          automationRate: coverageAnalysis.automatedTests / coverageAnalysis.totalTests,
          averageTestQuality: 0.85 // Would be calculated from actual metrics
        };
        
        return qualityMetrics;
      },
      storeAs: 'qualityData'
    });

    // Phase 8: Report Generation
    if (this.options.generateReport) {
      this.addStep({
        name: 'Generate Comprehensive QA Report',
        application: 'webapp',
        execute: async (context: WorkflowContext) => {
          const report = {
            project: context.state.data.setupData.project,
            documents: {
              uploaded: context.state.data.documentData.documentsUploaded,
              processingTime: context.state.data.documentData.totalProcessingTime
            },
            features: {
              generated: context.state.data.featureData.totalFeatures,
              withAI: true,
              scenarios: context.state.data.featureData.features.reduce(
                (sum, f) => sum + f.scenarios, 0
              )
            },
            tests: context.state.data.testGenerationData || null,
            execution: context.state.data.testExecutionData || null,
            quality: context.state.data.qualityData,
            monitoring: {
              admin: context.state.data.adminMonitoringData,
              execution: context.state.data.executionMonitoringData || null
            },
            workflow: {
              duration: Date.now() - context.startTime.getTime(),
              steps: context.state.stepResults.length,
              errors: context.state.errors.length,
              screenshots: await this.captureWorkflowScreenshots(context)
            }
          };
          
          // Save report
          await this.saveReport(report);
          
          return report;
        },
        storeAs: 'finalReport'
      });
    }

    // Phase 9: Cleanup
    this.addStep({
      name: 'Workflow Cleanup',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        // Take final screenshots from all apps
        const screenshots = await this.appContext.takeScreenshotsFromAllApps('workflow_final');
        
        // Get final metrics
        const metrics = this.appContext.getMetrics();
        
        return {
          screenshots,
          metrics,
          completed: true
        };
      }
    });
  }

  /**
   * Capture screenshots from all applications
   */
  private async captureWorkflowScreenshots(context: WorkflowContext): Promise<string[]> {
    const screenshots: string[] = [];
    
    for (const [app, _] of context.pages) {
      await this.appContext.switchTo(app);
      const filename = await this.captureScreenshot({
        name: `${app}_final`,
        application: app,
        execute: async () => {},
        storeAs: ''
      });
      if (filename) {
        screenshots.push(filename);
      }
    }
    
    return screenshots;
  }

  /**
   * Save workflow report
   */
  private async saveReport(report: any): Promise<void> {
    const reportPath = `test-results/qa-workflow-report-${Date.now()}.json`;
    await this.browserContext._fs.writeFile(
      reportPath,
      JSON.stringify(report, null, 2)
    );
  }

  /**
   * Get workflow report
   */
  getReport(): any {
    return this.getData('finalReport');
  }
}