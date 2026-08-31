/**
 * Cloud-Agnostic HTTP Client
 * Works with any REST API (AWS Lambda, Vercel, Railway, etc.)
 */

import type { APIConfig, APIResponse, APIError } from './types.js';

export class MantisAPIClient {
  private config: Required<APIConfig>;

  constructor(config: APIConfig) {
    this.config = {
      baseURL: config.baseURL.replace(/\/$/, ''), // Remove trailing slash
      authToken: config.authToken || '',
      timeout: config.timeout || 30000,
    };
  }

  /**
   * Generic HTTP request handler
   * Handles auth, errors, and response parsing
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: {
      body?: any;
      headers?: Record<string, string>;
      queryParams?: Record<string, string>;
    } = {}
  ): Promise<APIResponse<T>> {
    const url = this.buildURL(path, options.queryParams);
    const headers = this.buildHeaders(options.headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response body
      const contentType = response.headers.get('content-type');
      const isJSON = contentType?.includes('application/json');
      const rawBody = isJSON ? await response.json() : await response.text();

      // Handle Lambda response format: { statusCode, body: JSON.stringify(...) }
      // Also handles standard REST: direct JSON response
      const data = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
      const actualData = data.body ? JSON.parse(data.body) : data;

      if (!response.ok) {
        return {
          statusCode: response.status,
          error: {
            code: actualData.code,
            message: actualData.msg || actualData.message || 'Request failed',
            details: actualData,
          },
        };
      }

      return {
        statusCode: response.status,
        data: actualData,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      return {
        statusCode: 500,
        error: {
          message: error.name === 'AbortError' ? 'Request timeout' : error.message,
          details: error,
        },
      };
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildURL(path: string, queryParams?: Record<string, string>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.config.baseURL}${cleanPath}`;

    if (!queryParams || Object.keys(queryParams).length === 0) {
      return url;
    }

    const params = new URLSearchParams(queryParams);
    return `${url}?${params.toString()}`;
  }

  /**
   * Build headers with auth token
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    return headers;
  }

  // ========================================================================
  // Public HTTP Methods
  // ========================================================================

  async get<T>(path: string, queryParams?: Record<string, string>): Promise<APIResponse<T>> {
    return this.request<T>('GET', path, { queryParams });
  }

  async post<T>(path: string, body?: any): Promise<APIResponse<T>> {
    return this.request<T>('POST', path, { body });
  }

  async put<T>(path: string, body?: any): Promise<APIResponse<T>> {
    return this.request<T>('PUT', path, { body });
  }

  async delete<T>(path: string): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', path);
  }

  // ========================================================================
  // Configuration Helpers
  // ========================================================================

  /**
   * Update auth token (e.g., after login or token refresh)
   */
  setAuthToken(token: string): void {
    this.config.authToken = token;
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<APIConfig>> {
    return { ...this.config };
  }
}
