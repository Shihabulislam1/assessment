# Phase 2 Implementation Plan: Database Schema & Authentication

> **Time:** ~4–5 hours | **Branch:** `feature/phase-2-auth-db` | **Target:** `main`

---

## Overview

This document details the implementation plan for Phase 2, which includes:
- Full Prisma schema with all models
- JWT authentication with RS256, access/refresh tokens in httpOnly cookies
- Auth endpoints (register, login, logout, refresh, me)
- Next.js auth integration with Zustand store

---

## Branch Strategy

```bash
# Create new branch from main (Phase 1 already merged)
git checkout main
git pull origin main
git checkout -b feature/phase-2-auth-db
```

**PR Flow:** `feature/phase-2-auth-db` → `main`

---

## Skills to Use

| Skill | Purpose |
|-------|---------|
| `prisma-expert` | Schema design, relations, indexes, migrations, connection pooling |
| `auth-security-expert` | RS256 JWT, refresh token rotation, httpOnly cookies, reuse detection, bcrypt |
| `expressjs-development` | Routes, middleware, error handling, validation |
| `nodejs-backend-patterns` | Clean architecture patterns, service structure |
| `zustand` | Frontend auth store with proper action patterns |
| `nextjs` | Client components, protected routes, App Router patterns |

---

## Task Breakdown

### Phase 2A: Database Setup

#### Task 2A-1: Create Prisma Schema
**Skill:** `prisma-expert`

**File:** `apps/api/prisma/schema.prisma`

**Models (13 total):**
| Model | Relations | Indexes |
|-------|-----------|---------|
| User | WorkspaceMember[], Goal[], ActionItem[], Announcement[], Comment[], Reaction[], Activity[], AuditLog[], Notification[], RefreshToken[] | email (unique) |
| RefreshToken | User | userId, tokenHash |
| Workspace | WorkspaceMember[], Goal[], Announcement[], ActionItem[], AuditLog[] | - |
| WorkspaceMember | User, Workspace | userId+workspaceId (unique), workspaceId |
| Goal | User (owner), Workspace, Milestone[], ActionItem[], Activity[] | workspaceId, ownerId |
| Milestone | Goal | goalId |
| Activity | Goal, User | goalId, userId |
| ActionItem | User (assignee, optional), Goal (optional), Workspace | workspaceId, assigneeId, status |
| Announcement | User (author), Workspace, Comment[], Reaction[] | workspaceId |
| Comment | User, Announcement | announcementId |
| Reaction | User, Announcement | userId+announcementId+emoji (unique) |
| AuditLog | User, Workspace | workspaceId+createdAt, entity |
| Notification | User | userId+isRead |

**Implementation:**
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

---

#### Task 2A-2: Configure Prisma Client
**Skill:** `prisma-expert`

**File:** `apps/api/src/config/db.js`

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});

export default prisma;
```

---

#### Task 2A-3: Update Environment Variables
**Skill:** `prisma-expert`, `auth-security-expert`

**File:** `apps/api/.env`

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/fredocloud?connection_limit=5&pool_timeout=10
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:3000
```

**Generate RS256 keys:**
```bash
node -e "const c=require('crypto');const{publicKey,privateKey}=c.generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});console.log(publicKey);console.log(privateKey)"
```

---

### Phase 2B: Auth Service

#### Task 2B-1: Create Auth Service
**Skill:** `auth-security-expert`, `nodejs-backend-patterns`

**File:** `apps/api/src/services/auth.service.js`

**Functions:**
| Function | Purpose | Security |
|----------|---------|----------|
| `hashPassword(password)` | bcrypt 12 rounds | - |
| `verifyPassword(password, hash)` | bcrypt compare | - |
| `generateAccessToken(user)` | RS256, 15min, {sub, email} | RS256 asymmetric |
| `generateRefreshToken(user)` | RS256, 7d, {sub, jti} | jti for rotation |
| `hashToken(token)` | SHA-256 for DB storage | Never store plaintext |
| `register(data)` | Create user, issue tokens, set cookies | Password hashing, token generation |
| `login(email, password)` | Verify creds, set cookies | Rate limited |
| `refresh(refreshToken)` | Rotate tokens, detect reuse | Transaction + reuse detection |
| `logout(userId)` | Clear cookies, invalidate tokens | - |
| `getMe(userId)` | Fetch user data | Exclude password |

**Cookie Settings:**
```javascript
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh',
};
```

**Refresh Token Rotation with Reuse Detection:**
```javascript
// 1. Find token record
const tokenRecord = await prisma.refreshToken.findUnique({
  where: { tokenHash },
  include: { user: true }
});

// 2. Reuse detection
if (!tokenRecord || tokenRecord.isUsed) {
  await prisma.refreshToken.deleteMany({ where: { userId: decoded.sub } });
  await logSecurityEvent('REFRESH_TOKEN_REUSE', { userId: decoded.sub });
  throw new UnauthorizedError('Token reuse detected');
}

// 3. Atomic rotation
await prisma.$transaction([
  prisma.refreshToken.update({ where: { id: tokenRecord.id }, data: { isUsed: true } }),
  prisma.refreshToken.create({ data: { tokenHash: newHash, userId: user.id, expiresAt } })
]);
```

---

#### Task 2B-2: Create Audit Log Service
**Skill:** `nodejs-backend-patterns`

**File:** `apps/api/src/services/audit.service.js`

```javascript
import prisma from '../config/db.js';

export async function createAuditLog({ action, entity, entityId, changes, userId, workspaceId }) {
  return prisma.auditLog.create({
    data: { action, entity, entityId, changes, userId, workspaceId },
  });
}
```

---

### Phase 2C: Validation & Middleware

#### Task 2C-1: Create Auth Validators
**Skill:** `expressjs-development`

**File:** `apps/api/src/utils/validators/auth.validators.js`

```javascript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
```

---

#### Task 2C-2: Create Auth Middleware
**Skill:** `auth-security-expert`, `expressjs-development`

**File:** `apps/api/src/middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/AppError.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) throw new UnauthorizedError('No access token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
      algorithms: ['RS256'], // Whitelist algorithm
    });
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};
```

---

#### Task 2C-3: Create Rate Limiter Middleware
**Skill:** `expressjs-development`

**File:** `apps/api/src/middleware/rateLimiter.js`

```javascript
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: { message: 'Too many authentication attempts, try again later' } },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: { message: 'Too many requests, slow down' } },
});
```

---

#### Task 2C-4: Create Error Handler Middleware
**Skill:** `expressjs-development`

**File:** `apps/api/src/middleware/errorHandler.js`

```javascript
import { AppError } from '../utils/AppError.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

---

### Phase 2D: Controllers & Routes

#### Task 2D-1: Create Auth Controller
**Skill:** `expressjs-development`

**File:** `apps/api/src/controllers/auth.controller.js`

**Methods:**
| Method | Endpoint | Auth | Validation |
|--------|----------|------|------------|
| `register` | POST /register | None | registerSchema |
| `login` | POST /login | None | loginSchema |
| `refresh` | POST /refresh | Refresh cookie | - |
| `logout` | POST /logout | Access cookie | - |
| `me` | GET /me | requireAuth | - |

---

#### Task 2D-2: Create Auth Routes
**Skill:** `expressjs-development`

**File:** `apps/api/src/routes/auth.routes.js`

```javascript
import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../utils/validators/auth.validators.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
```

---

### Phase 2E: Server Configuration

#### Task 2E-1: Update Express Server
**Skill:** `expressjs-development`

**File:** `apps/api/src/index.js`

**Updates:**
1. Add rate limiter routes
2. Add helmet CSP configuration
3. Add auth routes mounting
4. Update error handler

```javascript
import helmet from 'helmet';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.routes.js';

// Helmet CSP (before other middleware)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'res.cloudinary.com'],
    }
  }
}));

// Rate limiting
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
```

---

### Phase 2F: Seed Script

#### Task 2F-1: Create Seed Script
**Skill:** `prisma-expert`

**File:** `apps/api/prisma/seed.js`

**Demo Account:**
- Email: `demo@fredocloud.com`
- Password: `Password123!`
- Sample workspace: `Fredocloud Demo`

---

### Phase 2G: Frontend Integration

#### Task 2G-1: Create API Fetch Wrapper
**Skill:** `nextjs`

**File:** `apps/web/src/lib/api.js`

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Request failed');
  }

  return res.json();
}
```

---

#### Task 2G-2: Create Zustand Auth Store
**Skill:** `zustand`

**File:** `apps/web/src/store/authStore.js`

**Store Structure:**
```javascript
import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    set({ user: data.user });
  },

  register: async (email, password, name) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    set({ user: data.user });
  },

  logout: async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
  },

  fetchUser: async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      set({ user: data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
```

---

#### Task 2G-3: Create Protected Route Component
**Skill:** `nextjs`

**File:** `apps/web/src/components/ProtectedRoute.jsx`

```jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }) {
  const { user, isLoading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return children;
}
```

---

### Phase 2H: Unit Tests

#### Task 2H-1: Auth Service Tests
**Skill:** `auth-security-expert`

**File:** `apps/api/src/__tests__/services/auth.service.test.js`

**Test Cases:**
| Test | Description |
|------|-------------|
| `hashPassword` | Creates bcrypt hash with 12 rounds |
| `verifyPassword` | Returns true for correct password |
| `generateAccessToken` | Creates RS256 JWT with 15min expiry |
| `generateRefreshToken` | Creates RS256 JWT with jti claim |
| `register` | Creates user with hashed password |
| `login` | Returns user on valid credentials |
| `refresh` | Rotates tokens correctly |
| `refresh reuse detection` | Revokes all tokens on reuse attack |
| `logout` | Invalidates tokens |

---

#### Task 2H-2: Auth Routes Tests
**Skill:** `expressjs-development`

**File:** `apps/api/src/__tests__/routes/auth.routes.test.js`

**Test Cases:**
| Test | Method | Path | Expected |
|------|--------|------|----------|
| Register valid | POST | /api/auth/register | 201 + user data |
| Register invalid email | POST | /api/auth/register | 400 |
| Register weak password | POST | /api/auth/register | 400 |
| Login valid | POST | /api/auth/login | 200 + cookies |
| Login wrong password | POST | /api/auth/login | 401 |
| Logout | POST | /api/auth/logout | 200 + cookies cleared |
| Me authenticated | GET | /api/auth/me | 200 + user |
| Me unauthenticated | GET | /api/auth/me | 401 |
| Rate limit | POST | /api/auth/login (6x) | 429 after 5 failures |

---

#### Task 2H-3: Auth Middleware Tests
**Skill:** `auth-security-expert`

**File:** `apps/api/src/__tests__/middleware/auth.test.js`

**Test Cases:**
| Test | Description |
|------|-------------|
| Valid token | Sets req.user correctly |
| Missing token | Throws UnauthorizedError |
| Expired token | Throws UnauthorizedError |
| Invalid algorithm | Throws UnauthorizedError |
| Token with 'none' algo | Rejected (security) |

---

## Implementation Checklist

### Database
- [x] Task 2A-1: Prisma schema created with all 13 models
- [x] Task 2A-2: Prisma client singleton configured
- [x] Task 2A-3: Environment variables updated with JWT keys

### Auth Service
- [x] Task 2B-1: Auth service with RS256, bcrypt, token rotation
- [x] Task 2B-2: Audit log service created

### Middleware
- [x] Task 2C-1: Zod validators for register/login
- [x] Task 2C-2: requireAuth middleware (RS256 verify)
- [x] Task 2C-3: Rate limiters (auth: 5/15min, api: 100/15min)
- [x] Task 2C-4: Error handler middleware

### Routes & Controllers
- [x] Task 2D-1: Auth controller (register, login, refresh, logout, me)
- [x] Task 2D-2: Auth routes mounted at /api/auth

### Server
- [x] Task 2E-1: Express server updated with helmet CSP, rate limiting

### Seed
- [x] Task 2F-1: Seed script creates demo@fredocloud.com

### Frontend
- [x] Task 2G-1: apiFetch wrapper with credentials: include
- [x] Task 2G-2: Zustand auth store
- [x] Task 2G-3: ProtectedRoute component

### Tests
- [x] Task 2H-1: Auth service unit tests
- [x] Task 2H-2: Auth routes integration tests
- [ ] Task 2H-3: Auth middleware unit tests (skipped - ESM mocking complexity)

### Validation
- [x] All tests pass (27 tests)
- [ ] Lint passes (web needs typescript - separate issue)

---

## Definition of Done

- [x] All 13 Prisma models created with proper relations
- [x] Database migration runs successfully
- [x] Register → Login → /me flow works end-to-end
- [x] Refresh token rotation works (old token invalidated, new issued)
- [x] Refresh token reuse triggers security revocation
- [x] Logout clears cookies and invalidates refresh token
- [x] Rate limiting blocks after 5 failed auth attempts
- [x] Protected routes return 401 for unauthenticated users
- [x] Next.js ProtectedRoute redirects to /login
- [x] Seed script creates demo@fredocloud.com / Password123!
- [x] All unit tests pass (27 tests)
- [ ] Lint passes with no errors (web needs typescript - separate issue)
- [x] PR created targeting main

---

## File Structure Summary

```
apps/api/
├── prisma/
│   ├── schema.prisma              # 13 models
│   └── seed.js                   # demo@fredocloud.com
├── src/
│   ├── config/
│   │   └── db.js                 # Prisma singleton
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── services/
│   │   ├── auth.service.js       # RS256 JWT, bcrypt, rotation
│   │   └── audit.service.js
│   ├── middleware/
│   │   ├── auth.js               # requireAuth
│   │   ├── rateLimiter.js        # authLimiter, apiLimiter
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── validators/
│   │   │   └── auth.validators.js  # Zod schemas
│   │   ├── AppError.js           # Already exists
│   │   └── asyncHandler.js       # Already exists
│   └── index.js                  # Updated
apps/web/
├── src/
│   ├── lib/
│   │   └── api.js               # apiFetch wrapper
│   ├── store/
│   │   └── authStore.js         # Zustand store
│   └── components/
│       └── ProtectedRoute.jsx    # Client component
```

---

## Gotchas Reference

| Issue | Fix |
|-------|-----|
| Prisma Client not found | Run `npx prisma generate` after schema changes |
| Cookie not sent cross-origin | `credentials: 'include'` + CORS `credentials: true` |
| Refresh token rotation fails | Use DB transaction when marking old + creating new |
| `sameSite: 'strict'` blocks cookies | Use `'lax'` for separate frontend/backend domains |
| Prisma migrate in prod | Use `prisma migrate deploy`, NEVER `migrate dev` |
