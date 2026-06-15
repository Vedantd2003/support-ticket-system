# SupportOS - AI-Powered Support Ticket System

SupportOS is a full-stack support ticket platform: React frontend with an animated Three.js/GSAP UI, a Node.js/Express + PostgreSQL backend, and optional Gemini-based ticket auto-classification.

## The Problem

Support teams need to triage incoming tickets by category and priority before anyone can act on them — doing that manually for every ticket is slow and inconsistent. SupportOS adds an AI classification step (`/api/tickets/classify`) that uses Gemini to suggest a category and priority from the ticket description, alongside a normal CRUD ticketing flow and a stats dashboard.

## Demo

[TODO: add live demo link or screenshot]

## Tech Stack

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

- Frontend: React 18, Axios, GSAP, Three.js
- Backend: Node.js 20, Express 4, Sequelize 6
- Database: PostgreSQL 16
- AI: Google Gemini (`@google/generative-ai`)
- Infra: Docker, Docker Compose

## Architecture

- `backend/src/controllers` — `authController.js` (register/login/JWT) and `ticketController.js` (CRUD, filters, stats, classify)
- `backend/src/models` — Sequelize models for `User` and `Ticket`
- `backend/src/utils/gemini.js` — wraps the Gemini API with a fixed prompt that classifies a ticket description into one of 4 categories (billing, technical, account, general) and 4 priority levels (low/medium/high/critical), returning strict JSON
- `backend/src/middleware/auth.js` — JWT verification middleware for protected routes
- `frontend/src/pages` — `AuthPage` and `DashboardPage`
- `frontend/src/components` — `TicketForm`, `TicketList`, `StatsDashboard`
- `frontend/src/three/ThreeBackground.js` — a Three.js scene rendered as an animated background behind the UI
- `docker-compose.yml` — wires Postgres + backend + frontend (nginx) into one local stack

## Features
- User authentication (register/login/JWT)
- Create, list, filter, update, and delete support tickets
- Dashboard stats for ticket volume, status, priority, and category
- AI ticket classification endpoint (`/api/tickets/classify`) backed by Gemini
- Animated Three.js background + GSAP transitions on the frontend
- Dockerized local setup with one command

## Project Structure
```text
support-ticket-system/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- tests/
|   |   `-- utils/
|   |-- Dockerfile
|   `-- package.json
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- three/
|   |   `-- utils/
|   |-- Dockerfile
|   `-- package.json
|-- docker-compose.yml
`-- README.md
```

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT required)
- `GET /api/tickets`
- `POST /api/tickets`
- `PATCH /api/tickets/:id`
- `DELETE /api/tickets/:id` (JWT required)
- `POST /api/tickets/classify`
- `GET /api/tickets/stats`

Ticket list filters:
- `category`
- `priority`
- `status`
- `search`

## Local Setup

### Run with Docker (Recommended)
1. Create/update root `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
DB_HOST=postgres
DB_PORT=5432
DB_NAME=support_tickets
DB_USER=postgres
DB_PASSWORD=postgres123
```

2. Start services:
```bash
docker compose up --build
```

3. Open:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Health: `http://localhost:5000/health`

### Run without Docker
Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm start
```

## Environment Notes
- Backend env template: `backend/.env.example`
- Frontend env template: `frontend/.env.example`
- Root `.env` is used by Docker Compose

## Testing
Backend tests:
```bash
cd backend
npm test
```

## Production/Security Notes
- Never commit real API keys or secrets.
- Replace default JWT secret before deployment.
- Restrict CORS to trusted origins in production.

## What I Learned

- Designing the Gemini classification prompt to return strict JSON (fixed category/priority enums) made it reliable enough to plug directly into the ticket model without extra parsing logic.
- Sequelize models plus a Dockerized Postgres made local setup reproducible across environments — `docker compose up --build` brings up the full stack with one command.
- Layering a Three.js animated background behind a data-heavy dashboard required keeping the WebGL canvas decoupled from React's render cycle to avoid performance issues.
