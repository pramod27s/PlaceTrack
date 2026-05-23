# PlaceTrack — Deployment Guide

> The realistic, zero-to-low-cost deployment path for PlaceTrack as it actually exists today: **Spring Boot 4 (Java 21) backend + React 19 / Vite frontend + Supabase Postgres**.

---

## 1. Stack Reality Check

| Piece | What we actually have | Deployment implication |
|------|----------------------|------------------------|
| Backend | Spring Boot 4.0.6, Java 21, Maven | Needs a **JVM host** — cannot run on Vercel serverless |
| Frontend | React 19 + Vite + Tailwind v4 + Axios + React Query + Zustand | Static bundle — any CDN works (Vercel/Netlify/Cloudflare Pages) |
| Auth | Spring Security + JWT (`jjwt`), own `users` table | Not using Supabase Auth |
| DB | Supabase Postgres via JDBC (Spring Data JPA) | Use Supabase **pooled** connection string (port 6543) |
| Storage | Supabase Storage (resume PDFs) | Server-side calls with service-role key |
| Realtime | WebSocket / STOMP for live bell | Backend host must support long-lived connections |
| Scheduler | Spring `@Scheduled` every 15 min (round scan) | Needs a long-running JVM process, not serverless |
| Email | SendGrid | Free: 100 emails/day |
| Push | Firebase Cloud Messaging (FCM) | Free |

---

## 2. Recommended Architecture

```
   Browser
      │
      ├──── static React  ──▶  Vercel CDN  (free)
      │
      └──── REST + WSS    ──▶  Spring Boot on Render / Railway / Fly.io
                                     │
                                     ├── JDBC ─▶ Supabase Postgres
                                     ├── HTTPS ─▶ Supabase Storage
                                     ├── HTTPS ─▶ SendGrid
                                     └── HTTPS ─▶ Firebase FCM
```

**Frontend** ships as static files on Vercel's CDN. **Backend** runs as a single Spring Boot JAR on a JVM host. **Data + files** stay on Supabase. **Email + push** go through SendGrid + FCM.

---

## 3. JVM Host Options for Spring Boot

| Host | Free tier | Why it fits | Watch out |
|------|-----------|-------------|-----------|
| **Render** (recommended) | 750 hrs/month free web service, spins down after 15 min idle | Native Maven/JDK build, env vars, WebSockets supported | Cold start ~30–60s after sleep |
| **Railway** | $5 free credit/month (~one small service) | Smooth Docker/Nixpacks build, no sleep-on-idle | Not strictly free past credit |
| **Fly.io** | Small free allowance | `flyctl launch` auto-detects Java, edge regions, persistent WS | Card on file required |
| **Koyeb** | 1 free web service | Direct GitHub deploys for JARs | Lower-tier RAM |

For a portfolio/college-scale app, **Render free tier + accepting cold starts** is genuinely ₹0/month.

---

## 4. Deployment Steps

### 4.1 Frontend → Vercel

1. Push repo to GitHub.
2. Vercel → **New Project** → import repo.
3. **Root Directory:** `frontend`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://placetrack-api.onrender.com
   VITE_WS_URL=wss://placetrack-api.onrender.com/ws
   ```
7. Deploy → get `placetrack.vercel.app`.

### 4.2 Backend → Render

1. Render → **New Web Service** → connect repo.
2. **Root Directory:** `backend`
3. **Runtime:** Docker (or Native — Render detects `pom.xml`)
4. **Build Command:** `./mvnw clean package -DskipTests`
5. **Start Command:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`
6. **Environment Variables:**
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://<pooler-host>:6543/postgres?sslmode=require
   SPRING_DATASOURCE_USERNAME=postgres.<project-ref>
   SPRING_DATASOURCE_PASSWORD=<db-password>
   JWT_SECRET=<32+ char random string>
   JWT_EXPIRATION_MS=86400000
   SENDGRID_API_KEY=<sg-key>
   SENDGRID_FROM_EMAIL=noreply@placetrack.app
   FCM_SERVICE_ACCOUNT_JSON=<base64-encoded service account>
   SUPABASE_URL=https://<ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   SUPABASE_STORAGE_BUCKET=resumes
   CORS_ALLOWED_ORIGINS=https://placetrack.vercel.app
   SPRING_PROFILES_ACTIVE=prod
   ```
7. Deploy → get `placetrack-api.onrender.com`.

### 4.3 Database → Supabase

1. Create Supabase project → copy the **connection pooling URI** (Settings → Database → Transaction mode, port **6543**).
   - The pooler is important for hosted backends — direct port 5432 limits concurrent connections.
2. Run schema SQL in the Supabase SQL editor (tables: `users`, `companies`, `rounds`, `journal_entries`, `resumes`, `notifications`).
3. Create a **Storage bucket** named `resumes`, private, with size limit (e.g., 5 MB).
4. Copy **service role key** for backend uploads.

### 4.4 SendGrid

1. Sign up, verify a sender domain (or use single-sender for dev).
2. Create an API key with **Mail Send** permission only.
3. Paste into `SENDGRID_API_KEY`.

### 4.5 Firebase Cloud Messaging

1. Firebase Console → new project → enable Cloud Messaging.
2. Generate **service account JSON**.
3. Base64-encode and store as `FCM_SERVICE_ACCOUNT_JSON` env var.
4. Frontend: register service worker, request notification permission, send FCM token to backend on login.

---

## 5. Code Changes Needed Before Deploying

These are the things to fix in the existing code:

- **`application.properties`** — every secret must come from env vars, not hardcoded values:
  ```properties
  spring.datasource.url=${SPRING_DATASOURCE_URL}
  spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
  spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
  spring.jpa.hibernate.ddl-auto=validate
  jwt.secret=${JWT_SECRET}
  jwt.expiration-ms=${JWT_EXPIRATION_MS}
  sendgrid.api-key=${SENDGRID_API_KEY}
  app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS}
  ```

- **`SecurityConfig`** — enable CORS for the Vercel domain:
  ```java
  http.cors(c -> c.configurationSource(corsSource()));
  // corsSource() reads app.cors.allowed-origins
  ```

- **Frontend axios** — read base URL from env:
  ```ts
  const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
  ```

- **Frontend WebSocket** — read URL from env, not hardcoded `ws://localhost:8080`.

- **Connection pool sizing** — Render free tier has limited RAM, so cap HikariCP:
  ```properties
  spring.datasource.hikari.maximum-pool-size=5
  ```

- **`@Scheduled` jobs** — fine on a single instance (free tier). If you ever scale to 2+ instances, add ShedLock or move scheduling to a separate worker.

---

## 6. Cost Summary

| Component | Monthly cost |
|-----------|--------------|
| Vercel Hobby (frontend) | ₹0 |
| Render free web service (backend) | ₹0 (sleeps when idle) |
| Supabase free (Postgres + Storage) | ₹0 (500 MB DB, 1 GB storage) |
| SendGrid free | ₹0 (100 emails/day) |
| Firebase FCM | ₹0 |
| **Total** | **₹0** |

If cold starts hurt during demos: upgrade Render to **$7/month Starter** — no sleep, more RAM, snappy WebSocket reconnects.

---

## 7. Trade-offs to Know

- **Cold starts** on Render free: first request after 15 min idle waits ~30–60s for the JVM to boot. Fine for portfolio, bad for live users.
- **No long-running jobs > a few minutes** without keeping the instance warm. Spring `@Scheduled` is fine; heavy batch work isn't.
- **Vendor lock-in is mild** — Supabase is plain Postgres (`pg_dump` and leave), Render runs your JAR (move to any VPS), Vercel serves static files.
- **Email deliverability** — SendGrid free works but sender reputation is low; verify a real domain for the inbox to trust it.
- **WebSocket on free Render** — works, but the sleep-on-idle behavior closes connections. Acceptable for a bell that reconnects.

---

## 8. Alternative Paths (for reference)

| # | Approach | When to use |
|---|----------|-------------|
| A | **Single VPS** (Hetzner / DO / Lightsail, ~$5/mo): Nginx + JAR + Postgres on one box | You want to learn devops and own the stack |
| B | **Dockerize everything → Railway/Fly.io single service** | You want one URL, one deploy, no cold starts (~$5–10/mo) |
| C | **AWS/GCP cloud-native** (ECS + RDS + CloudFront, or Cloud Run + Cloud SQL) | Resume-bait; overkill for a campus app |
| D | **Self-host on college lab machine** | Free hardware, terrible uptime |

The Vercel + Render + Supabase path stays the best balance of zero-cost, low-effort, and "looks professional in a demo."

---

## 9. Pre-Deploy Checklist

- [ ] All secrets read from env vars (no hardcoded DB password, JWT secret, API keys)
- [ ] `application-prod.properties` exists with prod-safe defaults (`ddl-auto=validate`, logging at INFO)
- [ ] CORS allow-list includes the Vercel domain
- [ ] Frontend `VITE_API_BASE_URL` + `VITE_WS_URL` set in Vercel
- [ ] Supabase pooled connection string (port 6543), not direct 5432
- [ ] HikariCP pool size capped (≤ 5 on free tier)
- [ ] SendGrid sender verified
- [ ] FCM service account JSON loaded as env var
- [ ] Health check endpoint (`/actuator/health` or `/api/health`) returns 200 — Render uses it
- [ ] Frontend `dist/` builds cleanly with `npm run build`
- [ ] Backend builds cleanly with `./mvnw clean package`

---

*Last updated: 2026-05-23*
