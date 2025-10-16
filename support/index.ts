/**
 * Support Exports
 * 
 * Central export point for all E2E test framework support utilities
 */

// Configuration
export * from './config';

// Data management
export * from './data';

// API layer
export * from './api';

// Page objects
export * from './pages';

// Helpers
export * from './helpers';

// Workflows
export * from './workflows';

// Quick access utilities
export const support = {
  // Configuration
  config: () => import('./config'),
  
  // Data management
  data: () => import('./data'),
  
  // API clients
  api: () => import('./api'),
  
  // Page objects
  pages: () => import('./pages'),
  
  // Helper utilities
  helpers: () => import('./helpers'),
  
  // Workflow system
  workflows: () => import('./workflows')
};