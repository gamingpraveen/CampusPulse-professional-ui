# CampusPulse — Two-Sided Smart Event Hub & Hosting Pipeline

A starter full-stack college event management project. Students can browse and register for events; organizers can create events. This starter includes a React frontend and an Express/MongoDB backend API.

## Requirements
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Configure the backend
```bash
cd backend
npm install
```
Create `backend/.env` using `.env.example` as a guide, then set `MONGODB_URI` and `JWT_SECRET`.

Start the API:
```bash
npm run dev
```
API runs at `http://localhost:5000`; health check: `http://localhost:5000/api/health`.

## 2. Start the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite (usually `http://localhost:5173`).

## API routes
- `GET /api/health` — health check
- `GET /api/events` — list published events
- `POST /api/events` — create event (starter endpoint; add authentication/role checks before production)
- `POST /api/events/:id/register` — register a student (starter endpoint; add authentication before production)

## Important
This is a learning/demo starter, not production-ready. Before real deployment, implement and enforce authentication/authorization for organizer and student actions, input validation, rate limiting, email verification, and secure secrets management. Never commit `.env`.
