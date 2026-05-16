# 🪐 PLANETY — Full Stack Setup Guide

## Quick Start

### 1. Start the Backend API
```bash
cd backend
node server.js
```
API runs at: **http://localhost:3001**

### 2. Open the Frontend
Open `frontend/index.html` in your browser (just double-click it, or serve it):
```bash
# Option A - just open the file
open frontend/index.html

# Option B - serve with Python
python3 -m http.server 8080 --directory frontend
# then visit http://localhost:8080
```

---

## 🔐 Demo Login Credentials
| Email | Password | Role |
|-------|----------|------|
| john@planety.com | password123 | Admin |
| elena@planety.com | pass456 | Sr. Data Scientist |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email + password → returns JWT |
| GET | `/api/auth/me` | Get current user profile |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List all goals for logged-in user |
| POST | `/api/goals` | Create a new goal |
| PUT | `/api/goals/:id` | Update a goal (name, status, priority, etc.) |
| PATCH | `/api/goals/:id/milestone/:milestoneId` | Toggle milestone done/undone |
| DELETE | `/api/goals/:id` | Delete a goal |

### Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/team` | List all team members |
| POST | `/api/team` | Add a team member |
| PUT | `/api/team/:id` | Update a team member |
| DELETE | `/api/team/:id` | Remove a team member |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated stats for the dashboard |
| GET | `/api/performance` | Performance metrics, charts, dept breakdown |

---

## 🗂 Project Structure
```
planety/
├── backend/
│   ├── server.js        ← Express API (auth, goals, team, performance)
│   ├── package.json
│   └── node_modules/
├── frontend/
│   └── index.html       ← Full SPA (login + all dashboard pages)
├── start.js             ← Convenience launcher
└── README.md
```

## 🔧 Tech Stack
- **Backend**: Node.js, Express, bcryptjs, jsonwebtoken, uuid
- **Storage**: In-memory (data resets on server restart — swap for SQLite/Postgres for persistence)
- **Frontend**: Vanilla HTML/CSS/JS + Three.js (no build step needed)
- **Auth**: JWT (7-day tokens, stored in localStorage)

## 💡 To add real persistence
Replace the `db` object in `server.js` with a real database.
Recommended: **SQLite** (via `better-sqlite3`) for local, or **PostgreSQL** for production.
