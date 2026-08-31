/**
 * API Configuration from Environment
 * Loads settings from environment variables
 */

import type { APIConfig } from '../api/types.js';

/**
 * Get API configuration from environment variables
 *
 * Required:
 *   MANTIS_API_URL - Base URL of Mantis API (AWS, Vercel, etc.)
 *
 * Optional:
 *   MANTIS_AUTH_TOKEN - Bearer token for authenticated requests
 *   MANTIS_API_TIMEOUT - Request timeout in ms (default: 30000)
 */
export function getAPIConfig(): APIConfig {
  const baseURL = process.env.MANTIS_API_URL;

  if (!baseURL) {
    throw new Error(
      'MANTIS_API_URL environment variable is required. ' +
      'Set it to your Mantis API base URL (e.g., https://api.mantisxr.com)'
    );
  }

  return {
    baseURL,
    authToken: process.env.MANTIS_AUTH_TOKEN,
    timeout: process.env.MANTIS_API_TIMEOUT
      ? parseInt(process.env.MANTIS_API_TIMEOUT, 10)
      : 30000,
  };
}

/**
 * Check if API is configured
 */
export function isAPIConfigured(): boolean {
  return !!process.env.MANTIS_API_URL;
}

/**
 * Get safe config info for logging (without sensitive data)
 */
export function getConfigInfo(): string {
  const baseURL = process.env.MANTIS_API_URL || '(not configured)';
  const hasToken = !!process.env.MANTIS_AUTH_TOKEN;

  return `API URL: ${baseURL}, Auth: ${hasToken ? 'configured' : 'none'}`;
}
