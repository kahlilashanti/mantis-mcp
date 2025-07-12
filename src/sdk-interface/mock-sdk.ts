/**
 * Mock Mantis SDK for demo purposes
 * Provides realistic responses without actual 3D functionality
 */

import {
  MantisSDKConfig,
  MantisEvent,
  CartItem,
  PerformanceMetrics,
  DebugInfo,
  BrowserInfo,
  PostMessageError,
  MantisEvents
} from './sdk-types.js';

export class MockMantisSDK {
  private config: MantisSDKConfig;
  private eventHandlers: Map<string, Function[]> = new Map();
  private cart: CartItem[] = [];
  private currentModelId?: string;
  private isInitialized = false;

  constructor(config: MantisSDKConfig) {
    this.config = {
      allowedOrigins: ['*'],
      enableLogging: false,
      environment: 'development',
      ...config
    };
  }

  // Event handling
  on(event: string, handler: (event: MantisEvent) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler?: (event: MantisEvent) => void): void {
    if (!this.eventHandlers.has(event)) return;
    
    if (handler) {
      const handlers = this.eventHandlers.get(event)!;
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const eventObj: MantisEvent = {
        type: event,
        data,
        timestamp: Date.now(),
        origin: window?.location?.origin || 'mock-origin'
      };
      
      handlers.forEach(handler => {
        try {
          handler(eventObj);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Lifecycle
  async init(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isInitialized = true;
        this.emit(MantisEvents.SDK_READY, { 
          version: '1.0.0',
          config: this.config 
        });
        resolve();
      }, 500); // Simulate initialization delay
    });
  }

  destroy(): void {
    this.isInitialized = false;
    this.eventHandlers.clear();
    this.cart = [];
    this.currentModelId = undefined;
  }

  // 3D Experience control
  async loadModel(modelId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.9) { // 90% success rate
          this.currentModelId = modelId;
          this.emit(MantisEvents.MODEL_LOADED, { modelId });
          resolve();
        } else {
          const error = new Error(`Failed to load model: ${modelId}`);
          this.emit(MantisEvents.MODEL_ERROR, { modelId, error: error.message });
          reject(error);
        }
      }, 1000); // Simulate loading time
    });
  }

  async showVariant(variantId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit(MantisEvents.VARIANT_CHANGED, { 
          variantId,
          modelId: this.currentModelId 
        });
        resolve();
      }, 300);
    });
  }

  async captureSnapshot(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return mock base64 image data
        const mockSnapshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        resolve(mockSnapshot);
      }, 500);
    });
  }

  // Cart operations
  async getCart(): Promise<CartItem[]> {
    return Promise.resolve([...this.cart]);
  }

  async addToCart(item: CartItem): Promise<void> {
    const existingItemIndex = this.cart.findIndex(
      cartItem => cartItem.variantId === item.variantId
    );

    if (existingItemIndex > -1) {
      this.cart[existingItemIndex].quantity += item.quantity;
    } else {
      this.cart.push({ ...item, id: `item-${Date.now()}` });
    }

    this.emit(MantisEvents.ITEM_ADDED, { item, cartTotal: this.cart.length });
    return Promise.resolve();
  }

  async removeFromCart(itemId: string): Promise<void> {
    const itemIndex = this.cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      const removedItem = this.cart.splice(itemIndex, 1)[0];
      this.emit(MantisEvents.ITEM_REMOVED, { 
        item: removedItem, 
        cartTotal: this.cart.length 
      });
    }
    return Promise.resolve();
  }

  async clearCart(): Promise<void> {
    this.cart = [];
    this.emit(MantisEvents.CART_CLEARED, { cartTotal: 0 });
    return Promise.resolve();
  }

  // Analytics
  track(event: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[Mantis Analytics] ${event}:`, data);
    }
    // In real implementation, this would send to analytics service
  }

  async getMetrics(): Promise<PerformanceMetrics> {
    return Promise.resolve({
      fps: Math.floor(Math.random() * 20) + 40, // 40-60 FPS
      loadTime: Math.floor(Math.random() * 2000) + 500, // 0.5-2.5s
      memoryUsage: Math.floor(Math.random() * 50) + 20, // 20-70MB
      gpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
      renderTime: Math.floor(Math.random() * 16) + 8, // 8-24ms
      triangleCount: Math.floor(Math.random() * 50000) + 10000 // 10k-60k triangles
    });
  }
}

// Mock debugging utilities
export function generateMockDebugInfo(): DebugInfo {
  return {
    sdkVersion: '1.0.0',
    browserInfo: generateMockBrowserInfo(),
    webglSupport: true,
    postMessageErrors: generateMockPostMessageErrors(),
    consoleErrors: [
      'Warning: WebGL context lost. Attempting recovery...',
      'Error: Failed to load texture: model_texture_001.jpg'
    ]
  };
}

function generateMockBrowserInfo(): BrowserInfo {
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
  ];

  return {
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    vendor: 'Google Inc.',
    platform: 'MacIntel',
    cookieEnabled: true,
    onLine: true,
    language: 'en-US',
    isPrivateMode: Math.random() < 0.1 // 10% chance of private mode
  };
}

function generateMockPostMessageErrors(): PostMessageError[] {
  const errors: PostMessageError[] = [];
  
  if (Math.random() < 0.3) { // 30% chance of origin mismatch
    errors.push({
      timestamp: Date.now() - 60000,
      origin: 'https://localhost:3000',
      expectedOrigin: 'https://app.example.com',
      message: 'Failed to execute \'postMessage\' on \'DOMWindow\': The target origin provided (\'https://localhost:3000\') does not match the recipient window\'s origin (\'https://app.example.com\').'
    });
  }

  if (Math.random() < 0.2) { // 20% chance of size limit error
    errors.push({
      timestamp: Date.now() - 30000,
      origin: 'https://mantisxr.com',
      expectedOrigin: 'https://mantisxr.com',
      message: 'DataCloneError: Failed to execute \'postMessage\' on \'Window\': Message size exceeds maximum allowed limit.'
    });
  }

  return errors;
}