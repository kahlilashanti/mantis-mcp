# Mantis MCP Server

AI assistant tools for building high-converting immersive commerce showrooms from your existing e-commerce catalog. Built on Mantis's production immersive-commerce platform, used by Fortune 500 brands including New Balance, with deployments spanning the Paris 2024 Olympics, MLB, NHL, and the Premier League.

Part of Mantis's vision for agent-invoked immersive commerce infrastructure. Learn more at [mantisxr.com](https://mantisxr.com).

## Quick Start

```bash
npx mantis-mcp
```

Or install globally:

```bash
npm install -g mantis-mcp
```

Then configure in Claude Desktop, Cursor, or any MCP-compatible client (see [Configuration](#configuration) below).

## Status

The Mantis showroom platform this MCP connects to is live in production, used by Fortune 500 brands including New Balance, with deployments including the Paris 2024 Olympics, Chicago Cubs (MLB), St. Louis Blues (NHL), and Burnley FC and other Premier League clubs. This MCP server is how that platform gets exposed to AI agents, and it's actively in development. Some tools are fully wired to the real platform API today; others are simulated while backend endpoints are being built out. See the tool status below for exactly what's real versus in progress.

## Setup

### Environment Variables (Optional)

Configure these to connect to the real Mantis API:

```bash
MANTIS_API_URL=https://your-mantis-instance.com
MANTIS_AUTH_TOKEN=your_token_here
```

Mantis users receive their API URL and auth token during account setup. Without these, tools work with simulated data for code generation and planning.

### Configuration

**Claude Desktop:**
1. Open Settings → Developer → Edit Config
2. Add:
```json
{
  "mcpServers": {
    "mantis-mcp": {
      "command": "npx",
      "args": ["mantis-mcp"]
    }
  }
}
```

**Cursor:**
1. Settings → MCP Servers → Add new server
2. Configure with `npx mantis-mcp`

**Other MCP clients:** Use `npx mantis-mcp` or `node /path/to/dist/index.js`

## Tools

### ✅ Fully Working (no API required)

**installMantisSDK**
Generates installation commands and .npmrc setup for integrating Mantis SDK into React, Vue, Next.js, Shopify, or vanilla JavaScript projects.

**createMantisIntegration**
Generates complete, framework-specific integration code with event handlers, cart integration, and analytics tracking.

**generateEventHandler**
Creates event handler code for Mantis SDK events (cart-opened, model-click, variant-changed, etc.).

**analyzeConsoleErrors**
Pattern-matches common errors (SDK not loaded, postMessage blocked, WebGL issues) and provides fixes with code examples.

**checkBrowserCompatibility**
Checks browser compatibility for WebGL, postMessage, fullscreen, and other immersive features with polyfill recommendations.

### 🟡 Partially Working (uses real API when configured)

**validateSetup**
Validates Mantis SDK installation. Calls real `showrooms.getShowroom` API if `MANTIS_API_URL` is configured, otherwise returns sample validation checks.

**importCatalog**
Imports product catalogs from Shopify (real API), CSV, or manual input. Data parsed successfully; backend storage endpoints pending.

**createStore**
Creates an immersive showroom. Attempts real `showrooms.createShowroom` API call if configured, falls back to mock response with guidance.

**publishStore**
Publishes showroom live. Attempts real `showrooms.updateShowroom` API if configured, otherwise simulates status change to active.

### 🔴 Mocked (simulated data, backend endpoints pending)

**debugPostMessage**
Simulates postMessage debugging scenarios with realistic message timelines, origin checks, and error patterns.

**testMantisEvent**
Simulates SDK event testing (model-loaded, add-to-cart, etc.) with validation and performance timing.

**simulateUserFlow**
Simulates multi-step user interaction flows (load → click → add-to-cart) with realistic delays and error scenarios.

**getPerformanceMetrics**
Generates simulated performance data (FPS, load times, memory, GPU) based on requested metrics.

**analyzeEventFlow**
Simulates event flow analysis with conversion funnels, dropoff points, and user behavior patterns.

## What This MCP Does Not Do

**Immersive Asset Generation:** Mantis does not provide automated conversion of product photos into immersive-ready assets. Merchants must provide immersive-ready assets (.glb/.gltf files) when creating products. This is an intentional scope decision: automated asset generation is a commoditizing service layer that multiple companies have attempted without building sustainable businesses. Mantis's value is the immersive showroom platform, merchandising intelligence, and agent-invokable commerce infrastructure—not asset generation.

## Development

```bash
# Clone and install
git clone https://github.com/kahlilashanti/mantis-mcp.git
cd mantis-mcp
npm install

# Build
npm run build

# Run locally
npm start
```

## License

MIT

## Links

- [Mantis Platform](https://mantisxr.com)
- [GitHub Issues](https://github.com/kahlilashanti/mantis-mcp/issues)
- [Model Context Protocol](https://modelcontextprotocol.io)
