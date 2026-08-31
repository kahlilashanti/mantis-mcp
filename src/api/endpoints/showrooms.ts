/**
 * Showrooms API Endpoints
 * "Showroom" = Store/Merchant in Mantis terminology
 */

import type { MantisAPIClient } from '../client.js';
import type { APIResponse, Showroom, ShowroomDetail } from '../types.js';

export class ShowroomsAPI {
  constructor(private client: MantisAPIClient) {}

  /**
   * Get showroom details by ID
   * Used by: validateSetup tool
   */
  async getShowroom(showroomId: string): Promise<APIResponse<ShowroomDetail>> {
    return this.client.get<ShowroomDetail>(`/showrooms/${showroomId}`);
  }

  /**
   * List all showrooms (Admin only)
   */
  async listShowrooms(): Promise<APIResponse<Showroom[]>> {
    return this.client.get<Showroom[]>('/showrooms');
  }

  /**
   * Create new showroom
   */
  async createShowroom(data: {
    name: string;
    description?: string;
    organizationId?: string;
  }): Promise<APIResponse<Showroom>> {
    return this.client.post<Showroom>('/showrooms', data);
  }

  /**
   * Update showroom
   */
  async updateShowroom(
    showroomId: string,
    data: Partial<Showroom>
  ): Promise<APIResponse<Showroom>> {
    return this.client.put<Showroom>(`/showrooms/${showroomId}`, data);
  }

  /**
   * Delete showroom
   */
  async deleteShowroom(showroomId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/showrooms/${showroomId}`);
  }

  /**
   * Get showroom configuration
   * Returns video chat capabilities, SDK config, etc.
   */
  async getConfig(showroomId: string): Promise<APIResponse<any>> {
    return this.client.get(`/showrooms/${showroomId}/config`);
  }

  /**
   * Check if user can host video chat in showroom
   */
  async canHost(showroomId: string): Promise<APIResponse<{ canHost: boolean }>> {
    return this.client.get(`/showrooms/${showroomId}/can-host`);
  }
}
