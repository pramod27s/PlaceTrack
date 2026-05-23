# PlaceTrack — Placement Season Command Center

> Turn the chaos of WhatsApp forwards, portal notices, and calendar invites into
> one structured pipeline. PlaceTrack is a personal command center that helps
> final-year students survive placement season.

PlaceTrack gives every student a clear visual pipeline of every company they've
applied to, a schedule with automatic conflict detection, and an interview
journal that compounds in value with each company.

---

## ✨ Features

| Area | What it does |
|------|--------------|
| **Kanban pipeline** | Drag company cards across 8 stages: Applied → OA → Shortlisted → GD → Tech → HR → Offer / Rejected |
| **Round scheduler** | Attach date, time, mode, duration, and meeting link to every round |
| **Conflict detection** | The API flags any two rounds whose time windows overlap |
| **Interview journal** | A structured per-round log of questions, topics, and reflections — your personal prep dataset |
| **Notifications** | In-app bell surfaces conflicts and rounds happening within 24 hours |
| **Analytics** | Conversion funnel, stage-wise drop-off, and shortlist / offer rates — an honest mirror |
| **Company research** | A notes field per company for culture, tech stack, and interviewer names |
| **Auth** | Email + password sign-in with stateless JWT; all data is private per user |

---

## 🧱 Tech Stack

**Backend** — Spring Boot 4 · Java 21 · Spring Data JPA · Spring Security (JWT) ·
Bean Validation · PostgreSQL (Supabase)

**Frontend** — React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router ·
TanStack Query · Zustand · dnd-kit

```
e:\newProject
├── backend/    Spring Boot REST API  (org.pramod.backend)
├── frontend/   React + Vite single-page app
├── ARCH.md     Backend architecture notes
├── FEATURES.md Feature summary
└── PROJECT_IDEA.md  Original product brief
```

---

## 🚀 Running locally

PlaceTrack uses a **Supabase PostgreSQL** database — the single source of truth.

### Database config

The connection lives in `backend/src/main/resources/application.properties`,
and the database password is loaded from `application-secrets.properties`
(git-ignored). That secrets file must exist and contain:

```properties
DB_PASSWORD=<your-supabase-database-password>
```

Connection details come from **Supabase Dashboard → Connect → Session pooler**.
Hibernate creates / updates the schema automatically on first run.

### 1. Backend (port 8080)

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and create an account from the sign-up screen.
The Vite dev server proxies `/api` to the backend automatically.

### Production secrets

For any non-local deployment, set these as environment variables:

- `DB_PASSWORD` — the Supabase database password
- `JWT_SECRET` — a long random string for signing tokens
- `CORS_ORIGINS` — comma-separated list of allowed frontend origins

---

## 📡 API overview

All endpoints are under `/api` and (except auth) require an
`Authorization: Bearer <jwt>` header.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/register` · `/api/auth/login` | Get a JWT |
| `GET`  | `/api/auth/me` | Current user |
| `GET POST` | `/api/companies` | List / create companies |
| `GET PUT DELETE` | `/api/companies/{id}` | Single company |
| `PATCH` | `/api/companies/{id}/stage` | Move a card (Kanban drag) |
| `GET POST` | `/api/companies/{id}/rounds` | Rounds for a company |
| `GET` | `/api/rounds` · `/api/rounds/upcoming` | All / next-7-days rounds |
| `PUT DELETE` | `/api/rounds/{id}` | Single round |
| `GET PUT` | `/api/rounds/{id}/journal` | Read / upsert a journal entry |
| `GET` | `/api/journal` | The full interview-prep dataset |
| `GET` | `/api/analytics/overview` | Funnel + conversion metrics |

---

*Built by a student, for students — because placement season deserves better
than a Google Sheet.*
