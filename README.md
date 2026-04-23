# SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season. Built for the **Shamba Records Software Engineer Intern** technical assessment.

---

## Live Demo

- **Frontend:** https://smartseason-self.vercel.app
- **Backend API:** https://smartseason-5jf8.onrender.com
- **GitHub:** https://github.com/Kimberly-ops177/smartseason

> **Note:** The backend runs on Render's free tier and may take 30–50 seconds to respond on the first request after a period of inactivity. If login seems slow, wait a moment and try again.

---

## Demo Credentials

| Role  | Email                 | Password |
|-------|-----------------------|----------|
| Admin | admin@smartseason.com | admin123 |
| Agent | agent@smartseason.com | agent123 |

---

## Screenshots

### Login Page
The entry point for all users. Clean, minimal login form with JWT-based authentication.

![Login Page](screenshots/smartseason%20login%20page.png)

---

### Admin Dashboard
Gives the coordinator a real-time overview of all fields — total count, active, at-risk, and completed fields, plus a stage breakdown (Planted / Growing / Ready / Harvested). At-risk fields are flagged with an alert.

![Admin Dashboard](screenshots/smartseason%20admin%20dashboard.png)

---

### Admin — All Fields
Admins can view, search, and manage all fields across all agents. Each card shows the crop type, planting date, assigned agent, latest observation note, and computed status badges.

![Admin Fields Page](screenshots/smartseason%20admin%20fields%20page.png)

---

### Admin — Create New Field
Admins can create a new field by specifying the name, crop type, planting date, initial stage, and optionally assigning it to a field agent immediately.

![Create New Field](screenshots/smartseason%20admin%20newfields%20page.png)

---

### Admin — Create New Agent
Admins can onboard new field agents or admin users directly from the dashboard without any external sign-up flow.

![Create New Agent](screenshots/smartseason%20admin%20newagents%20page.png)

---

### Agent Dashboard
Field agents see only a summary of their assigned fields — total, active, at-risk, and completed — keeping their view focused and clutter-free.

![Agent Dashboard](screenshots/smartseason%20Agent%20dashboard.png)

---

### Agent — My Fields
Agents can browse all fields assigned to them, see current stage and status at a glance, and navigate to any field to log an update.

![Agent Fields Page](screenshots/smartseason%20Agent%20fields%20page.png)

---

### Agent — Log a Field Update
Agents can update the stage of a field and add observations or notes. Every update is timestamped and logged to a full history visible on the field detail page.

![Agent Update Field](screenshots/smartseasons%20Agent%20update%20field.png)

---

## Tech Stack

- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** React (Vite)
- **Auth:** JWT (JSON Web Tokens)
- **Deployment:** Vercel (frontend) + Render (backend + PostgreSQL)

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL database
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Kimberly-ops177/smartseason.git
cd smartseason
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```
DATABASE_URL=postgresql://user:password@host:5432/smartseason
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Initialize the database — this creates all tables and seeds the demo users:

```bash
node init-db.js
```

Start the server:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/register` | Admin | Create a user |
| GET | `/api/auth/agents` | Admin | List all agents |

### Fields
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/fields` | Admin | Get all fields |
| GET | `/api/fields/my` | Agent | Get assigned fields |
| GET | `/api/fields/dashboard` | Both | Dashboard stats |
| GET | `/api/fields/:id` | Both | Field detail + update history |
| POST | `/api/fields` | Admin | Create field |
| PUT | `/api/fields/:id` | Admin | Update field |
| DELETE | `/api/fields/:id` | Admin | Delete field |
| POST | `/api/fields/:id/updates` | Both | Log a field update |

---

## Design Decisions

### Field Status Logic

Each field has a computed status derived from its stage and planting date:

- **Completed** — stage is `harvested`
- **At Risk** — stage is `planted` or `growing` AND planting date is more than 90 days ago (indicates a stalled or overdue crop)
- **Active** — everything else

Status is computed server-side on every fetch so there is no stale data stored in the database. This keeps the data model simple while ensuring the status always reflects the current reality of the field.

### Role Separation

- **Admins (Coordinators):** Full CRUD on fields, can create and assign agents, see all fields and a full dashboard overview
- **Field Agents:** Can only see their assigned fields, log stage updates and observations

Route-level middleware enforces access control — agents calling admin-only endpoints receive a 403 response.

### Monorepo Structure

```
smartseason/
├── backend/               # Node.js + Express API
│   ├── init-db.js         # Database initialisation script
│   └── src/
│       ├── config/        # DB connection
│       ├── controllers/   # Business logic
│       ├── middleware/    # Auth + role guards
│       └── routes/        # API routes
└── frontend/              # React (Vite)
    └── src/
        ├── api/           # Axios instance
        ├── components/    # Shared UI components
        ├── context/       # Auth context
        └── pages/         # Route-level pages
```

### Assumptions

- A field can only be assigned to one agent at a time
- Both admins and assigned agents can log updates on a field
- Field status is derived, not stored — computed fresh on each request
- The 90-day threshold for At Risk is a reasonable proxy for a stalled crop and can be configured per crop type in a future iteration
- Demo users are seeded via `init-db.js` for easy testing

---

## Features

- JWT authentication with role-based access control
- Admin dashboard with field count, status breakdown, stage breakdown, and at-risk alerts
- Agent dashboard scoped to assigned fields only
- Full field lifecycle: Planted → Growing → Ready → Harvested
- Timestamped update history per field with agent attribution
- Search and filter on the fields list
- Clean, responsive UI with colour-coded status and stage badges
- Clean, responsive UI
