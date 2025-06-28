// Global setup for e2e tests
import { ConfigService } from '@nestjs/config';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRATION = '1h';
process.env.COSMOS_DB_ENDPOINT = 'https://test-cosmos-db.documents.azure.com:443/';
process.env.COSMOS_DB_KEY = 'test-key';
process.env.COSMOS_DB_NAME = 'test-database';

// Increase timeout for e2e tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  generateTestUser: () => ({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    roles: ['client'],
  }),
  
  generateTestAuth: () => ({
    email: `auth_${Date.now()}@example.com`,
    username: `authuser_${Date.now()}`,
    password: 'password123',
  }),
}; 