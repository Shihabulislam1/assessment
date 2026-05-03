# FredoCloud — Collaborative Team Hub

A full-stack collaborative team hub built for the FredoCloud technical assessment. The application allows teams to manage shared goals, post announcements, and track action items in real-time.

---

## 🚀 Project Overview

FredoCloud is a robust workspace application designed to streamline team collaboration. It features a complete monorepo architecture with a Next.js frontend and an Express.js backend, communicating via a REST API and WebSockets for real-time synchronization.

**Key capabilities include:**
- **Workspaces:** Create, manage, and switch between workspaces. Invite members and assign roles.
- **Goals & Milestones:** Track strategic goals, nest milestones, and post progress updates to rich-text activity feeds.
- **Action Items:** Manage tasks with Kanban and list views. Assign priorities, due dates, and link to parent goals.
- **Announcements:** Workspace-wide rich-text announcements with emoji reactions and commenting.
- **Real-Time Collaboration:** Socket.io ensures instant updates for new posts, reactions, presence, and status changes.
- **Analytics:** Visual dashboards (using Recharts) for goal completion trends and task statistics, plus CSV data exports.

---

## 🛠️ Tech Stack

- **Monorepo:** Turborepo
- **Frontend:** Next.js 16+ (App Router), JavaScript, Tailwind CSS, Zustand, Recharts
- **Backend:** Node.js, Express.js (REST API)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (Access & Refresh tokens in HTTP-only cookies)
- **Real-time:** Socket.io
- **File Storage:** Cloudinary (Avatars & Attachments)
- **Deployment:** Railway (Frontend & Backend as separate services)

---

## ⭐ Advanced Features Implemented

As per the assessment requirements, the following **two advanced features** were chosen and implemented:

1. **Advanced RBAC (Role-Based Access Control):**
   A comprehensive permission matrix was implemented at both the frontend and API levels. **Admins** have full control to manage workspace settings, invite/remove members, and delete content. **Members** can participate (create goals, action items, announcements, and comments) but cannot perform destructive actions or access administrative settings.

2. **Audit Log:**
   An immutable log of all significant workspace changes (creates, updates, deletes) is maintained. The dashboard includes a filterable timeline UI for the audit log, allowing administrators to track who changed what and when, complete with CSV export capabilities.

---

## 🎁 Bonus Features Implemented

- **Unit & Integration Tests:** Robust backend testing coverage using Jest, ensuring critical business logic and RBAC constraints are securely verified.
- **Rich Text with Mentions:** Implemented `@mentions` in rich-text editors for goals and announcements, triggering UI updates and real-time alerts.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL (v15+)
- npm (v10+)

### 1. Clone & Install
```bash
git clone <repository-url>
cd fredocloud
npm install
```

### 2. Configure Environment Variables
Create the necessary `.env` files based on the reference provided in the next section.

### 3. Database Initialization
From the root directory, run the following commands to set up your PostgreSQL database:
```bash
# Generate Prisma Client
npx turbo run db:generate

# Apply migrations
npx turbo run db:migrate:dev

# Seed the database with demo data
npx turbo run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
This will concurrently start the backend API and the Next.js frontend, allowing you to view the app at `http://localhost:3000`.

---

## 🔐 Environment Variable Reference

### Backend (`apps/api/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/fredocloud
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000  # Or https://your-web.up.railway.app in production
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000       # Or https://your-api.up.railway.app in production
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000    # Or https://your-api.up.railway.app in production
```

---

## 🔑 Demo Credentials

A pre-seeded demo account is available if you ran the `db:seed` script:
- **Email:** `demo@fredocloud.com`
- **Password:** `Password123!`

---

## ⚠️ Known Limitations

- **Email Notifications:** While the `@mention` triggers an in-app notification and WebSocket event, actual email dispatch is omitted to prevent spam during development and testing.
- **Offline Support:** Full offline support (caching and queued writes) was not implemented, as the focus was placed on the Advanced RBAC and Audit Log features.
- **Mobile Responsiveness:** While Tailwind CSS is used and the app is generally responsive, complex views like the Kanban board and detailed analytics charts are best experienced on a desktop or tablet viewport.
- **Collaborative Editing:** Real-time presence and Socket.IO syncing are active, but live collaborative text editing with cursors (like Google Docs) is not supported.

---

## 🚀 Deployment

Both applications are configured to be deployed on **Railway** within a single project:
1. Provision a **PostgreSQL** database plugin.
2. Deploy the `apps/api` folder as a Node.js web service (it will automatically receive `DATABASE_URL`). Provide the remaining env vars.
3. Deploy the `apps/web` folder as a Next.js web service. Provide the `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` pointing to the deployed API service.
