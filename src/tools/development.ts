/**
 * Development Tools
 * Code generation and integration tools for Mantis SDK
 */

import { Environment, formatResponse } from '../utils/environment.js';

export const developmentTools = {
  /**
   * Generate Mantis integration code for specific frameworks
   */
  async createMantisIntegration(args: any, environment: Environment) {
    const { framework, features, storeType, responseMode } = args;
    
    let integrationCode = '';
    let additionalFiles: any[] = [];
    
    // Generate framework-specific code
    switch (framework) {
      case 'react':
        integrationCode = generateReactIntegration(features, storeType);
        additionalFiles = [
          {
            path: 'src/components/MantisExperience.tsx',
            content: integrationCode
          },
          {
            path: 'src/hooks/useMantis.ts',
            content: generateReactHook(features)
          }
        ];
        break;
        
      case 'vue':
        integrationCode = generateVueIntegration(features, storeType);
        additionalFiles = [
          {
            path: 'src/components/MantisExperience.vue',
            content: integrationCode
          }
        ];
        break;
        
      case 'shopify-liquid':
        integrationCode = generateShopifyIntegration(features, storeType);
        additionalFiles = [
          {
            path: 'sections/mantis-experience.liquid',
            content: integrationCode
          }
        ];
        break;
        
      case 'next':
        integrationCode = generateNextIntegration(features, storeType);
        additionalFiles = [
          {
            path: 'components/MantisExperience.tsx',
            content: integrationCode
          },
          {
            path: 'pages/api/mantis-webhook.ts',
            content: generateNextAPIRoute()
          }
        ];
        break;
        
      default:
        integrationCode = generateVanillaIntegration(features, storeType);
        additionalFiles = [
          {
            path: 'mantis-integration.js',
            content: integrationCode
          }
        ];
    }
    
    const result = {
      success: true,
      framework,
      features,
      storeType,
      code: integrationCode,
      files: additionalFiles,
      usage: getUsageInstructions(framework),
      customization: getCustomizationTips(features, storeType),
      documentation: `https://docs.mantisxr.com/frameworks/${framework}`,
      estimatedIntegrationTime: '10-15 minutes'
    };
    
    // Allow override of response mode if specified
    if (responseMode === 'execute' || responseMode === 'instructions') {
      return formatResponse(result, environment, responseMode);
    }
    
    // Default behavior based on environment capabilities
    if (environment.capabilities.canCreateFiles) {
      return formatResponse(result, environment, 'execute');
    }
    
    return formatResponse(result, environment, 'instructions');
  },

  /**
   * Generate event handler code for Mantis SDK events
   */
  async generateEventHandler(args: any, environment: Environment) {
    const { event, action, framework } = args;
    
    const handlerCode = generateEventHandlerCode(event, action, framework);
    const testCode = generateEventTestCode(event, framework);
    
    const result = {
      success: true,
      event,
      action,
      framework,
      handler: {
        code: handlerCode,
        usage: `Add this handler to your Mantis SDK initialization`,
        testing: testCode
      },
      relatedEvents: getRelatedEvents(event),
      bestPractices: getEventBestPractices(event),
      documentation: `https://docs.mantisxr.com/events/${event}`
    };
    
    return formatResponse(result, environment, 'instructions');
  }
};

// Helper functions for code generation

function generateReactIntegration(features: string[], storeType: string): string {
  const hasCart = features.includes('cart');
  const hasAnalytics = features.includes('analytics');
  const hasCamera = features.includes('camera');
  
  return `import React, { useEffect, useRef, useCallback } from 'react';
import { MantisSDK } from '@mantis-3d/sdk';
import { useMantis } from '../hooks/useMantis';

interface MantisExperienceProps {
  productId: string;
  modelUrl?: string;
  ${hasCart ? 'onAddToCart?: (item: any) => void;' : ''}
  ${hasAnalytics ? 'analyticsConfig?: any;' : ''}
}

export function MantisExperience({ 
  productId, 
  modelUrl,
  ${hasCart ? 'onAddToCart,' : ''}
  ${hasAnalytics ? 'analyticsConfig' : ''}
}: MantisExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { sdk, isLoaded, error } = useMantis({
    allowedOrigins: [window.location.origin],
    enableLogging: process.env.NODE_ENV === 'development',
    ${hasAnalytics ? 'analytics: analyticsConfig' : ''}
  });

  ${hasCart ? `
  const handleCartEvent = useCallback((event: any) => {
    if (onAddToCart) {
      onAddToCart({
        productId,
        variantId: event.data.variantId,
        quantity: event.data.quantity,
        price: event.data.price
      });
    }
  }, [productId, onAddToCart]);` : ''}

  ${hasCamera ? `
  const handleCameraCapture = useCallback((event: any) => {
    // Handle camera capture for ${storeType} experiences
    console.log('Camera captured:', event.data);
  }, []);` : ''}

  useEffect(() => {
    if (!sdk || !containerRef.current) return;

    // Initialize 3D experience
    sdk.load({
      container: containerRef.current,
      productId,
      modelUrl,
      storeType: '${storeType}'
    });

    // Set up event handlers
    ${hasCart ? `sdk.on('add-to-cart', handleCartEvent);` : ''}
    ${hasCamera ? `sdk.on('camera-capture', handleCameraCapture);` : ''}
    sdk.on('model-loaded', () => console.log('Model loaded successfully'));
    sdk.on('error', (error) => console.error('Mantis error:', error));

    return () => {
      ${hasCart ? `sdk.off('add-to-cart', handleCartEvent);` : ''}
      ${hasCamera ? `sdk.off('camera-capture', handleCameraCapture);` : ''}
      sdk.destroy();
    };
  }, [sdk, productId, modelUrl${hasCart ? ', handleCartEvent' : ''}${hasCamera ? ', handleCameraCapture' : ''}]);

  if (error) {
    return (
      <div className="mantis-error">
        <p>Unable to load 3D experience: {error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mantis-container"
      style={{ 
        width: '100%', 
        height: '400px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      {!isLoaded && (
        <div className="mantis-loading">
          <div className="spinner">Loading 3D experience...</div>
        </div>
      )}
    </div>
  );
}`;
}

function generateReactHook(features: string[]): string {
  return `import { useState, useEffect, useRef } from 'react';
import { MantisSDK } from '@mantis-3d/sdk';

interface UseMantisConfig {
  allowedOrigins: string[];
  enableLogging?: boolean;
  analytics?: any;
}

export function useMantis(config: UseMantisConfig) {
  const [sdk, setSdk] = useState<MantisSDK | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      const mantisSDK = new MantisSDK(config);
      
      mantisSDK.on('ready', () => {
        setIsLoaded(true);
        setError(null);
      });
      
      mantisSDK.on('error', (err) => {
        setError(err);
        setIsLoaded(false);
      });
      
      setSdk(mantisSDK);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize Mantis SDK'));
    }

    return () => {
      if (sdk) {
        sdk.destroy();
      }
    };
  }, []);

  return { sdk, isLoaded, error };
}`;
}

function generateVueIntegration(features: string[], storeType: string): string {
  return `<template>
  <div 
    ref="mantisContainer" 
    class="mantis-container"
    :class="{ 'loading': !isLoaded }"
  >
    <div v-if="error" class="mantis-error">
      <p>Unable to load 3D experience: {{ error.message }}</p>
      <button @click="$router.go(0)">Retry</button>
    </div>
    <div v-else-if="!isLoaded" class="mantis-loading">
      <div class="spinner">Loading 3D experience...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { MantisSDK } from '@mantis-3d/sdk';

interface Props {
  productId: string;
  modelUrl?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['addToCart', 'modelLoaded', 'error']);

const mantisContainer = ref<HTMLElement>();
const sdk = ref<MantisSDK>();
const isLoaded = ref(false);
const error = ref<Error | null>(null);

onMounted(async () => {
  if (!mantisContainer.value) return;

  try {
    sdk.value = new MantisSDK({
      allowedOrigins: [window.location.origin],
      enableLogging: process.env.NODE_ENV === 'development'
    });

    // Event handlers
    sdk.value.on('ready', () => {
      isLoaded.value = true;
      error.value = null;
    });

    ${features.includes('cart') ? `
    sdk.value.on('add-to-cart', (event) => {
      emit('addToCart', {
        productId: props.productId,
        variantId: event.data.variantId,
        quantity: event.data.quantity
      });
    });` : ''}

    sdk.value.on('model-loaded', () => {
      emit('modelLoaded');
    });

    sdk.value.on('error', (err) => {
      error.value = err;
      emit('error', err);
    });

    // Load the 3D experience
    await sdk.value.load({
      container: mantisContainer.value,
      productId: props.productId,
      modelUrl: props.modelUrl,
      storeType: '${storeType}'
    });

  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Failed to initialize');
  }
});

onUnmounted(() => {
  if (sdk.value) {
    sdk.value.destroy();
  }
});
</script>

<style scoped>
.mantis-container {
  width: 100%;
  height: 400px;
  background-color: #f5f5f5;
  border-radius: 8px;
  position: relative;
}

.mantis-loading, .mantis-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.spinner {
  color: #666;
}
</style>`;
}

function generateShopifyIntegration(features: string[], storeType: string): string {
  return `{% comment %} Mantis 3D Experience Section {% endcomment %}
<div class="mantis-section" data-section-type="mantis-experience">
  <div id="mantis-container-{{ product.id }}" class="mantis-container"></div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const productId = {{ product.id | json }};
  const productHandle = {{ product.handle | json }};
  
  // Initialize Mantis SDK
  const mantisSDK = new MantisSDK({
    allowedOrigins: [{{ shop.domain | json }}],
    enableLogging: false
  });

  // Configure for ${storeType} store
  mantisSDK.load({
    container: document.getElementById('mantis-container-' + productId),
    productId: productId,
    storeType: '${storeType}',
    shopifyConfig: {
      shop: {{ shop.domain | json }},
      productHandle: productHandle,
      currency: {{ cart.currency.iso_code | json }}
    }
  });

  ${features.includes('cart') ? `
  // Handle add to cart events
  mantisSDK.on('add-to-cart', function(event) {
    const variantId = event.data.variantId;
    const quantity = event.data.quantity || 1;
    
    // Use Shopify AJAX API to add to cart
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity
      })
    })
    .then(response => response.json())
    .then(item => {
      // Update cart drawer or redirect to cart
      if (typeof CartDrawer !== 'undefined') {
        CartDrawer.open();
      } else {
        window.location.href = '/cart';
      }
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      alert('Unable to add item to cart');
    });
  });` : ''}

  ${features.includes('analytics') ? `
  // Track 3D interactions
  mantisSDK.on('model-interaction', function(event) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'mantis_interaction', {
        'event_category': '3D Experience',
        'event_label': productHandle,
        'interaction_type': event.data.type
      });
    }
  });` : ''}

  // Error handling
  mantisSDK.on('error', function(error) {
    console.error('Mantis error:', error);
    document.getElementById('mantis-container-' + productId).innerHTML = 
      '<p>Unable to load 3D experience. <a href="#" onclick="location.reload()">Try again</a></p>';
  });
});
</script>

<style>
.mantis-container {
  width: 100%;
  height: 400px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin: 20px 0;
  position: relative;
}

@media (max-width: 768px) {
  .mantis-container {
    height: 300px;
  }
}
</style>`;
}

function generateNextIntegration(features: string[], storeType: string): string {
  return `'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MantisSDK to avoid SSR issues
const MantisSDK = dynamic(() => import('@mantis-3d/sdk'), { ssr: false });

interface MantisExperienceProps {
  productId: string;
  modelUrl?: string;
}

export default function MantisExperience({ productId, modelUrl }: MantisExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const initMantis = async () => {
      try {
        const { MantisSDK } = await import('@mantis-3d/sdk');
        
        sdkRef.current = new MantisSDK({
          allowedOrigins: [window.location.origin],
          enableLogging: process.env.NODE_ENV === 'development'
        });

        // Event handlers
        sdkRef.current.on('ready', () => setIsLoaded(true));
        sdkRef.current.on('error', (err: Error) => setError(err.message));

        ${features.includes('cart') ? `
        sdkRef.current.on('add-to-cart', async (event: any) => {
          // Call Next.js API route for cart management
          await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId,
              variantId: event.data.variantId,
              quantity: event.data.quantity
            })
          });
        });` : ''}

        // Load the experience
        await sdkRef.current.load({
          container: containerRef.current,
          productId,
          modelUrl,
          storeType: '${storeType}'
        });

      } catch (err) {
        setError('Failed to load 3D experience');
      }
    };

    initMantis();

    return () => {
      if (sdkRef.current) {
        sdkRef.current.destroy();
      }
    };
  }, [isClient, productId, modelUrl]);

  if (!isClient) {
    return <div className="mantis-container">Loading...</div>;
  }

  if (error) {
    return (
      <div className="mantis-container mantis-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="mantis-container"
      style={{
        width: '100%',
        height: '400px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}
    >
      {!isLoaded && <div className="loading">Loading 3D experience...</div>}
    </div>
  );
}`;
}

function generateNextAPIRoute(): string {
  return `// pages/api/cart/add.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productId, variantId, quantity } = req.body;

  try {
    // Implement your cart logic here
    // This could integrate with Shopify, WooCommerce, etc.
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      productId,
      variantId,
      quantity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
}`;
}

function generateVanillaIntegration(features: string[], storeType: string): string {
  return `// Vanilla JavaScript Mantis Integration
class MantisIntegration {
  constructor(config) {
    this.config = {
      allowedOrigins: [window.location.origin],
      enableLogging: false,
      ...config
    };
    this.sdk = null;
    this.isLoaded = false;
  }

  async init(containerId, productId, modelUrl) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(\`Container with ID \${containerId} not found\`);
    }

    try {
      this.sdk = new MantisSDK(this.config);
      
      // Set up event listeners
      this.sdk.on('ready', () => {
        this.isLoaded = true;
        this.onReady();
      });

      this.sdk.on('error', (error) => {
        this.onError(error);
      });

      ${features.includes('cart') ? `
      this.sdk.on('add-to-cart', (event) => {
        this.handleAddToCart(event.data);
      });` : ''}

      // Load the 3D experience
      await this.sdk.load({
        container,
        productId,
        modelUrl,
        storeType: '${storeType}'
      });

    } catch (error) {
      this.onError(error);
    }
  }

  onReady() {
    console.log('Mantis 3D experience loaded successfully');
  }

  onError(error) {
    console.error('Mantis error:', error);
    // Show fallback content or error message
  }

  ${features.includes('cart') ? `
  handleAddToCart(data) {
    // Implement your cart logic here
    console.log('Add to cart:', data);
    
    // Example: integrate with your e-commerce platform
    if (window.addToCart) {
      window.addToCart(data.variantId, data.quantity);
    }
  }` : ''}

  destroy() {
    if (this.sdk) {
      this.sdk.destroy();
      this.sdk = null;
      this.isLoaded = false;
    }
  }
}

// Usage example:
document.addEventListener('DOMContentLoaded', () => {
  const mantis = new MantisIntegration({
    enableLogging: true // Enable for development
  });

  mantis.init('mantis-container', 'PRODUCT_ID', 'MODEL_URL');
});`;
}

function generateEventHandlerCode(event: string, action: string, framework: string): string {
  const handlers = {
    'cart-opened': (action: string, fw: string) => 
      fw === 'react' ? 
        `const handleCartOpened = useCallback((event) => {\n  ${action};\n}, []);` :
        `sdk.on('cart-opened', (event) => {\n  ${action};\n});`,
        
    'model-click': (action: string, fw: string) =>
      fw === 'react' ? 
        `const handleModelClick = useCallback((event) => {\n  const { x, y, z } = event.data.position;\n  ${action};\n}, []);` :
        `sdk.on('model-click', (event) => {\n  const { x, y, z } = event.data.position;\n  ${action};\n});`,
        
    'variant-changed': (action: string, fw: string) =>
      fw === 'react' ? 
        `const handleVariantChanged = useCallback((event) => {\n  const { oldVariant, newVariant } = event.data;\n  ${action};\n}, []);` :
        `sdk.on('variant-changed', (event) => {\n  const { oldVariant, newVariant } = event.data;\n  ${action};\n});`
  };

  return handlers[event as keyof typeof handlers]?.(action, framework) || 
    `// Handler for ${event}\nsdk.on('${event}', (event) => {\n  ${action};\n});`;
}

function generateEventTestCode(event: string, framework: string): string {
  return `// Test ${event} event
${framework === 'react' ? 'useEffect(() => {' : ''}
  // Simulate ${event} for testing
  setTimeout(() => {
    if (sdk) {
      sdk.emit('${event}', { 
        data: { 
          timestamp: Date.now(),
          test: true 
        } 
      });
    }
  }, 2000);
${framework === 'react' ? '}, [sdk]);' : ''}`;
}

function getUsageInstructions(framework: string): string[] {
  const instructions = {
    react: [
      'Import the MantisExperience component in your product page',
      'Pass productId and optional modelUrl props',
      'Handle onAddToCart callback for cart integration',
      'Style the .mantis-container class for your design'
    ],
    vue: [
      'Import and register the MantisExperience component',
      'Use v-bind to pass productId and modelUrl',
      'Listen for @addToCart and @modelLoaded events',
      'Customize styling in the scoped style section'
    ],
    'shopify-liquid': [
      'Add the section to your product template',
      'Ensure MantisSDK script is loaded in theme.liquid',
      'Customize the Shopify-specific configuration',
      'Test cart integration with your theme'
    ],
    next: [
      'Use the component in your product pages',
      'Ensure it\'s wrapped in a client component',
      'Set up API routes for cart management',
      'Configure for your deployment environment'
    ]
  };
  
  return instructions[framework as keyof typeof instructions] || [
    'Include the script in your HTML',
    'Initialize with your product data',
    'Handle events based on your platform',
    'Test in various browsers'
  ];
}

function getCustomizationTips(features: string[], storeType: string): string[] {
  const tips = [
    `Optimize for ${storeType} experiences with appropriate camera angles`,
    'Add loading states and error boundaries for better UX',
    'Consider mobile responsive design for 3D interactions'
  ];
  
  if (features.includes('cart')) {
    tips.push('Integrate cart events with your existing checkout flow');
  }
  
  if (features.includes('analytics')) {
    tips.push('Set up conversion tracking for 3D interactions');
  }
  
  if (features.includes('camera')) {
    tips.push('Configure camera permissions and capture settings');
  }
  
  return tips;
}

function getRelatedEvents(event: string): string[] {
  const related = {
    'cart-opened': ['cart-closed', 'item-added', 'checkout-started'],
    'model-click': ['model-hover', 'model-rotate', 'zoom-changed'],
    'variant-changed': ['color-changed', 'size-changed', 'price-updated']
  };
  
  return related[event as keyof typeof related] || [];
}

function getEventBestPractices(event: string): string[] {
  const practices = {
    'cart-opened': [
      'Debounce rapid cart open/close events',
      'Track cart abandonment for analytics',
      'Ensure cart state sync across components'
    ],
    'model-click': [
      'Provide visual feedback for interactions',
      'Consider haptic feedback on mobile',
      'Track hotspot engagement'
    ],
    'variant-changed': [
      'Update product info immediately',
      'Sync with inventory availability',
      'Trigger price recalculation'
    ]
  };
  
  return practices[event as keyof typeof practices] || [
    'Handle errors gracefully',
    'Provide user feedback',
    'Log for debugging'
  ];
}