/**
 * MCP Platform API Class
 * 
 * Provides API testing capabilities for the Model Context Protocol platform
 * Includes tool execution, knowledge base, test generation, and more
 */

import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '../BaseAPI';
import {
  MCPTool,
  ToolExecutionRequest,
  ToolExecutionResponse,
  SessionRequest,
  SessionResponse,
  MCPSession,
  KnowledgeSearchRequest,
  KnowledgeSearchResponse,
  KnowledgeEntry,
  TestGenerationRequest,
  TestGenerationResponse,
  PlaywrightGenerationRequest,
  PlaywrightGenerationResponse,
  AIModel,
  WebhookConfig,
  UsageStats,
  ExecutionStatus,
  KnowledgeType
} from '../types';

export class McpAPI extends BaseAPI {
  constructor(request: APIRequestContext, config?: {
    baseURL?: string;
    authToken?: string;
  }) {
    super(request, {
      baseURL: config?.baseURL || process.env.MCP_API_URL || 'http://localhost:3010/api',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-MCP-Version': '1.0'
      },
      authToken: config?.authToken
    });
  }

  // ============= Session Management =============

  /**
   * Create new MCP session
   */
  async createSession(request?: SessionRequest): Promise<SessionResponse> {
    const response = await this.post<SessionResponse>('/sessions', {
      data: request || {}
    });
    
    // Set session token for subsequent requests
    if (response.data.token) {
      this.defaultHeaders['X-MCP-Session'] = response.data.token;
    }
    
    return response.data;
  }

  /**
   * Get session details
   */
  async getSession(sessionId?: string): Promise<MCPSession> {
    const id = sessionId || this.extractSessionId();
    const response = await this.get<MCPSession>(`/sessions/${id}`);
    return response.data;
  }

  /**
   * End session
   */
  async endSession(sessionId?: string): Promise<void> {
    const id = sessionId || this.extractSessionId();
    await this.delete(`/sessions/${id}`);
    delete this.defaultHeaders['X-MCP-Session'];
  }

  /**
   * Refresh session
   */
  async refreshSession(sessionId?: string): Promise<SessionResponse> {
    const id = sessionId || this.extractSessionId();
    const response = await this.post<SessionResponse>(`/sessions/${id}/refresh`);
    
    if (response.data.token) {
      this.defaultHeaders['X-MCP-Session'] = response.data.token;
    }
    
    return response.data;
  }

  // ============= Tool Management =============

  /**
   * List available tools
   */
  async listTools(category?: string): Promise<MCPTool[]> {
    const response = await this.get<MCPTool[]>('/tools', {
      params: category ? { category } : undefined
    });
    return response.data;
  }

  /**
   * Get tool details
   */
  async getTool(toolName: string): Promise<MCPTool> {
    const response = await this.get<MCPTool>(`/tools/${toolName}`);
    return response.data;
  }

  /**
   * Execute tool
   */
  async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResponse> {
    const response = await this.post<ToolExecutionResponse>('/tools/execute', {
      data: request
    });
    return response.data;
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<ToolExecutionResponse> {
    const response = await this.get<ToolExecutionResponse>(`/executions/${executionId}`);
    return response.data;
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    await this.post(`/executions/${executionId}/cancel`);
  }

  /**
   * Wait for execution completion
   */
  async waitForExecution(executionId: string, timeout = 60000): Promise<ToolExecutionResponse> {
    return await this.waitForCondition(
      () => this.getExecutionStatus(executionId),
      (status) => 
        status.status === ExecutionStatus.COMPLETED || 
        status.status === ExecutionStatus.FAILED ||
        status.status === ExecutionStatus.CANCELLED,
      {
        timeout,
        interval: 1000,
        errorMessage: `Execution ${executionId} timeout`
      }
    );
  }

  // ============= Knowledge Base =============

  /**
   * Search knowledge base
   */
  async searchKnowledge(request: KnowledgeSearchRequest): Promise<KnowledgeSearchResponse> {
    const response = await this.post<KnowledgeSearchResponse>('/knowledge/search', {
      data: request
    });
    return response.data;
  }

  /**
   * Get knowledge entry
   */
  async getKnowledgeEntry(entryId: string): Promise<KnowledgeEntry> {
    const response = await this.get<KnowledgeEntry>(`/knowledge/${entryId}`);
    return response.data;
  }

  /**
   * Add knowledge entry
   */
  async addKnowledgeEntry(entry: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> {
    const response = await this.post<KnowledgeEntry>('/knowledge', {
      data: entry
    });
    return response.data;
  }

  /**
   * Update knowledge entry
   */
  async updateKnowledgeEntry(entryId: string, updates: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> {
    const response = await this.patch<KnowledgeEntry>(`/knowledge/${entryId}`, {
      data: updates
    });
    return response.data;
  }

  /**
   * Delete knowledge entry
   */
  async deleteKnowledgeEntry(entryId: string): Promise<void> {
    await this.delete(`/knowledge/${entryId}`);
  }

  /**
   * Get best practices
   */
  async getBestPractices(framework?: string): Promise<KnowledgeEntry[]> {
    const searchResult = await this.searchKnowledge({
      query: 'best practices',
      type: [KnowledgeType.BEST_PRACTICE],
      filters: framework ? { frameworks: [framework] } : undefined
    });
    return searchResult.results.map(r => r.entry);
  }

  // ============= Test Generation =============

  /**
   * Generate test cases
   */
  async generateTests(request: TestGenerationRequest): Promise<TestGenerationResponse> {
    const response = await this.post<TestGenerationResponse>('/generate/tests', {
      data: request
    });
    return response.data;
  }

  /**
   * Generate Playwright code
   */
  async generatePlaywrightCode(request: PlaywrightGenerationRequest): Promise<PlaywrightGenerationResponse> {
    const response = await this.post<PlaywrightGenerationResponse>('/generate/playwright', {
      data: request
    });
    return response.data;
  }

  /**
   * Validate generated code
   */
  async validateGeneratedCode(code: string, framework: string): Promise<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  }> {
    const response = await this.post('/generate/validate', {
      data: { code, framework }
    });
    return response.data;
  }

  // ============= Model Management =============

  /**
   * List available AI models
   */
  async listModels(type?: string): Promise<AIModel[]> {
    const response = await this.get<AIModel[]>('/models', {
      params: type ? { type } : undefined
    });
    return response.data;
  }

  /**
   * Get model details
   */
  async getModel(modelId: string): Promise<AIModel> {
    const response = await this.get<AIModel>(`/models/${modelId}`);
    return response.data;
  }

  /**
   * Check model availability
   */
  async checkModelAvailability(modelId: string): Promise<{
    available: boolean;
    reason?: string;
    alternatives?: string[];
  }> {
    const response = await this.get(`/models/${modelId}/availability`);
    return response.data;
  }

  // ============= Webhooks =============

  /**
   * List webhooks
   */
  async listWebhooks(): Promise<WebhookConfig[]> {
    const response = await this.get<WebhookConfig[]>('/webhooks');
    return response.data;
  }

  /**
   * Create webhook
   */
  async createWebhook(webhook: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const response = await this.post<WebhookConfig>('/webhooks', {
      data: webhook
    });
    return response.data;
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const response = await this.patch<WebhookConfig>(`/webhooks/${webhookId}`, {
      data: updates
    });
    return response.data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.delete(`/webhooks/${webhookId}`);
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId: string): Promise<{
    success: boolean;
    response?: any;
    error?: string;
  }> {
    const response = await this.post(`/webhooks/${webhookId}/test`);
    return response.data;
  }

  // ============= Usage & Analytics =============

  /**
   * Get usage statistics
   */
  async getUsageStats(period?: { start: string; end: string }): Promise<UsageStats> {
    const response = await this.get<UsageStats>('/usage/stats', {
      params: period
    });
    return response.data;
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(filters?: {
    tool?: string;
    status?: string;
    limit?: number;
  }): Promise<ToolExecutionResponse[]> {
    const response = await this.get<ToolExecutionResponse[]>('/executions', {
      params: filters
    });
    return response.data;
  }

  // ============= Health & Status =============

  /**
   * Check MCP platform health
   */
  async healthCheck(): Promise<{
    status: string;
    version: string;
    tools: number;
    models: number;
  }> {
    const response = await this.get('/health');
    return response.data;
  }

  // ============= Helper Methods =============

  /**
   * Extract session ID from headers
   */
  private extractSessionId(): string {
    const token = this.defaultHeaders['X-MCP-Session'];
    if (!token) {
      throw new Error('No active MCP session');
    }
    // Assuming token contains session ID
    return token.split('.')[0];
  }

  /**
   * Execute tool and wait for result
   */
  async executeAndWait(request: ToolExecutionRequest, timeout = 60000): Promise<ToolExecutionResponse> {
    const execution = await this.executeTool(request);
    
    if (request.options?.async) {
      return await this.waitForExecution(execution.executionId, timeout);
    }
    
    return execution;
  }

  /**
   * Generate Playwright test from Gherkin
   */
  async gherkinToPlaywright(
    gherkin: string,
    options?: Partial<PlaywrightGenerationRequest['options']>
  ): Promise<PlaywrightGenerationResponse> {
    return await this.generatePlaywrightCode({
      gherkin,
      options: {
        typescript: true,
        pageObjectModel: true,
        roleBasedLocators: true,
        customAssertions: true,
        ...options
      }
    });
  }

  /**
   * Search and execute tool
   */
  async searchAndExecuteTool(
    toolNamePattern: string,
    parameters: Record<string, any>
  ): Promise<ToolExecutionResponse> {
    const tools = await this.listTools();
    const tool = tools.find(t => t.name.includes(toolNamePattern));
    
    if (!tool) {
      throw new Error(`No tool found matching: ${toolNamePattern}`);
    }
    
    return await this.executeAndWait({
      tool: tool.name,
      parameters
    });
  }

  /**
   * Quick domain knowledge query
   */
  async queryDomainKnowledge(query: string, limit = 5): Promise<KnowledgeSearchResult[]> {
    const response = await this.searchKnowledge({
      query,
      limit,
      threshold: 0.7
    });
    return response.results;
  }
}