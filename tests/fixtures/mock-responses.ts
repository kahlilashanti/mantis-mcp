/**
 * Mock Response Fixtures
 * Realistic mock responses for all Mantis MCP tools
 */

export const mockResponses = {
  // Setup & Installation Tools
  installMantisSDK: {
    claudeDesktop: {
      react: {
        success: true,
        action: 'instructions',
        message: 'Follow these steps to install Mantis SDK for React',
        steps: [
          {
            step: 1,
            description: 'Create .npmrc file with authentication',
            code: '@mantis-3d:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=YOUR_TOKEN',
            note: 'Replace YOUR_TOKEN with the token provided by Mantis',
            copyable: true
          },
          {
            step: 2,
            description: 'Install the Mantis SDK',
            command: 'npm install @mantis-3d/sdk',
            alternatives: ['yarn add @mantis-3d/sdk', 'pnpm add @mantis-3d/sdk']
          },
          {
            step: 3,
            description: 'Verify installation',
            command: 'npm list @mantis-3d/sdk',
            note: 'Should show version 1.2.3 or later'
          }
        ],
        nextSteps: [
          'Import MantisSDK in your main component',
          'Configure allowed origins for your domain',
          'Test with validateSetup tool'
        ],
        estimatedTime: '2-3 minutes',
        documentation: 'https://docs.mantisxr.com/sdk/installation'
      },
      shopify: {
        success: true,
        action: 'instructions',
        message: 'Follow these steps to install Mantis SDK for Shopify',
        steps: [
          {
            step: 1,
            description: 'Add Mantis SDK script to theme.liquid',
            code: '<script src="https://cdn.example.com/sdk/v1.2.3/mantis-sdk.min.js"></script>',
            location: 'Before closing </head> tag'
          },
          {
            step: 2,
            description: 'Initialize SDK in product template',
            code: `<script>
  window.mantisSDK = new MantisSDK({
    allowedOrigins: ['{{ shop.permanent_domain }}'],
    apiKey: 'YOUR_API_KEY'
  });
</script>`,
            location: 'In product.liquid template'
          }
        ],
        nextSteps: [
          'Configure API key in theme settings',
          'Add 3D viewer to product template',
          'Test on a product with 3D model'
        ]
      }
    },
    claudeCode: {
      react: {
        success: true,
        action: 'execute',
        steps: [
          {
            type: 'file',
            path: '.npmrc',
            content: '@mantis-3d:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=YOUR_TOKEN'
          },
          {
            type: 'command',
            command: 'npm install @mantis-3d/sdk'
          },
          {
            type: 'file',
            path: 'src/components/MantisViewer.tsx',
            content: `import { MantisSDK } from '@mantis-3d/sdk';
import { useEffect, useRef } from 'react';

export default function MantisViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const sdk = new MantisSDK({
      container: containerRef.current,
      allowedOrigins: [window.location.origin]
    });
    
    return () => sdk.destroy();
  }, []);
  
  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />;
}`
          }
        ]
      }
    }
  },

  validateSetup: {
    success: {
      success: true,
      action: 'instructions',
      message: 'Setup validation complete',
      validationResults: {
        sdkInstalled: true,
        version: '1.2.3',
        authConfigured: true,
        originsConfigured: true,
        dependencies: {
          'three': '0.157.0',
          'typescript': '5.3.2'
        },
        issues: []
      },
      score: 100,
      recommendations: [
        'Setup is complete and ready for development',
        'Consider enabling debug mode during development'
      ]
    },
    issues: {
      success: true,
      action: 'instructions',
      message: 'Setup validation found issues',
      validationResults: {
        sdkInstalled: true,
        version: '1.2.3',
        authConfigured: false,
        originsConfigured: false,
        issues: [
          {
            type: 'error',
            code: 'MISSING_AUTH',
            message: 'Authentication token not configured',
            fix: 'Add _authToken to .npmrc file'
          },
          {
            type: 'warning',
            code: 'MISSING_ORIGINS',
            message: 'No allowedOrigins configured',
            fix: 'Add allowedOrigins array to SDK configuration'
          }
        ]
      },
      score: 60,
      recommendations: [
        'Configure authentication in .npmrc',
        'Add allowedOrigins to SDK initialization',
        'Test postMessage communication'
      ]
    }
  },

  // Development Tools
  createMantisIntegration: {
    react: {
      success: true,
      action: 'instructions',
      message: 'Generated React integration with cart, camera, and variants features',
      generatedCode: `import { MantisSDK } from '@mantis-3d/sdk';
import { useEffect, useRef, useState, useCallback } from 'react';

interface MantisProductViewerProps {
  productId: string;
  className?: string;
  onCartAdd?: (data: any) => void;
  onVariantChange?: (variant: any) => void;
}

export function MantisProductViewer({ 
  productId, 
  className = '',
  onCartAdd,
  onVariantChange 
}: MantisProductViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<MantisSDK | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVariant, setCurrentVariant] = useState<any>(null);

  const handleCartOpened = useCallback((data: any) => {
    console.log('Cart opened:', data);
    // Integrate with your cart system
    if (onCartAdd) onCartAdd(data);
  }, [onCartAdd]);

  const handleVariantSelected = useCallback((data: any) => {
    console.log('Variant selected:', data);
    setCurrentVariant(data.variant);
    if (onVariantChange) onVariantChange(data.variant);
  }, [onVariantChange]);

  const handleModelClick = useCallback((data: any) => {
    console.log('Model interaction:', data);
    // Handle 3D model interactions
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    sdkRef.current = new MantisSDK({
      container: containerRef.current,
      allowedOrigins: [window.location.origin],
      enableLogging: process.env.NODE_ENV === 'development',
      productId,
      features: {
        cart: true,
        camera: true,
        variants: true
      }
    });

    // Event handlers for sneakers store
    sdkRef.current.on('cart-opened', handleCartOpened);
    sdkRef.current.on('variant-selected', handleVariantSelected);
    sdkRef.current.on('model-click', handleModelClick);

    sdkRef.current.on('experience-loaded', () => {
      setIsLoading(false);
    });

    sdkRef.current.on('error', (error: any) => {
      console.error('Mantis SDK Error:', error);
      setError(error.message);
      setIsLoading(false);
    });

    return () => {
      sdkRef.current?.destroy();
    };
  }, [productId, handleCartOpened, handleVariantSelected, handleModelClick]);

  if (error) {
    return (
      <div className={\`mantis-error \${className}\`}>
        <h3>3D Experience Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reload Experience
        </button>
      </div>
    );
  }

  return (
    <div className={\`mantis-viewer \${className}\`}>
      {isLoading && (
        <div className="mantis-loading">
          <div className="spinner" />
          <p>Loading 3D experience...</p>
        </div>
      )}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '400px', position: 'relative' }}
        aria-label="3D Product Viewer"
      />
      {currentVariant && (
        <div className="variant-info">
          <span>Selected: {currentVariant.title}</span>
        </div>
      )}
    </div>
  );
}`,
      framework: 'react',
      features: ['cart', 'camera', 'variants'],
      storeType: 'sneakers',
      files: [
        {
          path: 'src/components/MantisProductViewer.tsx',
          type: 'component'
        },
        {
          path: 'src/styles/mantis-viewer.css',
          type: 'styles'
        }
      ],
      nextSteps: [
        'Import component in your product page',
        'Add CSS styles for loading and error states',
        'Connect cart events to your cart system'
      ]
    }
  },

  // Debugging Tools
  debugPostMessage: {
    originMismatch: {
      success: true,
      action: 'instructions',
      issue: 'Origin mismatch detected',
      details: {
        sentFrom: 'https://localhost:3000',
        expectedOrigins: ['https://app.example.com'],
        capturedMessages: [
          {
            timestamp: '2024-01-15T14:30:22.123Z',
            origin: 'https://localhost:3000',
            data: { type: 'mantis-init', productId: 'prod_123' },
            blocked: true,
            reason: 'Origin not in allowedOrigins'
          }
        ],
        recommendation: "Add 'https://localhost:3000' to allowedOrigins in MantisSDK config"
      },
      solution: {
        description: 'Update your Mantis SDK configuration',
        code: `const sdk = new MantisSDK({
  allowedOrigins: [
    'https://localhost:3000',
    'https://app.example.com',
    window.location.origin
  ]
});`,
        documentation: 'https://docs.mantisxr.com/sdk/configuration#allowed-origins'
      },
      testSteps: [
        'Update SDK configuration with new origins',
        'Restart development server',
        'Test postMessage communication',
        'Verify no console errors'
      ]
    },
    safariPrivateMode: {
      success: true,
      action: 'instructions',
      issue: 'Safari private mode detected',
      details: {
        browser: 'Safari 17.0',
        privateMode: true,
        restrictions: [
          'postMessage between frames blocked',
          'localStorage access restricted',
          'sessionStorage limited'
        ],
        recommendation: 'Safari private mode restricts cross-frame communication'
      },
      solution: {
        description: 'Implement fallback for Safari private mode',
        code: `// Detect private mode and show fallback
const isPrivateMode = await detectPrivateMode();
if (isPrivateMode) {
  showStaticFallback();
} else {
  initializeMantisSDK();
}`,
        documentation: 'https://docs.mantisxr.com/sdk/browser-compatibility#safari-private-mode'
      }
    }
  },

  analyzeConsoleErrors: {
    sdkNotDefined: {
      success: true,
      action: 'instructions',
      issue: 'SDK not loaded',
      details: {
        errorCount: 1,
        primaryError: 'MantisSDK is not defined',
        errorType: 'ReferenceError',
        location: 'product-page.js:15',
        timestamp: '2024-01-15T14:30:15.456Z'
      },
      solution: {
        description: 'Ensure @mantis-3d/sdk is imported before use',
        code: `// Add to top of file
import { MantisSDK } from '@mantis-3d/sdk';

// Or for vanilla JS
<script src="https://cdn.example.com/sdk/mantis-sdk.min.js"></script>`,
        fixes: [
          'Add import statement',
          'Check bundle configuration',
          'Verify SDK installation'
        ]
      },
      prevention: [
        'Use TypeScript for better error catching',
        'Add SDK to build dependencies',
        'Implement proper error boundaries'
      ]
    }
  },

  // Performance & Monitoring
  getPerformanceMetrics: {
    good: {
      success: true,
      action: 'instructions',
      metrics: {
        fps: {
          average: 58.2,
          min: 45,
          max: 60,
          p95: 59.1
        },
        loadTime: {
          total: 2340,
          modelDownload: 1200,
          textureLoading: 800,
          initialization: 340
        },
        memory: {
          used: '45.2 MB',
          peak: '67.8 MB',
          textures: '28.1 MB',
          geometry: '12.4 MB'
        },
        gpu: {
          utilization: '34%',
          memory: '128 MB',
          drawCalls: 42
        },
        bandwidth: {
          total: '2.1 MB',
          compressed: '850 KB',
          compressionRatio: '59.5%'
        }
      },
      analysis: {
        performance: 'Good',
        grade: 'A-',
        bottlenecks: [
          'Initial model load time could be optimized',
          'Texture resolution higher than needed for mobile'
        ],
        strengths: [
          'Stable 60fps rendering',
          'Efficient memory usage',
          'Good compression ratio'
        ]
      },
      recommendations: [
        {
          priority: 'high',
          action: 'Enable DRACO compression',
          impact: 'Reduce model size by 60-80%',
          code: 'enableCompression: true'
        },
        {
          priority: 'medium',
          action: 'Implement progressive loading',
          impact: 'Faster initial render',
          code: 'progressiveLoading: true'
        }
      ]
    }
  },

  // Testing Tools
  testMantisEvent: {
    cartEvent: {
      success: true,
      action: 'instructions',
      testResult: 'passed',
      event: 'add-to-cart',
      data: {
        productId: 'prod_123',
        variantId: 'var_456',
        quantity: 1,
        price: 299.99
      },
      expectedResponse: {
        status: 'success',
        cartUpdated: true,
        analyticsTracked: true
      },
      actualResponse: {
        status: 'success',
        cartUpdated: true,
        analyticsTracked: true,
        timestamp: '2024-01-15T14:30:45.789Z',
        cartId: 'cart_abc123'
      },
      validation: {
        responseTime: '45ms',
        dataIntegrity: 'passed',
        eventPropagation: 'passed'
      }
    }
  },

  simulateUserFlow: {
    completePurchase: {
      success: true,
      action: 'instructions',
      flow: [
        'load-experience',
        'interact-with-model',
        'change-variant',
        'add-to-cart',
        'proceed-to-checkout'
      ],
      results: {
        totalTime: '9.5s',
        stepsCompleted: 5,
        success: true,
        dropoffPoints: [],
        performance: {
          'load-experience': { duration: '2.1s', success: true },
          'interact-with-model': { duration: '3.2s', success: true },
          'change-variant': { duration: '0.8s', success: true },
          'add-to-cart': { duration: '0.4s', success: true },
          'proceed-to-checkout': { duration: '3.0s', success: true }
        }
      },
      analytics: {
        conversionRate: '100%',
        averageEngagementTime: '6.5s',
        interactionCount: 12
      }
    }
  }
};

export const errorPatterns = {
  'MantisSDK is not defined': {
    category: 'setup',
    severity: 'high',
    commonCauses: [
      'SDK not imported',
      'Script tag missing',
      'Bundle configuration issue'
    ],
    solutions: [
      'Add import statement',
      'Check script loading order',
      'Verify webpack/vite configuration'
    ]
  },
  'Failed to execute postMessage': {
    category: 'communication',
    severity: 'high',
    commonCauses: [
      'Origin mismatch',
      'Safari private mode',
      'Cross-origin policy violation'
    ],
    solutions: [
      'Update allowedOrigins',
      'Implement fallback for private mode',
      'Check CORS headers'
    ]
  },
  'SecurityError': {
    category: 'security',
    severity: 'medium',
    commonCauses: [
      'Browser security restrictions',
      'HTTPS/HTTP mixed content',
      'Iframe sandbox restrictions'
    ],
    solutions: [
      'Use HTTPS for all resources',
      'Update iframe sandbox attributes',
      'Check Content Security Policy'
    ]
  }
};

export const browserCompatibility = {
  safari: {
    issues: [
      {
        feature: 'postMessage',
        issue: 'Private mode restrictions',
        workaround: 'Detect private mode and show fallback'
      },
      {
        feature: 'WebGL',
        issue: 'Limited on older versions',
        workaround: 'Check WebGL support before initialization'
      }
    ]
  },
  chrome: {
    issues: [
      {
        feature: 'extensions',
        issue: 'Ad blockers may interfere',
        workaround: 'Whitelist SDK domains'
      }
    ]
  },
  firefox: {
    issues: [
      {
        feature: 'tracking-protection',
        issue: 'Strict mode blocks some requests',
        workaround: 'Use first-party domains'
      }
    ]
  }
};