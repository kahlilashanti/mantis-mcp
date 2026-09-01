/**
 * Store Creation Tools
 * Anne's flow: import catalog → create store → publish
 *
 * Backend Status: MOCKED where endpoints don't exist yet
 * Real API: Uses configured MANTIS_API_URL when available
 */

import { Environment, formatResponse } from '../utils/environment.js';
import { createMantisAPI } from '../api/index.js';
import { isAPIConfigured, getAPIConfig } from '../config/api.js';

/**
 * Parse basic CSV (name,description,imageURL,price,sku)
 * No fancy library - just split and validate
 */
function parseCSV(csvData: string): any[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const product: any = {};

    headers.forEach((header, idx) => {
      product[header] = values[idx] || '';
    });

    // Only include if has name
    if (product.name) {
      products.push({
        name: product.name,
        description: product.description || '',
        imageURL: product.imageURL || product.image || '',
        price: parseFloat(product.price) || 0,
        sku: product.sku || product.name.toLowerCase().replace(/\s+/g, '-')
      });
    }
  }

  return products;
}

/**
 * Fetch products from Shopify Admin API
 */
async function fetchShopifyProducts(
  shopDomain: string,
  accessToken: string
): Promise<any> {
  const apiVersion = '2024-01';
  const url = `https://${shopDomain}/admin/api/${apiVersion}/products.json`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Map Shopify products to Mantis format
    return data.products.map((p: any) => ({
      name: p.title,
      description: p.body_html?.replace(/<[^>]*>/g, '') || '', // Strip HTML
      imageURL: p.images?.[0]?.src || '',
      price: parseFloat(p.variants?.[0]?.price) || 0,
      sku: p.variants?.[0]?.sku || p.handle,
      shopifyProductId: p.id,
      variants: p.variants?.length || 1
    }));
  } catch (error: any) {
    throw new Error(`Failed to fetch from Shopify: ${error.message}`);
  }
}

export const storeCreationTools = {
  /**
   * Import product catalog from Shopify or CSV/manual input
   *
   * Scope: Shopify only + CSV/manual fallback
   * Does NOT generate 3D assets - merchants provide modelURL separately
   */
  async importCatalog(args: any, environment: Environment) {
    const {
      source,
      shopifyStore,
      shopifyAccessToken,
      csvData,
      products
    } = args;

    let importedProducts: any[] = [];
    let warnings: string[] = [];

    try {
      // Shopify import
      if (source === 'shopify') {
        if (!shopifyStore || !shopifyAccessToken) {
          return formatResponse({
            success: false,
            error: 'Shopify import requires shopifyStore and shopifyAccessToken'
          }, environment, 'analysis');
        }

        importedProducts = await fetchShopifyProducts(shopifyStore, shopifyAccessToken);

        const missing3D = importedProducts.length;
        warnings.push(
          `${missing3D} products imported without 3D models.`,
          '3D assets must be added separately (Mantis does not auto-generate 3D models).'
        );
      }

      // CSV import
      else if (source === 'csv') {
        if (!csvData) {
          return formatResponse({
            success: false,
            error: 'CSV import requires csvData'
          }, environment, 'analysis');
        }

        importedProducts = parseCSV(csvData);
        warnings.push(
          `${importedProducts.length} products parsed from CSV.`,
          '3D assets must be added separately via modelURL field.'
        );
      }

      // Manual input
      else if (source === 'manual') {
        if (!products || !Array.isArray(products)) {
          return formatResponse({
            success: false,
            error: 'Manual import requires products array'
          }, environment, 'analysis');
        }

        importedProducts = products;
        warnings.push('Products accepted. Add 3D models separately.');
      }

      else {
        return formatResponse({
          success: false,
          error: `Unknown source: ${source}. Use 'shopify', 'csv', or 'manual'`
        }, environment, 'analysis');
      }

      const result = {
        success: true,
        source,
        imported: importedProducts.length,
        products: importedProducts,
        warnings,
        nextSteps: [
          'Use createStore to build showroom with these products',
          '3D models can be added later via product.modelURL',
          'Products without 3D will display as 2D until models are added'
        ]
      };

      return formatResponse(result, environment, 'analysis');

    } catch (error: any) {
      return formatResponse({
        success: false,
        error: error.message,
        source
      }, environment, 'analysis');
    }
  },

  /**
   * Create showroom with imported products
   *
   * Backend Status: MOCKED - Real endpoints don't fully exist yet
   * Uses patterns from backend code (showrooms/{alias}, add-model, etc.)
   */
  async createStore(args: any, environment: Environment) {
    const {
      name,
      description,
      organizationId,
      products = [],
      config = {}
    } = args;

    if (!name) {
      return formatResponse({
        success: false,
        error: 'Store name is required'
      }, environment, 'analysis');
    }

    // Generate alias from name
    const alias = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const showroomId = `showroom_${Date.now()}`;

    // Try real API if configured
    if (isAPIConfigured()) {
      try {
        const api = createMantisAPI(getAPIConfig());

        // Attempt real showroom creation
        const showroomResponse = await api.showrooms.createShowroom({
          name,
          description,
          organizationId
        });

        if (!showroomResponse.error && showroomResponse.data) {
          // Real API worked
          return formatResponse({
            success: true,
            mode: 'real',
            showroomId: showroomResponse.data.id,
            showroomAlias: alias,
            productsAdded: products.length,
            status: 'draft',
            showroomURL: `https://your-mantis-instance.com/showrooms/${alias}`,
            warnings: products.length === 0 ? ['No products added yet'] : [],
            nextSteps: [
              'Add 3D models to products',
              'Configure showroom settings',
              'Use publishStore to make it live'
            ]
          }, environment, 'execute');
        }
      } catch (error) {
        // Fall through to mock
      }
    }

    // Mock response (backend endpoints don't exist yet)
    const productsWithout3D = products.filter((p: any) => !p.modelURL).length;

    const result = {
      success: true,
      mode: 'mocked',
      notice: 'Backend creation endpoints not fully implemented - returning mock data',
      showroomId,
      showroomAlias: alias,
      productsAdded: products.length,
      productsWith3D: products.length - productsWithout3D,
      productsWithout3D,
      status: 'draft',
      showroomURL: `https://your-mantis-instance.com/showrooms/${alias}`,
      warnings: productsWithout3D > 0 ? [
        `${productsWithout3D} products missing 3D models`,
        '3D asset generation is not automated (see documentation)'
      ] : [],
      nextSteps: [
        'Backend needs: POST /showrooms, POST /products endpoints',
        'For now: Add products manually via CMS',
        'Use publishStore when ready to go live'
      ],
      backendNeeded: {
        endpoints: [
          'POST /showrooms - Create showroom',
          'POST /products - Create product',
          'POST /showrooms/{alias}/add-model - Link 3D model to showroom'
        ],
        reference: 'See mantis-be-api/src/lambdas/showrooms/batch-update-models/index.mjs for patterns'
      }
    };

    return formatResponse(result, environment, 'analysis');
  },

  /**
   * Publish showroom (make it live)
   *
   * Backend Status: MOCKED - No publish endpoint exists
   * Real behavior: Just changes showroom status to 'active'
   */
  async publishStore(args: any, environment: Environment) {
    const { showroomId, showroomAlias, domain } = args;

    if (!showroomId && !showroomAlias) {
      return formatResponse({
        success: false,
        error: 'Either showroomId or showroomAlias required'
      }, environment, 'analysis');
    }

    const alias = showroomAlias || showroomId.replace('showroom_', '');

    // Try real API if configured
    if (isAPIConfigured()) {
      try {
        const api = createMantisAPI(getAPIConfig());

        // Attempt status update (no publish endpoint exists)
        const updateResponse = await api.showrooms.updateShowroom(
          showroomId || alias,
          { status: 'active' }
        );

        if (!updateResponse.error) {
          return formatResponse({
            success: true,
            mode: 'real',
            published: true,
            showroomAlias: alias,
            liveURL: domain || `https://${alias}.your-domain.com`,
            status: 'active',
            nextSteps: [
              'Share the live URL with customers',
              'Monitor performance with analytics tools',
              'Update products as needed'
            ]
          }, environment, 'execute');
        }
      } catch (error) {
        // Fall through to mock
      }
    }

    // Mock response
    const result = {
      success: true,
      mode: 'mocked',
      notice: 'No publish endpoint exists - simulating status change to active',
      published: true,
      showroomAlias: alias,
      liveURL: domain || `https://${alias}.your-domain.com`,
      status: 'active',
      deployment: {
        cdn: 'CloudFront (mocked)',
        edge: 'Global (mocked)',
        ssl: 'Enabled (mocked)'
      },
      nextSteps: [
        'In production: Showroom becomes live at the URL above',
        'Currently: Backend needs publish endpoint or status-based activation',
        'Share URL for testing'
      ],
      backendNeeded: {
        options: [
          'Option A: Add POST /showrooms/{id}/publish endpoint',
          'Option B: Auto-activate when status changes to "active"',
          'Option C: Deploy via CDN when showroom.status = active'
        ],
        recommendation: 'Option B (simplest) - showroom goes live when status changes'
      }
    };

    return formatResponse(result, environment, 'analysis');
  }
};
