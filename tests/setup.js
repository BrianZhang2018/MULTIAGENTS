// Test setup file for Jest
import { jest } from '@jest/globals';

// Mock environment variables
process.env.GOOGLE_API_KEY = 'test-api-key-12345';
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  // Keep console.error for debugging but silence in CI
  error: process.env.CI ? jest.fn() : console.error,
  warn: jest.fn(),
  log: process.env.DEBUG_TESTS ? console.log : jest.fn(),
};