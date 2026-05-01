# Phase 2: Database Schema & Authentication

> **Time:** ~4–5 hours | **Depends on:** Phase 1

## Goals
- Full Prisma schema with all models (User, Workspace, Goal, Milestone, ActionItem, Announcement, Comment, Reaction, AuditLog, Notification)
- JWT auth with access (15min) + refresh (7d) tokens in httpOnly cookies
- Register, login, logout, refresh, me endpoints
- Next.js auth context + protected route wrapper

---

## 2.1 — Prisma Schema (`apps/api/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pooling for Railway: append ?connection_limit=5&pool_timeout=10 to DATABASE_URL
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String
  name         String
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  memberships  WorkspaceMember[]
  goals        Goal[]           @relation("GoalOwner")
  actionItems  ActionItem[]     @relation("AssignedItems")
  announcements Announcement[]
  comments     Comment[]
  reactions    Reaction[]
  activities   Activity[]
  auditLogs    AuditLog[]
  notifications Notification[]
  refreshTokens RefreshToken[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  tokenHash String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isUsed    Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([tokenHash])
  @@map("refresh_tokens")
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  description String?
  accentColor String   @default("#6366f1")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members      WorkspaceMember[]
  goals        Goal[]
  announcements Announcement[]
  actionItems  ActionItem[]
  auditLogs    AuditLog[]

  @@map("workspaces")
}

model WorkspaceMember {
  id          String   @id @default(cuid())
  role        String   @default("MEMBER") // ADMIN | MEMBER
  joinedAt    DateTime @default(now())
  userId      String
  workspaceId String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
  @@index([workspaceId])
  @@map("workspace_members")
}

model Goal {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   @default("NOT_STARTED")
  dueDate     DateTime?
  ownerId     String
  workspaceId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner       User       @relation("GoalOwner", fields: [ownerId], references: [id])
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  milestones  Milestone[]
  actionItems ActionItem[]
  activities  Activity[]

  @@index([workspaceId])
  @@index([ownerId])
  @@map("goals")
}

model Milestone {
  id         String   @id @default(cuid())
  title      String
  progress   Int      @default(0) // 0-100
  goalId     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  goal       Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId])
  @@map("milestones")
}

model Activity {
  id        String   @id @default(cuid())
  content   String
  goalId    String
  userId    String
  createdAt DateTime @default(now())

  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])

  @@index([goalId])
  @@index([userId])
  @@map("activities")
}

model ActionItem {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   @default("TODO")
  priority    String   @default("MEDIUM")
  dueDate     DateTime?
  assigneeId  String?
  goalId      String?
  workspaceId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assignee    User?     @relation("AssignedItems", fields: [assigneeId], references: [id])
  goal        Goal?     @relation(fields: [goalId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId])
  @@index([assigneeId])
  @@index([status])
  @@map("action_items")
}

model Announcement {
  id          String   @id @default(cuid())
  title       String
  content     String   // Rich text (HTML)
  isPinned    Boolean  @default(false)
  authorId    String
  workspaceId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  author      User       @relation(fields: [authorId], references: [id])
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  comments    Comment[]
  reactions   Reaction[]

  @@index([workspaceId])
  @@map("announcements")
}

model Comment {
  id             String   @id @default(cuid())
  content        String
  authorId       String
  announcementId String
  createdAt      DateTime @default(now())

  author       User         @relation(fields: [authorId], references: [id])
  announcement Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)

  @@index([announcementId])
  @@map("comments")
}

model Reaction {
  id             String   @id @default(cuid())
  emoji          String
  userId         String
  announcementId String
  createdAt      DateTime @default(now())

  user         User         @relation(fields: [userId], references: [id])
  announcement Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)

  @@unique([userId, announcementId, emoji])
  @@map("reactions")
}

model AuditLog {
  id          String   @id @default(cuid())
  action      String   // CREATE, UPDATE, DELETE, INVITE, ROLE_CHANGE
  entity      String   // Goal, ActionItem, Announcement, etc.
  entityId    String
  changes     Json?    // { before: {}, after: {} }
  userId      String
  workspaceId String
  createdAt   DateTime @default(now())

  user        User      @relation(fields: [userId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId, createdAt])
  @@index([entity])
  @@map("audit_logs")
}

model Notification {
  id        String   @id @default(cuid())
  type      String   // MENTION, INVITE, ASSIGNMENT
  content   String
  isRead    Boolean  @default(false)
  userId    String
  linkUrl   String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}
```

**Run migration:**
```bash
cd apps/api
npx prisma migrate dev --name init
```

**Prisma client singleton (`apps/api/src/config/db.js`):**
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});
export default prisma;
```

> [!IMPORTANT]
> **Connection Pooling for Railway:** Append `?connection_limit=5&pool_timeout=10` to `DATABASE_URL` to prevent connection exhaustion on Railway's serverless-like environment:
> ```
> DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10"
> ```

---

**`apps/api/.env`:**
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

> [!TIP]
> Generate the RS256 key pair once with: `node -e "const c=require('crypto');const{publicKey,privateKey}=c.generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});console.log(publicKey);console.log(privateKey)"`
> Store as multiline env vars in `.env` (use `\n` for newlines) and in Railway's variable panel.

---

## 2.2 — Auth Service (`apps/api/src/services/auth.service.js`)

**Key implementation details:**
- **Password hashing:** `bcryptjs` with 12 rounds
- **JWT Algorithm: RS256** (asymmetric) — NOT HS256. Generate RSA key pair for signing/verification:
  ```javascript
  // One-time key generation (store in env vars)
  const { generateKeyPairSync } = require('crypto');
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  ```
- **Access token:** `jwt.sign({ sub: user.id, email }, JWT_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '15m' })`
- **Refresh token:** `jwt.sign({ sub: user.id, jti: cuid() }, JWT_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '7d' })`
- **Verify tokens:** `jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] })`
- **Store refresh token hash** in `RefreshToken` table (SHA-256 hash, never plaintext)
- **Refresh token rotation:** On refresh, mark old token as used, issue new pair. If a used token is reused → revoke ALL user tokens (reuse detection)

> [!CAUTION]
> **Why RS256 over HS256:** HS256 uses a shared secret — if leaked, an attacker can forge any token. RS256 uses asymmetric keys: only the server signs with the private key, and all instances verify with the public key. This is critical for Railway multi-instance deployments where secrets would otherwise need distribution.

**Refresh token reuse detection (explicit implementation):**
```javascript
// In refresh endpoint:
const tokenRecord = await prisma.refreshToken.findUnique({
  where: { tokenHash },
  include: { user: true }
});

if (!tokenRecord || tokenRecord.isUsed) {
  // REUSE ATTACK — revoke all user tokens
  await prisma.refreshToken.deleteMany({ where: { userId: decoded.sub } });
  await logSecurityEvent('REFRESH_TOKEN_REUSE', { userId: decoded.sub });
  throw new UnauthorizedError('Token reuse detected');
}

// Atomic: mark old as used, create new
await prisma.$transaction([
  prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { isUsed: true }
  }),
  prisma.refreshToken.create({ data: { /* new token */ } })
]);
```

**Cookie settings:**
```javascript
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true, secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', maxAge: 15 * 60 * 1000, path: '/',
};
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth/refresh',
};
```

> [!WARNING]
> Use `sameSite: 'lax'` (not `strict`) for cross-origin frontend/backend on Railway. `strict` blocks cookies on initial navigation from external sites.

---

## 2.3 — Auth Routes (`apps/api/src/routes/auth.routes.js`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create user, set cookies |
| POST | `/api/auth/login` | Verify creds, set cookies |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Clear cookies, invalidate refresh token |
| GET | `/api/auth/me` | Get current user (requires auth) |

**Input validation with Zod:**
```javascript
import { z } from 'zod';
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'),
  name: z.string().min(2).max(50),
});
```

---

## 2.4 — Auth Middleware (`apps/api/src/middleware/auth.js`)

```javascript
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/AppError.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) throw new UnauthorizedError('No access token');
  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
      algorithms: ['RS256'],
    });
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};
```

> [!IMPORTANT]
> Always whitelist algorithms in `jwt.verify()` — never allow `'none'`. Use `JWT_PUBLIC_KEY` for verification (can be safely shared across instances).

---

## 2.4a — Rate Limiting (`apps/api/src/middleware/rateLimiter.js`)

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

**Apply in `src/index.js`:**
```javascript
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/', apiLimiter);
```

---

## 2.4b — Helmet CSP Configuration

Configure Content Security Policy to allow Cloudinary images and react-quill inline styles:

```javascript
import helmet from 'helmet';

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
```

> [!NOTE]
> `'unsafe-inline'` for styles is needed because `react-quill` outputs inline styled HTML.

---

## 2.5 — Audit Log Helper (`apps/api/src/services/audit.service.js`)

```javascript
import prisma from '../config/db.js';

export async function createAuditLog({ action, entity, entityId, changes, userId, workspaceId }) {
  return prisma.auditLog.create({
    data: { action, entity, entityId, changes, userId, workspaceId },
  });
}
```

Call this from every mutating endpoint in Phase 3+.

---

## 2.6 — Seed Script (`apps/api/prisma/seed.js`)

Create a demo user: `demo@fredocloud.com` / `Password123!` with a sample workspace. This is required for the submission (seeded demo account).

---

## 2.7 — Next.js Auth Integration

**`apps/web/src/lib/api.js`** — Fetch wrapper with `credentials: 'include'`:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

**Zustand auth store (`apps/web/src/store/authStore.js`):**
```javascript
import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  login: async (email, password) => { /* POST /api/auth/login */ },
  register: async (email, password, name) => { /* POST /api/auth/register */ },
  logout: async () => { /* POST /api/auth/logout, set user: null */ },
  fetchUser: async () => { /* GET /api/auth/me, set user or null */ },
}));
```

**Protected route wrapper (`apps/web/src/components/ProtectedRoute.js`):**
```jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute({ children }) {
  const { user, isLoading, fetchUser } = useAuthStore();
  const router = useRouter();
  useEffect(() => { fetchUser(); }, []);
  useEffect(() => { if (!isLoading && !user) router.push('/login'); }, [user, isLoading]);
  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;
  return children;
}
```

---

## Gotchas

| Issue | Fix |
|-------|-----|
| Prisma Client not found | Run `npx prisma generate` after schema changes |
| Cookie not sent cross-origin | `credentials: 'include'` + CORS `credentials: true` |
| Refresh token rotation fails | Use DB transaction when marking old + creating new |
| `sameSite: 'strict'` blocks cookies | Use `'lax'` for separate frontend/backend domains |
| Prisma migrate in prod | Use `prisma migrate deploy`, NEVER `migrate dev` |

## Definition of Done ✅

- [ ] All tables created in PostgreSQL
- [ ] Register → Login → /me flow works end-to-end
- [ ] Refresh token rotation works
- [ ] Logout clears cookies
- [ ] Protected routes redirect unauthenticated users
- [ ] Seed script creates demo account
