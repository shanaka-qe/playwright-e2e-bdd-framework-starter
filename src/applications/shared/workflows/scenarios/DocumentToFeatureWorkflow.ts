/**
 * Document to Feature Workflow
 * 
 * End-to-end workflow that demonstrates the complete flow from document upload
 * to feature generation across webapp and mcp-platform
 */

import { BaseWorkflow, WorkflowStep, WorkflowContext } from '../BaseWorkflow';
import { ApplicationContext } from '../ApplicationContext';
import { DocumentHubPage } from '../../pages/webapp/DocumentHubPage';
import { FeatureGeneratorPage } from '../../pages/webapp/FeatureGeneratorPage';
import { WebappAPI } from '../../api/webapp/WebappAPI';
import { McpAPI } from '../../api/mcp-platform/McpAPI';
import { DocumentBuilder } from '../../data/builders';
import path from 'path';

export interface DocumentToFeatureOptions {
  documentPath: string;
  projectName?: string;
  featureCount?: number;
  generatePlaywright?: boolean;
  validateQuality?: boolean;
}

export class DocumentToFeatureWorkflow extends BaseWorkflow {
  private appContext: ApplicationContext;
  private options: DocumentToFeatureOptions;

  constructor(
    browserContext: any,
    options: DocumentToFeatureOptions
  ) {
    super(browserContext, 'Document to Feature Generation', {
      continueOnError: false,
      captureScreenshots: true,
      timeout: 300000
    });
    
    this.options = options;
    this.appContext = new ApplicationContext(browserContext);
  }

  protected defineSteps(): void {
    // Step 1: Authenticate to webapp
    this.addStep({
      name: 'Authenticate to Web Application',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const config = this.configManager.getConfig('webapp');
        const credentials = config.getDefaultCredentials();
        
        if (!credentials) {
          throw new Error('No default credentials configured');
        }

        await this.appContext.authenticate('webapp', credentials);
        
        return {
          authenticated: true,
          user: this.appContext.getUser('webapp')
        };
      },
      storeAs: 'authData'
    });

    // Step 2: Navigate to Document Hub
    this.addStep({
      name: 'Navigate to Document Hub',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const docHub = new DocumentHubPage(session.page, session.locators);
        
        await docHub.navigate();
        await docHub.waitForPageReady();
        
        const docCount = await docHub.getDocumentCount();
        
        return {
          navigated: true,
          existingDocuments: docCount
        };
      },
      storeAs: 'navigationData'
    });

    // Step 3: Upload document
    this.addStep({
      name: 'Upload Requirements Document',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const docHub = new DocumentHubPage(session.page, session.locators);
        
        // Create document metadata
        const documentData = new DocumentBuilder()
          .withName(path.basename(this.options.documentPath))
          .withType('requirements')
          .withProject(this.options.projectName || 'Default Project')
          .build();
        
        // Upload document
        const uploadResult = await docHub.uploadDocument(
          this.options.documentPath,
          documentData
        );
        
        // Wait for processing
        await docHub.waitForDocumentProcessing(uploadResult.id);
        
        return {
          documentId: uploadResult.id,
          documentName: uploadResult.name,
          processingTime: uploadResult.processingTime,
          status: 'processed'
        };
      },
      storeAs: 'uploadData',
      recoverable: true
    });

    // Step 4: Verify document in MCP knowledge base
    this.addStep({
      name: 'Verify Document in Knowledge Base',
      application: 'mcp',
      execute: async (context: WorkflowContext) => {
        const uploadData = context.state.data.uploadData;
        const session = await this.appContext.getSession('mcp');
        
        if (!session) {
          await this.appContext.initializeApp('mcp');
        }
        
        const mcpApi = new McpAPI(
          this.browserContext._request || this.browserContext.request,
          { baseURL: this.configManager.getValue('mcp', 'app.baseUrl') }
        );
        
        // Query knowledge base
        const queryResult = await mcpApi.queryKnowledge({
          query: `document:${uploadData.documentName}`,
          limit: 10,
          threshold: 0.7
        });
        
        // Verify document is indexed
        const documentFound = queryResult.results.some(
          r => r.metadata?.document_id === uploadData.documentId
        );
        
        return {
          indexed: documentFound,
          chunks: queryResult.results.length,
          avgScore: queryResult.results.reduce((sum, r) => sum + r.score, 0) / queryResult.results.length
        };
      },
      storeAs: 'indexingData',
      timeout: 60000
    });

    // Step 5: Navigate to Feature Generator
    this.addStep({
      name: 'Navigate to Feature Generator',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const session = await this.appContext.getCurrentSession();
        const featureGen = new FeatureGeneratorPage(session.page, session.locators);
        
        await featureGen.navigate();
        await featureGen.waitForPageReady();
        
        return {
          navigated: true,
          aiModelAvailable: await featureGen.isAIModelAvailable()
        };
      }
    });

    // Step 6: Generate features from document
    this.addStep({
      name: 'Generate Features from Document',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const uploadData = context.state.data.uploadData;
        const session = await this.appContext.getCurrentSession();
        const featureGen = new FeatureGeneratorPage(session.page, session.locators);
        
        // Select document
        await featureGen.selectDocument(uploadData.documentId);
        
        // Configure generation options
        const generationOptions = {
          featureCount: this.options.featureCount || 5,
          includeEdgeCases: true,
          generateSteps: true,
          context: 'Generate comprehensive test scenarios'
        };
        
        // Generate features
        const features = await featureGen.generateFeatures(generationOptions);
        
        // Validate generated features
        const validationResults = await featureGen.validateGeneratedFeatures(features);
        
        return {
          generatedFeatures: features.length,
          validFeatures: validationResults.filter(v => v.valid).length,
          features: features.map(f => ({
            title: f.title,
            scenarios: f.scenarios.length,
            valid: validationResults.find(v => v.featureId === f.id)?.valid
          }))
        };
      },
      storeAs: 'generationData',
      recoverable: true,
      timeout: 120000
    });

    // Step 7: Save features to project
    this.addStep({
      name: 'Save Features to Project',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const generationData = context.state.data.generationData;
        const session = await this.appContext.getCurrentSession();
        const featureGen = new FeatureGeneratorPage(session.page, session.locators);
        
        // Save all valid features
        const savedFeatures = [];
        for (const feature of generationData.features) {
          if (feature.valid) {
            const saved = await featureGen.saveFeature({
              title: feature.title,
              project: this.options.projectName || 'Default Project',
              tags: ['automated', 'from-document']
            });
            savedFeatures.push(saved);
          }
        }
        
        return {
          savedCount: savedFeatures.length,
          featureIds: savedFeatures.map(f => f.id),
          projectName: this.options.projectName || 'Default Project'
        };
      },
      storeAs: 'saveData'
    });

    // Step 8: Generate Playwright code (optional)
    if (this.options.generatePlaywright) {
      this.addStep({
        name: 'Generate Playwright Code',
        application: 'mcp',
        execute: async (context: WorkflowContext) => {
          const generationData = context.state.data.generationData;
          const mcpApi = new McpAPI(
            this.browserContext._request || this.browserContext.request,
            { baseURL: this.configManager.getValue('mcp', 'app.baseUrl') }
          );
          
          const playwrightCode = [];
          
          // Generate code for each feature
          for (const feature of generationData.features) {
            if (feature.valid) {
              const codeResult = await mcpApi.generatePlaywrightCode({
                feature: feature.title,
                scenarios: feature.scenarios,
                framework: 'playwright',
                typescript: true
              });
              
              playwrightCode.push({
                feature: feature.title,
                code: codeResult.code,
                imports: codeResult.imports
              });
            }
          }
          
          return {
            generatedCodeCount: playwrightCode.length,
            totalLines: playwrightCode.reduce((sum, pc) => 
              sum + pc.code.split('\n').length, 0
            ),
            playwrightCode
          };
        },
        storeAs: 'codeGenerationData'
      });
    }

    // Step 9: Quality validation (optional)
    if (this.options.validateQuality) {
      this.addStep({
        name: 'Validate Feature Quality',
        application: 'webapp',
        execute: async (context: WorkflowContext) => {
          const generationData = context.state.data.generationData;
          const session = await this.appContext.getCurrentSession();
          const api = session.api as WebappAPI;
          
          const qualityResults = [];
          
          for (const feature of generationData.features) {
            // Validate feature quality
            const validation = await api.validateFeature({
              featureId: feature.title, // This would be the actual ID
              checks: [
                'gherkin_syntax',
                'scenario_completeness',
                'step_definitions',
                'test_coverage'
              ]
            });
            
            qualityResults.push({
              feature: feature.title,
              score: validation.score,
              issues: validation.issues
            });
          }
          
          const avgScore = qualityResults.reduce((sum, r) => sum + r.score, 0) / qualityResults.length;
          
          return {
            averageQualityScore: avgScore,
            passedQualityCheck: avgScore >= 0.8,
            results: qualityResults
          };
        },
        storeAs: 'qualityData'
      });
    }

    // Step 10: Generate summary report
    this.addStep({
      name: 'Generate Workflow Summary',
      application: 'webapp',
      execute: async (context: WorkflowContext) => {
        const summary = {
          document: {
            name: context.state.data.uploadData.documentName,
            id: context.state.data.uploadData.documentId,
            processingTime: context.state.data.uploadData.processingTime
          },
          indexing: {
            indexed: context.state.data.indexingData.indexed,
            chunks: context.state.data.indexingData.chunks
          },
          generation: {
            totalFeatures: context.state.data.generationData.generatedFeatures,
            validFeatures: context.state.data.generationData.validFeatures,
            savedFeatures: context.state.data.saveData.savedCount
          },
          quality: context.state.data.qualityData || null,
          playwrightCode: context.state.data.codeGenerationData || null,
          workflow: {
            duration: Date.now() - context.startTime.getTime(),
            steps: context.state.stepResults.length,
            errors: context.state.errors.length
          }
        };
        
        // Take final screenshot
        await this.appContext.takeScreenshotsFromAllApps('workflow_complete');
        
        return summary;
      },
      storeAs: 'workflowSummary'
    });
  }

  /**
   * Get workflow results
   */
  getResults(): any {
    return this.getData('workflowSummary');
  }

  /**
   * Validate workflow can execute
   */
  async validate(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Validate document exists
    try {
      await this.browserContext._fs.access(this.options.documentPath);
    } catch {
      errors.push(`Document not found: ${this.options.documentPath}`);
    }
    
    // Validate webapp config
    const webappConfig = this.configManager.getConfig('webapp');
    if (!webappConfig.getDefaultCredentials()) {
      errors.push('No webapp credentials configured');
    }
    
    // Validate MCP config
    const mcpConfig = this.configManager.getConfig('mcp');
    const mcpValidation = mcpConfig.validate();
    if (!mcpValidation.valid) {
      errors.push('MCP configuration invalid');
    }
    
    // Call parent validation
    const parentValidation = await super.validate();
    errors.push(...parentValidation.errors);
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}