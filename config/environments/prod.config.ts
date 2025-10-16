/**
 * Production Environment Configuration
 */

export const prodConfig = {
  environment: 'production',
  debug: false,
  webapp: {
    baseUrl: process.env.PROD_UI_BASE_URL || 'https://example.com',
    timeout: 15000,
  },
  adminapp: {
    baseUrl: process.env.PROD_ADMIN_BASE_URL || 'https://admin.example.com',
    timeout: 15000,
  },
  mcpServer: {
    baseUrl: process.env.PROD_MCP_PLATFORM_URL || 'https://mcp.example.com',
    timeout: 10000,
  },
  database: {
    host: process.env.PROD_DB_HOST,
    port: Number(process.env.PROD_DB_PORT) || 5432,
    cleanupAfterTests: true,
  },
  logging: {
    level: 'error',
    console: false,
    file: true,
  },
  retries: 3,
  parallel: {
    workers: 6,
  },
};