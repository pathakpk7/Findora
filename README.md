# Findora — Smart Campus Lost & Found Platform

Findora is a production-grade, secure, full-stack campus Lost & Found discovery and handover platform built with NestJS, Next.js 15, PostgreSQL, Prisma, Cloudinary, and AI matching.

---

## End-to-End Platform Workflow

```
[ Student A ] ──▶ Submits Found Item (PENDING)
                         │
                         ▼
                  [ Moderator ] ──▶ Reviews & Approves (APPROVED)
                                          │
[ Student B ] ──▶ Creates Lost Report ◄──┘
      │                  │
      │                  ▼
      ├─────────▶ Requests AI Matches ──▶ Gets Ranked Candidates (AI/Rule)
      │                  │
      ▼                  ▼
Submits Claim ──▶ [ Moderator ] ──▶ Approves Claim (APPROVED)
                         │
                         ▼
              [ Single-Use QR Token ]
                         │
                         ▼
        [ Authorized Participant Scans ]
                         │
                         ▼
            [ Handover Completed ]
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
[ Item RETURNED ] [ Claim COMPLETED ] [ TrustScore +30 ]
       │                 │                 │
       ▼                 ▼                 ▼
[ Badges Evaluated ] [ Notifications Sent ] [ Audit Log Written ]
```

---

## Key Features

- **Authentication & RBAC:** Secure JWT authentication with live database account active checks, password hashing via bcrypt, and strict Role-Based Access Control (`USER`, `MODERATOR`, `ADMIN`).
- **Found Item Submissions:** Public inventory reporting with image uploads via Cloudinary, mandatory moderation workflow (`PENDING` $\rightarrow$ `APPROVED`/`REJECTED`), and secret verification parameters (`serialNumber`, `hiddenMarks`).
- **Lost Reports:** Private lost report management for students with custom match queries.
- **Ownership Verification & Claims:** Private ownership claims with evidence submission, moderator verification queues, and status transitions.
- **Secure One-Time QR Handover:** Cryptographic 32-byte QR authorization tokens (SHA-256 hashed in database, 15-minute expiration, single-use atomic completion) for physical item returns.
- **AI-Powered Recommendation Matching:** Intelligent Lost & Found candidate matching using Google Gemini 1.5 with a deterministic rule-based fallback engine (`0–100` score, `LOW`/`MEDIUM`/`HIGH` confidence, and strict PII/private data isolation).
- **Gamification & Reputation:** Server-calculated `TrustScore` (`0–1000`), progression levels, automatic badge awards (`FIRST_FIND`, `COMMUNITY_HERO`, `CAMPUS_GUARDIAN`), and campus leaderboard.
- **In-App Notification Center:** Real-time persistent notifications with unread counts and deep-linking.
- **Admin Dashboard & Analytics:** Platform-wide operational statistics, aggregate conversion metrics, audit log inspector, and user management (role promotion, verification, deactivation).
- **Security Hardened:** Helmet security headers, CORS origin protection, IDOR ownership validation, DTO whitelist stripping, and zero secret logging (`SECURITY.md`).

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, Lucide Icons
- **Backend:** NestJS 10, Passport JWT, RxJS, Swagger Open API
- **Database & ORM:** PostgreSQL, Prisma ORM (v5.22)
- **File Storage:** Cloudinary Signed Upload API
- **AI Provider:** Google Gemini API (with deterministic fallback engine)
- **Deployment:** Containerized Docker & Docker Compose ready

---

## Architecture & Workspaces

```
findora/
├── apps/
│   ├── frontend/             # Next.js 15 App Router Frontend
│   └── backend/              # NestJS REST API Server
├── packages/
│   └── types/                # Shared TypeScript Data Types
├── docker-compose.yml        # Multi-container Docker configuration
├── SECURITY.md               # Comprehensive Security & Disclosure Guide
├── SETUP.md                  # Development & Deployment Setup Guide
└── README.md
```

---

## Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/pathakpk7/Findora.git
cd Findora
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Configure DATABASE_URL, JWT_SECRET, CLOUDINARY_*, GEMINI_API_KEY
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Run Development Servers
```bash
npm run dev
```
- **Frontend App:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001/api`
- **Swagger Docs:** `http://localhost:3001/api/docs`

---

## Testing & Verification

```bash
# Type check all packages
npm run type-check

# Run ESLint across workspace
npm run lint

# Execute backend tests (Jest)
cd apps/backend && npm run test

# Execute frontend tests (Jest)
cd apps/frontend && npm run test

# Build production bundles
npm run build
```

---

## Security & Disclosure

Security vulnerabilities, privacy boundaries, and QR token specifications are documented in [`SECURITY.md`](file:///c:/Users/patha/OneDrive/Desktop/FINDORA/SECURITY.md).

---

## License

Licensed under the [MIT License](LICENSE).
