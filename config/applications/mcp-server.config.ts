/**
 * MCP Server Configuration
 * Application-specific settings for the MCP (Model Context Protocol) server
 */

export interface McpServerConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  features: {
    textGeneration: boolean;
    embeddings: boolean;
    modelManagement: boolean;
  };
  authentication: {
    enabled: boolean;
    apiKeyRequired: boolean;
  };
  models: {
    defaultModel: string;
    availableModels: string[];
  };
}

export const mcpServerConfig: McpServerConfig = {
  baseUrl: process.env.MCP_PLATFORM_URL || 'http://localhost:3002',
  timeout: 15000,
  retries: 3,
  features: {
    textGeneration: true,
    embeddings: true,
    modelManagement: true,
  },
  authentication: {
    enabled: false,
    apiKeyRequired: false,
  },
  models: {
    defaultModel: 'ollama',
    availableModels: ['ollama', 'openai', 'anthropic'],
  },
};