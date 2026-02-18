# ⚡ SupportOS — AI-Powered Support Ticket System

A full-stack support ticket system built with **Node.js + Express**, **React**, **PostgreSQL**, **Three.js**, **GSAP animations**, and **Google Gemini AI** for automatic ticket classification.

---

## 🚀 Quick Start

### 1. Prerequisites
- Docker & Docker Compose installed
- A Gemini API key → [Get one here](https://aistudio.google.com/app/apikey)

### 2. Set your API key
Edit the `.env` file in the project root:
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Launch everything
```bash
docker-compose up --build
```

That's it! The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health check**: http://localhost:5000/health

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js 20, Express 4, ES6 Modules |
| ORM | Sequelize 6 + PostgreSQL 16 |
| Frontend | React 18, ES6 Modules |
| Animation | GSAP 3 |
| 3D Background | Three.js |
| AI / LLM | Google Gemini 1.5 Flash |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Infrastructure | Docker + Docker Compose |

---

## 🤖 LLM Integration — Why Gemini?

**Google Gemini 1.5 Flash** was chosen because:
- Fast response times (essential for real-time classification as user types)
- Free tier available with generous limits
- Reliable JSON output with proper prompting
- `@google/generative-ai` SDK is simple and well-maintained

**Prompt strategy**: The prompt instructs the model to return **only** a JSON object — no markdown, no preamble. This makes parsing reliable. The response is validated against allowed enum values before being used, so garbage output falls back to defaults gracefully.

**Graceful degradation**: If the API key is missing or the LLM call fails for any reason, the endpoint returns `{ llm_available: false }` and ticket submission still works normally with defaults.

---

## 📁 Project Structure

```
support-ticket-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Sequelize + PostgreSQL config
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, login, /me
│   │   │   └── ticketController.js # CRUD + classify + stats
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT protect/optional/admin
│   │   │   └── errorHandler.js     # Global error handler
│   │   ├── models/
│   │   │   ├── User.js             # User model with bcrypt hooks
│   │   │   └── Ticket.js           # Ticket model with enums
│   │   ├── routes/
│   │   │   ├── auth.js             # /api/auth/*
│   │   │   └── tickets.js          # /api/tickets/*
│   │   ├── utils/
│   │   │   └── gemini.js           # LLM classification utility
│   │   └── server.js               # App entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TicketForm.js       # New ticket form with LLM
│   │   │   ├── TicketList.js       # Filterable ticket list
│   │   │   └── StatsDashboard.js   # Stats + breakdown bars
│   │   ├── hooks/
│   │   │   └── useAuth.js          # Auth context + hook
│   │   ├── pages/
│   │   │   ├── AuthPage.js         # Login/register page
│   │   │   └── DashboardPage.js    # Main dashboard
│   │   ├── three/
│   │   │   └── ThreeBackground.js  # Animated 3D background
│   │   ├── utils/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env                            # ← set your GEMINI_API_KEY here
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | 🔒 JWT | Get current user |
| GET | `/api/tickets` | — | List tickets (filterable) |
| POST | `/api/tickets` | Optional | Create ticket |
| PATCH | `/api/tickets/:id` | Optional | Update ticket |
| DELETE | `/api/tickets/:id` | 🔒 JWT | Delete ticket |
| POST | `/api/tickets/classify` | — | AI classification |
| GET | `/api/tickets/stats` | — | Aggregated stats |

**Query params for GET /api/tickets**: `?category=`, `?priority=`, `?status=`, `?search=`

---

## 🎨 Design Decisions

- **MVC architecture**: Controllers, models, routes, and middleware are fully separated for maintainability.
- **ES6 modules**: All files use `import/export` (no CommonJS `require`). Both `package.json` files have `"type": "module"`.
- **DB-level aggregation**: The `/stats` endpoint uses Sequelize `fn('COUNT', ...)` and `group()` — no Python/JS-level loops over all rows.
- **Three.js background**: Animated particle field + wireframe torus gives the app a futuristic feel without impacting performance (uses `requestAnimationFrame` + proper cleanup).
- **GSAP animations**: Page transitions, card reveals, form shakes on error, badge pop-ins on AI suggestion.
- **Graceful auth**: Tickets can be submitted by guests (no JWT required). If a token exists, it's attached and the author is recorded.
- **Retry logic**: Backend retries DB connection up to 10 times with 3s delay — essential for Docker startup ordering.
