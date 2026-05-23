# PlaceTrack — Personal Placement Season Command Center

> A focused web app that helps final-year students survive placement season by turning a chaotic mix of WhatsApp forwards, calendar invites, and spreadsheets into a single, structured pipeline.

---

## 1. The Problem

During placement season, a typical student is juggling **20–40 companies** at once. Each company has its own multi-stage process:

- Pre-Placement Talk (PPT)
- Online Assessment (OA) / Coding Test
- Group Discussion (GD)
- Technical Interview (often 2–3 rounds)
- HR Interview
- Final Offer

Today, most students manage this through:
- A messy Excel sheet
- Screenshots of college placement portal notices
- WhatsApp group pings about schedule changes
- Memory (which is the first thing to break under stress)

The result: **missed rounds, double-booked slots, forgotten resume versions, and no learning loop across interviews.**

---

## 2. The Idea — In One Line

> **PlaceTrack is a Kanban-style placement tracker that gives every student a clear visual pipeline of every company they've applied to, a reminder system for upcoming rounds, and a personal interview journal that compounds in value with each company.**

---

## 3. What Makes It Different

This is not "just a to-do list for placements." The differentiators:

### a. Round-Aware Pipeline (not flat statuses)
Each company is a card that moves through **customizable stages**. The pipeline knows the difference between "OA scheduled" and "OA cleared, waiting for shortlist" — states that a generic Trello board can't model cleanly.

### b. Time-Aware Reminders
Each round has a date/time. The app surfaces:
- "Next 24 hours" view
- Conflict detection (two interviews at overlapping times)
- Auto-nudges 1 day and 1 hour before a round

### c. Interview Journal Per Company
After every round, a 60-second structured journal:
- Questions asked
- Topics that came up
- What went well / what flopped
- Resources to revisit

This builds a **personal interview prep dataset** the student can re-read before the next company's round.

### d. Resume Version Tracker
"Which resume did I submit to Google?" becomes a one-click answer. Each company card links to the exact resume PDF used.

### e. Offer Comparison
When 2+ offers arrive, a side-by-side compare view: CTC breakdown (base / variable / joining bonus / stock), location, role, bond period, joining date.

### f. Analytics Dashboard
- Application → Shortlist rate
- Stage-wise drop-off (where am I losing — OA, tech, or HR?)
- Time spent per company
- Honest mirror that helps the student course-correct mid-season

### g. Smart Multi-Channel Notifications
A student should *never* miss a round because they forgot to check the app. PlaceTrack pushes reminders through **three channels**, and the student picks which ones to enable:

| Channel | When it fires | Why it matters |
|---------|---------------|----------------|
| **Browser Push** | 24 hours, 1 hour, and 15 min before any round | Works even when the tab is closed — perfect for laptop users |
| **Email** | 24 hours before + on any schedule change | Reliable fallback; lands in inbox they already check |
| **In-app Bell** | Real-time updates (status change, new round added, conflict detected) | The "what's happening right now" feed |

**Notification triggers (not just time-based):**
- ⏰ Round approaching (24h / 1h / 15min)
- ⚠️ **Schedule conflict** — two rounds overlap
- 📋 OA / shortlist deadline approaching
- 🎯 Stage moved (e.g., card auto-flagged "stale" if no update in 7 days)
- 📅 Daily morning digest: *"You have 2 rounds today — Google OA at 10 AM, TCS HR at 4 PM"*
- 🎉 Offer received (celebratory + reminder to update status)

**User control:**
- Per-channel toggle (email on, push off, etc.)
- Per-event toggle (mute daily digest but keep round reminders)
- "Quiet hours" (no notifications between 11 PM – 7 AM)

---

## 4. Core Features (MVP Scope)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Company Card** | Add a company with role, CTC, JD link, research notes, and a `registered_on_superset` checkbox to confirm the TPO-portal registration step is done |
| 2 | **Stage Pipeline** | Drag-and-drop card across stages: Applied → OA → Shortlisted → GD → Tech → HR → Offer / Rejected |
| 3 | **Round Scheduler** | Attach date, time, mode (online/offline), meeting link to each round |
| 4 | **Notifications** | Multi-channel alerts (browser push + email + in-app bell) with per-event user control |
| 5 | **Interview Journal** | Per-round notes with question bank and reflection |
| 6 | **Resume Vault** | Upload multiple resume versions, tag which was used where |
| 7 | **Dashboard** | Live counts, upcoming rounds, conversion funnel |
| 8 | **Auth** | Email/Google login; data is per-user and private |

---

## 5. Stretch Features (V2)

- **Anonymous community pool** — opt-in sharing of "questions asked at Company X in 2026" so juniors benefit
- **Mock interview scheduler** — pair students prepping for the same company
- **Browser extension** — one-click "Add this company from LinkedIn / college portal"
- **Calendar sync** — push rounds to Google Calendar
- **Offer letter document vault** with expiry reminders
- **AI prep coach** — given a company + role + your past journal entries, suggest topics to revise tonight

---

## 6. Suggested Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + Vite + Tailwind CSS | Fast to build, looks clean, good DX |
| Drag-and-drop | `@dnd-kit/core` | Modern, accessible Kanban |
| Backend | Node.js + Express (or Next.js API routes) | Single-language stack |
| Database | PostgreSQL (via Supabase) | Relational fits the stage/round model; Supabase gives auth + storage free |
| Auth | Supabase Auth or Clerk | Quick Google login |
| File storage | Supabase Storage / Cloudinary | Resume PDFs |
| Notifications | Web Push API + Resend (email) | Free tier covers a student project |
| Hosting | Vercel (frontend) + Supabase (backend) | Zero-cost deploy |

---

## 7. Data Model (Sketch)

```
User
 └── Companies (many)
      ├── role, ctc, eligibility, jd_link, current_stage, applied_on
      ├── Resume (which version used)
      └── Rounds (many)
           ├── type (OA / GD / Tech / HR / ...)
           ├── scheduled_at, mode, meeting_link, status
           └── JournalEntry (questions, notes, reflection)
```

---

## 8. Why This Is a Strong Portfolio Project

- **Solves a real, repeated pain** the builder personally feels — best kind of project
- Touches **CRUD, auth, file uploads, scheduling, notifications, analytics** — a full-stack showcase in one cohesive app
- Has an obvious **V2 / V3 roadmap** (community pool, AI coach) so it can grow with you
- Easy to **demo in 60 seconds** at an interview: "Here's my pipeline, here's a round I have tomorrow, here's what I learned from my last interview"
- Realistic shot at **adoption inside your own college** — instant first 50 users

---

## 9. Suggested 4-Week Build Plan

| Week | Goal |
|------|------|
| 1 | Auth, Company CRUD, basic Kanban board with hardcoded stages |
| 2 | Rounds + scheduling + dashboard with upcoming rounds |
| 3 | Interview journal + resume vault + email reminders |
| 4 | Analytics dashboard, polish, deploy, write README + record demo video |

---

## 10. Naming Options

- **PlaceTrack** (clear, descriptive)
- **OfferPath**
- **PipelinePlace**
- **Shortlist** (short, memorable)
- **Hired.** (one-word, ambitious)

---

*Built by a student, for students — because placement season deserves better than a Google Sheet.*
