/**
 * MCP Platform API Types
 * 
 * Type definitions specific to the Model Context Protocol platform API
 */

// MCP Tools
export interface MCPTool {
  name: string;
  description: string;
  parameters: ToolParameters;
  category: ToolCategory;
  enabled: boolean;
  rateLimit?: RateLimit;
  permissions?: string[];
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, ParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface ParameterProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: any[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  default?: any;
  items?: ParameterProperty;
  properties?: Record<string, ParameterProperty>;
}

export enum ToolCategory {
  SEARCH = 'search',
  GENERATION = 'generation',
  ANALYSIS = 'analysis',
  TRANSFORMATION = 'transformation',
  VALIDATION = 'validation',
  INTEGRATION = 'integration'
}

export interface RateLimit {
  requests: number;
  window: number; // in seconds
  burstLimit?: number;
}

// Tool Execution
export interface ToolExecutionRequest {
  tool: string;
  parameters: Record<string, any>;
  context?: ExecutionContext;
  options?: ExecutionOptions;
}

export interface ExecutionContext {
  sessionId?: string;
  userId?: string;
  projectId?: string;
  previousResults?: string[];
  metadata?: Record<string, any>;
}

export interface ExecutionOptions {
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
  async?: boolean;
  webhook?: string;
}

export interface ToolExecutionResponse {
  executionId: string;
  tool: string;
  status: ExecutionStatus;
  result?: any;
  error?: ExecutionError;
  duration?: number;
  usage?: ResourceUsage;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable?: boolean;
}

export interface ResourceUsage {
  tokens?: number;
  credits?: number;
  apiCalls?: number;
  computeTime?: number;
}

// MCP Sessions
export interface MCPSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: SessionStatus;
  tools: string[];
  executions: number;
  totalTokens?: number;
  metadata?: SessionMetadata;
}

export enum SessionStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  EXPIRED = 'expired',
  TERMINATED = 'terminated'
}

export interface SessionMetadata {
  client?: string;
  version?: string;
  environment?: string;
  features?: string[];
}

export interface SessionRequest {
  tools?: string[];
  metadata?: SessionMetadata;
  ttl?: number; // time to live in seconds
}

export interface SessionResponse {
  session: MCPSession;
  token: string;
  expiresAt: string;
  availableTools: MCPTool[];
}

// Knowledge Base
export interface KnowledgeEntry {
  id: string;
  type: KnowledgeType;
  title: string;
  content: string;
  embedding?: number[];
  metadata: KnowledgeMetadata;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export enum KnowledgeType {
  DOCUMENT = 'document',
  BEST_PRACTICE = 'best_practice',
  EXAMPLE = 'example',
  PATTERN = 'pattern',
  REFERENCE = 'reference'
}

export interface KnowledgeMetadata {
  source?: string;
  author?: string;
  tags?: string[];
  language?: string;
  framework?: string;
  relevance?: number;
  quality?: number;
}

export interface KnowledgeSearchRequest {
  query: string;
  type?: KnowledgeType[];
  limit?: number;
  threshold?: number;
  filters?: KnowledgeFilters;
  includeEmbeddings?: boolean;
}

export interface KnowledgeFilters {
  tags?: string[];
  frameworks?: string[];
  languages?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface KnowledgeSearchResponse {
  results: KnowledgeSearchResult[];
  total: number;
  query: {
    original: string;
    expanded?: string;
    embedding?: number[];
  };
}

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry;
  score: number;
  highlights?: string[];
  explanation?: string;
}

// Test Case Generation
export interface TestGenerationRequest {
  input: TestInput;
  framework: TestFramework;
  options: TestGenerationOptions;
}

export interface TestInput {
  type: 'gherkin' | 'requirements' | 'user_story' | 'code';
  content: string;
  context?: string;
  examples?: string[];
}

export enum TestFramework {
  PLAYWRIGHT = 'playwright',
  CYPRESS = 'cypress',
  SELENIUM = 'selenium',
  JEST = 'jest',
  PYTEST = 'pytest',
  JUNIT = 'junit'
}

export interface TestGenerationOptions {
  language: 'javascript' | 'typescript' | 'python' | 'java';
  style?: 'bdd' | 'tdd' | 'atdd';
  includeEdgeCases?: boolean;
  includeNegativeTests?: boolean;
  includePerformanceTests?: boolean;
  pageObjectPattern?: boolean;
  dataTestIds?: boolean;
}

export interface TestGenerationResponse {
  tests: GeneratedTest[];
  coverage: TestCoverage;
  suggestions?: string[];
  warnings?: string[];
}

export interface GeneratedTest {
  name: string;
  description?: string;
  code: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  tags?: string[];
  dependencies?: string[];
}

export interface TestCoverage {
  scenarios: number;
  steps: number;
  assertions: number;
  edgeCases: number;
  estimatedDuration?: number;
}

// Playwright Code Generation
export interface PlaywrightGenerationRequest {
  gherkin: string;
  options: PlaywrightOptions;
  pageObjects?: PageObjectDefinition[];
}

export interface PlaywrightOptions {
  typescript: boolean;
  pageObjectModel: boolean;
  roleBasedLocators: boolean;
  customAssertions: boolean;
  testIdAttribute?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface PageObjectDefinition {
  name: string;
  url?: string;
  elements: PageElement[];
  actions?: PageAction[];
}

export interface PageElement {
  name: string;
  locator: string;
  type: 'button' | 'input' | 'link' | 'text' | 'select' | 'checkbox' | 'radio';
  description?: string;
}

export interface PageAction {
  name: string;
  steps: string[];
  parameters?: Parameter[];
}

export interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
}

export interface PlaywrightGenerationResponse {
  stepDefinitions: StepDefinitionFile[];
  pageObjects?: PageObjectFile[];
  helpers?: HelperFile[];
  config?: ConfigFile;
}

export interface StepDefinitionFile {
  filename: string;
  content: string;
  imports: string[];
  steps: StepDefinition[];
}

export interface StepDefinition {
  pattern: string;
  implementation: string;
  parameters: string[];
}

export interface PageObjectFile {
  filename: string;
  content: string;
  className: string;
  methods: string[];
}

export interface HelperFile {
  filename: string;
  content: string;
  exports: string[];
}

export interface ConfigFile {
  filename: string;
  content: string;
  settings: Record<string, any>;
}

// Model Management
export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  type: ModelType;
  capabilities: string[];
  pricing?: ModelPricing;
  limits?: ModelLimits;
  status: ModelStatus;
}

export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  LOCAL = 'local',
  CUSTOM = 'custom'
}

export enum ModelType {
  CHAT = 'chat',
  COMPLETION = 'completion',
  EMBEDDING = 'embedding',
  IMAGE = 'image',
  AUDIO = 'audio'
}

export interface ModelPricing {
  currency: string;
  inputCost: number; // per 1k tokens
  outputCost: number; // per 1k tokens
  minimumCharge?: number;
}

export interface ModelLimits {
  maxTokens: number;
  maxRequestsPerMinute: number;
  maxRequestsPerDay?: number;
  contextWindow: number;
}

export enum ModelStatus {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  UNAVAILABLE = 'unavailable',
  DEPRECATED = 'deprecated'
}

// Webhooks
export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy?: RetryPolicy;
  enabled: boolean;
}

export enum WebhookEvent {
  TOOL_EXECUTED = 'tool.executed',
  SESSION_STARTED = 'session.started',
  SESSION_ENDED = 'session.ended',
  GENERATION_COMPLETED = 'generation.completed',
  ERROR_OCCURRED = 'error.occurred',
  LIMIT_REACHED = 'limit.reached'
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
  maxBackoff: number;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
  signature?: string;
}

// Usage Analytics
export interface UsageStats {
  period: {
    start: string;
    end: string;
  };
  summary: UsageSummary;
  breakdown: UsageBreakdown;
  trends: UsageTrends;
}

export interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  activeUsers: number;
  activeSessions: number;
}

export interface UsageBreakdown {
  byTool: Record<string, ToolUsage>;
  byModel: Record<string, ModelUsage>;
  byUser: Record<string, UserUsage>;
  byHour: Record<string, HourlyUsage>;
}

export interface ToolUsage {
  executions: number;
  failures: number;
  avgDuration: number;
  tokens?: number;
}

export interface ModelUsage {
  requests: number;
  tokens: {
    input: number;
    output: number;
  };
  cost: number;
}

export interface UserUsage {
  requests: number;
  tokens: number;
  tools: string[];
  sessions: number;
}

export interface HourlyUsage {
  requests: number;
  tokens: number;
  errors: number;
}

export interface UsageTrends {
  requestsChange: number;
  tokensChange: number;
  costChange: number;
  topGrowingTools: string[];
  peakHours: number[];
}