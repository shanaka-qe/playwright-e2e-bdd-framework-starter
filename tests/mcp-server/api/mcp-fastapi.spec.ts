import { test, expect } from '@playwright/test';

/**
 * FastAPI MCP Platform API Tests
 * Tests for the new FastAPI-based MCP implementation
 * Validates that the FastAPI migration was successful
 */

test.describe('FastAPI MCP Platform Tests', () => {
  const mcpURL = process.env.MCP_FASTAPI_URL || 'http://localhost:3010';

  test.describe('Health and Status Checks', () => {
    test('GET /health should return healthy status', async ({ request }) => {
      const response = await request.get(`${mcpURL}/health`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('healthy');
      expect(data).toHaveProperty('service');
      expect(data.service).toBe('testoria-mcp-fastapi');
      expect(data).toHaveProperty('version');
      expect(data.version).toBe('2.0.0');
      expect(data).toHaveProperty('mcp_server_running');
    });

    test('GET /mcp/status should return MCP server status', async ({ request }) => {
      // This endpoint requires authentication, so we might get 401 or 403
      const response = await request.get(`${mcpURL}/mcp/status`);
      
      // Accept authentication required responses in test environment
      expect([200, 401, 403]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('tools');
        expect(data).toHaveProperty('capabilities');
        expect(Array.isArray(data.tools)).toBe(true);
      }
    });
  });

  test.describe('API Documentation', () => {
    test('GET /docs should return OpenAPI documentation', async ({ request }) => {
      const response = await request.get(`${mcpURL}/docs`);
      
      expect(response.status()).toBe(200);
      
      const headers = response.headers();
      expect(headers['content-type']).toContain('text/html');
    });

    test('GET /redoc should return ReDoc documentation', async ({ request }) => {
      const response = await request.get(`${mcpURL}/redoc`);
      
      expect(response.status()).toBe(200);
      
      const headers = response.headers();
      expect(headers['content-type']).toContain('text/html');
    });
  });

  test.describe('CORS and Security Headers', () => {
    test('should include proper CORS headers', async ({ request }) => {
      const response = await request.get(`${mcpURL}/health`);
      
      expect(response.status()).toBe(200);
      
      const headers = response.headers();
      // CORS headers should be present for browser compatibility
      expect(headers).toHaveProperty('access-control-allow-origin');
    });

    test('should include security headers', async ({ request }) => {
      const response = await request.get(`${mcpURL}/health`);
      
      expect(response.status()).toBe(200);
      
      const headers = response.headers();
      // Security headers from SecurityHeadersMiddleware
      expect(headers).toHaveProperty('x-content-type-options');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers).toHaveProperty('x-frame-options');
      expect(headers['x-frame-options']).toBe('DENY');
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should respond within reasonable time', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${mcpURL}/health`);
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
    });

    test('should handle concurrent requests', async ({ request }) => {
      const promises = Array(5).fill(null).map(() => 
        request.get(`${mcpURL}/health`)
      );
      
      const responses = await Promise.all(promises);
      
      for (const response of responses) {
        expect(response.status()).toBe(200);
      }
    });

    test('should handle malformed requests gracefully', async ({ request }) => {
      const response = await request.post(`${mcpURL}/health`, {
        data: 'invalid-data'
      });
      
      // Should handle the invalid request without crashing
      expect([200, 405, 422]).toContain(response.status());
    });
  });

  test.describe('Error Handling', () => {
    test('should return 404 for non-existent endpoints', async ({ request }) => {
      const response = await request.get(`${mcpURL}/non-existent-endpoint`);
      
      expect(response.status()).toBe(404);
    });

    test('should handle invalid JSON gracefully', async ({ request }) => {
      const response = await request.post(`${mcpURL}/auth/token`, {
        data: 'invalid-json',
        headers: { 'Content-Type': 'application/json' }
      });

      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe('Migration Validation', () => {
    test('FastAPI service should be running on correct port', async ({ request }) => {
      // Verify the FastAPI service is accessible on the expected port
      const response = await request.get(`${mcpURL}/health`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.service).toBe('testoria-mcp-fastapi');
    });

    test('Should not respond to old Node.js endpoints', async ({ request }) => {
      // The old Node.js MCP server used different endpoint structure
      // Verify that FastAPI doesn't accidentally expose old endpoints
      const oldNodeEndpoints = [
        '/mcp-tools',
        '/nodejs-health',
        '/legacy-api'
      ];

      for (const endpoint of oldNodeEndpoints) {
        const response = await request.get(`${mcpURL}${endpoint}`);
        expect(response.status()).toBe(404);
      }
    });

    test('All expected MCP tools should be available', async ({ request }) => {
      // This test validates that all 5 tools from Node.js were migrated
      const response = await request.get(`${mcpURL}/mcp/status`);
      
      if (response.status() === 200) {
        const data = await response.json();
        
        const expectedTools = [
          'query_domain_knowledge',
          'generate_test_case', 
          'get_playwright_best_practices',
          'get_coding_guidelines',
          'generate_playwright_code'
        ];
        
        for (const tool of expectedTools) {
          expect(data.tools).toContain(tool);
        }
        
        expect(data.tools.length).toBe(expectedTools.length);
      }
    });
  });
});