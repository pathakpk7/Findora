# FINDORA SECURITY ARCHITECTURE & POLICY

**Project:** Findora — Smart Campus Lost & Found Platform  
**Repository:** `https://github.com/pathakpk7/Findora.git`  
**Security Status:** Hardened & Verified (Phase 14)

---

## 1. Security Architecture Overview

Findora implements a defense-in-depth security model across NestJS, Next.js, Prisma, and Cloudinary. Security controls are strictly enforced at the backend REST API boundary. Frontend checks exist solely for user experience optimization; all authorization decisions are authoritative on the server.

```
       [ Client Request ]
               │
               ▼
      ┌─────────────────┐
      │  Helmet Headers │ (HTTP security headers)
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │  CORS Protection│ (Restricted frontend origins)
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ ValidationPipe  │ (Class-validator, whitelist: true, forbidNonWhitelisted: true)
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │  JwtAuthGuard   │ (JWT signature validation + Database active account check)
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │   RolesGuard    │ (Authoritative RBAC enforcement for USER, MODERATOR, ADMIN)
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ IDOR & Ownership│ (Resource ownership & participant boundary validation)
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ Prisma Database │ (Parameterized queries, transactions & unique constraints)
      └─────────────────┘
```

---

## 2. Authentication & Account Lifecycle Security

- **JWT Token Validation:** Bearer tokens are cryptographically signed using HS256 with environment secrets (`JWT_SECRET`).
- **Live State Inspection:** On every authenticated request, `JwtStrategy` inspects the user record in PostgreSQL via Prisma.
- **Instantaneous Account Deactivation:** If an account is deactivated by an administrator (`isActive = false`), subsequent requests using previously issued JWTs are immediately rejected with `401 Unauthorized`.
- **Password Security:** Passwords are hashed using bcrypt with salt rounds = 10. Passwords and hashes are stripped from all API outputs.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Resource / Action | USER | MODERATOR | ADMIN |
| :--- | :---: | :---: | :---: |
| Browse Approved Inventory | ✅ | ✅ | ✅ |
| Report Found Item | ✅ | ✅ | ✅ |
| Submit Lost Report | ✅ | ✅ | ✅ |
| Submit Ownership Claim | ✅ | ✅ | ✅ |
| Manage Own Claims & Reports | ✅ | ✅ | ✅ |
| Access Moderator Review Queue | ❌ | ✅ | ✅ |
| Approve / Reject Found Items | ❌ | ✅ | ✅ |
| Approve / Reject Claims | ❌ | ✅ | ✅ |
| View Private Claim Evidence | ❌ | ✅ | ✅ |
| Access Admin Portal & Analytics | ❌ | ❌ | ✅ |
| Manage User Roles | ❌ | ❌ | ✅ |
| Deactivate / Reactivate Users | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ✅ |

---

## 4. IDOR & Data Isolation Policies

- **Found Items:** Users can only edit or modify items they personally submitted (`foundById === requester.id`). Content edits reset item status to `PENDING` for mandatory moderator re-review.
- **Lost Reports:** Lost reports are private to the reporting student. Access requires `reporterId === requester.id` or staff privileges (`MODERATOR` / `ADMIN`).
- **Claims & Evidence:** Claim details and private evidence are strictly restricted to `claimantId === requester.id` or staff reviewers. Unrelated students receive `403 Forbidden`.
- **Notifications:** Users can only query, read, or mark read notifications where `userId === requester.id`.

---

## 5. Secure One-Time QR Handover Protocol

- **Cryptographic Generation:** Raw handover tokens are generated using 32 bytes of cryptographically secure random bytes (`crypto.randomBytes(32)`).
- **Zero Raw Storage:** Raw tokens are **never** stored in the database. Only SHA-256 digests (`tokenHash`) are stored.
- **Short Lifetime:** Handover tokens automatically expire 15 minutes after issuance.
- **Single-Use Consumption:** Scanning a valid QR code consumes the token inside an atomic database transaction (`status -> COMPLETED`), preventing double-use or replay attacks.
- **Strict Participant Authorization:** Handover scan completion requires the scanner to be a verified participant (`claimantId` or `foundById`). Unrelated users are rejected with `403 Forbidden`.
- **Secret Shielding:** Handover tokens never appear in URLs, server logs, notifications, or audit metadata.

---

## 6. Cloudinary Image Infrastructure

- **Server-Side Validation:** Uploaded files are validated against allowed MIME types (`image/jpeg`, `image/png`, `image/webp`) and file size limits (max 5 MB per image, max 5 images per item).
- **Signed Parameter Security:** Direct upload signatures expire using server timestamps and folder constraints.
- **IDOR Ownership Check on Deletion:** Image deletion requests verify that the requesting user is the original item author before invoking Cloudinary API destruction.

---

## 7. Audit Logging & Administrative Integrity

- **Immutable Audit Trail:** Privileged actions (`ROLE_CHANGED`, `USER_DEACTIVATED`, `USER_REACTIVATED`, `USER_VERIFIED`, `ITEM_APPROVED`, `ITEM_REJECTED`, `CLAIM_APPROVED`, `CLAIM_REJECTED`, `HANDOVER_COMPLETED`, `TRUST_SCORE_CHANGED`) write immutable `AuditLog` entries.
- **Administrative Protection:** Administrators cannot demote their own account or deactivate themselves, preventing accidental lockouts.

---

## 8. Trust Score & Gamification Security

- **Server-Only Mutation:** Clients cannot directly modify `User.trustScore`. Mutations are exclusively executed by backend events through `ReputationService`.
- **Bounded Range:** Scores are clamped between `0` and `1000`.
- **Database Idempotency:** Event processing relies on `TrustScoreHistory` unique constraints `@@unique([userId, sourceType, sourceId])` and `UserBadge` `@@unique([userId, badgeId])` to prevent double-rewarding under duplicate webhooks or concurrent requests.

---

## 9. Infrastructure & Header Protections

- **HTTP Security Headers:** Configured via `helmet()` middleware (X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Content-Security-Policy).
- **CORS Constraints:** Restricted to trusted frontend origins configured in `FRONTEND_URL`.
- **Injection Prevention:** All database operations utilize parameterized Prisma ORM queries.

---

## 10. Responsible Disclosure Policy

If you discover a potential security vulnerability in Findora:
1. Please report it privately to the campus platform development team.
2. Do not publicly disclose or exploit the vulnerability.
3. Provide step-by-step reproduction steps or proof-of-concept tests.
