/**
 * API Types - Cloud-agnostic response schemas
 * Works with AWS Lambda, Vercel, or any REST API
 */

// ============================================================================
// API Configuration
// ============================================================================

export interface APIConfig {
  baseURL: string;           // API base URL (AWS, Vercel, etc.)
  authToken?: string;        // Bearer token (Cognito JWT, guest token, etc.)
  timeout?: number;          // Request timeout in ms (default: 30000)
}

// ============================================================================
// Common Response Types
// ============================================================================

export interface APIResponse<T = any> {
  statusCode: number;
  data?: T;
  error?: APIError;
}

export interface APIError {
  code?: string;
  message: string;
  details?: any;
}

// ============================================================================
// Showroom Types (Primary "Store" concept)
// ============================================================================

/**
 * Shopify integration data
 * Backend JWT-encodes this before storage
 */
export interface ShopifyData {
  storeDomain: string;        // e.g., "odd-society.myshopify.com"
}

export interface Showroom {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  config?: ShowroomConfig;
  shopify_data?: string;      // JWT token (returned from API as shopify_data)
  createdAt?: string;
  updatedAt?: string;
}

export interface ShowroomConfig {
  allowedOrigins?: string[];
  sdkVersion?: string;
  features?: string[];
  canHost?: boolean;          // Video chat capability
}

export interface ShowroomDetail extends Showroom {
  products?: Product[];
  media?: MediaItem[];
}

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  modelURL?: string;          // 3D model URL
  textureURL?: string;
  shopifyProductId?: string;  // Shopify product ID for per-product checkout linking
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Organization Types (Multi-tenancy)
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Media Types
// ============================================================================

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'youtube';
  url: string;
  thumbnail?: string;
}

// ============================================================================
// Analytics Types (Future - when backend implements)
// ============================================================================

export interface PerformanceMetrics {
  fps?: { avg: number; min: number; max: number };
  loadTime?: { avg: number; p50: number; p95: number };
  memoryUsage?: { avg: number; peak: number };
  timeRange?: { start: string; end: string };
}

export interface EventFlow {
  funnel: Array<{
    step: string;
    count: number;
    dropoff: number;  // Percentage
  }>;
  conversionRate: number;
  insights?: string[];
}
