# Phase 4: Real-time, Media, & UI Polish

> **Time:** ~6–8 hours | **Depends on:** Phase 3

## Goals
- Cloudinary avatar upload (profile + workspace images)
- Socket.io real-time: live updates, online status, @mention notifications
- Polished Tailwind CSS UI: Kanban board, dashboard layout, dark mode
- Rich-text editor for announcements

---

## 4.1 — Cloudinary Avatar Upload

### Backend Setup (`apps/api/src/config/cloudinary.js`)

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

### Upload Route (`apps/api/src/routes/upload.routes.js`)

```javascript
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  },
});
```

| Method | Path | Action |
|--------|------|--------|
| POST | `/api/upload/avatar` | Upload to Cloudinary → return URL → update User.avatarUrl |

**Upload to Cloudinary via stream** (avoid writing temp files):
```javascript
import cloudinary from '../config/cloudinary.js';

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }] },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}
```

### Frontend Upload Component

Use `FormData` with `fetch` — don't JSON-encode files:
```javascript
const formData = new FormData();
formData.append('avatar', file);
await fetch(`${API_URL}/api/upload/avatar`, {
  method: 'POST', credentials: 'include', body: formData,
  // NO Content-Type header — browser sets multipart boundary automatically
});
```

---

## 4.2 — Socket.io Real-time Integration

### Backend: Full Socket Setup (`apps/api/src/socket/index.js`)

```javascript
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

let io = null;
const onlineUsers = new Map(); // workspaceId → Set<userId>

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  // Auth middleware — verify JWT from cookie or handshake auth
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
      || parseCookies(socket.handshake.headers.cookie)?.access_token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
      socket.data.userId = decoded.sub;
      next();
    } catch { next(new Error('Invalid token')); }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    // Join workspace room
    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      if (!onlineUsers.has(workspaceId)) onlineUsers.set(workspaceId, new Set());
      onlineUsers.get(workspaceId).add(userId);
      io.to(`workspace:${workspaceId}`).emit('online-users',
        Array.from(onlineUsers.get(workspaceId))
      );
    });

    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      onlineUsers.get(workspaceId)?.delete(userId);
      io.to(`workspace:${workspaceId}`).emit('online-users',
        Array.from(onlineUsers.get(workspaceId) || [])
      );
    });

    socket.on('disconnect', () => {
      for (const [wsId, users] of onlineUsers) {
        if (users.delete(userId)) {
          io.to(`workspace:${wsId}`).emit('online-users', Array.from(users));
        }
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
```

### Emitting Events from API Controllers

In controllers after mutations, emit to the workspace room:

```javascript
import { getIO } from '../socket/index.js';

// After creating a goal:
getIO().to(`workspace:${workspaceId}`).emit('goal:created', goal);

// After updating action item status:
getIO().to(`workspace:${workspaceId}`).emit('actionItem:updated', item);

// After new announcement:
getIO().to(`workspace:${workspaceId}`).emit('announcement:created', announcement);

// After reaction:
getIO().to(`workspace:${workspaceId}`).emit('reaction:toggled', { announcementId, reactions });
```

**Events to emit:**
- `goal:created`, `goal:updated`, `goal:deleted`
- `actionItem:created`, `actionItem:updated`, `actionItem:deleted`
- `announcement:created`, `announcement:updated`
- `reaction:toggled`, `comment:created`
- `online-users` (presence)
- `notification:new` (targeted to user)

### @Mention System

In comment/announcement content, parse `@username` patterns:
```javascript
function extractMentions(content) {
  const matches = content.match(/@(\w+)/g);
  return matches ? matches.map(m => m.slice(1)) : [];
}
```

For each mentioned user → create Notification + emit `notification:new` to their socket.

### Frontend: Socket Hook (`apps/web/src/hooks/useSocket.js`)

```javascript
'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(workspaceId) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (workspaceId) socket.emit('join-workspace', workspaceId);
    });

    return () => {
      if (workspaceId) socket.emit('leave-workspace', workspaceId);
      socket.disconnect();
    };
  }, [workspaceId]);

  return socketRef;
}
```

In Zustand stores, listen for socket events and update state:
```javascript
// In goalStore.js — call this from dashboard layout useEffect
subscribeToSocket: (socket) => {
  socket.on('goal:created', (goal) => {
    set((s) => ({ goals: [...s.goals, goal] }));
  });
  socket.on('goal:updated', (goal) => {
    set((s) => ({ goals: s.goals.map(g => g.id === goal.id ? goal : g) }));
  });
},
```

---

## 4.3 — Kanban Board UI

### Component Structure
```
components/
├── kanban/
│   ├── KanbanBoard.js      ← 3 columns: TODO, IN_PROGRESS, DONE
│   ├── KanbanColumn.js     ← Column with drop target
│   └── KanbanCard.js       ← Draggable card with priority badge
└── actionItems/
    ├── ActionItemList.js    ← Table/list view
    └── ViewToggle.js        ← List ↔ Kanban toggle
```

Use **HTML Drag & Drop API** (no library needed for MVP):
```jsx
function KanbanCard({ item, onDragStart }) {
  return (
    <div draggable onDragStart={(e) => { e.dataTransfer.setData('itemId', item.id); onDragStart(item); }}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[item.priority]}`}>
          {item.priority}
        </span>
      </div>
      <p className="mt-1 font-medium">{item.title}</p>
      {item.dueDate && <p className="text-xs text-gray-500 mt-1">{formatDate(item.dueDate)}</p>}
    </div>
  );
}
```

On drop → call `PUT /api/workspaces/:id/items/:itemId` with `{ status: newColumn }`.

---

## 4.4 — UI Layout & Polish (Tailwind)

### Dashboard Layout (`apps/web/src/app/(dashboard)/layout.js`)

```
┌──────────────────────────────────────────┐
│  TopNav (user avatar, workspace switcher)│
├──────┬───────────────────────────────────┤
│      │                                   │
│ Side │         Main Content              │
│ bar  │                                   │
│      │                                   │
│ Nav  │                                   │
│      │                                   │
└──────┴───────────────────────────────────┘
```

**Sidebar links:** Dashboard, Goals, Action Items, Announcements, Audit Log, Analytics, Settings

**Key Tailwind patterns:**
- Dark mode: `className="dark"` on `<html>`, use `dark:` variants
- Glassmorphism cards: `bg-white/80 backdrop-blur-sm dark:bg-gray-900/80`
- Accent color from workspace: CSS variable `--accent` set dynamically
- Responsive: `lg:flex` for sidebar, mobile hamburger menu

### Rich-Text Editor for Announcements

Use `react-quill` (already in deps):
```jsx
'use client';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
```

> [!WARNING]
> `react-quill` must be loaded with `dynamic()` and `ssr: false` in Next.js App Router — it uses `document` which doesn't exist on server.

---

## Gotchas

| Issue | Fix |
|-------|-----|
| Socket auth with httpOnly cookies | Parse cookie from `socket.handshake.headers.cookie` |
| Cloudinary upload hangs | Use stream upload, not file-based |
| `react-quill` SSR crash | Use `next/dynamic` with `ssr: false` |
| Kanban drag not working on mobile | Add touch event handlers or use a library |
| Online status stale after tab sleep | Handle `visibilitychange` event to reconnect |
| File upload sets wrong Content-Type | Don't set `Content-Type` header — let browser set multipart boundary |

## Definition of Done ✅

- [ ] Avatar upload works → Cloudinary URL saved
- [ ] Real-time updates: creating a goal on one tab shows on another
- [ ] Online users indicator works
- [ ] Kanban drag-and-drop changes status
- [ ] Rich-text announcements render properly
- [ ] Dark mode toggles correctly
- [ ] @Mentions create notifications
