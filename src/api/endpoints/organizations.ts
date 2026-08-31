/**
 * Organizations API Endpoints
 * Multi-tenant organization management
 */

import type { MantisAPIClient } from '../client.js';
import type { APIResponse, Organization, Showroom, Product } from '../types.js';

export class OrganizationsAPI {
  constructor(private client: MantisAPIClient) {}

  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string): Promise<APIResponse<Organization>> {
    return this.client.get<Organization>(`/organizations/${organizationId}`);
  }

  /**
   * List all organizations (Admin only)
   */
  async listOrganizations(): Promise<APIResponse<Organization[]>> {
    return this.client.get<Organization[]>('/organizations');
  }

  /**
   * Create new organization
   */
  async createOrganization(data: {
    name: string;
    status?: 'active' | 'inactive';
  }): Promise<APIResponse<Organization>> {
    return this.client.post<Organization>('/organizations', data);
  }

  /**
   * Update organization
   */
  async updateOrganization(
    organizationId: string,
    data: Partial<Organization>
  ): Promise<APIResponse<Organization>> {
    return this.client.put<Organization>(`/organizations/${organizationId}`, data);
  }

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/organizations/${organizationId}`);
  }

  /**
   * Get all showrooms belonging to organization
   */
  async getShowrooms(organizationId: string): Promise<APIResponse<Showroom[]>> {
    return this.client.get<Showroom[]>(`/organizations/${organizationId}/showrooms`);
  }

  /**
   * Get all products belonging to organization
   */
  async getProducts(organizationId: string): Promise<APIResponse<Product[]>> {
    return this.client.get<Product[]>(`/organizations/${organizationId}/products`);
  }
}
