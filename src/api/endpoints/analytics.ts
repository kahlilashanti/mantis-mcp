/**
 * Analytics API Endpoints
 * Performance metrics and event tracking
 *
 * NOTE: These endpoints don't exist in the backend yet.
 * This module is future-ready for when analytics endpoints are implemented.
 * Currently, MCP tools using these will fall back to mock data.
 */

import type { MantisAPIClient } from '../client.js';
import type { APIResponse, PerformanceMetrics, EventFlow } from '../types.js';

export class AnalyticsAPI {
  constructor(private client: MantisAPIClient) {}

  /**
   * Get performance metrics for a showroom
   * Future endpoint: GET /showrooms/{showroomId}/metrics
   */
  async getMetrics(
    showroomId: string,
    options?: {
      duration?: number;        // Time window in minutes
      metrics?: string[];       // Specific metrics to fetch
    }
  ): Promise<APIResponse<PerformanceMetrics>> {
    const queryParams: Record<string, string> = {};

    if (options?.duration) {
      queryParams.duration = options.duration.toString();
    }
    if (options?.metrics) {
      queryParams.metrics = options.metrics.join(',');
    }

    return this.client.get<PerformanceMetrics>(
      `/showrooms/${showroomId}/metrics`,
      queryParams
    );
  }

  /**
   * Get event flow analytics (conversion funnels, user journeys)
   * Future endpoint: GET /showrooms/{showroomId}/analytics/flows
   */
  async getEventFlow(
    showroomId: string,
    options?: {
      timeRange?: string;       // e.g., '7d', '30d'
    }
  ): Promise<APIResponse<EventFlow>> {
    const queryParams: Record<string, string> = {};

    if (options?.timeRange) {
      queryParams.timeRange = options.timeRange;
    }

    return this.client.get<EventFlow>(
      `/showrooms/${showroomId}/analytics/flows`,
      queryParams
    );
  }

  /**
   * Get raw event logs for a showroom
   * Future endpoint: GET /showrooms/{showroomId}/analytics/events
   */
  async getEvents(
    showroomId: string,
    options?: {
      limit?: number;
      offset?: number;
      eventType?: string;
    }
  ): Promise<APIResponse<any[]>> {
    const queryParams: Record<string, string> = {};

    if (options?.limit) {
      queryParams.limit = options.limit.toString();
    }
    if (options?.offset) {
      queryParams.offset = options.offset.toString();
    }
    if (options?.eventType) {
      queryParams.eventType = options.eventType;
    }

    return this.client.get<any[]>(
      `/showrooms/${showroomId}/analytics/events`,
      queryParams
    );
  }
}
