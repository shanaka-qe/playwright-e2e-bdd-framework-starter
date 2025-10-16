/**
 * Staging Environment Configuration
 */

export const stagingConfig = {
  environment: 'staging',
  debug: false,
  webapp: {
    baseUrl: process.env.STAGING_UI_BASE_URL || 'https://staging.example.com',
    timeout: 30000,
  },
  adminapp: {
    baseUrl: process.env.STAGING_ADMIN_BASE_URL || 'https://admin-staging.example.com',
    timeout: 30000,
  },
  mcpServer: {
    baseUrl: process.env.STAGING_MCP_PLATFORM_URL || 'https://mcp-staging.example.com',
    timeout: 15000,
  },
  database: {
    host: process.env.STAGING_DB_HOST,
    port: Number(process.env.STAGING_DB_PORT) || 5432,
    cleanupAfterTests: true,
  },
  logging: {
    level: 'info',
    console: true,
    file: true,
  },
  retries: 2,
  parallel: {
    workers: 4,
  },
};