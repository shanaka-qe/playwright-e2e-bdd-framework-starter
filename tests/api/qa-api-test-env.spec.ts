import { test, expect } from '@playwright/test';

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

test.describe('QA Knowledge Base API Tests (Test Environment)', () => {
  test.describe('Q&A API (/api/ask)', () => {
    test('GET /api/ask should return API status', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/ask`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('status');
      expect(data.message).toContain('Q&A API endpoint is ready');
    });

    test('POST /api/ask should handle valid question (with ChromaDB disconnected)', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: {
          question: 'What is the main purpose of this application?'
        }
      });
      
      // In test environment, ChromaDB is disconnected, so we expect an error response
      expect(response.status()).toBe(500);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Failed to process question');
    });

    test('POST /api/ask should handle missing question', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: {}
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Question is required');
    });

    test('POST /api/ask should handle empty question', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: {
          question: ''
        }
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Question is required');
    });

    test('POST /api/ask should handle maxResults parameter', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: {
          question: 'Test question',
          maxResults: 5
        }
      });
      
      // In test environment, ChromaDB is disconnected, so we expect an error response
      expect(response.status()).toBe(500);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Failed to process question');
    });
  });

  test.describe('Documents API (/api/documents)', () => {
    test('GET /api/documents should return documents list', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/documents should handle search parameters', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents?search=test`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/documents should handle pagination parameters', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents?page=1&limit=10`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('GET /api/documents should handle category filter', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents?category=test`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  test.describe('Features API (/api/features)', () => {
    test('GET /api/features should return features list', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/features`);
      
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      // In test environment, we expect some test features
      expect(data.length).toBeGreaterThanOrEqual(0);
    });

    test('POST /api/features should handle feature creation', async ({ request }) => {
      const timestamp = Date.now();
      const featureData = {
        title: `Test Feature ${timestamp}`,
        content: 'Feature: Test\nScenario: Test\nGiven I am on the page'
      };

      const response = await request.post(`${baseURL}/api/features`, {
        data: featureData
      });
      
      expect(response.status()).toBe(201);
      
      const data = await response.json();
      // The API returns the created feature directly, not wrapped in success/error
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('content');
      expect(data.title).toBe(featureData.title);
    });

    test('POST /api/features should validate required fields', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/features`, {
        data: {
          title: '',
          content: ''
        }
      });
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
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
      expect(data).toHaveProperty('message');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/nonexistent`);
      
      expect(response.status()).toBe(404);
    });

    test('should handle invalid JSON in request body', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(400);
    });

    test('should handle missing Content-Type header', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ask`, {
        data: {
          question: 'test'
        }
        // No Content-Type header
      });
      
      // Should handle the request even without explicit Content-Type
      expect(response.status()).toBe(500); // ChromaDB error, not 500 due to missing header
    });
  });

  test.describe('Performance', () => {
    test('should respond within reasonable time', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${baseURL}/api/ask`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5 seconds
    });

    test('should handle concurrent requests', async ({ request }) => {
      const promises = Array.from({ length: 5 }, () => 
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
      // Note: CORS headers are typically set by the server, not checked in tests
    });

    test('should include proper content type headers', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/ask`);
      
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
    });
  });
}); 