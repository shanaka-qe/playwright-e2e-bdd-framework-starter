/**
 * Development Environment Configuration
 */

export const devConfig = {
  environment: 'development',
  debug: true,
  webapp: {
    baseUrl: 'http://localhost:3001',
    timeout: 60000, // Longer timeouts for dev
  },
  adminapp: {
    baseUrl: 'http://localhost:3021',
    timeout: 60000,
  },
  mcpServer: {
    baseUrl: 'http://localhost:3002',
    timeout: 30000,
  },
  database: {
    host: 'localhost',
    port: 5432,
    cleanupAfterTests: false, // Keep data for debugging
  },
  logging: {
    level: 'debug',
    console: true,
    file: false,
  },
  retries: 0, // No retries in dev for faster feedback
  parallel: {
    workers: 1, // Sequential execution for easier debugging
  },
};