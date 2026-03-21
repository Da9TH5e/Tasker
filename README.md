# TaskFlow — Task Management System

A full-stack task management application built with Node.js, TypeScript, Next.js, and Prisma.

---

## Project Structure

```
task-management/
├── backend/        ← Node.js + TypeScript REST API
└── frontend/       ← Next.js + TypeScript web app
```

---

## Tech Stack

### Backend
- **Node.js** + **TypeScript** — runtime and language
- **Express.js** — web framework
- **Prisma ORM** — database access
- **SQLite** — database (via libsql adapter)
- **JWT** — authentication (access + refresh tokens)
- **bcryptjs** — password hashing

### Frontend
- **Next.js 16** (App Router) — React framework
- **TypeScript** — type safety
- **Tailwind CSS** — styling
- **shadcn/ui** — UI components
- **Axios** — HTTP client
- **Lucide React** — icons
- **React Hot Toast** — notifications
- **Recharts** — charts

---

## Prerequisites

Make sure you have these installed:

- **Node.js** v20 LTS or higher → [nodejs.org](https://nodejs.org)
- **npm** v10 or higher (comes with Node.js)
- **Git** → [git-scm.com](https://git-scm.com)

Verify your installation:
```bash
node -v    # should print v20.x.x
npm -v     # should print 10.x.x
git --version
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd task-management
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_ACCESS_SECRET="your-super-secret-access-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
PORT=5000
```

Run database migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the backend server:

```bash
npm run dev
```

The API will be running at **http://localhost:5000**

You should see:
```
Server running on http://localhost:5000
```

### 3. Set up the Frontend

Open a **new terminal** (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

The web app will be running at **http://localhost:3000**

---

## Using the App

1. Go to **http://localhost:3000**
2. Click **Get Started** to create an account
3. Register with your email and password
4. You'll be redirected to your dashboard
5. Start creating and managing tasks!

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (paginated, filterable, searchable) |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/:id` | Get a single task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/toggle` | Toggle task status |

### Timer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/timer` | Save a timer session |
| GET | `/timer` | Get all timer sessions |
| GET | `/timer/stats` | Get timer statistics |

---

## Features

### Track A — Full-Stack (Completed ✅)

**Backend:**
- ✅ JWT Authentication with access + refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Full CRUD for tasks
- ✅ Pagination, filtering by status, search by title
- ✅ Protected routes with JWT middleware
- ✅ Timer sessions saved to database
- ✅ Time goal setting per task

**Frontend:**
- ✅ Landing page with animated glass slab UI
- ✅ Register and Login pages
- ✅ Protected dashboard (redirects to login if not authenticated)
- ✅ Task list with real-time search and filter
- ✅ Add, Edit, Delete, Toggle tasks
- ✅ Toast notifications for all actions
- ✅ Timer section with countdown and goal tracking
- ✅ Statistics section with Apple Fitness-style activity rings
- ✅ Stats unlock after completing 3 tasks (gamification)
- ✅ Today's stats + monthly breakdown
- ✅ Responsive design
- ✅ Automatic token refresh (silent, user never sees it)

---

## Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database path |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (15 min expiry) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (7 day expiry) |
| `PORT` | Port to run the server on (default: 5000) |

---

## Database Schema

```prisma
model User {
  id           String       @id @default(cuid())
  email        String       @unique
  password     String       # bcrypt hashed
  createdAt    DateTime     @default(now())
  tasks        Task[]
  timerEntries TimerEntry[]
}

model Task {
  id           String       @id @default(cuid())
  title        String
  description  String?
  status       String       @default("pending") # pending | in_progress | done
  timeGoal     Int?         # goal in seconds
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  userId       String
  timerEntries TimerEntry[]
}

model TimerEntry {
  id        String   @id @default(cuid())
  duration  Int      # time taken in seconds
  beatGoal  Boolean? # did user beat their time goal?
  createdAt DateTime @default(now())
  taskId    String
  userId    String
}
```

---

## Development Scripts

### Backend
```bash
npm run dev      # start with hot reload (nodemon)
npm run build    # compile TypeScript
npm run start    # run compiled JavaScript
```

### Frontend
```bash
npm run dev      # start development server
npm run build    # build for production
npm run start    # run production build
npm run lint     # run ESLint
```

---

## Common Issues

**"Cannot connect to backend"**
→ Make sure the backend server is running on port 5000 before starting the frontend.

**"Token expired" / redirected to login**
→ The access token expires every 15 minutes. Simply log in again. The app will silently refresh tokens while you're using it.

**"Foreign key constraint violated"**
→ This happens if the database was reset but old tokens remain. Log out and register a new account.

**Tasks not showing after creation**
→ Hard refresh the page (Ctrl+Shift+R). If the problem persists, log out and log back in.

---

## Submitted By

- **Name:** Debarka Mandal
- **Track:** Track A (Full-Stack — Backend + Web Frontend)
- **Date:** March 2026
