/**
 * Products API Endpoints
 * Catalog management with 3D models
 */

import type { MantisAPIClient } from '../client.js';
import type { APIResponse, Product } from '../types.js';

export class ProductsAPI {
  constructor(private client: MantisAPIClient) {}

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<APIResponse<Product>> {
    return this.client.get<Product>(`/products/${productId}`);
  }

  /**
   * List all products (Admin only)
   */
  async listProducts(): Promise<APIResponse<Product[]>> {
    return this.client.get<Product[]>('/products');
  }

  /**
   * Get products for an organization
   */
  async getOrganizationProducts(organizationId: string): Promise<APIResponse<Product[]>> {
    return this.client.get<Product[]>(`/organizations/${organizationId}/products`);
  }

  /**
   * Create new product
   */
  async createProduct(data: {
    name: string;
    description?: string;
    organizationId?: string;
    modelURL?: string;
    metadata?: Record<string, any>;
  }): Promise<APIResponse<Product>> {
    return this.client.post<Product>('/products', data);
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    data: Partial<Product>
  ): Promise<APIResponse<Product>> {
    return this.client.put<Product>(`/products/${productId}`, data);
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<APIResponse<void>> {
    return this.client.delete<void>(`/products/${productId}`);
  }

  /**
   * Add 3D model to product
   * Returns pre-signed S3 URL for upload
   */
  async addModel(
    organizationId: string,
    productId: string,
    data: { fileName: string; fileType: string }
  ): Promise<APIResponse<{ uploadURL: string; modelURL: string }>> {
    return this.client.put(
      `/organizations/${organizationId}/products/${productId}/add-model`,
      data
    );
  }

  /**
   * Fetch product from 3rd party API (e.g., Arsenal)
   */
  async fetchFromThirdParty(productId: string): Promise<APIResponse<Product>> {
    return this.client.get<Product>(`/product-fetch/${productId}`);
  }
}
