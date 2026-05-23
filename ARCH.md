# PlaceTrack — Spring Boot Architecture

> Backend architecture document for PlaceTrack, the student placement-season command center. Built as a layered Spring Boot 3.x monolith with React frontend, PostgreSQL, and event-driven notifications.

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                React Frontend (separate repo)                │
│        Vite • Tailwind • Axios • React Query • Zustand       │
│                    Deployed on Vercel                        │
└──────────────────────┬───────────────────────────────────────┘
                       │
        REST (JSON + JWT)        WebSocket (STOMP) for live bell
                       │ │
┌──────────────────────▼─▼─────────────────────────────────────┐
│             Spring Boot 3.x Application                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Security Filter Chain                                 │  │
│  │  JwtAuthFilter → UsernamePasswordAuthFilter            │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │  Controller Layer (REST + WebSocket)                   │  │
│  │  AuthController • CompanyController • RoundController  │  │
│  │  JournalController • ResumeController • NotifController│  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │  Service Layer (business logic)                        │  │
│  │  • ConflictDetectionService                            │  │
│  │  • NotificationDispatchService                         │  │
│  │  • AnalyticsService                                    │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │  Repository Layer (Spring Data JPA)                    │  │
│  │  UserRepo • CompanyRepo • RoundRepo • JournalRepo      │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │  Scheduler  →  @Scheduled fixedRate = 15 min           │  │
│  │  Scans upcoming rounds → publishes notification events │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Event Bus (Spring ApplicationEvents)                  │  │
│  │  RoundReminderEvent → EmailListener + PushListener     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────┬────────────────────────────────┘
           │                  │
           │ JDBC             │ HTTPS
           ▼                  ▼
   ┌──────────────────────────────────────┐
   │             SUPABASE                 │
   │  ┌────────────────┐  ┌────────────┐  │
   │  │  PostgreSQL    │  │  Storage   │  │
   │  │  (primary DB,  │  │  (resume   │  │
   │  │   accessed via │  │   PDFs,    │  │
   │  │   Spring JPA   │  │   offers)  │  │
   │  │   over JDBC)   │  │            │  │
   │  └────────────────┘  └────────────┘  │
   └──────────────────────────────────────┘

   External: SendGrid (email) • Firebase Cloud Messaging (push)
```

---

## 2. Layered Architecture — Responsibility Map

| Layer | Responsibility | Annotation |
|-------|---------------|------------|
| **Controller** | HTTP concerns only — parse request, validate, call service, return DTO | `@RestController` |
| **Service** | Business logic, transaction boundaries, orchestration | `@Service` `@Transactional` |
| **Repository** | DB access only — query methods, no logic | `@Repository` extends `JpaRepository` |
| **Entity** | JPA-mapped domain objects | `@Entity` |
| **DTO** | Wire format — never expose entities directly | Plain records |
| **Mapper** | Entity ↔ DTO conversion | MapStruct `@Mapper` |
| **Config** | Beans, security, CORS, OpenAPI | `@Configuration` |
| **Exception** | Global error handling | `@RestControllerAdvice` |

---

## 3. Package Structure

```
com.placetrack
├── PlaceTrackApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   ├── CorsConfig.java
│   └── OpenApiConfig.java
├── security/
│   ├── JwtAuthFilter.java
│   ├── JwtService.java
│   └── UserDetailsServiceImpl.java
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   └── dto/  (LoginRequest, SignupRequest, AuthResponse)
├── user/
│   ├── User.java                ← @Entity
│   ├── UserRepository.java
│   └── UserService.java
├── company/
│   ├── Company.java
│   ├── CompanyController.java
│   ├── CompanyService.java
│   ├── CompanyRepository.java
│   ├── CompanyMapper.java
│   └── dto/
├── round/
│   ├── Round.java
│   ├── RoundController.java
│   ├── RoundService.java
│   ├── RoundRepository.java
│   ├── ConflictDetectionService.java
│   └── dto/
├── journal/
├── resume/
│   └── SupabaseStorageService.java
├── notification/
│   ├── Notification.java
│   ├── NotificationScheduler.java     ← @Scheduled
│   ├── NotificationDispatchService.java
│   ├── EmailNotificationListener.java ← @EventListener
│   ├── PushNotificationListener.java
│   └── events/RoundReminderEvent.java
├── analytics/
│   ├── AnalyticsController.java
│   └── AnalyticsService.java
└── exception/
    ├── GlobalExceptionHandler.java
    └── custom/  (ResourceNotFoundException, ConflictException, ...)
```

---

## 4. Database Schema (JPA Entities)

```
User                Company                      Round               JournalEntry
─────               ───────                      ─────               ────────────
id (PK)             id (PK)                      id (PK)             id (PK)
email (uniq)        user_id (FK)──┐             company_id (FK)──┐  round_id (FK)──┐
password_hash       name           │             type (OA/GD/...) │  questions_asked│
full_name           role           │             scheduled_at     │  reflection     │
google_id           ctc            │             mode             │  rating         │
created_at          jd_link        │             meeting_link     │  created_at     │
                    current_stage  │             status           │
                    applied_on     │             created_at       │
                    resume_id (FK) │
                    registered_on_superset (bool, default false)
                    research_notes (text)
                                   │
Resume              Notification   │
──────              ────────────   │
id (PK)             id (PK)        │
user_id (FK)        user_id (FK)   │
file_url            type           │
version_label       payload (JSON) │
uploaded_at         channel        │
                    sent_at        │
                    read_at        │
```

Use **Flyway** for migrations (`src/main/resources/db/migration/V1__init.sql`).

---

## 5. Tech Stack & Dependencies (pom.xml essentials)

| Dependency | Purpose |
|-----------|---------|
| `spring-boot-starter-web` | REST API |
| `spring-boot-starter-data-jpa` | ORM |
| `spring-boot-starter-security` | Auth |
| `spring-boot-starter-validation` | `@Valid`, `@NotBlank` |
| `spring-boot-starter-websocket` | Real-time bell |
| `spring-boot-starter-mail` | Email reminders |
| `jjwt-api / jjwt-impl / jjwt-jackson` | JWT tokens |
| `postgresql` | DB driver |
| `flyway-core` | Schema migrations |
| `lombok` | `@Data` `@Builder` boilerplate killer |
| `mapstruct` | DTO mappers |
| `springdoc-openapi-starter-webmvc-ui` | Swagger UI auto-gen |
| `okhttp` or `spring-webflux` (WebClient) | Calls to Supabase Storage REST API for resume uploads |
| `spring-boot-starter-test` | JUnit + MockMvc |
| `testcontainers-postgresql` | Real DB in tests |

### Supabase connection (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
    username: postgres
    password: ${SUPABASE_DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate          # Flyway owns the schema
    properties:
      hibernate.dialect: org.hibernate.dialect.PostgreSQLDialect

supabase:
  url: https://<project-ref>.supabase.co
  storage-bucket: resumes
  service-role-key: ${SUPABASE_SERVICE_ROLE_KEY}   # server-side only, never to frontend
```

> **Why Supabase here:** zero-setup managed Postgres (no Neon/Railway needed), built-in object storage for resume PDFs over a simple REST API, generous free tier (500 MB DB + 1 GB storage), and instant SQL editor in the dashboard for debugging. We only use it as **DB + Storage** — auth stays with Spring Security so the JWT flow is fully under our control.

---

## 6. Critical Flows

### 6a. Authentication

```
POST /api/auth/signup → AuthController
   → AuthService.register() → hash password → save User
   → JwtService.generate(user) → return { token }

POST /api/auth/login → returns JWT (15 min) + refresh token (7 days)

All other requests: JwtAuthFilter extracts token from
Authorization: Bearer <jwt> → sets SecurityContext
```

### 6b. Notification Engine (the interesting part)

```
@Scheduled(fixedRate = 900_000)   // every 15 min
NotificationScheduler.scanUpcomingRounds()
   ↓
RoundRepository.findRoundsBetween(now, now + 24h)
   ↓
for each round → check which reminder windows are due (24h/1h/15min)
   ↓
applicationEventPublisher.publishEvent(new RoundReminderEvent(...))
   ↓
   ┌─────────────────────┬──────────────────────┐
   │                     │                      │
@EventListener      @EventListener         @EventListener
EmailListener       PushListener           WebSocketListener
(SendGrid)          (FCM)                  (STOMP → /user/queue/notifications)
```

### 6c. Conflict Detection

When a round is created/updated, `ConflictDetectionService` queries overlapping rounds for the same user and either blocks the save or returns a warning DTO.

---

## 7. Deployment Topology

| Component | Where | Cost |
|-----------|-------|------|
| Spring Boot JAR | **Render** free tier (sleeps after 15 min) or **Railway** ($5/mo always-on) | Free → $5 |
| PostgreSQL | **Supabase** (500 MB DB free, no sleep, includes SQL editor + dashboard) | Free |
| React frontend | **Vercel** | Free |
| Resume storage | **Supabase Storage** (1 GB free, same project as DB) | Free |
| Email | **SendGrid** (100/day free) or Gmail SMTP | Free |
| Push | **Firebase Cloud Messaging** | Free |
| CI/CD | GitHub Actions → build JAR → deploy to Render | Free |

---

## 8. Why This Architecture is Interview-Defensible

When asked *"walk me through your architecture"*, you can say:

> *"It's a layered Spring Boot monolith. Controllers handle HTTP, services own business logic with @Transactional boundaries, and repositories use Spring Data JPA. I used Spring's ApplicationEvent system to decouple the notification scheduler from the actual senders — the scheduler just publishes a RoundReminderEvent, and email/push/WebSocket listeners react independently. That means adding SMS later is just one new listener, no changes to the scheduler. Security is JWT-based with a custom filter in the chain, and I used Flyway so schema changes are versioned with the code."*

That's an answer that hits **SOLID, event-driven design, separation of concerns, and migration discipline** — all in one paragraph.
