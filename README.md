# School Equipment Lending Portal (MERN)

A full-stack MERN implementation of a **School Equipment Lending Portal** that supports:

- **User Authentication & Roles**: student, staff, admin (JWT-based token login).
- **Equipment Management**: CRUD; name, category, condition, quantity.
- **Borrowing & Returns**: request → approve/reject → issue → return; overlap-safe booking check.
- **Dashboard & Search**: browse/filter equipment by category & availability.
- **Overdue tracking (enhancement)**: due-date checks with a simple cron job and in-app notifications.

> Built to address the assignment requirements in the provided brief (SE ZG503 – FSAD 2024–25).

## Quick Start

### 1) Prerequisites
- Node.js 
- MongoDB (local or Atlas)

### 2) Backend
```bash
cd backend
cp .env.example .env 
npm install
npm run dev
npm start
```
Back-end runs on `http://localhost:5000`. Swagger UI at `http://localhost:5000/api/docs` once running.

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
```
Front-end runs on `http://localhost:5173` (Vite). Dev proxy sends `/api/*` requests to the backend.

---

## Accounts

Use the seed script to create an **admin** and a few sample records:

```bash
cd backend
npm run seed
```

Default seed credentials:
- Admin: `admin@school.test` / `Admin@123`
- Staff: `staff@school.test` / `Staff@123`
- Student: `student@school.test` / `Student@123`

## Tech & Structure

```
mern-equipment-lending-portal/
├── backend/                 # Express + Mongoose + Swagger
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── jobs/
│   │   └── docs/
│   ├── package.json
│   └── .env.example
└── frontend/                # React + Vite
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   └── pages/
    └── package.json
```

## Core Endpoints (overview)

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/equipment`, `POST /api/equipment` (admin), `PUT/DELETE /api/equipment/:id` (admin)
- `POST /api/requests` (create request)
- `GET /api/requests` (own list; staff/admin get all with `?all=true`)
- Actions (staff/admin): `PATCH /api/requests/:id/approve`, `.../reject`, `.../issue`, `.../return`
- Notifications: `GET /api/notifications`

See Swagger for exact schemas and examples.
