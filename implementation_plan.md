# Phase 4: Real-time, Media & UI Polish

## User Review Required

> [!IMPORTANT]
> **Cloudinary credentials**: `.env` has `CLOUDINARY_CLOUD_NAME` but needs `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`.

> [!IMPORTANT]
> **Prisma migration**: Adding `imageUrl` to the `Workspace` model requires `npx prisma migrate dev`.

> [!IMPORTANT]
> **react-quill-new**: Using the React 19 compatible fork (`react-quill-new`) instead of `react-quill`. Will uninstall `react-quill` and install `react-quill-new`.

> [!IMPORTANT]
> **Socket URL**: Frontend needs `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000` in `.env.local`.

---

## Proposed Changes

### Component 1: Cloudinary Upload (User Avatar + Workspace Image)

#### Prisma Schema Change

#### [MODIFY] [schema.prisma](file:///home/zishan/assessment/apps/api/prisma/schema.prisma)
Add `imageUrl String?` to the `Workspace` model. Run migration after.

---

#### [NEW] `apps/api/src/config/cloudinary.js`
Cloudinary v2 SDK config from env vars.

#### [NEW] `apps/api/src/services/upload.service.js`
- `uploadToCloudinary(buffer, folder, transformations)` — stream upload, returns `secure_url`
- `uploadUserAvatar(userId, buffer)` — uploads to `avatars/` folder (200×200 face crop), updates `User.avatarUrl`
- `uploadWorkspaceImage(workspaceId, userId, buffer)` — uploads to `workspaces/` folder (400×400 fill crop), verifies admin, updates `Workspace.imageUrl`

#### [NEW] `apps/api/src/controllers/upload.controller.js`
- `uploadAvatar` — handles user avatar upload
- `uploadWorkspaceImage` — handles workspace image upload

#### [NEW] `apps/api/src/routes/upload.routes.js`

| Method | Path | Auth | Action |
|--------|------|------|--------|
| POST | `/api/upload/avatar` | `requireAuth` | User avatar → Cloudinary |
| POST | `/api/upload/workspace/:workspaceId/image` | `requireAuth, requireWorkspaceMember, requireRole('ADMIN')` | Workspace image → Cloudinary |

Both use multer `memoryStorage()`, 5MB limit, image-only filter.

#### [MODIFY] [index.js](file:///home/zishan/assessment/apps/api/src/index.js)
Register: `app.use('/api/upload', uploadRoutes);`

#### [MODIFY] [workspace.service.js](file:///home/zishan/assessment/apps/api/src/services/workspace.service.js)
Include `imageUrl` in `updateWorkspace` data and in all query `select`/`include` results.

---

#### Frontend — Avatar Upload

#### [NEW] `apps/web/src/components/dashboard/settings/AvatarUpload.js`
- Renders current avatar or initials fallback with camera overlay on hover
- Hidden `<input type="file" accept="image/*">`, 5MB client-side validation
- `FormData` + `apiFetch('/api/upload/avatar', { method: 'POST', body: formData })` — no Content-Type header
- On success, updates `authStore.user.avatarUrl`

#### [MODIFY] [GeneralSettingsForm.js](file:///home/zishan/assessment/apps/web/src/components/dashboard/settings/GeneralSettingsForm.js)
Add `AvatarUpload` for user profile. Add workspace image upload section (only visible to admins).

---

### Component 2: Socket.IO Real-time

#### [MODIFY] [socket/index.js](file:///home/zishan/assessment/apps/api/src/socket/index.js)

Full rewrite:
1. **JWT auth middleware** — parse `access_token` from `socket.handshake.headers.cookie`, verify RS256
2. **`join-workspace`** → `socket.join('workspace:<id>')`, track in `onlineUsers` Map
3. **`leave-workspace`** → leave room, remove from presence
4. **`disconnect`** → cleanup all rooms
5. **Emit `online-users`** on join/leave/disconnect
6. Export `getIO()` for controllers

#### [MODIFY] Controllers — emit socket events after mutations

**[goal.controller.js](file:///home/zishan/assessment/apps/api/src/controllers/goal.controller.js)**:
`goal:created`, `goal:updated`, `goal:deleted`, `milestone:created/updated/deleted`, `activity:created`

**[actionItem.controller.js](file:///home/zishan/assessment/apps/api/src/controllers/actionItem.controller.js)**:
`actionItem:created`, `actionItem:updated`, `actionItem:deleted`

**[announcement.controller.js](file:///home/zishan/assessment/apps/api/src/controllers/announcement.controller.js)**:
`announcement:created/updated/deleted`, `comment:created`, `reaction:toggled`

All emit to `workspace:<workspaceId>` room via `getIO().to(...)`.

---

#### Frontend — Socket Hook + Store Subscriptions

#### [NEW] `apps/web/src/hooks/useSocket.js`
- Connect to `NEXT_PUBLIC_SOCKET_URL` with `withCredentials: true`
- Emit `join-workspace` on connect, `leave-workspace` + disconnect on cleanup
- Handle `visibilitychange` for tab sleep reconnection
- Return `socketRef`

#### [NEW] `apps/web/src/store/socketStore.js`
Zustand store: `onlineUsers: []`, `isConnected: boolean`, setters

#### [MODIFY] [goalStore.js](file:///home/zishan/assessment/apps/web/src/store/goalStore.js)
Add `subscribeToSocket(socket)` / `unsubscribeFromSocket(socket)`:
- `goal:created` → prepend, `goal:updated` → map-replace, `goal:deleted` → filter

#### [MODIFY] [actionItemStore.js](file:///home/zishan/assessment/apps/web/src/store/actionItemStore.js)
Same pattern: `actionItem:created/updated/deleted`

#### [MODIFY] [announcementStore.js](file:///home/zishan/assessment/apps/web/src/store/announcementStore.js)
Same pattern + `comment:created`, `reaction:toggled`

#### [MODIFY] [layout.js](file:///home/zishan/assessment/apps/web/src/app/(dashboard)/layout.js)
Wire `useSocket(workspaceId)`, subscribe all stores, listen for `online-users` → `socketStore`, listen for `notification:new` → `notificationStore`

---

### Component 3: Rich-Text Announcements (react-quill-new)

#### Package swap
```bash
# In apps/web
npm uninstall react-quill
npm install react-quill-new
```

#### [NEW] `apps/web/src/components/dashboard/shared/RichTextEditor.js`
SSR-safe wrapper:
```javascript
'use client';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
```
Toolbar: headers, bold/italic/underline, lists, blockquote, code, link, image, clean.

#### [MODIFY] [AnnouncementDialog.js](file:///home/zishan/assessment/apps/web/src/components/dashboard/announcements/AnnouncementDialog.js)
Replace `<Textarea>` with `<RichTextEditor>` for content field.

#### [MODIFY] [AnnouncementCard.js](file:///home/zishan/assessment/apps/web/src/components/dashboard/announcements/AnnouncementCard.js)
Render content via `dangerouslySetInnerHTML` (backend sanitizes). Add CSS for rich content (headings, lists, links).

---

### Component 4: @Mention & Notification System

#### [NEW] `apps/api/src/utils/mentions.js`
```javascript
export function extractMentions(content) {
  const matches = content.match(/@(\w+)/g);
  return matches ? [...new Set(matches.map(m => m.slice(1)))] : [];
}
```

#### [NEW] `apps/api/src/services/notification.service.js`
- `createNotification({ type, content, userId, linkUrl })` — create record, emit `notification:new` via socket
- `getUserNotifications(userId)` — fetch paginated, return `{ notifications, unreadCount }`
- `markAsRead(notificationId, userId)` — ownership check + update
- `markAllAsRead(userId)` — bulk update

#### [NEW] `apps/api/src/controllers/notification.controller.js`
Thin controllers wrapping the service.

#### [NEW] `apps/api/src/routes/notification.routes.js`

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/notifications` | List user's notifications |
| POST | `/api/notifications/:id/read` | Mark one as read |
| POST | `/api/notifications/read-all` | Mark all as read |

#### [MODIFY] [index.js](file:///home/zishan/assessment/apps/api/src/index.js)
Register: `app.use('/api/notifications', requireAuth, notificationRoutes);`

#### [MODIFY] [announcement.service.js](file:///home/zishan/assessment/apps/api/src/services/announcement.service.js)
In `createComment()` and `createAnnouncement()`: extract @mentions → resolve usernames to user IDs → create Notification per mentioned user → emit `notification:new` via socket.

---

#### Frontend — Notification Panel

#### [NEW] `apps/web/src/components/dashboard/shared/NotificationPanel.js`
- Bell icon with unread badge in header
- Popover dropdown with notification list (type icon, content, timestamp)
- Click navigates to `linkUrl`, "Mark all read" button
- Real-time updates via `notification:new` socket event

#### [NEW] `apps/web/src/components/dashboard/shared/OnlineUsers.js`
- Stacked avatar circles with green dot, "N online" count
- Uses `socketStore.onlineUsers`, tooltip with names

#### [MODIFY] [layout.js](file:///home/zishan/assessment/apps/web/src/app/(dashboard)/layout.js)
Add `NotificationPanel` and `OnlineUsers` to dashboard header.

---

### Component 5: Unit Tests

All tests follow the existing pattern: `jest.unstable_mockModule` for ESM mocking, `jest.fn()` for Prisma/service mocks, `supertest` for route tests.

#### [NEW] `apps/api/src/__tests__/services/upload.service.test.js`

Tests for `upload.service.js` (mock Prisma + Cloudinary):
- `uploadToCloudinary` — calls `upload_stream` with correct folder/transformations
- `uploadUserAvatar` — updates user record with returned URL
- `uploadWorkspaceImage` — verifies admin role, updates workspace record
- `uploadWorkspaceImage` — throws Forbidden for non-admin
- Rejects files > 5MB (via multer config — tested at route level)

#### [NEW] `apps/api/src/__tests__/services/notification.service.test.js`

Tests for `notification.service.js` (mock Prisma + Socket):
- `createNotification` — creates record and emits socket event
- `getUserNotifications` — returns paginated list with unread count
- `markAsRead` — updates isRead, throws NotFound for invalid id
- `markAsRead` — throws Forbidden if notification belongs to different user
- `markAllAsRead` — bulk updates all user notifications

#### [NEW] `apps/api/src/__tests__/services/mentions.test.js`

Tests for `utils/mentions.js` (pure function, no mocks needed):
- Extracts single mention: `"hello @john"` → `["john"]`
- Extracts multiple mentions: `"@alice and @bob"` → `["alice", "bob"]`
- Deduplicates: `"@alice @alice"` → `["alice"]`
- Returns empty for no mentions: `"hello world"` → `[]`
- Handles edge cases: empty string, `@` with no name, special chars

#### [NEW] `apps/api/src/__tests__/routes/upload.routes.test.js`

Route-level tests (mock controllers, supertest):
- `POST /api/upload/avatar` — returns 201 with avatar URL (mock controller)
- `POST /api/upload/avatar` — returns 401 without auth
- `POST /api/upload/workspace/:id/image` — returns 201 for admin
- `POST /api/upload/workspace/:id/image` — returns 403 for non-admin

#### [NEW] `apps/api/src/__tests__/routes/notification.routes.test.js`

Route-level tests (mock controllers, supertest):
- `GET /api/notifications` — returns 200 with notification list
- `POST /api/notifications/:id/read` — returns 200
- `POST /api/notifications/read-all` — returns 200
- All routes return 401 without auth

#### [NEW] `apps/api/src/__tests__/middleware/socket.test.js`

Tests for socket JWT auth middleware (mock jwt.verify):
- Allows connection with valid cookie token
- Rejects connection with no token
- Rejects connection with expired/invalid token
- Sets `socket.data.userId` from decoded JWT `sub` claim

---

## File Change Summary

| Layer | File | Action |
|-------|------|--------|
| **Schema** | `prisma/schema.prisma` | MODIFY — add `imageUrl` to Workspace |
| **API Config** | `config/cloudinary.js` | NEW |
| **API Service** | `services/upload.service.js` | NEW |
| **API Service** | `services/notification.service.js` | NEW |
| **API Controller** | `controllers/upload.controller.js` | NEW |
| **API Controller** | `controllers/notification.controller.js` | NEW |
| **API Route** | `routes/upload.routes.js` | NEW |
| **API Route** | `routes/notification.routes.js` | NEW |
| **API Socket** | `socket/index.js` | MODIFY — JWT auth, rooms, presence |
| **API Util** | `utils/mentions.js` | NEW |
| **API Entry** | `index.js` | MODIFY — register new routes |
| **API Controller** | `controllers/goal.controller.js` | MODIFY — emit socket events |
| **API Controller** | `controllers/actionItem.controller.js` | MODIFY — emit socket events |
| **API Controller** | `controllers/announcement.controller.js` | MODIFY — emit socket events |
| **API Service** | `services/announcement.service.js` | MODIFY — @mention notifications |
| **API Service** | `services/workspace.service.js` | MODIFY — include imageUrl |
| **Test** | `__tests__/services/upload.service.test.js` | NEW |
| **Test** | `__tests__/services/notification.service.test.js` | NEW |
| **Test** | `__tests__/services/mentions.test.js` | NEW |
| **Test** | `__tests__/routes/upload.routes.test.js` | NEW |
| **Test** | `__tests__/routes/notification.routes.test.js` | NEW |
| **Test** | `__tests__/middleware/socket.test.js` | NEW |
| **Web Hook** | `hooks/useSocket.js` | NEW |
| **Web Store** | `store/socketStore.js` | NEW |
| **Web Store** | `store/goalStore.js` | MODIFY — socket subscriptions |
| **Web Store** | `store/actionItemStore.js` | MODIFY — socket subscriptions |
| **Web Store** | `store/announcementStore.js` | MODIFY — socket subscriptions |
| **Web Component** | `shared/RichTextEditor.js` | NEW |
| **Web Component** | `shared/NotificationPanel.js` | NEW |
| **Web Component** | `shared/OnlineUsers.js` | NEW |
| **Web Component** | `settings/AvatarUpload.js` | NEW |
| **Web Component** | `announcements/AnnouncementDialog.js` | MODIFY — use RichTextEditor |
| **Web Component** | `announcements/AnnouncementCard.js` | MODIFY — render HTML |
| **Web Component** | `settings/GeneralSettingsForm.js` | MODIFY — avatar + workspace image |
| **Web Layout** | `(dashboard)/layout.js` | MODIFY — socket, notifications, online users |
| **Web Package** | `package.json` | MODIFY — swap react-quill → react-quill-new |

---

### Component 6: Goal Detailed Page (Real-time Collaboration Hub) [NEW]

Create a dedicated view for individual goals where team members can collaborate in real-time.

#### [NEW] [apps/web/src/app/(dashboard)/workspace/[workspaceId]/goals/[goalId]/page.js](file:///home/zishan/assessment/apps/web/src/app/(dashboard)/workspace/[workspaceId]/goals/[goalId]/page.js)
- Detailed goal view fetching `getGoalById`.
- Real-time subscriptions for milestones and activity.

#### [NEW] [apps/web/src/components/dashboard/goals/GoalDetailHeader.js](file:///home/zishan/assessment/apps/web/src/components/dashboard/goals/GoalDetailHeader.js)
- Goal metadata, status, and overall progress.

#### [NEW] [apps/web/src/components/dashboard/goals/MilestoneSection.js](file:///home/zishan/assessment/apps/web/src/components/dashboard/goals/MilestoneSection.js)
- Manage milestones with real-time updates.

#### [NEW] [apps/web/src/components/dashboard/goals/GoalActivityLog.js](file:///home/zishan/assessment/apps/web/src/components/dashboard/goals/GoalActivityLog.js)
- Activity feed for the specific goal.

---

## Verification Plan

### Unit Tests (6 new test files)
```bash
cd apps/api && npm test
```
- `mentions.test.js` — 5+ cases for @mention parsing
- `upload.service.test.js` — 4+ cases for Cloudinary upload + DB update
- `notification.service.test.js` — 5+ cases for CRUD + socket emit
- `upload.routes.test.js` — 4 route-level tests
- `notification.routes.test.js` — 4 route-level tests  
- `socket.test.js` — 4 socket auth middleware tests

### Browser Verification
1. Upload user avatar in Settings → verify Cloudinary URL saved, avatar renders
2. Upload workspace image in Settings → verify admin-only, image renders in sidebar
3. Open two browser tabs → create goal in Tab A → appears in Tab B without refresh
4. Check online users indicator shows presence in header
5. Create announcement with bold/italic/links via rich editor → verify HTML renders
6. @mention user in comment → notification appears in real-time in their notification panel
7. Notification bell shows unread count, mark-as-read works
