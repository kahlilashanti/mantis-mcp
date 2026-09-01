# Mantis Web API

**Works with Claude Web, ChatGPT, Perplexity, and any LLM that supports function calling.**

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build
```bash
npm run build
```

### 3. Run Locally
```bash
npm run start:api
```

Server runs on http://localhost:3000

### 4. Test It
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","service":"mantis-api"}
```

---

## Deploy to Production

### Vercel (Recommended - Free Tier)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Get your URL: `https://your-project.vercel.app`

### Railway

```bash
railway login
railway init
railway up
```

### Render

1. Connect GitHub repo
2. Set build command: `npm install && npm run build`
3. Set start command: `npm run start:api`

---

## Connect to Claude Web

1. **Get your API URL** (e.g., `https://your-api.vercel.app`)

2. **Open Claude Web** (claude.ai)

3. **In any conversation, type:**
   ```
   Use this API to help me create a store:
   https://your-api.vercel.app/openapi.json
   ```

4. **Claude will load the API and can now call your tools**

5. **Try the flow:**
   ```
   I need to build a store that sells better than what I have now.
   I sell sneakers - about 15 different styles. What do I need to do?
   ```

---

## Connect to ChatGPT

1. **Go to:** https://platform.openai.com/docs/actions

2. **Create new Action**

3. **Import OpenAPI spec:**
   - Upload `openapi.json` OR
   - Point to `https://your-api.vercel.app/openapi.json`

4. **Save and test**

---

## Environment Variables

Optional (for real API integration):
```bash
MANTIS_API_URL=https://your-mantis-instance.com
MANTIS_AUTH_TOKEN=your-token
PORT=3000
```

---

## Endpoints

### POST /api/import-catalog
Import products from Shopify, CSV, or manual input

### POST /api/create-store
Create showroom with products

### POST /api/publish-store
Publish showroom to make it live

---

## CORS

CORS is enabled for all origins in development.

For production, update `src/web-api.ts`:
```typescript
app.use(cors({
  origin: ['https://claude.ai', 'https://chat.openai.com']
}));
```

---

## Status

- ✅ Works with Claude Web
- ✅ Works with ChatGPT (via Actions)
- ✅ Works with any HTTP client
- ⚠️ Backend endpoints mocked (returns sample data)
- ⚠️ Real integration requires Mantis backend updates

When backend is ready, tools automatically use real API (no code changes needed).
