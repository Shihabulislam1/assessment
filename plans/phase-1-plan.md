# Phase 1: Foundation & Monorepo Setup

> **Time:** ~3–4 hours | **Priority:** CRITICAL

## Goals
- Turborepo monorepo with `apps/web` (Next.js) + `apps/api` (Express.js)
- Shared `packages/shared` for constants/validators
- Railway PostgreSQL provisioned
- Both apps start via `turbo run dev`

---

## 1.1 — Initialize Monorepo (Manual)

```bash
mkdir fredocloud && cd fredocloud && git init && npm init -y
npm install turbo --save-dev
```

**Root `package.json`:**
```json
{
  "name": "fredocloud",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "db:migrate": "turbo run db:migrate --filter=api",
    "db:seed": "turbo run db:seed --filter=api"
  },
  "devDependencies": { "turbo": "^2.9.0" }
}
```

> [!IMPORTANT]
> Root scripts must ONLY delegate to `turbo run` — never put task logic here.

**Root `turbo.json`:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "!.next/cache/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "db:migrate": { "cache": false },
    "db:seed": { "cache": false }
  }
}
```

**`apps/web/turbo.json`** — Override for persistent dev server:
```json
{
  "extends": ["//"],
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

> [!NOTE]
> Per Turborepo best practices, apps with long-running dev servers should override `persistent: true` in their own `turbo.json`, while packages with one-shot scripts should not.

---

## 1.2 — Scaffold Next.js Frontend (`apps/web`)

```bash
mkdir -p apps/web
cd apps/web
npx -y create-next-app@latest ./ --js --no-typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --no-turbopack
```

Add dependencies: `zustand`, `socket.io-client`, `recharts`, `react-quill`

**`apps/web/next.config.mjs`** — Add Cloudinary image domain + API proxy rewrite:
```javascript
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` }];
  },
};
export default nextConfig;
```

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 1.3 — Scaffold Express.js Backend (`apps/api`)

```bash
mkdir -p apps/api/src/{routes,middleware,controllers,services,utils,config,socket}
mkdir -p apps/api/prisma
```

**Key settings:** `"type": "module"` in package.json, `dev` script → `node --watch src/index.js`

**Dependencies:** `express@^5`, `cors`, `cookie-parser`, `helmet`, `morgan`, `jsonwebtoken`, `bcryptjs`, `dotenv`, `@prisma/client`, `socket.io`, `cloudinary`, `multer`, `express-rate-limit`, `zod`

### Files to Create:

| File | Purpose |
|------|---------|
| `src/index.js` | Express app + HTTP server + Socket.io init |
| `src/socket/index.js` | Socket.io server setup with CORS |
| `src/utils/asyncHandler.js` | Async route wrapper (catches → `next(err)`) |
| `src/utils/AppError.js` | Custom error classes (AppError, NotFound, Validation, Unauthorized, Forbidden) |

**`src/index.js` essentials:**
- `import 'dotenv/config'` as FIRST import
- Middleware: `helmet()`, `cors({ origin, credentials: true })`, `cookieParser()`, `express.json()`, `morgan()`
- Health check: `GET /api/health` → `{ status: 'ok' }`
- 404 handler + global error handler (4-arg)
- `httpServer = createServer(app)` — Socket.io needs the raw HTTP server
- `initSocket(httpServer)` then `httpServer.listen(PORT)`

**`apps/api/.env`:**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/fredocloud?connection_limit=5&pool_timeout=10
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
# If Railway doesn't handle \n escaping, use base64 instead:
# JWT_PRIVATE_KEY_BASE64=<base64-encoded-key>
# JWT_PUBLIC_KEY_BASE64=<base64-encoded-key>
# Then decode: Buffer.from(process.env.JWT_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:3000
```

---

## 1.4 — Shared Package (`packages/shared`)

```json
{
  "name": "@fredocloud/shared",
  "private": true,
  "type": "module",
  "main": "./src/index.js",
  "exports": { ".": "./src/index.js", "./constants": "./src/constants.js" }
}
```

**`src/constants.js`** — Export: `ROLES`, `GOAL_STATUS`, `ACTION_ITEM_STATUS`, `ACTION_ITEM_PRIORITY`, `AUDIT_ACTION`

Wire into apps: `"@fredocloud/shared": "workspace:*"`

---

## 1.5 — Railway PostgreSQL

1. Create Railway project → Add PostgreSQL plugin
2. Copy `DATABASE_URL` → `apps/api/.env`
3. Railway auto-injects at deploy time

---

## 1.6 — Git Setup

`.gitignore`: `node_modules/`, `.next/`, `dist/`, `.env`, `.env.local`, `.turbo/`

```bash
git add . && git commit -m "feat: initialize turborepo monorepo"
```

---

## Gotchas

| Issue | Fix |
|-------|-----|
| Next.js creates TS files | Delete `tsconfig.json`, use `--js` flag |
| CORS errors | `credentials: true` on both Express and fetch |
| Socket.io won't connect | Attach to `httpServer`, not `app` |
| ESM import errors | `.js` extensions in imports, `"type": "module"` |
| `.env` not loading | `import 'dotenv/config'` must be first |

## Definition of Done ✅

- [ ] `npm run dev` starts both apps
- [ ] `GET /api/health` → 200
- [ ] Next.js loads at `:3000`
- [ ] Socket.io connects (console log)
- [ ] No TypeScript files
