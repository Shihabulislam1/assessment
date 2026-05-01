# Phase 3: Core API & State Management

> **Time:** ~6–8 hours | **Depends on:** Phase 2

> [!IMPORTANT]
> **Advanced Features Chosen (2 of 5):**
> 1. **Advanced RBAC** — Permission matrix controlling who can create goals, post announcements, and invite members
> 2. **Audit Log** — Immutable log of all workspace changes; filterable timeline UI with CSV export
>
> These choices are implemented in this phase and finalized in Phase 5. State them clearly in the README.

## Goals
- Full CRUD for Workspaces, Goals, Milestones, Action Items, Announcements
- RBAC middleware (Advanced Feature #1) — Admin/Member permission matrix
- Audit log integration (Advanced Feature #2) — Log every mutation
- Zustand slices for all entities
- Invitation system (invite by email)

---

## 3.1 — RBAC Middleware (`apps/api/src/middleware/rbac.js`)

**Permission Matrix:**

| Action | Admin | Member |
|--------|-------|--------|
| Create workspace | ✅ | ✅ |
| Update workspace settings | ✅ | ❌ |
| Delete workspace | ✅ | ❌ |
| Invite members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Remove members | ✅ | ❌ |
| Create/edit goals | ✅ | ✅ |
| Delete goals | ✅ | ❌ |
| Create/edit action items | ✅ | ✅ |
| Delete action items | ✅ | ❌ |
| Post announcements | ✅ | ❌ |
| Pin announcements | ✅ | ❌ |
| Comment/react | ✅ | ✅ |

```javascript
import prisma from '../config/db.js';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError.js';

/**
 * Middleware: checks user is a member of the workspace.
 * Attaches req.membership = { role, workspaceId }
 */
export const requireWorkspaceMember = async (req, res, next) => {
  const workspaceId = req.params.workspaceId || req.body.workspaceId;
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: req.user.id, workspaceId } },
  });
  if (!membership) throw new ForbiddenError('Not a workspace member');
  req.membership = membership;
  next();
};

/**
 * Middleware factory: checks user has required role.
 * @param {'ADMIN'} role
 */
export const requireRole = (role) => (req, res, next) => {
  if (req.membership.role !== role) {
    throw new ForbiddenError(`Requires ${role} role`);
  }
  next();
};
```

Usage: `router.delete('/:id', requireAuth, requireWorkspaceMember, requireRole('ADMIN'), deleteWorkspace)`

---

## 3.2 — Workspace Routes (`apps/api/src/routes/workspace.routes.js`)

| Method | Path | Auth | RBAC | Action |
|--------|------|------|------|--------|
| POST | `/api/workspaces` | ✅ | — | Create workspace (creator = ADMIN) |
| GET | `/api/workspaces` | ✅ | — | List user's workspaces |
| GET | `/api/workspaces/:workspaceId` | ✅ | Member | Get workspace details + members |
| PUT | `/api/workspaces/:workspaceId` | ✅ | Admin | Update name/description/color |
| DELETE | `/api/workspaces/:workspaceId` | ✅ | Admin | Delete workspace |
| POST | `/api/workspaces/:workspaceId/invite` | ✅ | Admin | Invite by email |
| PUT | `/api/workspaces/:workspaceId/members/:memberId/role` | ✅ | Admin | Change role |
| DELETE | `/api/workspaces/:workspaceId/members/:memberId` | ✅ | Admin | Remove member |

**On create workspace:** auto-add creator as ADMIN member + audit log.

**Invite flow:** Look up user by email → create `WorkspaceMember` with MEMBER role → create Notification → audit log. If user doesn't exist, return error (no email signup in MVP).

---

## 3.3 — Goal Routes (`apps/api/src/routes/goal.routes.js`)

| Method | Path | RBAC | Action |
|--------|------|------|--------|
| POST | `/api/workspaces/:workspaceId/goals` | Member | Create goal |
| GET | `/api/workspaces/:workspaceId/goals` | Member | List goals (with milestones count) |
| GET | `/api/workspaces/:workspaceId/goals/:goalId` | Member | Get goal + milestones + activities |
| PUT | `/api/workspaces/:workspaceId/goals/:goalId` | Member | Update goal |
| DELETE | `/api/workspaces/:workspaceId/goals/:goalId` | Admin | Delete goal |

**Milestones** (nested under goals):

| Method | Path | Action |
|--------|------|--------|
| POST | `.../goals/:goalId/milestones` | Add milestone |
| PUT | `.../goals/:goalId/milestones/:milestoneId` | Update progress |
| DELETE | `.../goals/:goalId/milestones/:milestoneId` | Delete milestone |

**Activity feed** (progress updates):
- POST `.../goals/:goalId/activities` — Add activity update

---

## 3.4 — Action Item Routes (`apps/api/src/routes/actionItem.routes.js`)

| Method | Path | Action |
|--------|------|--------|
| POST | `/api/workspaces/:workspaceId/items` | Create item |
| GET | `/api/workspaces/:workspaceId/items` | List items (filter: status, assignee, priority) |
| GET | `/api/workspaces/:workspaceId/items/:itemId` | Get item |
| PUT | `/api/workspaces/:workspaceId/items/:itemId` | Update item (status, assignee, etc.) |
| DELETE | `/api/workspaces/:workspaceId/items/:itemId` | Delete item (Admin only) |

**Query params for filtering:**
```
?status=TODO,IN_PROGRESS&priority=HIGH&assigneeId=xxx&goalId=xxx&sort=dueDate
```

---

## 3.5 — Announcement Routes (`apps/api/src/routes/announcement.routes.js`)

| Method | Path | RBAC | Action |
|--------|------|------|--------|
| POST | `/api/workspaces/:workspaceId/announcements` | Admin | Create (rich-text content) |
| GET | `/api/workspaces/:workspaceId/announcements` | Member | List (pinned first) |
| PUT | `.../announcements/:id` | Admin | Update / pin/unpin |
| DELETE | `.../announcements/:id` | Admin | Delete |
| POST | `.../announcements/:id/comments` | Member | Add comment |
| POST | `.../announcements/:id/reactions` | Member | Toggle emoji reaction |

**Ordering:** Pinned announcements always on top, then by `createdAt DESC`.

---

## 3.6 — Audit Log Integration

In **every** mutating controller, call `createAuditLog()`:

```javascript
import { createAuditLog } from '../services/audit.service.js';

// After creating a goal:
await createAuditLog({
  action: 'CREATE',
  entity: 'Goal',
  entityId: goal.id,
  changes: { after: { title, status, dueDate } },
  userId: req.user.id,
  workspaceId,
});
```

**Audit log routes:**

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/workspaces/:workspaceId/audit-log` | List audit logs (paginated, filterable) |
| GET | `/api/workspaces/:workspaceId/audit-log/export` | CSV export |

**Filters:** `?entity=Goal&action=CREATE&userId=xxx&from=2026-01-01&to=2026-05-01`

---

## 3.7 — Zustand Stores (Frontend)

**Store structure (`apps/web/src/store/`):**

```
store/
├── authStore.js        ← (from Phase 2)
├── workspaceStore.js   ← Current workspace + members
├── goalStore.js        ← Goals + milestones for current workspace
├── actionItemStore.js  ← Action items for current workspace
├── announcementStore.js← Announcements + comments
├── uiStore.js          ← Sidebar state, modals, view mode (list/kanban)
└── notificationStore.js← User notifications
```

**Pattern for each store** (keep it simple, no class-based — this is vanilla JS):

```javascript
import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    const data = await apiFetch('/api/workspaces');
    set({ workspaces: data, isLoading: false });
  },

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  createWorkspace: async (payload) => {
    const ws = await apiFetch('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    set((s) => ({ workspaces: [...s.workspaces, ws] }));
    return ws;
  },
  // ... updateWorkspace, deleteWorkspace, inviteMember, etc.
}));
```

> [!TIP]
> Since this is vanilla JS (not TypeScript), use JSDoc `@typedef` blocks at the top of each store for documentation, but don't over-invest — focus on working code.

---

## 3.8 — Next.js Page Structure

```
apps/web/src/app/
├── (auth)/
│   ├── login/page.js
│   └── register/page.js
├── (dashboard)/
│   ├── layout.js          ← ProtectedRoute + Sidebar + TopNav
│   ├── page.js            ← Redirect to first workspace
│   └── workspace/
│       └── [workspaceId]/
│           ├── page.js         ← Dashboard overview
│           ├── goals/page.js   ← Goals list
│           ├── items/page.js   ← Action items (list/kanban toggle)
│           ├── announcements/page.js
│           ├── audit-log/page.js
│           ├── analytics/page.js
│           └── settings/page.js
└── layout.js              ← Root layout (fonts, tailwind)
```

---

## Gotchas

| Issue | Fix |
|-------|-----|
| Prisma N+1 on goals with milestones | Use `include: { milestones: true }` |
| Over-fetching with `include` | Use `select` to return only needed fields (see example below) |
| RBAC middleware order matters | `requireAuth` → `requireWorkspaceMember` → `requireRole()` |
| Audit log bloats responses | Don't return audit logs from mutation endpoints |
| Zustand state stale after workspace switch | Reset stores when `currentWorkspace` changes |
| Rich text XSS | Sanitize HTML content before storing (use `sanitize-html`) |

**Prisma `select` optimization (avoid over-fetching):**
```javascript
// Instead of include (which fetches ALL fields):
prisma.goal.findMany({
  where: { workspaceId },
  select: {
    id: true,
    title: true,
    status: true,
    dueDate: true,
    owner: { select: { id: true, name: true, avatarUrl: true } },
    milestones: {
      select: { id: true, title: true, progress: true }
    },
    _count: { select: { activities: true } }
  }
});
```

## Definition of Done ✅

- [ ] All CRUD endpoints functional (test with curl/Postman)
- [ ] RBAC blocks unauthorized actions
- [ ] Audit log entries created for all mutations
- [ ] Zustand stores fetch and update data
- [ ] Next.js pages render data from API
- [ ] Workspace invite flow works
