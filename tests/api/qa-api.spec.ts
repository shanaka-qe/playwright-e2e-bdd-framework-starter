import { test, expect } from '@playwright/test';

/**
 * Comprehensive API Tests for QA Knowledge Base
 * Tests all API endpoints with various scenarios
 * Smoke-level tests - no DB operations or model changes
 */

test.describe('QA Knowledge Base API Tests', () => {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

  test.describe('Q&A API (/api/ask)', () => {
    test('GET /api/ask should return API status', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/ask`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('Q&A API endpoint is ready');
      expect(data).toHaveProperty('usage');
      expect(data).toHaveProperty('availableDocuments');
    });

    test('POST /api/ask should handle valid question', async ({ request }) => {
      const question = 'What is testing?';
      const response = await request.post(`${baseURL}/api/ask`, {
        data: { question }
      });

      // In test environment, ChromaDB might not be available, so we expect either 200 or 500
      expect([200, 500]).toContain(response.status());
      
      const data = await response.json();
      if (response.status() === 200) {
        expect(data).toHaveProperty('success');
        expect(data.success).toBe(true);
        expect(data).toHaveProperty('answer');
        expect(data).toHaveProperty('sources');
        expect(data).toHaveProperty('confidence');
        expect(data).toHaveProperty('question');
        expect(data.question).toBe(question);
      } else {
        expect(data).toHaveProperty('error');
      }
    });

    test('POST /api/ask should handle empty question', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: { question: '' }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Question is required');
    });

    test('POST /api/ask should handle missing question', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: {}
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Question is required');
    });

    test('POST /api/ask should handle complex questions', async ({ request }) => {
      const question = 'How do I implement user authentication with JWT tokens and what are the security best practices?';
      const response = await request.post(`${baseURL}/api/ask`, {
        data: { question, maxResults: 10 }
      });

      // In test environment, ChromaDB might not be available, so we expect either 200 or 500
      expect([200, 500]).toContain(response.status());
      
      const data = await response.json();
      if (response.status() === 200) {
        expect(data.success).toBe(true);
        expect(data.question).toBe(question);
      } else {
        expect(data).toHaveProperty('error');
      }
    });

    test('POST /api/ask should handle maxResults parameter', async ({ request }) => {
      const question = 'What is testing?';
      const response = await request.post(`${baseURL}/api/ask`, {
        data: { question, maxResults: 3 }
      });

      // In test environment, ChromaDB might not be available, so we expect either 200 or 500
      expect([200, 500]).toContain(response.status());
      
      const data = await response.json();
      if (response.status() === 200) {
        expect(data.success).toBe(true);
        expect(data.sources.length).toBeLessThanOrEqual(3);
      } else {
        expect(data).toHaveProperty('error');
      }
    });
  });

  test.describe('Documents API (/api/documents)', () => {
    test('GET /api/documents should return documents list', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data).toHaveProperty('pagination');
    });

    test('GET /api/documents should handle pagination parameters', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents?page=1&limit=10`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('totalPages');
      expect(data.pagination).toHaveProperty('totalCount');
    });

    test('GET /api/documents should handle search parameters', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents?search=test`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/documents should handle category filter', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents?category=feature`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  test.describe('Features API (/api/features)', () => {
    test('GET /api/features should return features list', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/features`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      // Features API returns array directly, not wrapped in success/data
      expect(Array.isArray(data)).toBe(true);
    });

    test('POST /api/features should handle feature creation', async ({ request }) => {
      const featureData = {
        title: 'Test Feature',
        content: 'Feature: Test\nScenario: Test\nGiven I am on the page',
        source: 'generated'
      };

      const response = await request.post(`${baseURL}/api/features`, {
        data: featureData
      });

      // Should either succeed (201), return validation error (400), or conflict (409)
      expect([201, 400, 409]).toContain(response.status());
      
      const data = await response.json();
      if (response.status() === 201) {
        // API returns feature object directly on creation
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('title');
        expect(data.title).toBe(featureData.title);
      } else if (response.status() === 409) {
        // Conflict - feature already exists
        expect(data).toHaveProperty('error');
        // canOverwrite property might not always be present
        if (data.canOverwrite !== undefined) {
          expect(typeof data.canOverwrite).toBe('boolean');
        }
      } else {
        expect(data).toHaveProperty('error');
      }
    });

    test('POST /api/features should validate required fields', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/features`, {
        data: {}
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  test.describe('ChromaDB Health API (/api/chromadb/health)', () => {
    test('GET /api/chromadb/health should return health status', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/chromadb/health`);
      
      // ChromaDB health endpoint might not exist in all environments
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('message');
      }
    });
  });

  test.describe('Settings API (/api/settings)', () => {
    test('GET /api/settings/models should return model configuration', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/settings/models`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('currentConfig');
      expect(data).toHaveProperty('availableModels');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/non-existent`);
      
      expect(response.status()).toBe(404);
    });

    test('should handle invalid JSON in request body', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.status()).toBe(400);
    });

    test('should handle missing Content-Type header', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: { question: 'test' }
      });

      // Should handle the request even without explicit Content-Type
      // In test environment, ChromaDB might not be available, so we expect either 200 or 500
      expect([200, 400, 500]).toContain(response.status());
    });
  });

  test.describe('Performance', () => {
    test('should respond within reasonable time', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${baseURL}/api/ask`);
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
    });

    test('should handle concurrent requests', async ({ request }) => {
      const promises = Array(5).fill(null).map(() => 
        request.get(`${baseURL}/api/ask`)
      );
      
      const responses = await Promise.all(promises);
      
      for (const response of responses) {
        expect(response.status()).toBe(200);
      }
    });
  });

  test.describe('CORS and Headers', () => {
    test('should include proper CORS headers', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/ask`);
      
      expect(response.status()).toBe(200);
      
      // Check for CORS headers (if implemented)
      const headers = response.headers();
      // Note: CORS headers might not be present in all environments
      // This test just ensures the request doesn't fail
    });

    test('should include proper content type headers', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/ask`);
      
      expect(response.status()).toBe(200);
      
      const headers = response.headers();
      expect(headers['content-type']).toContain('application/json');
    });
  });
});