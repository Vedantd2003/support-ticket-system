# SupportOS - AI-Powered Support Ticket System

SupportOS is a full-stack support ticket platform with:
- React frontend with animated UI (Three.js + GSAP)
- Node.js/Express backend
- PostgreSQL database
- Optional Google Gemini-based ticket classification

## Features
- User authentication (register/login/JWT)
- Create, list, filter, update, and delete support tickets
- Dashboard stats for ticket volume, status, priority, and category
- AI ticket classification endpoint (`/api/tickets/classify`)
- Dockerized local setup with one command

## Tech Stack
- Frontend: React 18, Axios, GSAP, Three.js
- Backend: Node.js 20, Express 4, Sequelize 6
- Database: PostgreSQL 16
- AI: Google Gemini (`@google/generative-ai`)
- Infra: Docker, Docker Compose

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

## Run with Docker (Recommended)
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

## Run without Docker
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
