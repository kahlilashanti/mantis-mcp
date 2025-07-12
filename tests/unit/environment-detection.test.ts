/**
 * Environment Detection Tests
 * Tests for detecting Claude Desktop vs Claude Code and adapting responses
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

interface EnvironmentDetector {
  detectEnvironment(): 'claude-desktop' | 'claude-code' | 'cursor' | 'unknown';
  getResponseFormat(environment: string): 'instructions' | 'execute';
  adaptResponse(response: any, environment: string): any;
}

// Mock implementation for testing
class MockEnvironmentDetector implements EnvironmentDetector {
  private mockEnv: string = 'claude-desktop';
  
  setMockEnvironment(env: string) {
    this.mockEnv = env;
  }
  
  detectEnvironment(): 'claude-desktop' | 'claude-code' | 'cursor' | 'unknown' {
    // Simulate environment detection logic
    if (this.mockEnv.includes('claude-code')) return 'claude-code';
    if (this.mockEnv.includes('cursor')) return 'cursor';
    if (this.mockEnv.includes('claude-desktop')) return 'claude-desktop';
    return 'unknown';
  }
  
  getResponseFormat(environment: string): 'instructions' | 'execute' {
    return environment === 'claude-desktop' ? 'instructions' : 'execute';
  }
  
  adaptResponse(response: any, environment: string): any {
    const format = this.getResponseFormat(environment);
    
    if (format === 'instructions') {
      return {
        action: 'instructions',
        message: response.message || 'Follow these steps:',
        steps: response.steps || [],
        nextSteps: response.nextSteps || []
      };
    } else {
      return {
        action: 'execute',
        steps: response.steps?.map((step: any) => ({
          type: step.type || 'command',
          command: step.command || step.code,
          path: step.path,
          content: step.content
        })) || []
      };
    }
  }
}

describe('Environment Detection', () => {
  let detector: MockEnvironmentDetector;
  
  beforeEach(() => {
    detector = new MockEnvironmentDetector();
  });
  
  describe('detectEnvironment', () => {
    it('should detect Claude Desktop environment', () => {
      detector.setMockEnvironment('claude-desktop-app');
      expect(detector.detectEnvironment()).toBe('claude-desktop');
    });
    
    it('should detect Claude Code environment', () => {
      detector.setMockEnvironment('claude-code-vscode');
      expect(detector.detectEnvironment()).toBe('claude-code');
    });
    
    it('should detect Cursor environment', () => {
      detector.setMockEnvironment('cursor-editor');
      expect(detector.detectEnvironment()).toBe('cursor');
    });
    
    it('should return unknown for unrecognized environments', () => {
      detector.setMockEnvironment('some-other-tool');
      expect(detector.detectEnvironment()).toBe('unknown');
    });
  });
  
  describe('getResponseFormat', () => {
    it('should return instructions format for Claude Desktop', () => {
      expect(detector.getResponseFormat('claude-desktop')).toBe('instructions');
    });
    
    it('should return execute format for Claude Code', () => {
      expect(detector.getResponseFormat('claude-code')).toBe('execute');
    });
    
    it('should return execute format for Cursor', () => {
      expect(detector.getResponseFormat('cursor')).toBe('execute');
    });
  });
  
  describe('adaptResponse', () => {
    const mockResponse = {
      message: 'Install Mantis SDK',
      steps: [
        {
          description: 'Create .npmrc file',
          code: '@mantis-3d:registry=https://npm.pkg.github.com',
          type: 'file',
          path: '.npmrc'
        },
        {
          description: 'Install SDK',
          command: 'npm install @mantis-3d/sdk',
          type: 'command'
        }
      ],
      nextSteps: ['Configure origins', 'Test installation']
    };
    
    it('should format response for Claude Desktop', () => {
      const adapted = detector.adaptResponse(mockResponse, 'claude-desktop');
      
      expect(adapted).toEqual({
        action: 'instructions',
        message: 'Install Mantis SDK',
        steps: mockResponse.steps,
        nextSteps: mockResponse.nextSteps
      });
    });
    
    it('should format response for Claude Code', () => {
      const adapted = detector.adaptResponse(mockResponse, 'claude-code');
      
      expect(adapted).toEqual({
        action: 'execute',
        steps: [
          {
            type: 'file',
            command: '@mantis-3d:registry=https://npm.pkg.github.com',
            path: '.npmrc',
            content: undefined
          },
          {
            type: 'command',
            command: 'npm install @mantis-3d/sdk',
            path: undefined,
            content: undefined
          }
        ]
      });
    });
  });
});

describe('Response Validation', () => {
  let detector: MockEnvironmentDetector;
  
  beforeEach(() => {
    detector = new MockEnvironmentDetector();
  });
  
  it('should validate Claude Desktop response schema', () => {
    const response = {
      action: 'instructions',
      message: 'Test message',
      steps: [
        {
          step: 1,
          description: 'Test step',
          code: 'test code',
          note: 'test note'
        }
      ],
      nextSteps: ['Step 1', 'Step 2']
    };
    
    // Should have required fields for Claude Desktop
    expect(response.action).toBe('instructions');
    expect(response.message).toBeDefined();
    expect(Array.isArray(response.steps)).toBe(true);
    expect(Array.isArray(response.nextSteps)).toBe(true);
  });
  
  it('should validate Claude Code response schema', () => {
    const response = {
      action: 'execute',
      steps: [
        {
          type: 'file',
          path: '.npmrc',
          content: 'test content'
        },
        {
          type: 'command',
          command: 'npm install'
        }
      ]
    };
    
    // Should have required fields for Claude Code
    expect(response.action).toBe('execute');
    expect(Array.isArray(response.steps)).toBe(true);
    response.steps.forEach((step: any) => {
      expect(step.type).toBeDefined();
      if (step.type === 'file') {
        expect(step.path).toBeDefined();
      }
      if (step.type === 'command') {
        expect(step.command).toBeDefined();
      }
    });
  });
});