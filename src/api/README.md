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

// Get showroom details
const result = await api.showrooms.getShowroom('showroom_123');

if (result.error) {
  console.error('API error:', result.error.message);
} else {
  console.log('Showroom:', result.data);
}

// Update auth token
api.setAuthToken('new-token');
```

## Architecture

```
src/api/
├── client.ts           # HTTP client (fetch-based)
├── types.ts            # TypeScript types
├── endpoints/
│   └── showrooms.ts    # Showroom endpoints
└── index.ts            # Main export
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
