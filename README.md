# SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

Built for the **Shamba Records Software Engineer Intern** technical assessment.

---

## Tech Stack

- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** React (Vite)
- **Auth:** JWT (JSON Web Tokens)
- **Deployment:** Vercel (frontend) + Render (backend + PostgreSQL)

---

## Live Demo

- Frontend: https://smartseason-self.vercel.app
- Backend: https://smartseason-5jf8.onrender.com
- GitHub: https://github.com/Kimberly-ops177/smartseason

---

## Demo Credentials

| Role  | Email                      | Password   |
|-------|----------------------------|------------|
| Admin | admin@smartseason.com      | admin123   |
| Agent | agent@smartseason.com      | agent123   |

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

Run the database schema (in your PostgreSQL client or terminal):

```bash
psql $DATABASE_URL -f src/config/schema.sql
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
| GET | `/api/fields/:id` | Both | Field detail + history |
| POST | `/api/fields` | Admin | Create field |
| PUT | `/api/fields/:id` | Admin | Update field |
| DELETE | `/api/fields/:id` | Admin | Delete field |
| POST | `/api/fields/:id/updates` | Both | Log a field update |

---

## Design Decisions

### Field Status Logic

Each field has a computed status based on its stage and planting date:

- **Completed** — stage is `harvested`
- **At Risk** — stage is `planted` or `growing` AND planting date is more than 90 days ago (indicates a stalled crop)
- **Active** — everything else

This logic is computed server-side on every field fetch so there's no stale data stored in the DB.

### Role Separation

- **Admins (Coordinators):** Full CRUD on fields, can create/assign agents, see all fields and dashboard overview
- **Field Agents:** Can only see their assigned fields, log stage updates and notes

Route-level middleware enforces this — agents calling admin endpoints get a 403.

### Monorepo Structure

```
smartseason/
├── backend/          # Node.js + Express API
│   └── src/
│       ├── config/   # DB connection + schema
│       ├── controllers/
│       ├── middleware/
│       └── routes/
└── frontend/         # React (Vite)
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

### Assumptions

- A field can only be assigned to one agent at a time
- Any user (admin or assigned agent) can log updates on a field
- Status is derived, not stored — computed fresh on each request
- Seeded demo users are included in the schema for easy testing
- Password hashing uses bcrypt (10 rounds)

---

## Features

- JWT authentication with role-based access control
- Admin dashboard with field count, status breakdown, and at-risk alerts
- Agent dashboard showing only assigned fields
- Field lifecycle: Planted → Growing → Ready → Harvested
- Timestamped update history per field
- Search/filter on fields list
- Clean, responsive UI
