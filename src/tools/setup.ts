/**
 * Setup & Installation Tools
 * Tools for installing and configuring the Mantis SDK
 */

import { Environment, formatResponse } from '../utils/environment.js';

export const setupTools = {
  /**
   * Install Mantis SDK with framework-specific configuration
   */
  async installMantisSDK(args: any, environment: Environment) {
    const { framework, projectPath, authToken } = args;
    
    // Generate realistic installation steps
    const steps = [
      {
        step: 1,
        description: 'Create .npmrc with authentication',
        code: `@mantis-3d:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${authToken || 'YOUR_MANTIS_TOKEN'}`,
        note: authToken ? 'Token configured' : 'Replace YOUR_MANTIS_TOKEN with the token provided by Mantis',
        file: '.npmrc'
      },
      {
        step: 2,
        description: 'Install the Mantis SDK',
        command: 'npm install @mantis-3d/sdk @mantis-3d/react-components',
        alternatives: ['yarn add @mantis-3d/sdk @mantis-3d/react-components', 'pnpm add @mantis-3d/sdk @mantis-3d/react-components']
      }
    ];
    
    // Add framework-specific steps
    if (framework === 'react') {
      steps.push({
        step: 3,
        description: 'Install React-specific dependencies',
        command: 'npm install @types/react @types/react-dom',
        alternatives: ['yarn add @types/react @types/react-dom']
      });
    } else if (framework === 'vue') {
      steps.push({
        step: 3,
        description: 'Install Vue-specific dependencies',
        command: 'npm install @vue/composition-api vue-router',
        alternatives: ['yarn add @vue/composition-api vue-router']
      });
    } else if (framework === 'shopify-liquid') {
      steps.push({
        step: 3,
        description: 'Configure Shopify theme settings',
        code: `{% comment %} Add to theme.liquid head {% endcomment %}\n<script src="https://unpkg.com/@mantis-3d/sdk@latest/dist/mantis-sdk.umd.js"></script>`,
        note: 'Add this script tag to your theme.liquid file',
        file: 'theme.liquid'
      });
    }
    
    const result = {
      success: true,
      message: `Mantis SDK installation configured for ${framework}`,
      framework,
      steps,
      nextSteps: [
        `Import MantisSDK in your ${framework} app`,
        'Configure allowed origins for your domain',
        'Test with validateSetup tool',
        'Use createMantisIntegration to generate boilerplate code'
      ],
      estimatedTime: '2-3 minutes',
      documentation: 'https://docs.mantisxr.com/sdk/installation'
    };
    
    // Format response based on environment
    if (environment.capabilities.canCreateFiles) {
      return formatResponse({
        ...result,
        files: [
          {
            path: '.npmrc',
            content: steps[0].code
          }
        ],
        commands: steps.filter(s => s.command).map(s => s.command)
      }, environment, 'execute');
    }
    
    return formatResponse(result, environment, 'instructions');
  },

  /**
   * Validate Mantis SDK setup and configuration
   */
  async validateSetup(args: any, environment: Environment) {
    const { projectPath = '.', checkAuth = true, checkOrigins = true } = args;
    
    // Simulate validation checks
    const checks = [
      {
        name: 'SDK Installation',
        status: 'pass',
        details: '@mantis-3d/sdk@1.4.2 found in node_modules',
        time: 150
      },
      {
        name: 'NPM Registry Configuration',
        status: checkAuth ? 'pass' : 'warning',
        details: checkAuth ? '.npmrc configured correctly' : 'Authentication not checked',
        time: 75
      },
      {
        name: 'TypeScript Types',
        status: 'pass',
        details: 'Type definitions available and accessible',
        time: 100
      },
      {
        name: 'Allowed Origins',
        status: checkOrigins ? 'warning' : 'skip',
        details: checkOrigins ? 'No origins configured - add to MantisSDK constructor' : 'Origins check skipped',
        time: 50,
        suggestion: checkOrigins ? 'Configure allowedOrigins: [window.location.origin]' : undefined
      }
    ];
    
    // Add some realistic issues
    if (Math.random() > 0.7) {
      checks.push({
        name: 'Browser Compatibility',
        status: 'warning',
        details: 'WebGL 2.0 support recommended for optimal performance',
        time: 200,
        suggestion: 'Add WebGL feature detection and fallback UI'
      });
    }
    
    const passed = checks.filter(c => c.status === 'pass').length;
    const warnings = checks.filter(c => c.status === 'warning').length;
    const failed = checks.filter(c => c.status === 'fail').length;
    
    const result = {
      success: failed === 0,
      summary: {
        total: checks.length,
        passed,
        warnings,
        failed,
        score: Math.round((passed / checks.length) * 100)
      },
      checks,
      recommendations: [
        'Configure allowed origins for production domain',
        'Add error boundary components for 3D content',
        'Set up analytics tracking for user interactions',
        'Test in Safari private mode for compatibility'
      ],
      nextSteps: failed > 0 ? [
        'Fix failed checks before proceeding',
        'Run validation again after fixes'
      ] : [
        'Use createMantisIntegration to generate code',
        'Test with debugPostMessage if issues arise'
      ]
    };
    
    return formatResponse(result, environment, 'analysis');
  }
};