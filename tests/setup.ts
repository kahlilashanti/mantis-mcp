/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Extend Jest matchers
import '@jest/globals';

// Mock console methods to reduce noise during testing
const originalConsole = { ...console };

beforeEach(() => {
  // Reset console mocks before each test
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore original console after each test
  Object.assign(console, originalConsole);
});

// Global test utilities
global.testUtils = {
  // Mock MCP environment detection
  mockEnvironment: (env: 'claude-desktop' | 'claude-code' | 'cursor') => {
    process.env.MCP_ENVIRONMENT = env;
  },
  
  // Reset environment
  resetEnvironment: () => {
    delete process.env.MCP_ENVIRONMENT;
  },
  
  // Create mock MCP tool response
  createMockResponse: (tool: string, success: boolean = true, data: any = {}) => {
    return {
      success,
      tool,
      timestamp: new Date().toISOString(),
      ...data
    };
  },
  
  // Validate MCP response schema
  validateMCPResponse: (response: any) => {
    expect(response).toHaveProperty('success');
    expect(typeof response.success).toBe('boolean');
    
    if (response.success) {
      expect(response).toHaveProperty('action');
      expect(['instructions', 'execute']).toContain(response.action);
    }
    
    return true;
  },
  
  // Create mock SDK types for testing
  createMockSDKConfig: () => ({
    allowedOrigins: ['https://localhost:3000'],
    enableLogging: true,
    productId: 'test-product-123'
  }),
  
  // Performance testing utilities
  measurePerformance: async (fn: Function) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  }
};

// Add type declarations for global utilities
declare global {
  var testUtils: {
    mockEnvironment: (env: 'claude-desktop' | 'claude-code' | 'cursor') => void;
    resetEnvironment: () => void;
    createMockResponse: (tool: string, success?: boolean, data?: any) => any;
    validateMCPResponse: (response: any) => boolean;
    createMockSDKConfig: () => any;
    measurePerformance: (fn: Function) => Promise<number>;
  };
}

// Mock fetch for HTTP requests in tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Mock performance API for Node.js environment
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    clearMarks: () => {},
    clearMeasures: () => {}
  } as any;
}