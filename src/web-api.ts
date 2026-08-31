/**
 * Web API Server
 * Exposes MCP tools via HTTP for Claude Web, ChatGPT, etc.
 *
 * Usage: node dist/web-api.js
 * Port: 3000 (configurable via PORT env var)
 */

import express from 'express';
import cors from 'cors';
import { storeCreationTools } from './tools/store-creation.js';
import { detectEnvironment } from './utils/environment.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Detect environment (web API context)
const environment = detectEnvironment();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mantis-api' });
});

// Serve OpenAPI spec
app.get('/openapi.json', (req, res) => {
  res.sendFile('openapi.json', { root: process.cwd() });
});

// Import catalog endpoint
app.post('/api/import-catalog', async (req, res) => {
  try {
    const result = await storeCreationTools.importCatalog(req.body, environment);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create store endpoint
app.post('/api/create-store', async (req, res) => {
  try {
    const result = await storeCreationTools.createStore(req.body, environment);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Publish store endpoint
app.post('/api/publish-store', async (req, res) => {
  try {
    const result = await storeCreationTools.publishStore(req.body, environment);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mantis Web API running on http://localhost:${PORT}`);
  console.log(`OpenAPI spec: http://localhost:${PORT}/openapi.json`);
  console.log(`Ready for Claude Web, ChatGPT, and other LLMs`);
});
