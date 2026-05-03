# FredoCloud — Collaborative Team Hub

> A high-performance goal and task management platform built for modern teams. Features real-time synchronization, visual analytics, and granular security auditing.

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black)
![Express.js](https://img.shields.io/badge/Express.js-5.0.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-purple)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-yellow)

---

## 🎯 Project Overview

**FredoCloud** is a comprehensive workspace for teams to align on strategic objectives and execute daily tasks. It combines the clarity of goal tracking with the velocity of Kanban task management, all synchronized in real-time across your team.

---

## ✨ Key Features

### ✅ Strategic Goal Management
- **Milestone Tracking**: Break down large objectives into measurable progress steps.
- **Activity Timelines**: Rich-text activity feeds for every goal with @mention support.
- **Visual Progress**: Real-time progress bars and status indicators.

### ✅ Agile Task Management
- **Kanban & List Views**: Switch between flexible Kanban boards and structured lists.
- **Smart Prioritization**: Categorize tasks by urgency and importance (Low, Medium, High, Urgent).
- **Assignee Management**: Clear ownership for every action item.

### ✅ Team Collaboration
- **Real-time Sync**: Instant updates across all clients via Socket.IO.
- **Online Presence**: See which team members are currently active in the workspace.
- **Notification System**: In-app alerts for mentions, assignments, and status changes.

### ✅ Advanced Analytics & Security
- **Visual Dashboards**: Goal completion trends and task distribution charts powered by Recharts.
- **Immutable Audit Log**: A tamper-proof record of every administrative action and data change.
- **Data Portability**: Export workspace data and security logs to CSV format.
- **RBAC**: Robust Role-Based Access Control (Admin vs. Member permissions).

---

## 🏗️ Architecture

### Monorepo Structure (Turborepo)
```
fredocloud/
├── apps/
│   ├── web/        # Next.js frontend (App Router)
│   └── api/        # Express.js REST API & Socket.IO
├── packages/
│   └── shared/     # Shared constants and utilities
└── prisma/         # Database schema and migrations
```

### Technical Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, Shadcn/UI, Zustand, Recharts.
- **Backend**: Node.js, Express.js 5, Socket.IO 4, Prisma ORM.
- **Database**: PostgreSQL.
- **Real-time**: Bidirectional WebSockets for live state synchronization.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **PostgreSQL**: v15 or higher
- **npm**: v10+

### Installation

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd fredocloud
   npm install
   ```

2. **Configure Environment**
   Create `apps/api/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:pass@localhost:5432/fredocloud
   JWT_PRIVATE_KEY="your-rs256-private-key"
   JWT_PUBLIC_KEY="your-rs256-public-key"
   CLIENT_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your-name
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```

   Create `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

3. **Initialize Database**
   ```bash
   npx turbo run db:generate
   npx turbo run db:migrate:dev
   npx turbo run db:seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

---

## 🔒 Security Features

### Audit Log & RBAC
FredoCloud implements an **Immutable Audit Log** system. Every action (Create, Update, Delete) on Goals, Tasks, and Workspace settings is recorded with:
- Timestamp
- Performing User
- Entity affected
- Detailed JSON change diff

**Permissions:**
- **Admins**: Manage workspace settings, members, and delete any content.
- **Members**: Create and update goals/tasks, but cannot delete workspace-level data.

---

## 🔑 Demo Credentials

Access the pre-seeded demo account:
- **Email**: `demo@fredocloud.com`
- **Password**: `Password123!`

---

## 📡 Deployment

FredoCloud is designed to be deployed as two separate services (Frontend and Backend) with a shared PostgreSQL database.

**Recommended:** [Railway](https://railway.app) for Backend/DB and [Vercel](https://vercel.com) or Railway for Frontend.
