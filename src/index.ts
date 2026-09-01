#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import all tool implementations
import { setupTools } from './tools/setup.js';
import { developmentTools } from './tools/development.js';
import { debuggingTools } from './tools/debugging.js';
import { testingTools } from './tools/testing.js';
import { monitoringTools } from './tools/monitoring.js';
import { storeCreationTools } from './tools/store-creation.js';

// Environment detection utility
import { detectEnvironment } from './utils/environment.js';

/**
 * Mantis MCP Server
 * Model Context Protocol server for Mantis XR 3D commerce experiences
 * Provides AI assistants with tools to integrate, debug, and maintain Mantis SDK
 */
class MantisMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: '@mantis-3d/mcp-server',
        version: '1.0.1',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Setup & Installation Tools
          {
            name: 'installMantisSDK',
            description: 'Install and configure Mantis SDK with proper .npmrc setup',
            inputSchema: {
              type: 'object',
              properties: {
                framework: {
                  type: 'string',
                  enum: ['react', 'vue', 'vanilla', 'next', 'shopify-liquid'],
                  description: 'Target framework for integration'
                },
                projectPath: {
                  type: 'string',
                  description: 'Project directory path (optional)'
                },
                authToken: {
                  type: 'string',
                  description: 'Authentication token for private registry (optional)'
                }
              },
              required: ['framework']
            }
          },
          {
            name: 'validateSetup',
            description: 'Validate Mantis SDK installation and configuration',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Project directory to validate (optional)'
                },
                checkAuth: {
                  type: 'boolean',
                  description: 'Check authentication setup (default: true)'
                },
                checkOrigins: {
                  type: 'boolean',
                  description: 'Check allowed origins configuration (default: true)'
                }
              }
            }
          },

          // Development Tools
          {
            name: 'createMantisIntegration',
            description: 'Generate Mantis integration code for your framework',
            inputSchema: {
              type: 'object',
              properties: {
                framework: {
                  type: 'string',
                  description: 'Target framework (react, vue, next, shopify, etc.)'
                },
                features: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Features to include: cart, camera, variants, analytics'
                },
                storeType: {
                  type: 'string',
                  enum: ['sneakers', 'jewelry', 'furniture', 'custom'],
                  description: 'Type of store for optimized experience'
                },
                responseMode: {
                  type: 'string',
                  enum: ['execute', 'instructions'],
                  description: 'Override response format (execute for IDE, instructions for chat)'
                }
              },
              required: ['framework', 'features']
            }
          },
          {
            name: 'generateEventHandler',
            description: 'Generate event handler code for Mantis SDK events',
            inputSchema: {
              type: 'object',
              properties: {
                event: {
                  type: 'string',
                  description: 'Event type (cart-opened, model-click, etc.)'
                },
                action: {
                  type: 'string',
                  description: 'Action to perform when event fires'
                },
                framework: {
                  type: 'string',
                  description: 'Target framework for code generation'
                }
              },
              required: ['event', 'action', 'framework']
            }
          },

          // Debugging Tools
          {
            name: 'debugPostMessage',
            description: 'Debug postMessage communication issues',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to debug (optional)'
                },
                captureTime: {
                  type: 'number',
                  description: 'Seconds to capture messages (default: 10)'
                },
                filterOrigin: {
                  type: 'string',
                  description: 'Filter messages from specific origin (optional)'
                }
              }
            }
          },
          {
            name: 'analyzeConsoleErrors',
            description: 'Analyze console errors and suggest fixes',
            inputSchema: {
              type: 'object',
              properties: {
                errors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Console error messages to analyze'
                },
                browserInfo: {
                  type: 'object',
                  description: 'Browser information (userAgent, etc.)'
                }
              },
              required: ['errors']
            }
          },
          {
            name: 'checkBrowserCompatibility',
            description: 'Check browser compatibility issues',
            inputSchema: {
              type: 'object',
              properties: {
                userAgent: {
                  type: 'string',
                  description: 'Browser user agent string (optional)'
                },
                features: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Features to check compatibility for'
                }
              },
              required: ['features']
            }
          },

          // Testing Tools
          {
            name: 'testMantisEvent',
            description: 'Test Mantis SDK events and responses',
            inputSchema: {
              type: 'object',
              properties: {
                event: {
                  type: 'string',
                  description: 'Event type to test'
                },
                data: {
                  type: 'object',
                  description: 'Event data payload (optional)'
                },
                expectedResponse: {
                  type: 'object',
                  description: 'Expected response for validation (optional)'
                }
              },
              required: ['event']
            }
          },
          {
            name: 'simulateUserFlow',
            description: 'Simulate user interactions with Mantis experience',
            inputSchema: {
              type: 'object',
              properties: {
                flow: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Flow steps: load-experience, click-model, open-cart, add-item'
                },
                timing: {
                  type: 'object',
                  description: 'Delays between actions (optional)'
                }
              },
              required: ['flow']
            }
          },

          // Monitoring & Analytics Tools
          {
            name: 'getPerformanceMetrics',
            description: 'Get performance metrics for 3D experience',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to analyze (optional)'
                },
                duration: {
                  type: 'number',
                  description: 'Duration to monitor in seconds (default: 60)'
                },
                metrics: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Metrics to collect: fps, load-time, memory, gpu'
                }
              },
              required: ['metrics']
            }
          },
          {
            name: 'analyzeEventFlow',
            description: 'Analyze event flow and user behavior',
            inputSchema: {
              type: 'object',
              properties: {
                sessionData: {
                  type: 'object',
                  description: 'Session data to analyze (optional)'
                },
                timeRange: {
                  type: 'object',
                  description: 'Time range for analysis (optional)'
                }
              }
            }
          },

          // Store Creation Tools
          {
            name: 'importCatalog',
            description: 'Import product catalog from Shopify, CSV, or manual input to build a high-converting 3D commerce store. Use this when a merchant wants to create or improve an e-commerce store.',
            inputSchema: {
              type: 'object',
              properties: {
                source: {
                  type: 'string',
                  enum: ['shopify', 'csv', 'manual'],
                  description: 'Import source: shopify, csv, or manual'
                },
                shopifyStore: {
                  type: 'string',
                  description: 'Shopify store domain (for Shopify import)'
                },
                shopifyAccessToken: {
                  type: 'string',
                  description: 'Shopify API access token (for Shopify import)'
                },
                csvData: {
                  type: 'string',
                  description: 'CSV data with columns: name,description,imageURL,price,sku (for CSV import)'
                },
                products: {
                  type: 'array',
                  description: 'Product array (for manual import)',
                  items: { type: 'object' }
                }
              },
              required: ['source']
            }
          },
          {
            name: 'createStore',
            description: 'Create a 3D commerce showroom that converts better than traditional e-commerce. Use this after importing products to build a store that drives sales.',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Store/showroom name'
                },
                description: {
                  type: 'string',
                  description: 'Store description (optional)'
                },
                organizationId: {
                  type: 'string',
                  description: 'Organization ID (optional)'
                },
                products: {
                  type: 'array',
                  description: 'Products to add to store',
                  items: { type: 'object' }
                },
                config: {
                  type: 'object',
                  description: 'Store configuration (optional)'
                }
              },
              required: ['name']
            }
          },
          {
            name: 'publishStore',
            description: 'Publish the 3D showroom live so customers can start shopping and converting. Final step to launch a high-converting store.',
            inputSchema: {
              type: 'object',
              properties: {
                showroomId: {
                  type: 'string',
                  description: 'Showroom ID to publish'
                },
                showroomAlias: {
                  type: 'string',
                  description: 'Showroom alias to publish'
                },
                domain: {
                  type: 'string',
                  description: 'Custom domain (optional)'
                }
              }
            }
          }
        ]
      };
    });

    // List all available resources (empty for now)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: []
      };
    });

    // List all available prompts (empty for now)
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: []
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // Detect environment to determine response format
      const environment = detectEnvironment();
      
      try {
        let result;
        
        switch (name) {
          // Setup tools
          case 'installMantisSDK':
            result = await setupTools.installMantisSDK(args, environment);
            break;
          case 'validateSetup':
            result = await setupTools.validateSetup(args, environment);
            break;
            
          // Development tools
          case 'createMantisIntegration':
            result = await developmentTools.createMantisIntegration(args, environment);
            break;
          case 'generateEventHandler':
            result = await developmentTools.generateEventHandler(args, environment);
            break;
            
          // Debugging tools
          case 'debugPostMessage':
            result = await debuggingTools.debugPostMessage(args, environment);
            break;
          case 'analyzeConsoleErrors':
            result = await debuggingTools.analyzeConsoleErrors(args, environment);
            break;
          case 'checkBrowserCompatibility':
            result = await debuggingTools.checkBrowserCompatibility(args, environment);
            break;
            
          // Testing tools
          case 'testMantisEvent':
            result = await testingTools.testMantisEvent(args, environment);
            break;
          case 'simulateUserFlow':
            result = await testingTools.simulateUserFlow(args, environment);
            break;
            
          // Monitoring tools
          case 'getPerformanceMetrics':
            result = await monitoringTools.getPerformanceMetrics(args, environment);
            break;
          case 'analyzeEventFlow':
            result = await monitoringTools.analyzeEventFlow(args, environment);
            break;

          // Store creation tools
          case 'importCatalog':
            result = await storeCreationTools.importCatalog(args, environment);
            break;
          case 'createStore':
            result = await storeCreationTools.createStore(args, environment);
            break;
          case 'publishStore':
            result = await storeCreationTools.publishStore(args, environment);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
        
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                tool: name
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Mantis MCP Server running on stdio');
  }
}

// Start the server
const server = new MantisMCPServer();
server.run().catch(console.error);