# 🎯 PlaceTrack — Placement Season Command Center

> **Turn the chaos of WhatsApp forwards, college portal notices, and overlapping calendar invites into one structured command center.** Built for final-year students navigating 20–40 campus hiring drives simultaneously.

PlaceTrack gives every student a clear visual pipeline of every company they've applied to, round scheduling with automatic collision detection, 1-click calendar sync, and an interview journal that compounds in prep value with each company.

---

## ✨ Features & Capabilities

| Area | Feature | Why It Matters |
| :--- | :--- | :--- |
| 🗂️ **Kanban Pipeline** | **8-Stage Drag-and-Drop Pipeline** with **Superset tracking** | Move companies smoothly across `Applied → OA → Shortlisted → GD → Tech → HR → Offer / Rejected`. Includes a dedicated checkbox to verify college TPO portal registration. |
| ⚡ **Quick Actions & Undo** | **1-Click Inline Status Actions** + **Undo Toasts** | Mark overdue rounds as `Cleared`, `Did not clear`, or `Completed` directly on cards. Instant bottom-right toast with 5-second `Undo` on all stage and status changes. |
| 📅 **Calendar Sync** | **1-Click Google Calendar & `.ics` Export** | Automatically generates pre-filled Google Calendar links and RFC-5545 `.ics` event files (for Apple Calendar & Outlook) with meeting URLs and locations. |
| ⚠️ **Conflict Detection** | **Real-Time Collision Engine** | Automatically checks time intervals (`startA < endB && startB < endA`) and surfaces warning banners when tests or interview slots overlap. |
| 📖 **Interview Journal** | **Compounding Prep Dataset** | Structured 60-second reflection logs after every round (*Questions asked, Topics covered, What went well, What flopped*). Searchable across all past drives. |
| 🔍 **Pipeline Search & Filter** | **Instant Multi-Tag Filtering** | Real-time search across company name, role, CTC, and location. Quick filter pills for `Active Only`, `Superset Registered`, `In Interviews`, and `Offers`. |
| 🌟 **Community Vault** | **Peer Interview Intelligence** | Campus-shared interview rounds, questions asked, difficulty ratings, pro-tips, and helpful upvoting with anonymous posting options. |
| 🚀 **Public Landing Page** | **Modern SaaS Showcase** | Responsive landing page featuring an interactive live product mockup, problem vs. solution comparison, Community spotlight, and technical architecture deep dive. |
| 🔒 **Security & Isolation** | **Stateless JWT + Tenant Isolation** | Secured Spring Boot backend with BCrypt password hashing and user-isolated JPA queries. |

---

## 🧱 Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling & Design System:** Tailwind CSS v4 + Plus Jakarta Sans + Glassmorphic UI utilities
- **State & Data Fetching:** TanStack Query (React Query) + Zustand
- **Drag & Drop:** `@dnd-kit/core` (with touch-delay sensors and mobile fallbacks)
- **Icons & Routing:** Lucide React + React Router v7

### Backend
- **Framework:** Spring Boot 3.x · Java 21
- **Database & ORM:** PostgreSQL (Supabase) + Spring Data JPA + Hibernate
- **Security:** Spring Security + Stateless JWT Filter + BCrypt
- **Architecture:** Layered Monolith (Controller → Service → Repository → DTOs via Java Records)

```text
PLACETRACK/
├── backend/                  # Spring Boot 3 REST API (org.pramod.backend)
│   ├── src/main/java/org/pramod/backend/
│   │   ├── auth/             # Login, Signup, AuthController & DTOs
│   │   ├── company/          # Company entity, service, controller & stages
│   │   ├── round/            # Round scheduler & ConflictDetectionService
│   │   ├── journal/          # Interview journal notes & question bank
│   │   ├── experience/       # Community experiences, filters & helpful upvotes
│   │   └── security/         # JwtAuthFilter & SecurityConfig
├── frontend/                 # React 19 + Vite Single Page Application
│   ├── src/
│   │   ├── components/       # KanbanBoard, ExperienceModal, ExperienceDetailModal, etc.
│   │   ├── pages/            # Landing, Dashboard, Pipeline, Rounds, Journal, Experiences
│   │   ├── lib/              # Calendar generator, constants, formatters, API client
│   │   ├── hooks/            # TanStack Query mutations and optimistic queries
│   │   └── store/            # Auth & Toast Zustand stores
├── ARCH.md                   # Backend architecture notes & notification engine
├── AI.md                     # Spring AI roadmap & prep coach specifications
└── FEATURES.md               # Feature breakdown
```

---

## 🚀 Getting Started (Running Locally)

PlaceTrack uses **PostgreSQL via Supabase** as its database.

### 1. Database Configuration
In `backend/src/main/resources/application.properties`, configure your Supabase or local PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://<your-supabase-host>:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}
```

Create `backend/src/main/resources/application-secrets.properties` (git-ignored) with:
```properties
DB_PASSWORD=<your-database-password>
```

### 2. Run the Backend (Port 8080)
```bash
cd backend
./mvnw spring-boot:run        # On Windows: .\mvnw.cmd spring-boot:run
```

### 3. Run the Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser:
* **Logged-Out:** You will see the public **Landing Page**.
* **Sign In / Sign Up:** Access the **Dashboard**, **Kanban Pipeline**, and **Rounds Schedule**.

---

## 📡 API Reference

All backend endpoints are under `/api` and require an `Authorization: Bearer <jwt>` header (except auth endpoints).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` · `/api/auth/login` | Register or authenticate user & obtain JWT token |
| `GET` | `/api/auth/me` | Retrieve currently authenticated user profile |
| `GET` `POST` | `/api/companies` | List all companies for user / Create new company |
| `GET` `PUT` `DELETE`| `/api/companies/{id}` | Retrieve, update details, or delete company |
| `PATCH` | `/api/companies/{id}/stage` | Update company stage (powers Kanban drag-and-drop) |
| `GET` `POST` | `/api/companies/{id}/rounds` | Fetch or schedule interview rounds for a company |
| `GET` | `/api/rounds` | List all scheduled & past rounds across companies |
| `GET` | `/api/rounds/upcoming` | Fetch rounds scheduled in the next 7 days |
| `PUT` `DELETE` | `/api/rounds/{id}` | Update round timing, link, status, or delete |
| `GET` `POST` | `/api/rounds/{id}/journal` | Fetch or add journal reflection note for a round |
| `GET` | `/api/journal` | Search and list the complete interview prep dataset |
| `GET` | `/api/analytics/overview` | Fetch conversion funnel, drop-off stats, and counts |

---

## 💡 Key Architectural Highlights (Interview Defense)

* **Interval Overlap Collision Engine:** Pure mathematical interval comparison (`startA < endB && startB < endA`) executing on scheduled rounds to guarantee zero missed clashes.
* **Optimistic Updates & Undo Queues:** Stage drag events mutate local cache immediately via React Query while firing optimistic API patches and creating reversible Undo toast actions.
* **Strict Tenant Scoping:** Every query enforces user ownership (e.g. `companyRepository.findByIdAndUser(id, user)`), eliminating IDOR (Insecure Direct Object Reference) vulnerabilities.
* **RFC-5545 iCalendar & Google Calendar Integration:** Universal 1-click calendar synchronization requiring zero OAuth friction or external API limits.

---

*Built by a student, for students — because placement season deserves better than a Google Sheet.*
