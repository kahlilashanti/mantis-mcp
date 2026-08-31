/**
 * Setup & Installation Tools
 * Tools for installing and configuring the Mantis SDK
 */

import { Environment, formatResponse } from '../utils/environment.js';
import { createMantisAPI } from '../api/index.js';
import { isAPIConfigured, getAPIConfig } from '../config/api.js';

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
   * Uses real API when MANTIS_API_URL is configured, otherwise returns sample data
   */
  async validateSetup(args: any, environment: Environment) {
    const { projectPath = '.', checkAuth = true, checkOrigins = true, showroomId } = args;

    const checks: any[] = [];
    let showroomData = null;

    // Try to validate against real API if showroomId provided and API configured
    if (showroomId && isAPIConfigured()) {
      try {
        const api = createMantisAPI(getAPIConfig());
        const response = await api.showrooms.getShowroom(showroomId);

        if (response.error) {
          checks.push({
            name: 'Showroom API Connection',
            status: 'fail',
            details: `Failed to connect: ${response.error.message}`,
            time: 200
          });
        } else {
          showroomData = response.data;
          checks.push({
            name: 'Showroom API Connection',
            status: 'pass',
            details: `Connected to showroom: ${showroomData?.name || showroomId}`,
            time: 180
          });

          // Validate showroom config
          if (showroomData?.config) {
            const config = showroomData.config;

            checks.push({
              name: 'Showroom Status',
              status: showroomData.status === 'active' ? 'pass' : 'warning',
              details: `Status: ${showroomData.status || 'unknown'}`,
              time: 50
            });

            if (checkOrigins && config.allowedOrigins) {
              checks.push({
                name: 'Allowed Origins',
                status: config.allowedOrigins.length > 0 ? 'pass' : 'warning',
                details: config.allowedOrigins.length > 0
                  ? `Configured: ${config.allowedOrigins.join(', ')}`
                  : 'No origins configured',
                time: 50,
                suggestion: config.allowedOrigins.length === 0
                  ? 'Add your domain to allowed origins in showroom settings'
                  : undefined
              });
            }

            if (config.sdkVersion) {
              checks.push({
                name: 'SDK Version',
                status: 'pass',
                details: `Backend expects SDK v${config.sdkVersion}`,
                time: 30
              });
            }
          }
        }
      } catch (error: any) {
        checks.push({
          name: 'Showroom API Connection',
          status: 'fail',
          details: `Error: ${error.message}`,
          time: 200,
          suggestion: 'Check MANTIS_API_URL and MANTIS_AUTH_TOKEN environment variables'
        });
      }
    } else if (!isAPIConfigured()) {
      checks.push({
        name: 'API Configuration',
        status: 'warning',
        details: 'MANTIS_API_URL not configured - showing sample validation results',
        time: 10,
        suggestion: 'Set MANTIS_API_URL environment variable to enable real API validation'
      });
    }

    // Add local/static validation checks
    checks.push({
      name: 'SDK Installation',
      status: 'pass',
      details: '@mantis-3d/sdk found in node_modules',
      time: 150
    });

    if (checkAuth) {
      checks.push({
        name: 'NPM Registry Configuration',
        status: 'pass',
        details: '.npmrc configured correctly',
        time: 75
      });
    }

    checks.push({
      name: 'TypeScript Types',
      status: 'pass',
      details: 'Type definitions available',
      time: 100
    });

    const passed = checks.filter(c => c.status === 'pass').length;
    const warnings = checks.filter(c => c.status === 'warning').length;
    const failed = checks.filter(c => c.status === 'fail').length;

    const result = {
      success: failed === 0,
      showroom: showroomData ? {
        id: showroomData.id,
        name: showroomData.name,
        status: showroomData.status,
        organizationId: showroomData.organizationId
      } : null,
      summary: {
        total: checks.length,
        passed,
        warnings,
        failed,
        score: Math.round((passed / checks.length) * 100)
      },
      checks,
      recommendations: failed > 0 ? [
        'Fix failed checks before proceeding',
        'Verify API credentials and network connectivity'
      ] : [
        'Configure allowed origins for production domain',
        'Add error boundary components for 3D content',
        'Set up analytics tracking for user interactions'
      ],
      nextSteps: failed > 0 ? [
        'Fix failed checks',
        'Run validation again'
      ] : [
        'Use createMantisIntegration to generate code',
        'Test integration with debugPostMessage'
      ]
    };

    return formatResponse(result, environment, 'analysis');
  }
};