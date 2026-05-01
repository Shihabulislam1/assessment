# Phase 5: Analytics & Deployment

> **Time:** ~4–5 hours | **Depends on:** Phase 4

## Goals
- Recharts analytics dashboard (stats + charts)
- CSV export for workspace data + audit log
- Railway deployment (frontend + backend as separate services)
- Seed demo account, README, final polish

---

## 5.1 — Analytics API (`apps/api/src/routes/analytics.routes.js`)

### Endpoints

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/workspaces/:workspaceId/analytics/summary` | Total goals, completed, overdue, items completed this week |
| GET | `/api/workspaces/:workspaceId/analytics/goal-completion` | Goal completion over time (for chart) |
| GET | `/api/workspaces/:workspaceId/analytics/export` | CSV download of workspace data |

### Summary Query

```javascript
const [totalGoals, completedGoals, overdueGoals, itemsCompletedThisWeek] = await Promise.all([
  prisma.goal.count({ where: { workspaceId } }),
  prisma.goal.count({ where: { workspaceId, status: 'COMPLETED' } }),
  prisma.goal.count({ where: { workspaceId, status: { not: 'COMPLETED' }, dueDate: { lt: new Date() } } }),
  prisma.actionItem.count({
    where: { workspaceId, status: 'DONE', updatedAt: { gte: startOfWeek() } },
  }),
]);
```

### Goal Completion Chart Data

Return monthly aggregation for last 6 months:
```javascript
// Group completed goals by month
const data = await prisma.$queryRaw`
  SELECT DATE_TRUNC('month', "updatedAt") as month,
         COUNT(*) as completed
  FROM goals
  WHERE workspace_id = ${workspaceId}
    AND status = 'COMPLETED'
    AND "updatedAt" >= NOW() - INTERVAL '6 months'
  GROUP BY month
  ORDER BY month
`;
```

---

## 5.2 — Recharts Dashboard (`apps/web/src/app/(dashboard)/workspace/[workspaceId]/analytics/page.js`)

```jsx
'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
         PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Layout:
// ┌──────────┬──────────┬──────────┬──────────┐
// │ Total    │ Completed│ Overdue  │ Done     │
// │ Goals    │ Goals    │ Goals    │ This Week│
// ├──────────┴──────────┴──────────┴──────────┤
// │         Goal Completion Chart (Bar)       │
// ├───────────────────┬───────────────────────┤
// │  Status Breakdown │  Priority Distribution│
// │  (Pie Chart)      │  (Pie Chart)          │
// └───────────────────┴───────────────────────┘
```

**Stat cards:** Use glassmorphism style with accent color:
```jsx
<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl p-6 shadow-sm border">
  <p className="text-sm text-gray-500 dark:text-gray-400">Total Goals</p>
  <p className="text-3xl font-bold mt-1">{stats.totalGoals}</p>
</div>
```

---

## 5.3 — CSV Export

### Workspace Data Export

Generate CSV from goals, action items, and members:

```javascript
// apps/api/src/routes/analytics.routes.js
router.get('/:workspaceId/analytics/export', requireAuth, requireWorkspaceMember,
  asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const goals = await prisma.goal.findMany({
      where: { workspaceId },
      include: { owner: { select: { name: true } }, milestones: true },
    });

    const csv = [
      'Title,Status,Owner,Due Date,Milestones,Progress',
      ...goals.map(g => [
        `"${g.title}"`, g.status, g.owner.name,
        g.dueDate?.toISOString() || 'N/A',
        g.milestones.length,
        g.milestones.length ? Math.round(g.milestones.reduce((s,m) => s+m.progress, 0) / g.milestones.length) + '%' : 'N/A'
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="workspace-${workspaceId}-goals.csv"`);
    res.send(csv);
  })
);
```

### Audit Log Export

```javascript
router.get('/:workspaceId/audit-log/export', requireAuth, requireWorkspaceMember,
  asyncHandler(async (req, res) => {
    const logs = await prisma.auditLog.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const csv = [
      'Timestamp,Action,Entity,Entity ID,User,Email,Changes',
      ...logs.map(l => [
        l.createdAt.toISOString(), l.action, l.entity, l.entityId,
        `"${l.user.name}"`, l.user.email,
        `"${JSON.stringify(l.changes || {}).replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
    res.send(csv);
  })
);
```

Frontend: Download button using `fetch` with credentials (required for httpOnly cookies):
```javascript
const handleExport = async (type = 'export') => {
  const url = `${API_URL}/api/workspaces/${workspaceId}/analytics/${type}`;
  const res = await fetch(url, { credentials: 'include' });
  const blob = await res.blob();
  const link = document.createElement('a');
  const blobUrl = URL.createObjectURL(blob);
  link.href = blobUrl;
  link.download = type === 'export' ? 'workspace-export.csv' : 'audit-log.csv';
  link.click();
  URL.revokeObjectURL(blobUrl); // Prevent memory leak
};
```

> [!WARNING]
> Never use `window.open` for CSV downloads — it won't send httpOnly cookies. Always use `fetch` with `credentials: 'include'`, then create a Blob URL. Call `URL.revokeObjectURL()` after `link.click()` to free the blob memory.

---

## 5.4 — Seed Script (`apps/api/prisma/seed.js`)

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  // Demo user
  const hashedPw = await bcrypt.hash('Password123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@fredocloud.com' },
    update: {},
    create: { email: 'demo@fredocloud.com', password: hashedPw, name: 'Demo User' },
  });

  // Demo workspace
  const ws = await prisma.workspace.create({
    data: {
      name: 'FredoCloud Team',
      description: 'Demo workspace for assessment',
      accentColor: '#6366f1',
      members: { create: { userId: user.id, role: 'ADMIN' } },
    },
  });

  // Sample goals, items, announcements...
  // (Create 3-4 goals with milestones, 5-6 action items, 2 announcements)
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Add to `apps/api/package.json`:
```json
{ "prisma": { "seed": "node prisma/seed.js" } }
```

---

## 5.5 — Railway Deployment

### Project Structure on Railway

```
Railway Project: fredocloud
├── Service: api (apps/api)
│   ├── Source: GitHub repo
│   ├── Root Directory: apps/api
│   ├── Build Command: npx prisma generate && npx prisma migrate deploy
│   ├── Start Command: node src/index.js
│   └── Variables: DATABASE_URL (auto), JWT_*, CLOUDINARY_*, CLIENT_URL
├── Service: web (apps/web)
│   ├── Source: GitHub repo
│   ├── Root Directory: apps/web
│   ├── Build Command: npm run build
│   ├── Start Command: npm start
│   └── Variables: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL
└── Plugin: PostgreSQL (auto-injects DATABASE_URL)
```

### Deployment Steps

1. **Push to GitHub** — Clean commit history with conventional commits
2. **Create Railway project** → Connect GitHub repo
3. **Add PostgreSQL plugin** (if not already from Phase 1)
4. **Add `api` service:**
   - Set root directory: `apps/api`
   - Set build: `npx prisma generate && npx prisma migrate deploy`
   - Set start: `node src/index.js`
   - Add env vars: `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `CLOUDINARY_*`, `CLIENT_URL`
5. **Add `web` service:**
   - Set root directory: `apps/web`
   - Set build: `npm run build`
   - Set start: `npm start`
   - Add env vars: `NEXT_PUBLIC_API_URL=https://api-xxx.up.railway.app`, `NEXT_PUBLIC_SOCKET_URL=https://api-xxx.up.railway.app`
6. **Run seed:** After API deploys, exec `node prisma/seed.js` via Railway shell
7. **Verify:**
   - API health check: `https://api-xxx.up.railway.app/api/health`
   - Web app loads and login works with `demo@fredocloud.com`

### Railway `nixpacks.toml` (if needed, in each app root)

```toml
[phases.setup]
nixPkgs = ["nodejs_22"]
```

> [!IMPORTANT]
> Railway auto-detects Node.js apps. You may need `nixpacks.toml` only if specific Node version is required. Ensure `PORT` is NOT hardcoded — Railway injects it.

---

## 5.6 — README.md (Root)

Must include:
- Project overview
- Tech stack table
- Setup instructions (clone, install, env vars, prisma migrate, seed, dev)
- Env variable reference (list all vars)
- **Advanced features chosen:** Audit Log + Advanced RBAC
- Architecture diagram (text-based)
- Known limitations
- Demo credentials: `demo@fredocloud.com` / `Password123!`
- Live URLs (Railway)

---

## 5.7 — Final Checklist

### Submission Requirements
- [ ] **Live URLs** — Two Railway links (web + API)
- [ ] **GitHub repo** — Public, conventional commits
- [ ] **README** — Complete with setup, features, env ref
- [ ] **Video walkthrough** — 3-5 min screen recording
- [ ] **Seeded demo account** — `demo@fredocloud.com` / `Password123!`

### Feature Verification
- [ ] Auth: register, login, logout, refresh, protected routes
- [ ] User profile with avatar upload
- [ ] Workspace: create, switch, invite, roles
- [ ] Goals: CRUD + milestones + activity feed
- [ ] Action items: CRUD + Kanban + list view
- [ ] Announcements: rich text, pin, emoji reactions, comments
- [ ] Real-time: Socket.io live updates across tabs
- [ ] Online presence indicator
- [ ] Analytics dashboard with Recharts
- [ ] CSV export (workspace + audit log)
- [ ] Audit log: immutable timeline, filterable
- [ ] RBAC: Admin/Member permissions enforced
- [ ] Dark mode
- [ ] Responsive layout

### Quality Checks
- [ ] No TypeScript files in entire codebase
- [ ] No console errors in browser
- [ ] API returns proper error responses (not 500 for bad input)
- [ ] Cookies work cross-domain on Railway
- [ ] Socket.io reconnects after disconnect
- [ ] No N+1 queries in Prisma

---

## Gotchas

| Issue | Fix |
|-------|-----|
| Railway can't find `prisma` | Add `prisma` as regular dependency, not just devDep |
| `NEXT_PUBLIC_*` not available | Must be set at BUILD TIME, not just runtime |
| Socket.io fails on Railway | Railway supports WebSockets natively, ensure correct URL |
| CORS fails on Railway | Update `CLIENT_URL` env var with actual Railway web URL |
| CSS not loading in production | Ensure Tailwind purge config includes all content paths |
| Seed script fails | Run after `migrate deploy`, ensure `DATABASE_URL` is set |

## Time Budget Summary

| Phase | Estimated | Focus |
|-------|-----------|-------|
| Phase 1 | 3-4h | Foundation (can't skip any of this) |
| Phase 2 | 4-5h | Schema + Auth (core blocker) |
| Phase 3 | 6-8h | API + Stores (biggest phase, prioritize ruthlessly) |
| Phase 4 | 6-8h | Real-time + UI (cut scope here if behind) |
| Phase 5 | 4-5h | Analytics + Deploy (must finish deployment) |
| **Total** | **23-30h** | Buffer: ~6-13h for debugging/polish |

> [!TIP]
> **If running behind:** Cut dark mode, cut @mentions, simplify Kanban (use list view only), skip milestone progress updates. Focus on: auth → CRUD → deploy → Recharts → audit log. A deployed incomplete app scores higher than a perfect local-only app.
