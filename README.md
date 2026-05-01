# FredoCloud — Goal & Task Management Platform

> Real-time productivity hub with visual goal tracking, intelligent prioritization, and automated analytics.

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black)
![Express.js](https://img.shields.io/badge/Express.js-5.0.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![Redis](https://img.shields.io/badge/Redis-7.4.0-red)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-purple)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-yellow)

---

## 🎯 Project Overview

**FredoCloud** is a comprehensive goal and task management platform designed to help individuals and teams achieve their objectives through visual tracking, intelligent prioritization, and seamless collaboration. The platform combines a modern, responsive web interface with a powerful, real-time backend to deliver an exceptional productivity experience.

---

## ✨ Key Features

### ✅ Visual Goal Management
- **Hierarchical Goal Structure**: Organize goals into parent-child relationships for better clarity
- **Visual Goal Cards**: Interactive cards showing progress, status, and deadlines
- **Milestone Tracking**: Break down goals into manageable milestones with individual tracking
- **Progress Visualization**: Real-time progress bars and completion percentages

### ✅ Intelligent Task Management
- **Smart Categorization**: Automatically categorize tasks using AI-powered natural language understanding
- **Priority Prediction**: AI suggests optimal priority levels based on task characteristics
- **Due Date Prediction**: Predicts realistic due dates using historical data
- **Smart Sorting**: Automatically sorts tasks by importance, urgency, and effort

### ✅ Real-time Collaboration
- **Live Updates**: Instant synchronization of goal and task changes across all devices
- **Real-time Notifications**: Instant alerts for updates, mentions, and task completions
- **Online Presence**: See who's online and working on what in real-time
- **Team Dashboards**: Collaborative workspaces for team goal tracking

### ✅ Advanced Analytics
- **AI-Powered Insights**: Natural language explanations of trends and patterns
- **Visual Analytics**: Comprehensive charts and graphs powered by Recharts
- **Completion Analytics**: Track goal completion rates over time
- **Progress Analytics**: Monitor individual and team progress
- **Audit Trails**: Complete audit logs for all changes with detailed change tracking
- **Data Export**: Export workspace data and audit logs to CSV format

### ✅ User Experience
- **Dark Mode**: Built-in dark mode support with automatic theme switching
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Enhanced keyboard navigation for power users
- **Accessibility**: ARIA labels and keyboard navigation support
- **User Onboarding**: Step-by-step guided setup for new users

### ✅ Productivity Tools
- **Quick Capture**: Instant task creation with natural language input
- **Smart Reminders**: Context-aware notifications and reminders
- **Time Tracking**: Track time spent on tasks and goals
- **Streak Tracking**: Visual streaks for consecutive days of productivity

### ✅ Workspace Management
- **Multi-Workspace Support**: Manage multiple workspaces independently
- **Member Management**: Add, remove, and manage workspace members
- **Role-Based Access**: Role-based permissions for workspace members
- **Workspace Analytics**: Track workspace-wide productivity metrics
- **Settings Management**: Configure workspace-specific settings

---

## 🏗️ Architecture

### Monorepo Structure

The project follows a **Turborepo monorepo** architecture for optimal code sharing and development efficiency:

```
fredocloud/
├── apps/
│   ├── web/        # Next.js frontend (React)
│   └── api/        # Express.js backend (Node.js)
├── packages/
│   └── shared/      # Shared code (constants, validators)
├── README.md
├── package.json
└── turbo.json
```

### Technical Stack

- **Frontend**: Next.js 16 with App Router, React 19, Tailwind CSS 4, Recharts
- **Backend**: Express.js 5 with Socket.IO
- **Database**: PostgreSQL (hosted on Railway)
- **Cache**: Redis (hosted on Railway)
- **Real-time**: Socket.IO
- **File Storage**: Cloudinary
- **Deployment**: Vercel (frontend), Railway (backend)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **PostgreSQL**: v15 or higher (via Railway)
- **Redis**: v7 or higher (via Railway)
- **npm** v10+

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd fredocloud
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `apps/api/.env` with:
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/fredocloud
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_ISSUER=fredocloud
JWT_AUDIENCE=fredocloud-api
CSRF_COOKIE_DOMAIN=.yourdomain.com
CSRF_COOKIE_SAMESITE=lax
CSRF_COOKIE_SECURE=true
CSRF_TOKEN_LENGTH=64
# REQUIRED — must be an even integer >= 32. All instances must share the same value.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=http://localhost:3000
```

Create `apps/web/.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. **Start development servers**
```bash
npm run dev
```

This starts both the Next.js frontend (http://localhost:3000) and Express.js API (http://localhost:5000).

---

## 📂 Project Structure

```
apps/
├── web/                 # Next.js frontend
│   ├── src/
│   │   └── app/        # Next.js App Router pages
│   ├── public/         # Static assets
│   ├── next.config.mjs # Next.js configuration
│   └── turbo.json      # Turborepo config
│
├── api/                 # Express.js backend
│   ├── src/
│   │   ├── routes/     # Express routes
│   │   ├── middleware/  # Express middleware
│   │   ├── controllers/# Request handlers
│   │   ├── services/   # Business logic
│   │   ├── utils/      # Utilities
│   │   ├── config/     # Configuration
│   │   └── socket/     # Socket.IO setup
│   ├── prisma/         # Database schema (Phase 2)
│   ├── package.json
│   └── turbo.json      # Turborepo config
│
packages/
└── shared/              # Shared code
    ├── src/
    │   └── constants.js # Shared constants
    └── package.json
```

---

## 🔄 Real-time Sync

Socket.IO enables real-time bidirectional communication between the frontend and backend. The socket server is initialized alongside the Express HTTP server and handles:
- Real-time notifications
- Live updates for goals and tasks
- Online presence tracking

---

## 🔒 Authentication

JWT-based authentication with RS256 algorithm. Keys are configured via environment variables:
- `JWT_PRIVATE_KEY` - For signing tokens
- `JWT_PUBLIC_KEY` - For verifying tokens

---

## 📡 Deployment

### Frontend (Vercel)
- Connects to API via `NEXT_PUBLIC_API_URL` environment variable
- API proxy configured in `next.config.mjs`

### Backend (Railway)
- PostgreSQL database provisioned via Railway
- Redis cache provisioned via Railway
- Environment variables injected at deploy time

---

## 🧪 Testing

```bash
npm run lint     # Lint all packages
npm run build    # Build all packages
```

---

## 🧩 Phases

- **Phase 1**: Monorepo foundation, Next.js frontend, Express backend, Socket.IO
- **Phase 2**: Prisma schema, PostgreSQL, Redis (planned)
- **Phase 3**: Authentication & authorization (planned)
- **Phase 4**: Goal & task management UI (planned)
- **Phase 5**: Analytics & reporting (planned)
