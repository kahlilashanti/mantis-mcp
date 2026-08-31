# Mantis MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to help developers integrate, debug, and maintain Mantis XR 3D commerce experiences.

## 📹 Demo Video

Watch the Mantis MCP in action: [Demo Video](https://share.cleanshot.com/kNKvRq24)

## 🚀 Features

- **Environment-Aware Responses**: Adapts output format for Claude Desktop vs Claude Code
- **Complete SDK Lifecycle**: Installation, configuration, development, and debugging
- **Framework Support**: React, Vue, Next.js, Shopify Liquid, and Vanilla JS
- **Comprehensive Debugging**: PostMessage analysis, browser compatibility, error patterns
- **Performance Monitoring**: FPS tracking, memory analysis, load time optimization
- **Testing Tools**: Event simulation and user flow validation
- **Store Creation**: Import catalog, create showroom, publish (Shopify + CSV + manual)

## 🌐 Web API (Works with Claude Web, ChatGPT, etc.)

**Don't have Claude Desktop?** Use the Web API instead:

```bash
npm install
npm run build
npm run start:api
```

Then deploy to Vercel/Railway and connect to any LLM. See [WEB_API.md](./WEB_API.md) for full instructions.

**Works with:**
- ✅ Claude Web (claude.ai)
- ✅ ChatGPT (via Actions)
- ✅ Perplexity, Gemini, any LLM with function calling

## 📦 Installation

### Future: NPM Package (Coming Soon)
Once published to npm, you'll be able to install with:
```bash
npx @mantis-3d/mcp-server
```

### Current: Local Installation
```bash
# Clone the repository
git clone https://github.com/mantis-xr/mantis-mcp.git
cd mantis-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Start the MCP server
npm start
```

## 🔧 Configuration

Choose your IDE/Editor:

<details>
<summary><strong>▶ Claude Desktop</strong></summary>

**Method 1: Using the UI (Recommended)**
1. Open Claude Desktop
2. Click on **Claude** menu → **Settings** 
3. Click on **Developer** in the left sidebar
4. Click **Edit Config**
5. Add the following configuration:

```json
{
  "mcpServers": {
    "mantis-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/mantis-mcp/dist/index.js"]
    }
  }
}
```

**Method 2: Direct file edit**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Restart Claude Desktop after adding the configuration.
</details>

<details>
<summary><strong>▶ Claude Code</strong></summary>

Using the CLI with portable script:

```bash
# Make the portable script executable
chmod +x mantis-mcp-portable.sh

# Add to Claude Code using the portable script
claude mcp add mantis-mcp "$(pwd)/mantis-mcp-portable.sh"
```

Or using direct node command:
```bash
claude mcp add mantis-mcp node $(pwd)/dist/index.js
```
</details>

<details>
<summary><strong>▶ Cursor</strong></summary>

**Latest Cursor (2025)** configuration:

**Method 1: Using UI**
1. Open Cursor
2. Go to **Settings** → **Cursor Settings**
3. Find **MCP Servers** option and enable it
4. Click **Add new MCP server**
5. Configure the server (a green dot will appear when active)

**Method 2: Configuration file**
Create or edit `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project-specific):

```json
{
  "mcpServers": {
    "mantis-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/mantis-mcp/dist/index.js"]
    }
  }
}
```

Restart Cursor after configuration.
</details>

<details>
<summary><strong>▶ Windsurf (formerly Codeium)</strong></summary>

**Windsurf Wave 3 (2025)** with MCP support:

**Method 1: Using Cascade UI**
1. Open Windsurf Editor
2. Click the **Hammer Icon** on the Cascade toolbar
3. Configure MCP servers through the UI
4. One-click setup for curated MCP servers available

**Method 2: Configuration file**
Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "mantis-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/mantis-mcp/dist/index.js"]
    }
  }
}
```

**Note**: Maximum 50 tools can be active at once from MCP servers.
</details>

<details>
<summary><strong>▶ VS Code (via Continue.dev or Cline)</strong></summary>

**Option 1: Using Continue.dev Extension**

Install Continue.dev extension, then edit `~/.continue/config.json`:

```json
{
  "models": [{
    "title": "Claude with MCP",
    "model": "claude-3-opus",
    "provider": "anthropic",
    "mcpServers": {
      "mantis-mcp": {
        "command": "node",
        "args": ["/absolute/path/to/mantis-mcp/dist/index.js"]
      }
    }
  }]
}
```

**Option 2: Using Cline Extension (formerly Claude Dev)**

1. Install Cline extension in VS Code
2. Open Cline settings in VS Code
3. Go to MCP Servers section
4. Add Mantis MCP configuration
</details>

<details>
<summary><strong>▶ Zed</strong></summary>

For Zed editor with MCP support:

1. Open Zed settings: `~/.config/zed/settings.json`
2. Add MCP configuration:

```json
{
  "assistant": {
    "mcpServers": {
      "mantis-mcp": {
        "command": "node",
        "args": ["/absolute/path/to/mantis-mcp/dist/index.js"]
      }
    }
  }
}
```

Restart Zed after configuration.
</details>

<details>
<summary><strong>▶ Other MCP-Compatible Editors</strong></summary>

For any MCP-compatible editor, the general configuration format is:

```json
{
  "mcpServers": {
    "mantis-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/mantis-mcp/dist/index.js"]
    }
  }
}
```

Check your editor's documentation for the specific configuration file location.
</details>

**Note**: After adding the configuration, restart your IDE/editor for the MCP server to be recognized.

## 🔌 API Integration (Optional)

Connect to your Mantis backend for real-time validation and data:

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your API settings
MANTIS_API_URL=https://your-api.mantisxr.com
MANTIS_AUTH_TOKEN=your-auth-token
```

**Environment Variables:**
- `MANTIS_API_URL` - Your Mantis API base URL (AWS, Vercel, etc.)
- `MANTIS_AUTH_TOKEN` - Bearer token for authenticated requests (optional)
- `MANTIS_SHOWROOM_ID` - Default showroom ID for validation (optional)

**What this enables:**
- ✅ Real showroom validation via `validateSetup`
- ✅ Live configuration checks
- ✅ Actual API error responses

**Without API config:**
- Tools work with sample/mock data
- Still useful for code generation and debugging
- No external dependencies required

The API client is cloud-agnostic and works with any REST backend (AWS Lambda, Vercel, Railway, custom servers).

## 🏪 Store Creation & 3D Assets

**New Tools for End-to-End Store Creation:**
- `importCatalog` - Import products from Shopify or CSV/manual input
- `createStore` - Create showroom with imported products
- `publishStore` - Publish showroom (make it live)

**3D Asset Generation (Scope Boundary):**

Mantis does not provide automated 2D-to-3D asset conversion. Merchants must provide 3D-ready assets (.glb/.gltf files) when creating products. This is an intentional scope decision: automated 3D generation is a commoditizing service layer that multiple well-funded companies (VNTANA, Curio) attempted and failed to build sustainable businesses around. Our value is the showroom platform, merchandising intelligence, and agent-invokable commerce infrastructure, not asset generation. 3D asset creation is handled via Mantis's existing manual design service for premium customers or future partner integrations.

## 🛠️ Available Tools

### Setup & Installation
- `installMantisSDK` - Install and configure Mantis SDK with proper .npmrc setup
- `validateSetup` - Validate Mantis SDK installation and configuration

### Development
- `createMantisIntegration` - Generate Mantis integration code for your framework
- `generateEventHandler` - Generate event handler code for Mantis SDK events

### Debugging
- `debugPostMessage` - Debug postMessage communication issues
- `analyzeConsoleErrors` - Analyze console errors and suggest fixes
- `checkBrowserCompatibility` - Check browser compatibility issues

### Testing
- `testMantisEvent` - Test Mantis SDK events and responses
- `simulateUserFlow` - Simulate user interactions with Mantis experience

### Monitoring
- `getPerformanceMetrics` - Get performance metrics for 3D experience
- `analyzeEventFlow` - Analyze event flow and user behavior

### Store Creation
- `importCatalog` - Import product catalog from Shopify, CSV, or manual input
- `createStore` - Create showroom with imported products
- `publishStore` - Publish showroom to make it live

## 📋 Usage Examples

### Install Mantis SDK for React

```
Use the installMantisSDK tool with:
- framework: "react"
- features: ["cart", "analytics"]
- storeType: "sneakers"
```

### Debug PostMessage Issues

```
Use the debugPostMessage tool with:
- captureTime: 10
- filterOrigin: "https://localhost:3000"
```

### Generate React Integration

```
Use the createMantisIntegration tool with:
- framework: "react"
- features: ["cart", "camera", "analytics"]
- storeType: "jewelry"
```

### Monitor Performance

```
Use the getPerformanceMetrics tool with:
- duration: 60
- metrics: ["fps", "load-time", "memory", "gpu"]
```

## 🌐 Environment Detection

The MCP server automatically detects the calling environment and adapts responses:

### Claude Desktop (Chat Interface)
- Provides step-by-step instructions
- Returns copyable code snippets
- Explains what each step does

### Claude Code / Cursor (IDE Integration)
- Returns executable actions
- Can trigger file creation
- Provides progress feedback

## 🔍 Framework Support

### React
- Complete component with hooks
- Error boundaries and loading states
- TypeScript support
- Event handling patterns

### Vue 3
- Composition API integration
- Reactive state management
- Component lifecycle handling
- Event emission patterns

### Next.js
- SSR/SSG compatibility
- API route integration
- Dynamic imports for client-side only
- App Router support

### Shopify Liquid
- Theme integration
- Cart API integration
- Shopify-specific event handling
- Mobile optimization

### Vanilla JavaScript
- Framework-agnostic implementation
- ES6 module support
- Progressive enhancement
- Cross-browser compatibility

## 🐛 Error Patterns

The MCP server recognizes and provides fixes for common issues:

- **Origin Mismatch**: `Failed to execute 'postMessage'`
- **SDK Not Loaded**: `MantisSDK is not defined`
- **WebGL Issues**: `WebGL context lost`
- **Network Errors**: `Failed to fetch`
- **Browser Specific**: `SecurityError in Safari Private`

## 📊 Performance Monitoring

Track key metrics for 3D experiences:

- **FPS Monitoring**: Real-time frame rate tracking
- **Load Time Analysis**: Model and texture loading performance
- **Memory Usage**: Heap and GPU memory monitoring
- **User Interactions**: Engagement and conversion tracking
- **Network Performance**: Bandwidth and latency analysis

## 🧪 Testing Capabilities

### Event Testing
- Simulate any Mantis SDK event
- Validate event data structures
- Test error scenarios
- Performance benchmarking

### User Flow Simulation
- Complete user journey testing
- Conversion funnel analysis
- Dropoff point identification
- A/B testing support

## 🚀 Development

### Project Structure

```
mantis-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   ├── setup.ts          # Installation and configuration tools
│   │   ├── development.ts    # Code generation and integration tools
│   │   ├── debugging.ts      # Debug and troubleshooting tools
│   │   ├── monitoring.ts     # Performance and analytics tools
│   │   └── testing.ts        # Event testing and validation tools
│   └── utils/
│       └── environment.ts    # Environment detection utilities
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

## 📈 Success Metrics

The MCP helps developers achieve:

- **Setup time**: < 5 minutes (vs hours manually)
- **Time to first event**: < 30 seconds
- **Debug resolution time**: < 2 minutes
- **Browser compatibility**: 99%+
- **Performance optimization**: 40%+ improvement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🐛 Troubleshooting

### Common Issues

#### Script Permission Denied
```bash
# If you get permission denied error
chmod +x mantis-mcp-portable.sh
chmod +x mantis-mcp-wrapper.sh
```

#### MCP Tools Not Showing in Claude
1. Restart Claude Code/Desktop completely after adding the MCP server
2. Check if the server is running:
   ```bash
   ./mantis-mcp-portable.sh
   # Should output: "Mantis MCP Server running on stdio"
   ```

#### Script Timeout Issues
If the portable script times out in Claude Code:
1. Check that Node.js is in your PATH
2. Verify the build completed: `ls dist/index.js`
3. Try the direct node configuration method instead

#### Testing MCP Connection
After installation, test with:
```
Hi Claude! Can you list the available Mantis MCP tools?
```

You should see all 11 tools listed (installMantisSDK, validateSetup, etc.)

## 🔗 Links

- [Mantis XR Documentation](https://docs.mantisxr.com)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai)

## 🆘 Support

- Issues: [GitHub Issues](https://github.com/mantis-xr/mantis-mcp/issues)
- Documentation: [Mantis Docs](https://docs.mantisxr.com/mcp)
- Community: [Discord](https://discord.gg/mantisxr)