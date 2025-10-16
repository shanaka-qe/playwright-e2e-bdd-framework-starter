/**
 * MCP Platform Configuration
 * 
 * Configuration management for the Model Context Protocol platform
 */

import { z } from 'zod';
import { BaseConfig } from './BaseConfig';

// Define MCP configuration schema
const McpConfigSchema = z.object({
  app: z.object({
    name: z.string().default('Testoria MCP Platform'),
    baseUrl: z.string().url(),
    port: z.number().int().positive(),
    apiUrl: z.string().url(),
    environment: z.enum(['development', 'test', 'staging', 'production'])
  }),
  
  server: z.object({
    host: z.string().default('localhost'),
    port: z.number().int().positive().default(3010),
    protocol: z.enum(['http', 'https']).default('http'),
    timeout: z.number().int().positive().default(30000),
    maxConnections: z.number().int().positive().default(100)
  }),
  
  models: z.object({
    defaultChat: z.string().default('gpt-4'),
    defaultEmbedding: z.string().default('text-embedding-3-small'),
    providers: z.object({
      openai: z.object({
        enabled: z.boolean().default(true),
        apiKey: z.string().optional(),
        models: z.array(z.string()).default(['gpt-4', 'gpt-3.5-turbo'])
      }),
      anthropic: z.object({
        enabled: z.boolean().default(false),
        apiKey: z.string().optional(),
        models: z.array(z.string()).default(['claude-3-opus', 'claude-3-sonnet'])
      }),
      local: z.object({
        enabled: z.boolean().default(true),
        ollamaUrl: z.string().url().default('http://localhost:11434'),
        models: z.array(z.string()).default(['llama3', 'mistral'])
      })
    })
  }),
  
  tools: z.object({
    enabled: z.array(z.string()).default([
      'query_domain_knowledge',
      'generate_test_case',
      'get_playwright_best_practices',
      'generate_playwright_code'
    ]),
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      windowMs: z.number().int().default(60000), // 1 minute
      maxRequests: z.number().int().default(100)
    }),
    timeout: z.object({
      default: z.number().int().default(30000),
      generation: z.number().int().default(60000),
      search: z.number().int().default(10000)
    })
  }),
  
  knowledge: z.object({
    chromaUrl: z.string().url().default('http://localhost:8000'),
    collections: z.object({
      documents: z.string().default('documents'),
      features: z.string().default('features'),
      patterns: z.string().default('patterns')
    }),
    embedding: z.object({
      model: z.string().default('text-embedding-3-small'),
      dimension: z.number().int().default(1536),
      batchSize: z.number().int().default(100)
    }),
    search: z.object({
      topK: z.number().int().default(5),
      threshold: z.number().min(0).max(1).default(0.7)
    })
  }),
  
  sessions: z.object({
    ttl: z.number().int().default(3600000), // 1 hour
    maxPerUser: z.number().int().default(5),
    cleanup: z.object({
      enabled: z.boolean().default(true),
      interval: z.number().int().default(300000) // 5 minutes
    })
  }),
  
  webhooks: z.object({
    enabled: z.boolean().default(false),
    retries: z.number().int().default(3),
    timeout: z.number().int().default(5000),
    backoff: z.object({
      initial: z.number().int().default(1000),
      multiplier: z.number().default(2),
      max: z.number().int().default(30000)
    })
  }),
  
  testing: z.object({
    mockModels: z.boolean().default(false),
    deterministicResponses: z.boolean().default(false),
    latencySimulation: z.object({
      enabled: z.boolean().default(false),
      min: z.number().int().default(100),
      max: z.number().int().default(1000)
    })
  })
});

export type McpConfigType = z.infer<typeof McpConfigSchema>;

export class McpConfig extends BaseConfig<typeof McpConfigSchema> {
  constructor(environment?: string) {
    super(McpConfigSchema, environment);
  }

  protected getDefaults(): Partial<McpConfigType> {
    const isProduction = this.environment === 'production';
    
    return {
      app: {
        name: 'Testoria MCP Platform',
        baseUrl: 'http://localhost:3010',
        port: 3010,
        apiUrl: 'http://localhost:3010/api',
        environment: 'development'
      },
      server: {
        host: 'localhost',
        port: 3010,
        protocol: isProduction ? 'https' : 'http',
        timeout: 30000,
        maxConnections: isProduction ? 1000 : 100
      },
      models: {
        defaultChat: 'gpt-4',
        defaultEmbedding: 'text-embedding-3-small',
        providers: {
          openai: {
            enabled: true,
            models: ['gpt-4', 'gpt-3.5-turbo']
          },
          anthropic: {
            enabled: false,
            models: ['claude-3-opus', 'claude-3-sonnet']
          },
          local: {
            enabled: !isProduction,
            ollamaUrl: 'http://localhost:11434',
            models: ['llama3', 'mistral']
          }
        }
      },
      tools: {
        enabled: [
          'query_domain_knowledge',
          'generate_test_case',
          'get_playwright_best_practices',
          'generate_playwright_code'
        ],
        rateLimit: {
          enabled: isProduction,
          windowMs: 60000,
          maxRequests: isProduction ? 60 : 100
        },
        timeout: {
          default: 30000,
          generation: 60000,
          search: 10000
        }
      },
      knowledge: {
        chromaUrl: 'http://localhost:8000',
        collections: {
          documents: 'documents',
          features: 'features',
          patterns: 'patterns'
        },
        embedding: {
          model: 'text-embedding-3-small',
          dimension: 1536,
          batchSize: 100
        },
        search: {
          topK: 5,
          threshold: 0.7
        }
      },
      sessions: {
        ttl: isProduction ? 1800000 : 3600000, // 30m prod, 1h dev
        maxPerUser: 5,
        cleanup: {
          enabled: true,
          interval: 300000
        }
      },
      webhooks: {
        enabled: isProduction,
        retries: 3,
        timeout: 5000,
        backoff: {
          initial: 1000,
          multiplier: 2,
          max: 30000
        }
      },
      testing: {
        mockModels: false,
        deterministicResponses: false,
        latencySimulation: {
          enabled: false,
          min: 100,
          max: 1000
        }
      }
    };
  }

  protected envToConfig(env: NodeJS.ProcessEnv): Partial<McpConfigType> {
    const config: any = {};

    // App configuration
    if (env.MCP_BASE_URL) {
      config.app = config.app || {};
      config.app.baseUrl = env.MCP_BASE_URL;
    }
    if (env.MCP_PORT) {
      config.app = config.app || {};
      config.app.port = parseInt(env.MCP_PORT, 10);
      config.server = config.server || {};
      config.server.port = parseInt(env.MCP_PORT, 10);
    }

    // Model configuration
    if (env.OPENAI_API_KEY) {
      config.models = config.models || {};
      config.models.providers = config.models.providers || {};
      config.models.providers.openai = {
        enabled: true,
        apiKey: env.OPENAI_API_KEY
      };
    }
    if (env.ANTHROPIC_API_KEY) {
      config.models = config.models || {};
      config.models.providers = config.models.providers || {};
      config.models.providers.anthropic = {
        enabled: true,
        apiKey: env.ANTHROPIC_API_KEY
      };
    }
    if (env.OLLAMA_URL) {
      config.models = config.models || {};
      config.models.providers = config.models.providers || {};
      config.models.providers.local = {
        enabled: true,
        ollamaUrl: env.OLLAMA_URL
      };
    }

    // Knowledge configuration
    if (env.CHROMA_URL) {
      config.knowledge = config.knowledge || {};
      config.knowledge.chromaUrl = env.CHROMA_URL;
    }

    // Tool configuration
    if (env.MCP_ENABLED_TOOLS) {
      config.tools = config.tools || {};
      config.tools.enabled = env.MCP_ENABLED_TOOLS.split(',').map(t => t.trim());
    }
    if (env.MCP_RATE_LIMIT === 'false') {
      config.tools = config.tools || {};
      config.tools.rateLimit = { enabled: false };
    }

    // Testing configuration
    if (env.MCP_MOCK_MODELS === 'true') {
      config.testing = config.testing || {};
      config.testing.mockModels = true;
    }
    if (env.MCP_DETERMINISTIC === 'true') {
      config.testing = config.testing || {};
      config.testing.deterministicResponses = true;
    }

    return config;
  }

  // Convenience methods

  getServerUrl(): string {
    const { protocol, host, port } = this.config.server;
    return `${protocol}://${host}:${port}`;
  }

  getApiUrl(): string {
    return this.config.app.apiUrl;
  }

  getChromaUrl(): string {
    return this.config.knowledge.chromaUrl;
  }

  isModelProviderEnabled(provider: 'openai' | 'anthropic' | 'local'): boolean {
    return this.config.models.providers[provider].enabled;
  }

  getEnabledModels(): string[] {
    const models: string[] = [];
    
    for (const [provider, config] of Object.entries(this.config.models.providers)) {
      if (config.enabled && config.models) {
        models.push(...config.models);
      }
    }
    
    return models;
  }

  isToolEnabled(toolName: string): boolean {
    return this.config.tools.enabled.includes(toolName);
  }

  getToolTimeout(toolType: 'default' | 'generation' | 'search' = 'default'): number {
    return this.config.tools.timeout[toolType];
  }

  getSearchConfig() {
    return this.config.knowledge.search;
  }

  getSessionConfig() {
    return this.config.sessions;
  }

  getTestingConfig() {
    return this.config.testing;
  }

  shouldMockModels(): boolean {
    return this.config.testing.mockModels;
  }
}

// Singleton instance
let instance: McpConfig | null = null;

export function getMcpConfig(environment?: string): McpConfig {
  if (!instance || (environment && environment !== instance.getEnvironment())) {
    instance = new McpConfig(environment);
  }
  return instance;
}