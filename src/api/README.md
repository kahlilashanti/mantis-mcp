# Mantis API Client

Cloud-agnostic REST client for Mantis backend. Works with AWS, Vercel, or any HTTP API.

## Setup

```bash
# Copy example env file
cp .env.example .env

# Set your API URL
MANTIS_API_URL=https://your-api-url.com
MANTIS_AUTH_TOKEN=your-token  # Optional
```

## Usage

```typescript
import { createMantisAPI } from './api/index.js';
import { getAPIConfig } from './config/api.js';

// Create client
const api = createMantisAPI(getAPIConfig());

// Showrooms
const showroom = await api.showrooms.getShowroom('showroom_123');

// Products
const product = await api.products.getProduct('product_456');

// Organizations
const org = await api.organizations.getOrganization('org_789');

// Analytics (future endpoints)
const metrics = await api.analytics.getMetrics('showroom_123');

// Auth - Create guest account
const guest = await api.auth.createGuestAccount('John Doe');
if (!guest.error) {
  api.setAuthToken(guest.data.token);
}

// Error handling
if (showroom.error) {
  console.error('API error:', showroom.error.message);
} else {
  console.log('Showroom:', showroom.data);
}
```

## Architecture

```
src/api/
├── client.ts              # HTTP client (fetch-based)
├── types.ts               # TypeScript types
├── endpoints/
│   ├── showrooms.ts       # Showroom endpoints
│   ├── products.ts        # Product/catalog endpoints
│   ├── organizations.ts   # Multi-tenant org endpoints
│   ├── analytics.ts       # Performance & event tracking (future)
│   └── auth.ts            # Guest accounts & authentication
└── index.ts               # Main export
```

## Response Format

All endpoints return:
```typescript
{
  statusCode: number;
  data?: T;              // Success response
  error?: {              // Error response
    code?: string;
    message: string;
    details?: any;
  };
}
```

## Adding Endpoints

```typescript
// 1. Add types to types.ts
export interface Product { id: string; name: string; }

// 2. Create endpoint module
export class ProductsAPI {
  constructor(private client: MantisAPIClient) {}

  async getProduct(id: string) {
    return this.client.get<Product>(`/products/${id}`);
  }
}

// 3. Add to MantisAPI class in index.ts
export class MantisAPI {
  public products: ProductsAPI;

  constructor(config: APIConfig) {
    this.products = new ProductsAPI(this.client);
  }
}
```

## Migration Notes

**Current**: AWS Lambda + API Gateway
**Future**: Vercel, Railway, or custom server

No code changes needed - just update `MANTIS_API_URL` environment variable.
