/**
 * API Testing Exports
 * 
 * Central export point for all API testing utilities
 */

// Base API
export { BaseAPI } from './BaseAPI';
export type { APIRequestOptions, APIResponseData } from './BaseAPI';

// Application APIs
export { WebappAPI } from './webapp/WebappAPI';
export { AdminAPI } from './adminapp/AdminAPI';
export { McpAPI } from './mcp-platform/McpAPI';

// Type definitions
export * from './types/common.types';
export * from './types/webapp.types';
export * from './types/adminapp.types';
export * from './types/mcp-platform.types';

// Validation helpers
export { 
  APIValidation, 
  ChainableAPIAssertion, 
  expectAPI 
} from './helpers/APIValidation';

// Test data builders
export {
  // Document builders
  DocumentBuilder,
  aDocument,
  DocumentFactory,
  
  // User builders
  UserBuilder,
  AdminUserBuilder,
  aUser,
  anAdminUser,
  UserFactory,
  
  // Feature builders
  StepBuilder,
  ScenarioBuilder,
  FeatureBuilder,
  FeatureFileBuilder,
  aStep,
  aScenario,
  aFeature,
  aFeatureFile,
  FeatureFactory,
  
  // Project builders
  ProjectBuilder,
  aProject,
  ProjectFactory,
  
  // Test data factory
  TestDataFactory
} from './builders/TestDataFactory';

// Re-export types used by builders
export type {
  TestDataSet,
  ProjectTestData
} from './builders/TestDataFactory';