/**
 * Mantis API Client - Main Entry Point
 * Cloud-agnostic REST client for Mantis backend
 *
 * Usage:
 *   const api = createMantisAPI({
 *     baseURL: process.env.MANTIS_API_URL,
 *     authToken: process.env.MANTIS_AUTH_TOKEN
 *   });
 *
 *   const result = await api.showrooms.getShowroom('showroom_123');
 */

import { MantisAPIClient } from './client.js';
import { ShowroomsAPI } from './endpoints/showrooms.js';
import type { APIConfig } from './types.js';

export class MantisAPI {
  private client: MantisAPIClient;

  // Endpoint modules
  public showrooms: ShowroomsAPI;

  constructor(config: APIConfig) {
    this.client = new MantisAPIClient(config);
    this.showrooms = new ShowroomsAPI(this.client);
  }

  /**
   * Update auth token (e.g., after login)
   */
  setAuthToken(token: string): void {
    this.client.setAuthToken(token);
  }

  /**
   * Get underlying HTTP client (for custom requests)
   */
  getClient(): MantisAPIClient {
    return this.client;
  }
}

/**
 * Factory function to create API client
 */
export function createMantisAPI(config: APIConfig): MantisAPI {
  return new MantisAPI(config);
}

// Re-export types for convenience
export * from './types.js';
export { MantisAPIClient } from './client.js';
