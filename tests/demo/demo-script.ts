/**
 * Mantis MCP Demo Script
 * Interactive demonstration of Mantis MCP capabilities
 */

import { performance } from 'perf_hooks';

interface DemoScenario {
  name: string;
  description: string;
  environment: 'claude-desktop' | 'claude-code';
  steps: DemoStep[];
}

interface DemoStep {
  tool: string;
  description: string;
  params: any;
  expectedResult?: any;
  timing?: number;
}

class MCPDemo {
  private scenarios: DemoScenario[] = [];
  private results: any[] = [];
  
  constructor() {
    this.setupScenarios();
  }
  
  private setupScenarios() {
    // Scenario 1: New Developer Onboarding (Claude Desktop)
    this.scenarios.push({
      name: 'New Developer Onboarding',
      description: 'A new developer wants to integrate Mantis 3D into their React e-commerce site',
      environment: 'claude-desktop',
      steps: [
        {
          tool: 'installMantisSDK',
          description: 'Install Mantis SDK with proper authentication',
          params: {
            framework: 'react',
            projectPath: './my-sneaker-store',
            authToken: 'ghp_xxxxxxxxxxxx'
          }
        },
        {
          tool: 'validateSetup',
          description: 'Verify SDK is properly installed and configured',
          params: {
            projectPath: './my-sneaker-store',
            checkAuth: true,
            checkOrigins: true
          }
        },
        {
          tool: 'createMantisIntegration',
          description: 'Generate React component for 3D product viewing',
          params: {
            framework: 'react',
            features: ['cart', 'camera', 'variants'],
            storeType: 'sneakers'
          }
        },
        {
          tool: 'generateEventHandler',
          description: 'Create handler for cart interactions',
          params: {
            event: 'cart-opened',
            action: 'Track analytics and update UI state',
            framework: 'react'
          }
        }
      ]
    });
    
    // Scenario 2: Production Debugging (Claude Code)
    this.scenarios.push({
      name: 'Production Debugging',
      description: 'Developer experiencing postMessage errors in production',
      environment: 'claude-code',
      steps: [
        {
          tool: 'analyzeConsoleErrors',
          description: 'Analyze reported console errors',
          params: {
            errors: [
              'Failed to execute \\'postMessage\\' on \\'Window\\': The target origin provided (\\'https://app.mantisxr.com\\') does not match the recipient window\\'s origin (\\'https://my-store.com\\').',
              'MantisSDK: Origin mismatch detected'
            ],
            browserInfo: {
              name: 'Safari',
              version: '17.0',
              os: 'macOS',
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
            }
          }
        },
        {
          tool: 'debugPostMessage',
          description: 'Debug postMessage communication issues',
          params: {
            url: 'https://my-store.com/products/air-jordan-1',
            captureTime: 45,
            filterOrigin: 'mantisxr.com'
          }
        },
        {
          tool: 'checkBrowserCompatibility',
          description: 'Check for Safari-specific issues',
          params: {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            features: ['postMessage', 'iframe', 'webgl', 'localStorage']
          }
        }
      ]
    });
    
    // Scenario 3: Advanced Integration (Claude Desktop)
    this.scenarios.push({
      name: 'Advanced Shopify Integration',
      description: 'E-commerce agency building custom Shopify theme with 3D product views',
      environment: 'claude-desktop',
      steps: [
        {
          tool: 'installMantisSDK',
          description: 'Install SDK for Shopify Liquid environment',
          params: {
            framework: 'shopify-liquid',
            projectPath: './themes/mantis-3d-theme'
          }
        },
        {
          tool: 'createMantisIntegration',
          description: 'Generate Shopify-specific integration code',
          params: {
            framework: 'shopify-liquid',
            features: ['cart', 'variants', 'analytics', 'wishlist'],
            storeType: 'jewelry'
          }
        },
        {
          tool: 'generateEventHandler',
          description: 'Handle variant selection with Shopify cart integration',
          params: {
            event: 'variant-selected',
            action: 'Update Shopify variant and sync cart state',
            framework: 'shopify-liquid'
          }
        },
        {
          tool: 'testMantisEvent',
          description: 'Test event flow without browser',
          params: {
            event: 'add-to-cart',
            data: {
              productId: 'gid://shopify/Product/123456789',
              variantId: 'gid://shopify/ProductVariant/987654321',
              quantity: 1,
              price: 299.99
            },
            expectedResponse: {
              status: 'success',
              cartUpdated: true,
              analyticsTracked: true
            }
          }
        }
      ]
    });
    
    // Scenario 4: Performance Monitoring (Claude Code)
    this.scenarios.push({
      name: 'Performance Monitoring',
      description: 'Monitor 3D experience performance and optimize load times',
      environment: 'claude-code',
      steps: [
        {
          tool: 'getPerformanceMetrics',
          description: 'Collect 3D rendering performance data',
          params: {
            url: 'https://store.example.com/products/diamond-ring-3d',
            duration: 60,
            metrics: ['fps', 'load-time', 'memory', 'gpu', 'bandwidth']
          }
        },
        {
          tool: 'analyzeEventFlow',
          description: 'Analyze user interaction patterns',
          params: {
            sessionData: {
              sessionId: 'sess_abc123',
              userId: 'user_xyz789',
              startTime: new Date(Date.now() - 300000), // 5 minutes ago
              events: ['page-load', 'model-load', 'rotate-model', 'zoom-in', 'variant-change', 'add-to-cart']
            },
            timeRange: {
              start: new Date(Date.now() - 3600000), // 1 hour ago
              end: new Date()
            }
          }
        },
        {
          tool: 'simulateUserFlow',
          description: 'Simulate complete purchase flow for testing',
          params: {
            flow: [
              'load-experience',
              'interact-with-model',
              'change-variant',
              'add-to-cart',
              'proceed-to-checkout'
            ],
            timing: {
              'load-experience': 2000,
              'interact-with-model': 5000,
              'change-variant': 1000,
              'add-to-cart': 500,
              'proceed-to-checkout': 1000
            }
          }
        }
      ]
    });
  }
  
  async runDemo(): Promise<void> {
    console.log('🚀 Mantis MCP Demo Starting...\n');
    console.log('This demo showcases how the Mantis MCP helps developers:');
    console.log('• Install and configure the Mantis 3D SDK');
    console.log('• Generate framework-specific integration code');
    console.log('• Debug common postMessage and origin issues');
    console.log('• Monitor 3D experience performance');
    console.log('• Test events and user flows\n');
    
    for (const scenario of this.scenarios) {
      await this.runScenario(scenario);
    }
    
    this.printSummary();
  }
  
  private async runScenario(scenario: DemoScenario): Promise<void> {
    console.log(`\n📋 Scenario: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);
    console.log(`💻 Environment: ${scenario.environment.toUpperCase()}\n`);
    
    const scenarioStart = performance.now();
    const scenarioResults: any[] = [];
    
    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      console.log(`   ${i + 1}. ${step.description}`);
      
      const stepStart = performance.now();
      const result = await this.mockToolExecution(step, scenario.environment);
      const stepEnd = performance.now();
      
      step.timing = stepEnd - stepStart;
      scenarioResults.push({ step, result });
      
      console.log(`      ✅ Completed in ${step.timing.toFixed(2)}ms`);
      
      // Show key result information
      if (result.generatedCode) {
        console.log(`      📄 Generated ${result.generatedCode.split('\\n').length} lines of code`);
      }
      if (result.issue) {
        console.log(`      🔍 Identified issue: ${result.issue}`);
      }
      if (result.recommendation) {
        console.log(`      💡 Recommendation: ${result.recommendation.substring(0, 60)}...`);
      }
    }
    
    const scenarioEnd = performance.now();
    const totalTime = scenarioEnd - scenarioStart;
    
    console.log(`\n   📊 Scenario completed in ${totalTime.toFixed(2)}ms`);
    console.log(`   🎯 All ${scenario.steps.length} steps successful`);
    
    this.results.push({
      scenario: scenario.name,
      environment: scenario.environment,
      steps: scenarioResults,
      totalTime
    });
  }
  
  private async mockToolExecution(step: DemoStep, environment: string): Promise<any> {
    // Simulate realistic tool execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    // Return mock responses based on tool type and environment
    switch (step.tool) {
      case 'installMantisSDK':
        return this.mockInstallResponse(step.params, environment);
      case 'validateSetup':
        return this.mockValidationResponse(step.params, environment);
      case 'createMantisIntegration':
        return this.mockIntegrationResponse(step.params, environment);
      case 'generateEventHandler':
        return this.mockEventHandlerResponse(step.params, environment);
      case 'analyzeConsoleErrors':
        return this.mockErrorAnalysisResponse(step.params, environment);
      case 'debugPostMessage':
        return this.mockPostMessageDebugResponse(step.params, environment);
      case 'checkBrowserCompatibility':
        return this.mockCompatibilityResponse(step.params, environment);
      case 'testMantisEvent':
        return this.mockEventTestResponse(step.params, environment);
      case 'getPerformanceMetrics':
        return this.mockPerformanceResponse(step.params, environment);
      case 'analyzeEventFlow':
        return this.mockEventFlowResponse(step.params, environment);
      case 'simulateUserFlow':
        return this.mockUserFlowResponse(step.params, environment);
      default:
        return { success: true, action: environment === 'claude-desktop' ? 'instructions' : 'execute' };
    }
  }
  
  private mockInstallResponse(params: any, environment: string) {
    const action = environment === 'claude-desktop' ? 'instructions' : 'execute';
    
    if (action === 'instructions') {
      return {
        success: true,
        action: 'instructions',
        message: `Setting up Mantis SDK for ${params.framework}`,
        steps: [
          {
            step: 1,
            description: 'Create .npmrc with authentication',
            code: '@mantis-3d:registry=https://npm.pkg.github.com\\n//npm.pkg.github.com/:_authToken=YOUR_TOKEN',
            note: 'Replace YOUR_TOKEN with your Mantis authentication token'
          },
          {
            step: 2,
            description: 'Install the Mantis SDK',
            command: 'npm install @mantis-3d/sdk',
            alternatives: ['yarn add @mantis-3d/sdk', 'pnpm add @mantis-3d/sdk']
          }
        ],
        nextSteps: [
          'Import MantisSDK in your main component',
          'Configure allowedOrigins for your domain',
          'Run validateSetup to confirm installation'
        ]
      };
    } else {
      return {
        success: true,
        action: 'execute',
        steps: [
          {
            type: 'file',
            path: '.npmrc',
            content: '@mantis-3d:registry=https://npm.pkg.github.com\\n//npm.pkg.github.com/:_authToken=' + (params.authToken || 'YOUR_TOKEN')
          },
          {
            type: 'command',
            command: 'npm install @mantis-3d/sdk'
          }
        ]
      };
    }
  }
  
  private mockIntegrationResponse(params: any, environment: string) {
    const codeTemplates = {
      react: `import { MantisSDK } from '@mantis-3d/sdk';
import { useEffect, useRef, useState } from 'react';

export function MantisProductViewer({ productId, className }) {
  const containerRef = useRef(null);
  const sdkRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    sdkRef.current = new MantisSDK({
      container: containerRef.current,
      allowedOrigins: [window.location.origin],
      enableLogging: process.env.NODE_ENV === 'development',
      productId
    });

    // Event handlers for ${params.storeType} store
    ${params.features.includes('cart') ? `
    sdkRef.current.on('cart-opened', (data) => {
      console.log('Cart opened:', data);
      // Integrate with your cart system
    });

    sdkRef.current.on('add-to-cart', (data) => {
      console.log('Adding to cart:', data);
      // Add product to cart
    });` : ''}

    ${params.features.includes('variants') ? `
    sdkRef.current.on('variant-selected', (data) => {
      console.log('Variant selected:', data);
      // Update product variant
    });` : ''}

    ${params.features.includes('camera') ? `
    sdkRef.current.on('model-click', (data) => {
      console.log('Model interaction:', data);
      // Handle 3D model interactions
    });` : ''}

    sdkRef.current.on('experience-loaded', () => {
      setIsLoading(false);
    });

    sdkRef.current.on('error', (error) => {
      console.error('Mantis SDK Error:', error);
      setError(error.message);
      setIsLoading(false);
    });

    return () => {
      sdkRef.current?.destroy();
    };
  }, [productId]);

  if (error) {
    return <div className="mantis-error">Error loading 3D experience: {error}</div>;
  }

  return (
    <div className={className}>
      {isLoading && <div className="mantis-loading">Loading 3D experience...</div>}
      <div ref={containerRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
}`,
      'shopify-liquid': `<!-- Mantis 3D Product Viewer for Shopify -->
<div id="mantis-container-{{ product.id }}" class="mantis-3d-viewer">
  <div class="mantis-loading">Loading 3D experience...</div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const mantisSDK = new MantisSDK({
    container: document.getElementById('mantis-container-{{ product.id }}'),
    allowedOrigins: ['{{ shop.permanent_domain }}', '{{ shop.myshopify_domain }}'],
    productId: '{{ product.id }}',
    variantId: '{{ product.selected_or_first_available_variant.id }}'
  });

  ${params.features.includes('cart') ? `
  // Shopify cart integration
  mantisSDK.on('add-to-cart', function(event) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: event.data.variantId,
        quantity: event.data.quantity || 1
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Added to Shopify cart:', data);
      // Update cart UI
      if (window.theme && window.theme.cartDrawer) {
        window.theme.cartDrawer.refresh();
      }
    })
    .catch(error => console.error('Cart error:', error));
  });` : ''}

  ${params.features.includes('variants') ? `
  // Shopify variant selection
  mantisSDK.on('variant-selected', function(event) {
    const variantId = event.data.variantId;
    const variantSelectElement = document.querySelector('select[name="id"]');
    if (variantSelectElement) {
      variantSelectElement.value = variantId;
      variantSelectElement.dispatchEvent(new Event('change'));
    }
  });` : ''}

  // Hide loading indicator when ready
  mantisSDK.on('experience-loaded', function() {
    const loading = document.querySelector('#mantis-container-{{ product.id }} .mantis-loading');
    if (loading) loading.style.display = 'none';
  });
});
</script>

<style>
.mantis-3d-viewer {
  width: 100%;
  height: 400px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.mantis-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f5f5;
  color: #666;
}
</style>`
    };

    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      message: `Generated ${params.framework} integration with ${params.features.join(', ')} features`,
      generatedCode: codeTemplates[params.framework as keyof typeof codeTemplates] || '// Framework template not available',
      framework: params.framework,
      features: params.features,
      storeType: params.storeType
    };
  }
  
  private mockErrorAnalysisResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: 'Origin mismatch detected',
      details: {
        errorCount: params.errors.length,
        primaryError: params.errors[0],
        browser: params.browserInfo?.name || 'Unknown',
        patterns: ['postMessage origin mismatch', 'cross-origin communication blocked']
      },
      solution: {
        description: 'Update Mantis SDK configuration to include all valid origins',
        code: `const sdk = new MantisSDK({
  allowedOrigins: [
    'https://my-store.com',
    'https://www.my-store.com',
    window.location.origin
  ]
});`,
        documentation: 'https://docs.mantisxr.com/sdk/configuration#allowed-origins'
      },
      recommendation: 'Add your production domain to the allowedOrigins array in your Mantis SDK configuration'
    };
  }
  
  private mockPerformanceResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      metrics: {
        fps: { average: 58.2, min: 45, max: 60 },
        loadTime: 2340, // ms
        memory: { used: '45.2 MB', peak: '67.8 MB' },
        gpu: { utilization: '34%', memory: '128 MB' },
        bandwidth: { total: '2.1 MB', compressed: '850 KB' }
      },
      analysis: {
        performance: 'Good',
        bottlenecks: ['Initial model load time could be optimized'],
        recommendations: [
          'Enable model compression for faster loading',
          'Implement progressive loading for complex models',
          'Consider using lower resolution textures on mobile devices'
        ]
      },
      optimizations: {
        suggested: [
          'Enable DRACO compression: enableCompression: true',
          'Implement level-of-detail: useLOD: true',
          'Preload critical textures: preloadTextures: [\'diffuse\', \'normal\']'
        ]
      }
    };
  }
  
  // Additional mock methods for other tools...
  private mockValidationResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      validationResults: {
        sdkInstalled: true,
        authConfigured: true,
        originsConfigured: false,
        issues: ['Missing allowedOrigins configuration'],
        recommendations: ['Add allowedOrigins to SDK configuration']
      }
    };
  }
  
  private mockEventHandlerResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      generatedCode: `// Event handler for ${params.event}\\nconst handle${params.event.replace('-', '')} = (data) => {\\n  // ${params.action}\\n};`,
      framework: params.framework
    };
  }
  
  private mockPostMessageDebugResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: 'Origin mismatch detected',
      recommendation: 'Add localhost to allowedOrigins'
    };
  }
  
  private mockCompatibilityResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      issue: 'Safari private mode detected',
      details: { issues: [{ feature: 'postMessage', issue: 'Safari private mode restrictions' }] },
      recommendation: 'Test in normal Safari mode'
    };
  }
  
  private mockEventTestResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      testResult: 'passed',
      actualResponse: params.expectedResponse
    };
  }
  
  private mockEventFlowResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      flowAnalysis: {
        totalEvents: 6,
        conversionRate: '78%',
        dropoffPoints: ['model-load to interaction: 15%']
      }
    };
  }
  
  private mockUserFlowResponse(params: any, environment: string) {
    return {
      success: true,
      action: environment === 'claude-desktop' ? 'instructions' : 'execute',
      simulationResult: {
        totalTime: '9.5s',
        stepsCompleted: params.flow.length,
        success: true
      }
    };
  }
  
  private printSummary(): void {
    console.log('\\n\\n📊 Demo Summary Report');
    console.log('========================');
    
    const totalScenarios = this.results.length;
    const totalSteps = this.results.reduce((sum, r) => sum + r.steps.length, 0);
    const totalTime = this.results.reduce((sum, r) => sum + r.totalTime, 0);
    
    console.log(`✅ Completed ${totalScenarios} scenarios`);
    console.log(`🔧 Executed ${totalSteps} MCP tool operations`);
    console.log(`⏱️  Total demo time: ${totalTime.toFixed(2)}ms`);
    console.log(`⚡ Average operation time: ${(totalTime / totalSteps).toFixed(2)}ms`);
    
    console.log('\\n🎯 Key Capabilities Demonstrated:');
    console.log('• Environment-aware responses (Claude Desktop vs Claude Code)');
    console.log('• SDK installation and validation');
    console.log('• Framework-specific code generation (React, Shopify Liquid)');
    console.log('• postMessage debugging and error analysis');
    console.log('• Browser compatibility checking');
    console.log('• Performance monitoring and optimization');
    console.log('• Event testing and user flow simulation');
    
    console.log('\\n💡 Value Proposition:');
    console.log('• Reduces setup time from hours to minutes');
    console.log('• Provides instant debugging assistance');
    console.log('• Generates production-ready integration code');
    console.log('• Handles complex browser compatibility issues');
    console.log('• Enables comprehensive testing without browsers');
    
    console.log('\\n🚀 Demo completed successfully!');
  }
}

// Export for use in tests and demos
export { MCPDemo, DemoScenario, DemoStep };

// Run demo if this file is executed directly
if (require.main === module) {
  const demo = new MCPDemo();
  demo.runDemo().catch(console.error);
}