/**
 * Integration Workflow Tests
 * Tests for complete workflows combining multiple MCP tools
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock workflow orchestrator
class WorkflowOrchestrator {
  private tools: any;
  private environment: string = 'claude-desktop';
  
  constructor(tools: any) {
    this.tools = tools;
  }
  
  setEnvironment(env: string) {
    this.environment = env;
    this.tools.setEnvironment(env);
  }
  
  // Complete setup workflow
  async completeSetupWorkflow(params: {
    framework: string;
    projectPath: string;
    authToken: string;
  }) {
    const results = [];
    
    // Step 1: Install SDK
    const installResult = await this.tools.installMantisSDK({
      framework: params.framework,
      projectPath: params.projectPath,
      authToken: params.authToken
    });
    results.push({ step: 'install', result: installResult });
    
    // Step 2: Validate setup
    const validateResult = await this.tools.validateSetup({
      projectPath: params.projectPath,
      checkAuth: true,
      checkOrigins: true
    });
    results.push({ step: 'validate', result: validateResult });
    
    // Step 3: Create basic integration
    const integrationResult = await this.tools.createMantisIntegration({
      framework: params.framework,
      features: ['cart', 'camera'],
      storeType: 'sneakers'
    });
    results.push({ step: 'integration', result: integrationResult });
    
    return {
      success: results.every(r => r.result.success),
      workflow: 'complete-setup',
      steps: results,
      summary: {
        sdkInstalled: installResult.success,
        validationPassed: validateResult.success,
        integrationCreated: integrationResult.success,
        environment: this.environment
      }
    };
  }
  
  // Debug workflow for common issues
  async debugWorkflow(params: {
    errors: string[];
    url?: string;
    userAgent?: string;
  }) {
    const results = [];
    
    // Step 1: Analyze console errors
    const errorAnalysis = await this.tools.analyzeConsoleErrors({
      errors: params.errors,
      browserInfo: { userAgent: params.userAgent }
    });
    results.push({ step: 'analyze-errors', result: errorAnalysis });
    
    // Step 2: Debug postMessage if relevant
    if (params.errors.some(e => e.includes('postMessage'))) {
      const postMessageDebug = await this.tools.debugPostMessage({
        url: params.url,
        captureTime: 30
      });
      results.push({ step: 'debug-postmessage', result: postMessageDebug });
    }
    
    // Step 3: Check browser compatibility
    const compatibilityCheck = await this.tools.checkBrowserCompatibility({
      userAgent: params.userAgent,
      features: ['postMessage', 'webgl', 'iframe']
    });
    results.push({ step: 'check-compatibility', result: compatibilityCheck });
    
    return {
      success: results.every(r => r.result.success),
      workflow: 'debug',
      steps: results,
      summary: {
        errorPattern: errorAnalysis.issue,
        postMessageIssue: results.find(r => r.step === 'debug-postmessage')?.result.issue,
        compatibilityIssues: compatibilityCheck.details?.issues?.length || 0,
        recommendations: results.map(r => r.result.recommendation).filter(Boolean)
      }
    };
  }
  
  // Development workflow
  async developmentWorkflow(params: {
    framework: string;
    features: string[];
    events: Array<{ event: string; action: string }>;
  }) {
    const results = [];
    
    // Step 1: Create main integration
    const integrationResult = await this.tools.createMantisIntegration({
      framework: params.framework,
      features: params.features,
      storeType: 'custom'
    });
    results.push({ step: 'create-integration', result: integrationResult });
    
    // Step 2: Generate event handlers
    for (const eventConfig of params.events) {
      const handlerResult = await this.tools.generateEventHandler({
        event: eventConfig.event,
        action: eventConfig.action,
        framework: params.framework
      });
      results.push({ 
        step: `generate-handler-${eventConfig.event}`, 
        result: handlerResult 
      });
    }
    
    return {
      success: results.every(r => r.result.success),
      workflow: 'development',
      steps: results,
      summary: {
        framework: params.framework,
        featuresImplemented: params.features,
        handlersGenerated: params.events.length,
        codeGenerated: results.map(r => r.result.generatedCode).filter(Boolean)
      }
    };
  }
}

// Mock tools for integration testing
class MockIntegrationTools {
  private environment: string = 'claude-desktop';
  
  setEnvironment(env: string) {
    this.environment = env;
  }
  
  async installMantisSDK(params: any) {
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      message: 'SDK installation complete',
      steps: [{ description: 'Install complete' }]
    };
  }
  
  async validateSetup(params: any) {
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      validationResults: {
        sdkInstalled: true,
        authConfigured: true,
        originsConfigured: true,
        issues: []
      }
    };
  }
  
  async createMantisIntegration(params: any) {
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      generatedCode: `// ${params.framework} integration code`,
      framework: params.framework,
      features: params.features
    };
  }
  
  async generateEventHandler(params: any) {
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      generatedCode: `// Event handler for ${params.event}`,
      framework: params.framework
    };
  }
  
  async analyzeConsoleErrors(params: any) {
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: 'Origin mismatch',
      recommendation: 'Update allowedOrigins configuration'
    };
  }
  
  async debugPostMessage(params: any) {
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: 'Origin mismatch detected',
      recommendation: 'Add localhost to allowedOrigins'
    };
  }
  
  async checkBrowserCompatibility(params: any) {
    return {
      success: true,
      action: this.environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: 'No issues detected',
      details: { issues: [] },
      recommendation: 'Browser appears compatible'
    };
  }
}

describe('Integration Workflows', () => {
  let workflow: WorkflowOrchestrator;
  let tools: MockIntegrationTools;
  
  beforeEach(() => {
    tools = new MockIntegrationTools();
    workflow = new WorkflowOrchestrator(tools);
  });
  
  describe('Complete Setup Workflow', () => {
    it('should complete full setup workflow in Claude Desktop', async () => {
      workflow.setEnvironment('claude-desktop');
      
      const result = await workflow.completeSetupWorkflow({
        framework: 'react',
        projectPath: './test-project',
        authToken: 'test-token-123'
      });
      
      expect(result.success).toBe(true);
      expect(result.workflow).toBe('complete-setup');
      expect(result.steps).toHaveLength(3);
      expect(result.summary.sdkInstalled).toBe(true);
      expect(result.summary.validationPassed).toBe(true);
      expect(result.summary.integrationCreated).toBe(true);
      expect(result.summary.environment).toBe('claude-desktop');
      
      // Verify each step
      const installStep = result.steps.find(s => s.step === 'install');
      expect(installStep?.result.action).toBe('instructions');
      
      const validateStep = result.steps.find(s => s.step === 'validate');
      expect(validateStep?.result.validationResults.sdkInstalled).toBe(true);
      
      const integrationStep = result.steps.find(s => s.step === 'integration');
      expect(integrationStep?.result.framework).toBe('react');
    });
    
    it('should complete full setup workflow in Claude Code', async () => {
      workflow.setEnvironment('claude-code');
      
      const result = await workflow.completeSetupWorkflow({
        framework: 'vue',
        projectPath: './vue-project',
        authToken: 'vue-token-456'
      });
      
      expect(result.success).toBe(true);
      expect(result.summary.environment).toBe('claude-code');
      
      // Verify actions are 'execute' for Claude Code
      const installStep = result.steps.find(s => s.step === 'install');
      expect(installStep?.result.action).toBe('execute');
    });
  });
  
  describe('Debug Workflow', () => {
    it('should debug postMessage errors', async () => {
      const result = await workflow.debugWorkflow({
        errors: ['Failed to execute postMessage on Window', 'Origin mismatch'],
        url: 'https://localhost:3000',
        userAgent: 'Mozilla/5.0 (Safari)'
      });
      
      expect(result.success).toBe(true);
      expect(result.workflow).toBe('debug');
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.summary.errorPattern).toBeDefined();
      expect(result.summary.postMessageIssue).toBeDefined();
      expect(result.summary.recommendations).toBeDefined();
      
      // Should include postMessage debugging
      const postMessageStep = result.steps.find(s => s.step === 'debug-postmessage');
      expect(postMessageStep).toBeDefined();
    });
    
    it('should debug without postMessage when not relevant', async () => {
      const result = await workflow.debugWorkflow({
        errors: ['MantisSDK is not defined'],
        userAgent: 'Mozilla/5.0 (Chrome)'
      });
      
      expect(result.success).toBe(true);
      expect(result.steps.some(s => s.step === 'analyze-errors')).toBe(true);
      expect(result.steps.some(s => s.step === 'check-compatibility')).toBe(true);
      expect(result.steps.some(s => s.step === 'debug-postmessage')).toBe(false);
    });
  });
  
  describe('Development Workflow', () => {
    it('should generate complete development setup', async () => {
      const result = await workflow.developmentWorkflow({
        framework: 'react',
        features: ['cart', 'camera', 'analytics'],
        events: [
          { event: 'cart-opened', action: 'Track cart interaction' },
          { event: 'model-click', action: 'Update product view' },
          { event: 'variant-selected', action: 'Update UI and track selection' }
        ]
      });
      
      expect(result.success).toBe(true);
      expect(result.workflow).toBe('development');
      expect(result.summary.framework).toBe('react');
      expect(result.summary.featuresImplemented).toEqual(['cart', 'camera', 'analytics']);
      expect(result.summary.handlersGenerated).toBe(3);
      expect(result.summary.codeGenerated).toHaveLength(4); // 1 integration + 3 handlers
      
      // Verify integration step
      const integrationStep = result.steps.find(s => s.step === 'create-integration');
      expect(integrationStep?.result.framework).toBe('react');
      
      // Verify handler steps
      const handlerSteps = result.steps.filter(s => s.step.startsWith('generate-handler-'));
      expect(handlerSteps).toHaveLength(3);
      expect(handlerSteps.some(s => s.step.includes('cart-opened'))).toBe(true);
      expect(handlerSteps.some(s => s.step.includes('model-click'))).toBe(true);
      expect(handlerSteps.some(s => s.step.includes('variant-selected'))).toBe(true);
    });
  });
});

describe('Cross-Environment Workflow Validation', () => {
  let workflow: WorkflowOrchestrator;
  let tools: MockIntegrationTools;
  
  beforeEach(() => {
    tools = new MockIntegrationTools();
    workflow = new WorkflowOrchestrator(tools);
  });
  
  it('should adapt workflow responses for different environments', async () => {
    const workflowParams = {
      framework: 'react',
      projectPath: './test',
      authToken: 'token'
    };
    
    // Test Claude Desktop
    workflow.setEnvironment('claude-desktop');
    const desktopResult = await workflow.completeSetupWorkflow(workflowParams);
    
    // Test Claude Code
    workflow.setEnvironment('claude-code');
    const codeResult = await workflow.completeSetupWorkflow(workflowParams);
    
    // Both should succeed
    expect(desktopResult.success).toBe(true);
    expect(codeResult.success).toBe(true);
    
    // But have different environments
    expect(desktopResult.summary.environment).toBe('claude-desktop');
    expect(codeResult.summary.environment).toBe('claude-code');
    
    // And different action types
    const desktopInstall = desktopResult.steps.find(s => s.step === 'install');
    const codeInstall = codeResult.steps.find(s => s.step === 'install');
    
    expect(desktopInstall?.result.action).toBe('instructions');
    expect(codeInstall?.result.action).toBe('execute');
  });
});

describe('Error Handling in Workflows', () => {
  let workflow: WorkflowOrchestrator;
  
  beforeEach(() => {
    // Create tools that can simulate failures
    const faultyTools = {
      setEnvironment: () => {},
      installMantisSDK: async () => ({ success: false, error: 'Installation failed' }),
      validateSetup: async () => ({ success: true }),
      createMantisIntegration: async () => ({ success: true }),
      analyzeConsoleErrors: async () => ({ success: true }),
      debugPostMessage: async () => ({ success: true }),
      checkBrowserCompatibility: async () => ({ success: true })
    };
    
    workflow = new WorkflowOrchestrator(faultyTools);
  });
  
  it('should handle workflow failures gracefully', async () => {
    const result = await workflow.completeSetupWorkflow({
      framework: 'react',
      projectPath: './test',
      authToken: 'token'
    });
    
    expect(result.success).toBe(false); // Should fail due to installation failure
    expect(result.steps).toHaveLength(3); // Should still complete all steps
    expect(result.summary.sdkInstalled).toBe(false);
    
    const failedStep = result.steps.find(s => s.step === 'install');
    expect(failedStep?.result.success).toBe(false);
    expect(failedStep?.result.error).toBe('Installation failed');
  });
});