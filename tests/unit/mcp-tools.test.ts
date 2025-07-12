/**
 * MCP Tools Test Suite
 * Tests for all Mantis MCP tools defined in the project specification
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Tool response interfaces based on project spec
interface MCPToolResponse {
  success: boolean;
  action: 'instructions' | 'execute';
  message?: string;
  steps?: any[];
  nextSteps?: string[];
  error?: string;
}

interface SetupToolResponse extends MCPToolResponse {
  npmrcContent?: string;
  installCommands?: string[];
  validationResults?: any;
}

interface DevelopmentToolResponse extends MCPToolResponse {
  generatedCode?: string;
  framework?: string;
  features?: string[];
  templates?: any[];
}

interface DebuggingToolResponse extends MCPToolResponse {
  issue?: string;
  details?: any;
  solution?: any;
  recommendation?: string;
}

// Mock implementations for testing
class MockMCPTools {
  private environment: string = 'claude-desktop';
  
  setEnvironment(env: string) {
    this.environment = env;
  }
  
  // Setup & Installation Tools
  async installMantisSDK(params: {
    framework: string;
    projectPath?: string;
    authToken?: string;
  }): Promise<SetupToolResponse> {
    const { framework, projectPath = '.', authToken } = params;
    
    const npmrcContent = '@mantis-3d:registry=https://npm.pkg.github.com\\n//npm.pkg.github.com/:_authToken=' + (authToken || 'YOUR_TOKEN');
    
    if (this.environment === 'claude-desktop') {
      return {
        success: true,
        action: 'instructions',
        message: `Follow these steps to install Mantis SDK for ${framework}`,
        steps: [
          {
            step: 1,
            description: 'Create .npmrc with authentication',
            code: npmrcContent,
            note: 'Replace YOUR_TOKEN with the token provided by Mantis'
          },
          {
            step: 2,
            description: 'Install the SDK',
            command: 'npm install @mantis-3d/sdk',
            alternatives: ['yarn add @mantis-3d/sdk', 'pnpm add @mantis-3d/sdk']
          }
        ],
        nextSteps: [
          'Import MantisSDK in your main file',
          'Configure allowed origins',
          'Test with validateSetup tool'
        ],
        npmrcContent,
        installCommands: ['npm install @mantis-3d/sdk']
      };
    } else {
      return {
        success: true,
        action: 'execute',
        steps: [
          {
            type: 'file',
            path: '.npmrc',
            content: npmrcContent
          },
          {
            type: 'command',
            command: 'npm install @mantis-3d/sdk'
          }
        ],
        npmrcContent,
        installCommands: ['npm install @mantis-3d/sdk']
      };
    }
  }
  
  async validateSetup(params: {
    projectPath?: string;
    checkAuth?: boolean;
    checkOrigins?: boolean;
  }): Promise<SetupToolResponse> {
    const { projectPath = '.', checkAuth = true, checkOrigins = true } = params;
    
    const validationResults = {
      sdkInstalled: true,
      authConfigured: checkAuth ? true : 'skipped',
      originsConfigured: checkOrigins ? false : 'skipped',
      issues: checkOrigins ? ['Missing allowedOrigins configuration'] : []
    };
    
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      message: 'Setup validation complete',
      validationResults,
      nextSteps: validationResults.issues.length > 0 ? 
        ['Configure allowedOrigins in MantisSDK'] : 
        ['Setup is complete - ready to integrate']
    };
  }
  
  // Development Tools
  async createMantisIntegration(params: {
    framework: string;
    features: string[];
    storeType: string;
  }): Promise<DevelopmentToolResponse> {
    const { framework, features, storeType } = params;
    
    const templates = {
      react: `import { MantisSDK } from '@mantis-3d/sdk';
import { useEffect, useRef } from 'react';

export function MantisExperience({ productId }) {
  const sdkRef = useRef(null);
  
  useEffect(() => {
    sdkRef.current = new MantisSDK({
      allowedOrigins: [window.location.origin],
      enableLogging: process.env.NODE_ENV === 'development'
    });
    
    ${features.includes('cart') ? "sdkRef.current.on('cart-opened', handleCartOpened);" : ''}
    ${features.includes('camera') ? "sdkRef.current.on('model-click', handleModelClick);" : ''}
    
    return () => sdkRef.current?.destroy();
  }, []);
  
  return <div id="mantis-container"></div>;
}`,
      vue: `<template>
  <div id="mantis-container"></div>
</template>

<script>
import { MantisSDK } from '@mantis-3d/sdk';

export default {
  name: 'MantisExperience',
  props: ['productId'],
  mounted() {
    this.sdk = new MantisSDK({
      allowedOrigins: [window.location.origin]
    });
    
    ${features.includes('cart') ? "this.sdk.on('cart-opened', this.handleCartOpened);" : ''}
    ${features.includes('camera') ? "this.sdk.on('model-click', this.handleModelClick);" : ''}
  },
  beforeDestroy() {
    this.sdk?.destroy();
  }
}
</script>`
    };
    
    const generatedCode = templates[framework as keyof typeof templates] || 
      `// ${framework} integration template not available`;
    
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      message: `Generated Mantis integration for ${framework} with ${features.join(', ')} features`,
      generatedCode,
      framework,
      features,
      templates: [{
        framework,
        code: generatedCode,
        features,
        storeType
      }]
    };
  }
  
  async generateEventHandler(params: {
    event: string;
    action: string;
    framework: string;
  }): Promise<DevelopmentToolResponse> {
    const { event, action, framework } = params;
    
    const handlers = {
      react: `const handle${event.replace('-', '')} = useCallback((eventData) => {
  // ${action}
  console.log('${event} event:', eventData);
  
  // Add your custom logic here
  ${action.includes('cart') ? 'updateCartState(eventData);' : ''}
  ${action.includes('analytics') ? 'trackEvent(eventData);' : ''}
}, []);`,
      vue: `handle${event.replace('-', '')}(eventData) {
  // ${action}
  console.log('${event} event:', eventData);
  
  // Add your custom logic here
  ${action.includes('cart') ? 'this.updateCartState(eventData);' : ''}
  ${action.includes('analytics') ? 'this.trackEvent(eventData);' : ''}
}`
    };
    
    const generatedCode = handlers[framework as keyof typeof handlers] || 
      `// ${framework} event handler template not available`;
    
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      message: `Generated ${event} event handler for ${framework}`,
      generatedCode,
      framework
    };
  }
  
  // Debugging Tools
  async debugPostMessage(params: {
    url?: string;
    captureTime?: number;
    filterOrigin?: string;
  }): Promise<DebuggingToolResponse> {
    const { url, captureTime = 30, filterOrigin } = params;
    
    // Simulate common postMessage issues
    const mockIssues = [
      {
        type: 'origin-mismatch',
        details: {
          sentFrom: 'https://localhost:3000',
          expectedOrigins: ['https://app.example.com'],
          recommendation: "Add 'https://localhost:3000' to allowedOrigins in MantisSDK config"
        }
      },
      {
        type: 'safari-private-mode',
        details: {
          browser: 'Safari',
          privateMode: true,
          recommendation: 'Safari private mode restricts postMessage. Test in normal mode.'
        }
      }
    ];
    
    const issue = mockIssues[0]; // Simulate origin mismatch
    
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: issue.type,
      details: issue.details,
      solution: {
        description: 'Update your Mantis SDK configuration',
        code: `const sdk = new MantisSDK({
  allowedOrigins: ['https://localhost:3000']
});`,
        documentation: 'https://docs.mantisxr.com/sdk/configuration#allowed-origins'
      },
      recommendation: issue.details.recommendation
    };
  }
  
  async analyzeConsoleErrors(params: {
    errors: string[];
    browserInfo?: any;
  }): Promise<DebuggingToolResponse> {
    const { errors, browserInfo } = params;
    
    const errorPatterns = {
      'MantisSDK is not defined': {
        issue: 'SDK not loaded',
        solution: 'Ensure @mantis-3d/sdk is imported before use',
        code: "import { MantisSDK } from '@mantis-3d/sdk';"
      },
      'Failed to execute postMessage': {
        issue: 'Origin mismatch',
        solution: 'Add current origin to allowedOrigins',
        code: 'allowedOrigins: [window.location.origin]'
      },
      'SecurityError': {
        issue: 'Browser security restriction',
        solution: 'Check for Safari private mode or strict security settings',
        code: '// Test in normal browser mode'
      }
    };
    
    const firstError = errors[0] || 'No errors provided';
    const pattern = Object.keys(errorPatterns).find(key => firstError.includes(key));
    const solution = pattern ? errorPatterns[pattern as keyof typeof errorPatterns] : {
      issue: 'Unknown error',
      solution: 'Please provide full error message for analysis',
      code: '// Unable to determine solution'
    };
    
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: solution.issue,
      details: {
        errorCount: errors.length,
        browser: browserInfo?.name || 'unknown',
        patterns: [pattern || 'unknown']
      },
      solution,
      recommendation: solution.solution
    };
  }
  
  async checkBrowserCompatibility(params: {
    userAgent?: string;
    features: string[];
  }): Promise<DebuggingToolResponse> {
    const { userAgent = 'unknown', features } = params;
    
    const compatibilityIssues = [];
    
    if (userAgent.includes('Safari') && features.includes('postMessage')) {
      compatibilityIssues.push({
        feature: 'postMessage',
        issue: 'Safari private mode restrictions',
        recommendation: 'Test in normal Safari mode'
      });
    }
    
    if (userAgent.includes('Chrome') && features.includes('webgl')) {
      // Chrome generally has good WebGL support
    } else if (features.includes('webgl') && !userAgent.includes('Chrome')) {
      compatibilityIssues.push({
        feature: 'webgl',
        issue: 'WebGL support may be limited',
        recommendation: 'Test 3D rendering capabilities'
      });
    }
    
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: compatibilityIssues.length > 0 ? 'Compatibility issues detected' : 'No issues detected',
      details: {
        browser: userAgent,
        features,
        issues: compatibilityIssues
      },
      recommendation: compatibilityIssues.length > 0 ? 
        compatibilityIssues.map(i => i.recommendation).join('; ') :
        'Browser appears compatible with all requested features'
    };
  }
}

describe('MCP Tools - Setup & Installation', () => {
  let tools: MockMCPTools;
  
  beforeEach(() => {
    tools = new MockMCPTools();
  });
  
  describe('installMantisSDK', () => {
    it('should generate installation instructions for Claude Desktop', async () => {
      tools.setEnvironment('claude-desktop');
      
      const result = await tools.installMantisSDK({
        framework: 'react',
        authToken: 'test-token'
      });
      
      expect(result.success).toBe(true);
      expect(result.action).toBe('instructions');
      expect(result.steps).toBeDefined();
      expect(result.steps!.length).toBeGreaterThan(0);
      expect(result.npmrcContent).toContain('test-token');
      expect(result.nextSteps).toBeDefined();
    });
    
    it('should generate executable steps for Claude Code', async () => {
      tools.setEnvironment('claude-code');
      
      const result = await tools.installMantisSDK({
        framework: 'vue'
      });
      
      expect(result.success).toBe(true);
      expect(result.action).toBe('execute');
      expect(result.steps).toBeDefined();
      expect(result.steps!.some((step: any) => step.type === 'file')).toBe(true);
      expect(result.steps!.some((step: any) => step.type === 'command')).toBe(true);
    });
  });
  
  describe('validateSetup', () => {
    it('should validate SDK installation and configuration', async () => {
      const result = await tools.validateSetup({
        checkAuth: true,
        checkOrigins: true
      });
      
      expect(result.success).toBe(true);
      expect(result.validationResults).toBeDefined();
      expect(result.validationResults!.sdkInstalled).toBe(true);
    });
  });
});

describe('MCP Tools - Development', () => {
  let tools: MockMCPTools;
  
  beforeEach(() => {
    tools = new MockMCPTools();
  });
  
  describe('createMantisIntegration', () => {
    it('should generate React integration code', async () => {
      const result = await tools.createMantisIntegration({
        framework: 'react',
        features: ['cart', 'camera'],
        storeType: 'sneakers'
      });
      
      expect(result.success).toBe(true);
      expect(result.generatedCode).toContain('MantisSDK');
      expect(result.generatedCode).toContain('useEffect');
      expect(result.generatedCode).toContain('cart-opened');
      expect(result.generatedCode).toContain('model-click');
      expect(result.framework).toBe('react');
      expect(result.features).toEqual(['cart', 'camera']);
    });
    
    it('should generate Vue integration code', async () => {
      const result = await tools.createMantisIntegration({
        framework: 'vue',
        features: ['cart'],
        storeType: 'jewelry'
      });
      
      expect(result.success).toBe(true);
      expect(result.generatedCode).toContain('MantisSDK');
      expect(result.generatedCode).toContain('mounted()');
      expect(result.generatedCode).toContain('cart-opened');
      expect(result.framework).toBe('vue');
    });
  });
  
  describe('generateEventHandler', () => {
    it('should generate React event handler', async () => {
      const result = await tools.generateEventHandler({
        event: 'cart-opened',
        action: 'Update cart state and track analytics',
        framework: 'react'
      });
      
      expect(result.success).toBe(true);
      expect(result.generatedCode).toContain('useCallback');
      expect(result.generatedCode).toContain('cart-opened');
      expect(result.generatedCode).toContain('updateCartState');
      expect(result.generatedCode).toContain('trackEvent');
    });
  });
});

describe('MCP Tools - Debugging', () => {
  let tools: MockMCPTools;
  
  beforeEach(() => {
    tools = new MockMCPTools();
  });
  
  describe('debugPostMessage', () => {
    it('should identify origin mismatch issues', async () => {
      const result = await tools.debugPostMessage({
        url: 'https://localhost:3000',
        captureTime: 30
      });
      
      expect(result.success).toBe(true);
      expect(result.issue).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.solution).toBeDefined();
      expect(result.recommendation).toBeDefined();
    });
  });
  
  describe('analyzeConsoleErrors', () => {
    it('should analyze SDK not defined error', async () => {
      const result = await tools.analyzeConsoleErrors({
        errors: ['MantisSDK is not defined'],
        browserInfo: { name: 'Chrome', version: '120' }
      });
      
      expect(result.success).toBe(true);
      expect(result.issue).toBe('SDK not loaded');
      expect(result.solution).toBeDefined();
      expect(result.details!.errorCount).toBe(1);
    });
    
    it('should analyze postMessage errors', async () => {
      const result = await tools.analyzeConsoleErrors({
        errors: ['Failed to execute postMessage on Window'],
        browserInfo: { name: 'Safari', version: '17' }
      });
      
      expect(result.success).toBe(true);
      expect(result.issue).toBe('Origin mismatch');
      expect(result.solution).toBeDefined();
    });
  });
  
  describe('checkBrowserCompatibility', () => {
    it('should detect Safari private mode issues', async () => {
      const result = await tools.checkBrowserCompatibility({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        features: ['postMessage', 'webgl']
      });
      
      expect(result.success).toBe(true);
      expect(result.details!.issues).toBeDefined();
    });
    
    it('should report no issues for Chrome with standard features', async () => {
      const result = await tools.checkBrowserCompatibility({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        features: ['postMessage', 'webgl']
      });
      
      expect(result.success).toBe(true);
      expect(result.issue).toBe('No issues detected');
    });
  });
});