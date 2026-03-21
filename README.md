# 📝 TaskFlow — Task Management System

`A full-stack task management application built as part of a Software Engineering Assessment. TaskFlow allows users to register, log in, and perform full management of their personal tasks — with a timer system, statistics, and a polished dark UI.`

## ❗ About

TaskFlow is a complete task management system with a Node.js backend API and a Next.js web frontend. Users can create, organize, and track their tasks with real-time search, filtering, and status management. The app also includes a built-in timer to track how long tasks take, time goal challenges, and an Apple Fitness-style statistics section that unlocks after completing 3 tasks.

**Track:** Track A — Full-Stack (Backend + Web Frontend)

**Submitted by:** Debarka Mandal — March 2026


## 🧰 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + TypeScript | Runtime and language |
| Express.js | Web framework |
| Prisma ORM | Database access |
| SQLite (libsql) | Database |
| JWT | Authentication (access + refresh tokens) |
| bcryptjs | Password hashing |

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Axios | HTTP client with auto token refresh |
| Lucide React | Icons |
| React Hot Toast | Notifications |

## 🚀 Features

### Backend API
- ✅ JWT Authentication — access token (15 min) + refresh token (7 days)
- ✅ Password hashing with bcrypt — never stores plain text
- ✅ Full CRUD for tasks — create, read, update, delete
- ✅ Pagination, filtering by status, search by title
- ✅ Protected routes with JWT middleware
- ✅ Timer sessions saved to database
- ✅ Time goal setting per task
- ✅ Toggle task status endpoint

### Frontend
- ✅ Animated landing page with glass slab UI
- ✅ Register and Login pages with form validation
- ✅ Protected dashboard (middleware redirects unauthenticated users)
- ✅ Task list with real-time search and filter pills
- ✅ Add, Edit, Delete, Toggle tasks with instant UI updates
- ✅ Toast notifications for every action
- ✅ Timer section — start/stop timer per task, countdown mode with time goals
- ✅ Beat the goal challenge — set a time goal and race against it
- ✅ Apple Fitness-style activity rings for statistics
- ✅ Stats unlock after completing 3 tasks (gamification)
- ✅ Today's stats + monthly breakdown chart
- ✅ Silent token refresh — user never gets logged out unexpectedly
- ✅ Responsive design


## 🍿 Demo Video

https://github.com/user-attachments/assets/53bb8b63-fd84-43cd-8581-35b4fbc82749



## 🏗️ Project Structure

```
task-management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     ← database schema
│   │   └── migrations/       ← migration history
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts       ← register, login, refresh, logout
│   │   │   ├── tasks.ts      ← CRUD + toggle
│   │   │   └── timer.ts      ← timer sessions + stats
│   │   ├── middleware/
│   │   │   └── auth.ts       ← JWT guard
│   │   ├── lib/
│   │   │   ├── prisma.ts     ← DB singleton
│   │   │   └── jwt.ts        ← token helpers
│   │   └── index.ts          ← entry point
│   └── .env
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx           ← homepage
        │   ├── login/page.tsx     ← login
        │   ├── register/page.tsx  ← register
        │   └── dashboard/page.tsx ← main dashboard
        ├── components/
        │   ├── TaskCard.tsx
        │   ├── TaskModal.tsx
        │   ├── TimerSection.tsx
        │   └── StatsSection.tsx
        ├── lib/
        │   ├── api.ts             ← all API calls
        │   └── auth.ts            ← token management
        └── proxy.ts               ← route protection
```

## ⛳ API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Login + get tokens | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout | No |

### Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks (paginated) | Yes |
| POST | `/tasks` | Create a task | Yes |
| GET | `/tasks/:id` | Get single task | Yes |
| PATCH | `/tasks/:id` | Update a task | Yes |
| DELETE | `/tasks/:id` | Delete a task | Yes |
| PATCH | `/tasks/:id/toggle` | Toggle done/pending | Yes |

### Timer
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/timer` | Save timer session | Yes |
| GET | `/timer` | Get all sessions | Yes |
| GET | `/timer/stats` | Get aggregated stats | Yes |

## 💻 Getting Started

### Prerequisites
- Node.js v20 LTS — [nodejs.org](https://nodejs.org)
- npm v10+
- Git
- TypeScript
- Prisma
- Express.js

### 1. Clone the repository
```bash
git clone <(https://github.com/Da9TH5e/Tasker)>
cd (any name for folder)
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=5000
```

Run migrations and start:
```bash
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

API running at → **http://localhost:5000**

### 3. Set up the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
App running at → **http://localhost:3000**


## ⚠️ Common Issues

**Tasks not showing** → Hard refresh (Ctrl+Shift+R) or log out and back in.

**Foreign key error on task creation** → Database was reset but old token remains in browser. Log out and register a new account.

**Cannot connect to backend** → Make sure backend is running on port 5000 before starting the frontend.

**Token expired** → Access tokens expire every 15 minutes. The app silently refreshes them — if it fails, simply log in again.
