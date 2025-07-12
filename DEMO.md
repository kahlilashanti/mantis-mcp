# 🎯 Mantis MCP Server - Interactive Demo Guide

Welcome to the comprehensive demo guide for the Mantis MCP Server! This guide will walk you through setting up and testing all 11 MCP tools with real examples.

## 📹 Video Demo

Watch a complete walkthrough: [Demo Video](https://share.cleanshot.com/kNKvRq24)

## 🚀 Quick Start (2 Minutes!)

### ⚡ One-Command Installation

#### Option 1: Using Claude CLI with Portable Script (Recommended)
```bash
# Clone the repository
git clone https://github.com/your-org/mantis-mcp.git
cd mantis-mcp

# Install dependencies and build
npm install
npm run build

# Make portable script executable
chmod +x mantis-mcp-portable.sh

# Add to Claude using the portable script
claude mcp add mantis-mcp "$(pwd)/mantis-mcp-portable.sh"
```

#### Option 1b: Using Claude CLI with Direct Node
```bash
# Add to Claude using direct node command
claude mcp add mantis-mcp node $(pwd)/dist/index.js
```

#### Option 2: Using npx from local directory
```bash
# From within the mantis-mcp directory
npx .
```

#### Option 3: Using npx (Future - Once Published to npm)
```bash
# This will be available after npm publication
npx @mantis-3d/mcp-server

# No cloning or building required - it will just work!
```

**Note**: Currently, you need to use Option 1 or 2. The npm package will be published soon for easier installation.

The CLI will automatically:
- ✅ Detect your Claude Desktop configuration
- ✅ Install and configure the MCP server
- ✅ Validate everything is working
- ✅ Guide you through next steps

### 🔄 Restart Claude Desktop

After installation completes:
1. **Restart Claude Desktop completely**
2. **Test the connection:**

```
Hi Claude! Can you list the available Mantis MCP tools?
```

**Expected Response**: You should see all 11 tools listed:
- installMantisSDK
- validateSetup
- createMantisIntegration
- generateEventHandler
- debugPostMessage
- analyzeConsoleErrors
- checkBrowserCompatibility
- testMantisEvent
- simulateUserFlow
- getPerformanceMetrics
- analyzeEventFlow

### 🛠️ Alternative Commands

```bash
# Check if installation is working (from mantis-mcp directory)
npx . --status
# Or if installed globally via npm link
mantis-mcp --status

# Remove from Claude Desktop
npx . --uninstall
# Or
mantis-mcp --uninstall

# Fix broken installation
npx . --repair
# Or
mantis-mcp --repair
```

### 📁 Manual Installation (If Needed)

<details>
<summary>Click here for manual setup instructions</summary>

#### Step 1: Install and Build

```bash
# Clone or navigate to the project directory
cd mantis-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Verify the build
ls dist/index.js  # Should exist
```

#### Step 2: Configure Claude Desktop

1. **Find your Claude Desktop configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the MCP server configuration:**

```json
{
  "mcpServers": {
    "mantis-mcp": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mantis-mcp/dist/index.js"]
    }
  }
}
```

⚠️ **Important**: Replace `/FULL/PATH/TO/mantis-mcp` with your actual project path!

</details>

---

## 🎮 Demo Scenarios

### 📦 Demo 1: E-commerce React Integration

**Scenario**: Setting up 3D product visualization for a sneaker store

**Copy and paste this prompt:**

```
I'm building a React e-commerce site for sneakers and want to add 3D product visualization. Can you help me:

1. First, install the Mantis SDK for React
2. Then generate a complete integration with cart functionality and analytics
3. Finally, validate the setup

Use these parameters:
- Framework: react
- Store type: sneakers  
- Features: cart, analytics, camera
- Product ID: "air-jordan-1-retro"
```

**What you'll see:**
- Installation steps with .npmrc configuration
- Complete React component with hooks
- Cart integration code
- Analytics setup
- Validation checklist

---

### 🛍️ Demo 2: Shopify Theme Integration

**Scenario**: Adding 3D jewelry try-on to a Shopify store

**Copy and paste this prompt:**

```
I have a Shopify jewelry store and want customers to virtually try on rings and necklaces. Generate the complete Shopify Liquid integration code with:

- Framework: shopify-liquid
- Store type: jewelry
- Features: cart, camera, analytics
- Make it mobile-optimized for try-on experiences
```

**What you'll see:**
- Shopify Liquid template code
- Cart API integration
- Mobile-optimized CSS
- Analytics tracking for Shopify
- Theme integration instructions

---

### 🐛 Demo 3: Debugging PostMessage Issues

**Scenario**: Troubleshooting communication problems

**Copy and paste this prompt:**

```
My Mantis SDK integration isn't working properly. I'm getting postMessage errors and the 3D experience won't load. Can you help me debug this?

Debug these issues:
1. Check postMessage communication for 10 seconds
2. Analyze these console errors:
   - "Failed to execute 'postMessage' on 'DOMWindow': https://mystore.com !== https://localhost:3000"
   - "MantisSDK is not defined"
   - "WebGL context lost"
3. Check browser compatibility for WebGL features

My site is running on https://mystore.com
```

**What you'll see:**
- PostMessage debugging analysis
- Origin mismatch solutions
- SDK loading diagnostics
- WebGL compatibility report
- Step-by-step fixes

---

### 📊 Demo 4: Performance Monitoring

**Scenario**: Optimizing 3D experience performance

**Copy and paste this prompt:**

```
My 3D product experiences are loading slowly and customers are experiencing lag. Can you help me analyze the performance?

1. Get performance metrics for FPS, load time, memory usage, and GPU performance
2. Monitor for 60 seconds 
3. Analyze the event flow to see where users are dropping off
4. Test a complete user flow: load-experience → click-model → open-cart → add-item

I want to optimize for mobile users primarily.
```

**What you'll see:**
- Real-time performance metrics
- Memory usage analysis
- User flow simulation results
- Mobile optimization recommendations
- Performance improvement suggestions

---

### 🎯 Demo 5: Multi-Framework Comparison

**Scenario**: Comparing integration options

**Copy and paste this prompt:**

```
I'm deciding between React, Vue, and Next.js for my furniture store's 3D experience. Can you generate integration code for all three frameworks so I can compare?

For each framework, include:
- Features: cart, variants, analytics
- Store type: furniture
- Focus on large model optimization

Show me the differences in implementation complexity and capabilities.
```

**What you'll see:**
- React component with hooks
- Vue 3 composition API version
- Next.js with SSR handling
- Side-by-side comparison
- Recommendations for each use case

---

## 🔧 Advanced Demos

### Testing Tools Demo

**Copy and paste this prompt:**

```
I want to test my Mantis integration thoroughly. Can you help me:

1. Test the "cart-opened" event with sample data
2. Simulate a complete user flow for a furniture shopping experience
3. Validate that all events are firing correctly

Use this test data:
- Product: "leather-sofa-brown"
- User actions: browse → rotate → change-color → add-to-cart → checkout
```

### Event Handler Generation Demo

**Copy and paste this prompt:**

```
Generate event handlers for my Vue.js furniture store:

1. Handle "variant-changed" events when customers switch between different sofa colors
2. Handle "model-click" events to show detailed product information
3. Handle "camera-capture" events for customer photos with furniture

Make the handlers specific to furniture shopping behaviors.
```

---

## ✅ Validation Checklist

After running the demos, verify each tool works:

- [ ] **installMantisSDK**: Returns installation steps and .npmrc config
- [ ] **validateSetup**: Shows validation checks and scores
- [ ] **createMantisIntegration**: Generates framework-specific code
- [ ] **generateEventHandler**: Creates event handling code
- [ ] **debugPostMessage**: Analyzes communication issues
- [ ] **analyzeConsoleErrors**: Provides error solutions
- [ ] **checkBrowserCompatibility**: Reports browser support
- [ ] **testMantisEvent**: Simulates SDK events
- [ ] **simulateUserFlow**: Runs user journey tests
- [ ] **getPerformanceMetrics**: Returns performance data
- [ ] **analyzeEventFlow**: Provides flow analysis

---

## 🔍 What to Look For

### Good Signs ✅
- Each tool returns structured JSON responses
- Code examples are framework-specific and complete
- Error analysis includes specific solutions
- Performance metrics include realistic numbers
- Environment detection adapts responses correctly

### Red Flags ❌
- Tools return "Unknown tool" errors
- Responses are generic or incomplete
- No code examples provided
- JSON parsing errors
- Server connection timeouts

---

## 🛠️ Troubleshooting

### MCP Server Not Found

```bash
# Check installation status (from mantis-mcp directory)
npx . --status
# Or if using npm link
mantis-mcp --status

# Try automatic repair
npx . --repair
# Or
mantis-mcp --repair

# Manual check if server is built
ls dist/index.js

# Test server manually
node dist/index.js
# Should show: "Mantis MCP Server running on stdio"
```

### Configuration Issues

```bash
# Use the CLI to check and fix issues
npx . --status
# Or
mantis-mcp --status

# Repair installation automatically
npx . --repair
# Or
mantis-mcp --repair

# Or reinstall completely
npx . --uninstall
npx .
# Or using Claude CLI
claude mcp remove mantis-mcp
claude mcp add mantis-mcp node $(pwd)/dist/index.js
```

### Tool Not Responding

```
Claude, can you try using the installMantisSDK tool with framework "react"?
```

If this fails:
1. Check status: `npx @mantis-3d/mcp-server --status`
2. Repair: `npx @mantis-3d/mcp-server --repair`
3. Restart Claude Desktop completely

### Dependencies Missing

```bash
# Install CLI dependencies
npm install chalk commander inquirer ora

# Rebuild everything
npm run build:cli
```

---

## 🎯 Demo Script for Presentations

### 5-Minute Lightning Demo

1. **Setup** (1 min): Show the config file and restart
2. **React Integration** (2 min): Run Demo 1 - E-commerce React Integration  
3. **Debugging** (1 min): Run Demo 3 - PostMessage debugging
4. **Performance** (1 min): Run Demo 4 - Performance monitoring

### 15-Minute Full Demo

1. **Introduction** (2 min): Explain Mantis XR and MCP
2. **Setup** (3 min): Walk through installation and configuration
3. **Development Tools** (4 min): Run Demos 1 and 2
4. **Debugging Tools** (3 min): Run Demo 3 with error scenarios
5. **Testing & Monitoring** (3 min): Run Demos 4 and 5

### 30-Minute Workshop

- Include all demos
- Let participants try their own prompts
- Cover troubleshooting scenarios
- Show environment detection features
- Demonstrate framework comparisons

---

## 📝 Custom Demo Ideas

### For E-commerce Teams
- Focus on cart integration and conversion tracking
- Show Shopify and WooCommerce examples
- Demonstrate mobile optimization

### For Developers
- Emphasize code generation and debugging tools
- Show framework flexibility
- Deep dive into event handling

### For Product Managers
- Focus on user flow simulation
- Highlight analytics and performance monitoring
- Show business impact metrics

---

## 🔗 Next Steps

After the demo:

1. **Integrate into your workflow**: Add to Claude Desktop permanently
2. **Customize for your needs**: Modify the tools for your specific use cases
3. **Extend functionality**: Add new tools or frameworks
4. **Share feedback**: Report issues or feature requests
5. **Scale up**: Use in production environments

---

## 🆘 Support

**Demo not working?**
- Check the [README.md](./README.md) for detailed documentation
- Review the [troubleshooting section](#🛠️-troubleshooting) above
- Test individual tools manually
- Verify your Claude Desktop configuration

**Want to customize the demo?**
- Modify the tool responses in `src/tools/`
- Add new demo scenarios
- Create industry-specific examples
- Extend with your own MCP tools

---

## 🏆 Success Metrics

A successful demo should show:

- ⚡ **Setup time**: Under 5 minutes
- 🛠️ **All tools working**: 11/11 tools responding correctly
- 🎯 **Framework coverage**: React, Vue, Next.js, Shopify examples
- 🐛 **Debug capabilities**: PostMessage and error analysis working
- 📊 **Monitoring features**: Performance and user flow analysis active

**Ready to revolutionize 3D commerce development with AI assistance!** 🚀