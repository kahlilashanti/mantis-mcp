/**
 * TypeScript types for Mantis SDK
 * These represent the actual SDK interface that will be used in production
 */

export interface MantisSDKConfig {
  allowedOrigins?: string[];
  enableLogging?: boolean;
  environment?: 'development' | 'staging' | 'production';
  apiKey?: string;
  customization?: {
    theme?: 'light' | 'dark' | 'auto';
    branding?: boolean;
    controls?: boolean;
  };
}

export interface MantisEvent {
  type: string;
  data: any;
  timestamp: number;
  origin?: string;
}

export interface MantisSDK {
  new(config: MantisSDKConfig): MantisSDK;
  
  // Event handling
  on(event: string, handler: (event: MantisEvent) => void): void;
  off(event: string, handler?: (event: MantisEvent) => void): void;
  emit(event: string, data?: any): void;
  
  // Lifecycle
  init(): Promise<void>;
  destroy(): void;
  
  // 3D Experience control
  loadModel(modelId: string): Promise<void>;
  showVariant(variantId: string): Promise<void>;
  captureSnapshot(): Promise<string>;
  
  // Cart operations
  getCart(): Promise<CartItem[]>;
  addToCart(item: CartItem): Promise<void>;
  removeFromCart(itemId: string): Promise<void>;
  clearCart(): Promise<void>;
  
  // Analytics
  track(event: string, data?: any): void;
  getMetrics(): Promise<PerformanceMetrics>;
}

export interface CartItem {
  id: string;
  variantId: string;
  modelId: string;
  quantity: number;
  price: number;
  customization?: {
    color?: string;
    material?: string;
    size?: string;
    [key: string]: any;
  };
}

export interface PerformanceMetrics {
  fps: number;
  loadTime: number;
  memoryUsage: number;
  gpuUsage?: number;
  renderTime: number;
  triangleCount: number;
}

export interface DebugInfo {
  sdkVersion: string;
  browserInfo: BrowserInfo;
  webglSupport: boolean;
  postMessageErrors: PostMessageError[];
  consoleErrors: string[];
}

export interface BrowserInfo {
  userAgent: string;
  vendor: string;
  platform: string;
  cookieEnabled: boolean;
  onLine: boolean;
  language: string;
  isPrivateMode?: boolean;
}

export interface PostMessageError {
  timestamp: number;
  origin: string;
  expectedOrigin: string;
  message: string;
  stack?: string;
}

// Common Mantis events
export enum MantisEvents {
  // Lifecycle events
  SDK_READY = 'sdk-ready',
  SDK_ERROR = 'sdk-error',
  
  // Model events
  MODEL_LOADED = 'model-loaded',
  MODEL_ERROR = 'model-error',
  MODEL_CLICK = 'model-click',
  VARIANT_CHANGED = 'variant-changed',
  
  // Cart events
  CART_OPENED = 'cart-opened',
  CART_CLOSED = 'cart-closed',
  ITEM_ADDED = 'item-added',
  ITEM_REMOVED = 'item-removed',
  CART_CLEARED = 'cart-cleared',
  
  // User interaction events
  CAMERA_CHANGED = 'camera-changed',
  FULLSCREEN_ENTERED = 'fullscreen-entered',
  FULLSCREEN_EXITED = 'fullscreen-exited',
  
  // Performance events
  PERFORMANCE_WARNING = 'performance-warning',
  MEMORY_WARNING = 'memory-warning'
}

export type Framework = 'react' | 'vue' | 'vanilla' | 'next' | 'shopify-liquid' | 'angular' | 'svelte';
export type StoreType = 'sneakers' | 'jewelry' | 'furniture' | 'electronics' | 'fashion' | 'automotive' | 'custom';