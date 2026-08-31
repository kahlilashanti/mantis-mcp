# Mantis MCP Implementation Status & Roadmap

**Last Updated**: 2026-08-28
**Status**: Mock/Prototype → Production Migration Needed

---

## Executive Summary

The Mantis MCP Server currently has **11 tools**, of which:
- ✅ **4 are real/working** (code generation, error pattern matching)
- ⚠️ **7 return mocked data** (validation, testing, monitoring, debugging)

The mocked tools were built without access to the real Mantis CMS/SDK backend API. This document maps the path from mock to real for each tool.

---

## Current Implementation Status

### ✅ Fully Functional (Real Implementation)

| Tool | Status | What It Does | Dependencies |
|------|--------|--------------|--------------|
| `createMantisIntegration` | **REAL** | Generates production-ready code for React/Vue/Next/Shopify/Vanilla | Template engine only |
| `generateEventHandler` | **REAL** | Generates event handler code snippets | Template engine only |
| `analyzeConsoleErrors` | **REAL** | Pattern-matches 15+ error types with solutions | Regex patterns in `src/utils/error-patterns.ts` |
| Environment Detection | **REAL** | Detects Claude Desktop vs Code, adapts responses | Process inspection |

**Value**: These tools work today and provide genuine value (code scaffolding, documentation).

---

### ⚠️ Mocked (Returns Synthetic Data)

| Tool | Mock Evidence | Impact |
|------|---------------|--------|
| `installMantisSDK` | Generates text, doesn't install packages | Low (instructions still useful) |
| `validateSetup` | `Math.random() > 0.7` for warnings (setup.ts:125) | Medium (misleading) |
| `debugPostMessage` | Hardcoded scenarios, no browser capture | High (not actually debugging) |
| `checkBrowserCompatibility` | Hardcoded compatibility matrices | Medium (static data is okay) |
| `testMantisEvent` | `setTimeout(Math.random() * 100 + 50)` (testing.ts:79) | High (fake test results) |
| `simulateUserFlow` | Randomized success rates (90-99%) | High (fake conversion data) |
| `getPerformanceMetrics` | `fps: Math.random() * 20 + 40` (monitoring.ts:88-99) | High (completely fake metrics) |
| `analyzeEventFlow` | Synthetic conversion funnels | High (fake analytics) |

**Impact**: Users calling these tools get plausible-looking but entirely fabricated data.

---

## What's Missing: Real Mantis CMS/SDK API

### Current SDK Interface

**Location**: `src/sdk-interface/`

```typescript
// sdk-types.ts - Interface definitions only
interface MantisSDK {
  loadModel(modelId: string): Promise<void>;
  getCart(): Promise<CartItem[]>;
  getMetrics(): Promise<PerformanceMetrics>;
  // ... etc
}

// mock-sdk.ts - Fake implementation
async getMetrics(): Promise<PerformanceMetrics> {
  return {
    fps: Math.floor(Math.random() * 20) + 40,  // ❌ FAKE
    loadTime: Math.floor(Math.random() * 2000) + 500,  // ❌ FAKE
    // ...
  };
}
```

**No Real Implementation Exists:**
- No HTTP client
- No API base URL configuration
- No authentication layer
- No actual Mantis SDK dependency in `package.json`

### What We Need to Know

**Before we can implement real integrations, we need:**

1. **Mantis CMS API Documentation**
   - REST endpoints? GraphQL? gRPC?
   - Base URL (e.g., `https://api.mantisxr.com`)
   - Available endpoints and methods
   - Request/response schemas

2. **Authentication Model**
   - API keys? OAuth? JWT?
   - Where do merchants obtain credentials?
   - How is authentication passed? (Header? Query param?)

3. **Real SDK Package**
   - Is there a published `@mantis-3d/sdk` npm package?
   - If so, what methods does it expose?
   - Does it include an API client or just browser SDK?

4. **Multi-Tenancy Model**
   - How are stores/merchants identified? (Store ID? Domain?)
   - How is data scoped per merchant?
   - Rate limiting per tenant?

---

## Tool-by-Tool Migration Path

### 1. `installMantisSDK` (Setup)

**Current Implementation**: Generates `.npmrc` text and installation commands (src/tools/setup.ts:16-86)

**Migration Path**:
- ✅ **Keep as-is** - Generating instructions is the right approach
- Optional: Could validate that `authToken` is valid by hitting a `/validate-token` endpoint

**API Needed**:
- `POST /api/v1/auth/validate-token` (optional)
  - Request: `{ token: string }`
  - Response: `{ valid: boolean, scope: string[] }`

**Priority**: Low (current implementation is fine)

---

### 2. `validateSetup` (Setup)

**Current Implementation**: Returns randomized pass/warning/fail states (src/tools/setup.ts:92-155)

```typescript
// ❌ FAKE
if (Math.random() > 0.7) {
  checks.push({ status: 'warning', details: 'WebGL 2.0 support recommended' });
}
```

**What It Should Do**:
- Verify SDK is installed in `node_modules`
- Validate API key is active
- Check store configuration in CMS
- Verify allowed origins match CMS settings

**API Needed**:
- `GET /api/v1/stores/{storeId}/config`
  - Headers: `Authorization: Bearer {apiKey}`
  - Response:
    ```json
    {
      "storeId": "store_123",
      "allowedOrigins": ["https://example.com"],
      "sdkVersion": "1.4.2",
      "features": ["cart", "analytics"],
      "status": "active"
    }
    ```

**Implementation**:
- Read `package.json` to check SDK version
- Call CMS API to validate key and get config
- Compare local setup vs CMS config
- Return real validation results

**Priority**: **HIGH** - Critical for merchant onboarding

---

### 3. `debugPostMessage` (Debugging)

**Current Implementation**: Returns hardcoded postMessage error scenarios (src/tools/debugging.ts:12-187)

```typescript
// ❌ FAKE - Hardcoded scenarios
const scenarios = [
  { origin: 'https://app.mantisxr.com', expectedOrigin: 'https://my-store.com' }
];
```

**What It Should Do**:
- This tool fundamentally can't work without browser automation
- Option A: Remove it (not possible from MCP server)
- Option B: Provide documentation/patterns (current approach is fine)
- Option C: Build browser extension that sends debug data to MCP server

**API Needed**: None (browser automation not feasible from Node.js MCP server)

**Alternative Approach**:
- Keep as educational tool showing common error patterns
- Add disclaimer: "Common scenarios - for live debugging, use browser DevTools"

**Priority**: Low (keep as reference implementation)

---

### 4. `checkBrowserCompatibility` (Debugging)

**Current Implementation**: Returns hardcoded browser compatibility matrices (src/tools/debugging.ts:189-290)

**What It Should Do**:
- Current approach (static compatibility data) is fine
- Could pull from Can I Use API for real-time data

**API Needed**:
- Optional: `GET https://caniuse.com/api` (third-party)
- Or maintain static data (current approach is acceptable)

**Priority**: Low (current implementation is acceptable)

---

### 5. `testMantisEvent` (Testing)

**Current Implementation**: Simulates events with fake delays and success rates (src/tools/testing.ts:61-100)

```typescript
// ❌ FAKE
await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
const actualResponse = generateMockEventResponse(event, data, eventDef);
```

**What It Should Do**:
- Send real events to a test environment
- Capture actual responses from Mantis SDK
- Validate event data structures

**API Needed**:
- **Option A**: Test environment endpoint
  - `POST /api/v1/test/events`
  - Request: `{ storeId: string, event: string, data: any }`
  - Response: `{ success: boolean, response: any, executionTime: number }`

- **Option B**: Sandbox SDK mode
  - Initialize real SDK in sandbox mode
  - Fire events, capture responses
  - Return actual results

**Implementation**:
- For server-side: Use test API endpoint
- For client-side: Would need browser automation (not feasible)

**Priority**: **MEDIUM** - Useful for development, but needs test infrastructure

---

### 6. `simulateUserFlow` (Testing)

**Current Implementation**: Generates fake user journey data with random success rates (src/tools/testing.ts:103-200+)

```typescript
// ❌ FAKE
const stepSuccess = Math.random() > 0.1; // 90% success rate
totalTime += Math.random() * 1000 + 500;
```

**What It Should Do**:
- Execute real user flows in test environment
- Capture actual timing and success/failure
- Identify real bottlenecks

**API Needed**:
- `POST /api/v1/test/flows`
  - Request:
    ```json
    {
      "storeId": "store_123",
      "flow": ["load-experience", "click-model", "add-to-cart"],
      "environment": "staging"
    }
    ```
  - Response:
    ```json
    {
      "steps": [
        { "action": "load-experience", "success": true, "duration": 1234 },
        { "action": "click-model", "success": true, "duration": 456 }
      ],
      "totalTime": 1690,
      "success": true
    }
    ```

**Alternative**: Playwright/Puppeteer integration for real browser testing (complex)

**Priority**: **LOW** - Nice to have, requires significant test infrastructure

---

### 7. `getPerformanceMetrics` (Monitoring)

**Current Implementation**: Returns completely random performance data (src/tools/monitoring.ts:58-99)

```typescript
// ❌ FAKE
fps: Math.floor(Math.random() * 20) + 40,  // 40-60 FPS
loadTime: Math.floor(Math.random() * 2000) + 500,  // 0.5-2.5s
memoryUsage: Math.floor(Math.random() * 50) + 20,  // 20-70MB
```

**What It Should Do**:
- Retrieve real performance metrics from CMS analytics
- Return actual FPS, load times, memory usage per store
- Historical data and trends

**API Needed**:
- `GET /api/v1/stores/{storeId}/metrics`
  - Headers: `Authorization: Bearer {apiKey}`
  - Query: `?duration=60&metrics=fps,load-time,memory`
  - Response:
    ```json
    {
      "storeId": "store_123",
      "timeRange": { "start": "2026-08-28T10:00:00Z", "end": "2026-08-28T11:00:00Z" },
      "metrics": {
        "fps": { "avg": 58, "min": 42, "max": 60, "samples": [...] },
        "loadTime": { "avg": 1234, "p50": 1100, "p95": 2300 },
        "memory": { "avg": 45, "peak": 67 }
      }
    }
    ```

**Implementation**:
- Call CMS analytics API with merchant's API key
- Return real performance data
- Cache results (5min TTL) to avoid rate limits

**Priority**: **HIGH** - Core value prop for monitoring/optimization

---

### 8. `analyzeEventFlow` (Monitoring)

**Current Implementation**: Generates fake conversion funnels and user behavior (src/tools/monitoring.ts:37-53)

**What It Should Do**:
- Retrieve real event flow data from CMS analytics
- Show actual conversion rates, drop-offs, user paths

**API Needed**:
- `GET /api/v1/stores/{storeId}/analytics/flows`
  - Headers: `Authorization: Bearer {apiKey}`
  - Query: `?timeRange=7d`
  - Response:
    ```json
    {
      "storeId": "store_123",
      "timeRange": "7d",
      "funnel": [
        { "step": "page-view", "count": 10000, "dropoff": 0 },
        { "step": "experience-loaded", "count": 8500, "dropoff": 15 },
        { "step": "model-clicked", "count": 6800, "dropoff": 20 },
        { "step": "cart-opened", "count": 3400, "dropoff": 50 },
        { "step": "item-added", "count": 2720, "dropoff": 20 }
      ],
      "conversionRate": 27.2,
      "insights": ["High drop-off at cart-opened step", "..."]
    }
    ```

**Implementation**:
- Call CMS analytics API
- Return real conversion data
- Provide real insights based on actual user behavior

**Priority**: **HIGH** - Core value prop for optimization

---

## Required API Surface (Summary)

### Auth & Configuration
```
POST   /api/v1/auth/validate-token         # Validate API key
GET    /api/v1/stores/{storeId}/config     # Get store configuration
PUT    /api/v1/stores/{storeId}/config     # Update store config
```

### Performance & Analytics (Critical)
```
GET    /api/v1/stores/{storeId}/metrics          # Real-time performance data
GET    /api/v1/stores/{storeId}/analytics/flows  # User behavior & conversion funnels
GET    /api/v1/stores/{storeId}/analytics/events # Event logs
```

### Testing (Nice to Have)
```
POST   /api/v1/test/events                 # Test event execution
POST   /api/v1/test/flows                  # Test user flow execution
GET    /api/v1/test/environments           # List test environments
```

### Catalog & Publishing (For "Real Demo")
```
GET    /api/v1/stores/{storeId}/catalog    # Get product catalog
POST   /api/v1/stores/{storeId}/products   # Add product with 3D model
PUT    /api/v1/stores/{storeId}/products/{productId}  # Update product
POST   /api/v1/stores/{storeId}/publish    # Publish store changes
GET    /api/v1/stores/{storeId}/status     # Get publish status
```

---

## Authentication & Multi-Tenancy Requirements

### Current State
- `authToken` parameter exists but is only used to generate `.npmrc` text
- No token validation
- No multi-tenant scoping

### Required Implementation

**1. API Key Authentication**
```typescript
// Add to MCP server initialization
class MantisMCPServer {
  private apiClient: MantisAPIClient;

  constructor(config: { apiKey: string; baseURL: string }) {
    this.apiClient = new MantisAPIClient({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.mantisxr.com'
    });
  }
}
```

**2. Per-Request Auth**
```typescript
// Tools receive API key from MCP client configuration
async validateSetup(args: any, environment: Environment) {
  const storeConfig = await this.apiClient.get('/stores/{storeId}/config', {
    headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
  });

  // Return real validation results
}
```

**3. Configuration File**
```json
// ~/.mantis/config.json or environment variables
{
  "apiKey": "msk_live_abc123...",
  "storeId": "store_123",
  "environment": "production"
}
```

**4. MCP Server Config Updates**
```json
// claude_desktop_config.json
{
  "mcpServers": {
    "mantis-mcp": {
      "command": "node",
      "args": ["/path/to/mantis-mcp/dist/index.js"],
      "env": {
        "MANTIS_API_KEY": "msk_live_abc123...",
        "MANTIS_STORE_ID": "store_123",
        "MANTIS_API_BASE_URL": "https://api.mantisxr.com"
      }
    }
  }
}
```

**5. Multi-Tenancy Scoping**
- Every API call must include `storeId`
- API key is scoped to specific merchant account
- Rate limiting per merchant/store
- Data isolation enforced by backend

---

## Prioritization: Fastest Path to "Real Demo"

### Goal: "Agent creates and publishes a real store" demo

**Current Gap**: 0% of this flow exists

### Phase 1: Foundation (Week 1)
**Priority: CRITICAL**

1. **API Client Infrastructure**
   - Create `src/api/client.ts` with auth, error handling, rate limiting
   - Environment variable configuration
   - Connection testing tool

2. **Auth Implementation**
   - API key validation on server startup
   - Per-request authentication headers
   - Multi-tenant scoping (storeId in all requests)

3. **Real Validation Tool** (`validateSetup`)
   - Verify API key is active
   - Check store configuration exists
   - Validate SDK version compatibility
   - First tool with real API integration

**Deliverable**: MCP server connects to real Mantis CMS, validates credentials

---

### Phase 2: Core Monitoring (Week 2)
**Priority: HIGH**

4. **Real Performance Metrics** (`getPerformanceMetrics`)
   - Call `/api/v1/stores/{storeId}/metrics`
   - Return actual FPS, load times, memory usage
   - Cache results (5min TTL)

5. **Real Analytics** (`analyzeEventFlow`)
   - Call `/api/v1/stores/{storeId}/analytics/flows`
   - Return actual conversion funnels
   - Real drop-off analysis

**Deliverable**: Merchants can see real performance/analytics data via MCP tools

---

### Phase 3: "Real Store" Demo (Week 3-4)
**Priority: HIGH for Demo**

**Requires New Tools + CMS Endpoints:**

6. **New Tool: `importCatalog`**
   - `POST /api/v1/stores/{storeId}/catalog/import`
   - Import products from Shopify/CSV
   - Map products to 3D models

7. **New Tool: `createProduct`**
   - `POST /api/v1/stores/{storeId}/products`
   - Create product with 3D model reference
   - Set variants, pricing, metadata

8. **New Tool: `publishStore`**
   - `POST /api/v1/stores/{storeId}/publish`
   - Deploy store changes live
   - Return publish status and URL

9. **New Tool: `getStoreStatus`**
   - `GET /api/v1/stores/{storeId}/status`
   - Check if store is live, pending, draft
   - Return store URL, last published date

**Agent Flow**:
```
User: "Create a sneaker store with 5 products"

Agent:
1. Uses importCatalog to fetch products
2. Uses createProduct for each product (with 3D model URLs)
3. Uses validateSetup to ensure configuration is correct
4. Uses publishStore to make it live
5. Uses getStoreStatus to return live URL

Result: Real store at https://store_123.mantisxr.com with real products
```

**Deliverable**: End-to-end "catalog → store → published" demo with real CMS

---

### Phase 4: Testing Infrastructure (Optional)
**Priority: MEDIUM**

10. **Real Event Testing** (`testMantisEvent`)
    - Requires test environment API
    - Lower priority than core demo

11. **Real User Flow Testing** (`simulateUserFlow`)
    - Requires browser automation or test API
    - Lower priority

---

## Development Sequence

### Immediate Next Steps

**1. API Discovery (You provide)**
- Share Mantis CMS API documentation
- Provide test API keys
- Identify which endpoints exist vs need building

**2. Create API Client Module**
```typescript
// src/api/client.ts
export class MantisAPIClient {
  constructor(config: { apiKey: string; baseURL: string });
  async get(path: string, options?): Promise<any>;
  async post(path: string, body: any, options?): Promise<any>;
  // ... etc
}
```

**3. Update MCP Server Initialization**
```typescript
// src/index.ts
const apiClient = new MantisAPIClient({
  apiKey: process.env.MANTIS_API_KEY!,
  baseURL: process.env.MANTIS_API_BASE_URL || 'https://api.mantisxr.com',
  storeId: process.env.MANTIS_STORE_ID!
});

// Pass apiClient to all tools
```

**4. Migrate One Tool (Start with `validateSetup`)**
- Replace mock logic with real API calls
- Test with real credentials
- Validate error handling

**5. Repeat for Remaining Tools**
- Focus on high-priority tools first (metrics, analytics)
- Add new tools for catalog/publishing as needed

---

## Technical Debt & Cleanup

### Remove When Going Real
- `src/sdk-interface/mock-sdk.ts` - Delete entirely
- Mock data generators in `src/tools/*.ts` - Replace with API calls
- Hardcoded error scenarios - Keep as fallback/examples

### Add When Going Real
- `src/api/client.ts` - HTTP client with auth
- `src/api/types.ts` - API request/response types
- `src/config/env.ts` - Environment variable validation
- Error handling for API failures
- Retry logic with exponential backoff
- Rate limiting awareness
- Response caching (where appropriate)

---

## Security Considerations

### API Key Management
- Never log API keys
- Never return API keys in tool responses
- Use environment variables, not config files
- Rotate keys regularly
- Scope keys to minimum required permissions

### Data Privacy
- Don't cache sensitive merchant data
- Respect rate limits
- Log only anonymized metrics
- GDPR compliance for EU merchants

### Input Validation
- Validate all tool arguments before API calls
- Sanitize user inputs (prevent injection attacks)
- Use Zod schemas (already imported but unused)

---

## Success Metrics

### MVP Success (Phase 1-2)
- ✅ Real API authentication working
- ✅ `validateSetup` returns real data
- ✅ `getPerformanceMetrics` returns real metrics
- ✅ `analyzeEventFlow` returns real analytics
- ✅ At least 1 merchant using tools in production

### Demo Success (Phase 3)
- ✅ Agent can import catalog
- ✅ Agent can create products with 3D models
- ✅ Agent can publish store
- ✅ Store is live and functional
- ✅ End-to-end demo completed in <5 minutes

### Production Success (Long-term)
- ✅ All 11 tools using real data
- ✅ Multi-tenant support for 10+ merchants
- ✅ Error rate < 1%
- ✅ P95 response time < 2s
- ✅ Published to MCP Registry

---

## Questions for Mantis CMS Team

Before implementation can begin, we need answers to:

1. **API Documentation**
   - Where is the API documentation? (URL, Postman, OpenAPI spec)
   - Which endpoints currently exist?
   - Which endpoints need to be built?

2. **Authentication**
   - How do merchants obtain API keys?
   - What authentication scheme? (Bearer token, API key header, etc.)
   - How is multi-tenancy handled? (storeId required in all requests?)

3. **Test Environment**
   - Is there a staging/test API? (e.g., `https://api-staging.mantisxr.com`)
   - Can we get test API keys?
   - Is there test data we can use?

4. **Rate Limiting**
   - What are the rate limits per endpoint?
   - How should we handle rate limit errors?
   - Should we implement client-side rate limiting?

5. **SDK Package**
   - Is there a real `@mantis-3d/sdk` npm package?
   - If yes, what's the package name and where is it published?
   - Does it include an API client or just browser SDK?

6. **Publishing Flow**
   - How does store publishing currently work in the CMS?
   - Is there a "preview" mode before going live?
   - What's the typical publish duration?

7. **Analytics Data**
   - What analytics are currently tracked?
   - Are metrics stored per-store or globally?
   - What's the retention period for analytics data?

---

## Conclusion

**Current State**: Functional code generator + documentation tool with mocked monitoring/testing

**Target State**: Full-stack agent infrastructure with real CMS integration

**Fastest Path to Value**:
1. Wire up authentication + validation (proves integration works)
2. Wire up metrics + analytics (proves value to merchants)
3. Add catalog/publishing tools (proves end-to-end automation)

**Blocker**: Need real Mantis CMS API documentation and test credentials to proceed.

Once API surface is documented, implementation can begin immediately with Phase 1 (Foundation) targeting completion in 1 week.
