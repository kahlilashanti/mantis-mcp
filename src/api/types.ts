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

export interface Showroom {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  config?: ShowroomConfig;
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
