/**
 * Authentication API Endpoints
 * Guest accounts and token management
 */

import type { MantisAPIClient } from '../client.js';
import type { APIResponse } from '../types.js';

export interface GuestAccountResponse {
  fullName: string;
  token: string;
  ttl: number;              // Unix timestamp when token expires
}

export class AuthAPI {
  constructor(private client: MantisAPIClient) {}

  /**
   * Create guest account
   * Returns JWT token valid for 6 hours
   * No authentication required (public endpoint)
   */
  async createGuestAccount(fullName: string): Promise<APIResponse<GuestAccountResponse>> {
    return this.client.post<GuestAccountResponse>('/accounts/guest', { fullName });
  }

  /**
   * Helper: Check if token is expired
   */
  isTokenExpired(ttl: number): boolean {
    return Date.now() / 1000 > ttl;
  }

  /**
   * Helper: Get token expiration time in human-readable format
   */
  getTokenExpirationTime(ttl: number): string {
    const expiresAt = new Date(ttl * 1000);
    return expiresAt.toLocaleString();
  }
}
