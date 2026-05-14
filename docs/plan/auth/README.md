# Auth — Authentication Specification

> **Component:** `src/components/auth/`, `src/lib/auth.ts`, `src/middleware.ts`
> **Status:** Implemented
> **Files:** Login.tsx, Setup.tsx, UserSettings.tsx, auth.ts, middleware.ts

---

## Overview

Session-based Authentication mit bcrypt Password-Hashing.

**Ziel:** Secure login ohne OAuth/SSO (vorerst).

---

## Components

```
auth/
├── Login.tsx           ← Login Page
├── Setup.tsx           ← First-time Setup (Admin erstellen)
├── UserSettings.tsx    ← Profile + Appearance
├── TwoFactor.tsx       ← (future) 2FA
├── ForgotPassword.tsx  ← (future) Password reset
└── README.md          ← This file
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────┘

  User Visit
      │
      ├── Has Session Cookie?
      │     │
      │     ├── YES → Validate Session → Allow Access
      │     │
      │     └── NO → Show Login Page
      │               │
      │               ├── Login (email + password)
      │               │       │
      │               │       └── Valid? → Create Session → Redirect
      │               │
      │               └── First Visit? → Show Setup Page
      │                                       │
      │                                       └── Create Admin Account
      │
      └── /setup only if no users exist
```

---

## Session Management

### Session Data

```typescript
interface Session {
  id: string;           // Unique session ID
  userId: number;        // User ID
  email: string;         // User email
  role: 'user' | 'admin' | 'oga';
  teamIds: number[];     // Teams user is member of
  createdAt: Date;
  expiresAt: Date;       // Session expiry
}
```

### Session Storage

- **Database:** `Session` table in Prisma
- **Cookie:** `hatches_session` (httpOnly, secure, sameSite)
- **Expiry:** 7 days (configurable)

---

## Middleware

### Route Protection

```typescript
// middleware.ts
const PROTECTED_ROUTES = ['/board', '/docs', '/notes', '/planner', '/admin', '/settings'];
const PUBLIC_ROUTES = ['/login', '/setup', '/api/auth/login', '/api/auth/setup'];

// Check: Is logged in?
// Check: Has permission for route?
// Check: Is Oga (for admin routes)?
```

### Permission Check

```typescript
function checkPermission(user: User, route: string, method: string): boolean {
  if (user.role === 'oga') return true;  // Oga can do everything
  if (route.startsWith('/admin')) return user.role === 'admin' || user.role === 'oga';
  if (route.startsWith('/api/admin')) return user.role === 'admin' || user.role === 'oga';
  // ... other checks
}
```

---

## Password Security

### Hashing

- **Algorithm:** bcrypt
- **Rounds:** 12 (default)
- **Storage:** `passwordHash` field in User table

### Password Rules

- Minimum 8 characters (future: configurable)
- No common passwords (future: check against list)
- No username/email in password (future)

---

## Two-Factor Auth (Future)

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| TOTP | ❌ | Authenticator App |
| Backup Codes | ❌ | Recovery codes |
| SMS | ❌ | (future) |

---

## Data Model

```typescript
// User
interface User {
  id: number;
  email: string;            // Unique
  username: string;          // Unique
  displayName: string | null;
  passwordHash: string;
  role: 'user' | 'admin' | 'oga';
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session
interface Session {
  id: string;               // UUID
  userId: number;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
  expiresAt: Date;
}

// LoginAttempt (future - rate limiting)
interface LoginAttempt {
  id: number;
  email: string;
  ip: string;
  success: boolean;
  attemptedAt: Date;
}
```

---

## API Endpoints

```
# Authentication
POST   /api/auth/login       → Login (email + password)
POST   /api/auth/logout      → Logout (destroy session)
POST   /api/auth/setup       → First-time setup (create admin)
GET    /api/auth/me          → Current user info

# Profile
PATCH  /api/auth/profile     → Update profile
POST   /api/auth/avatar      → Upload avatar

# Security (future)
POST   /api/auth/change-password
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/verify
POST   /api/auth/2fa/disable
GET    /api/auth/sessions    → List active sessions
DELETE /api/auth/sessions/:id → Revoke session
```

---

## Security Best Practices (Implemented)

| Practice | Status | Beschreibung |
|----------|--------|-------------|
| Password Hashing | ✅ | bcrypt |
| HTTP-Only Cookies | ✅ | XSS protection |
| CSRF Token | ❌ | (future) |
| Rate Limiting | ❌ | (future) |
| Account Lockout | ❌ | (future) |

---

## Future Enhancements

### Phase 2
- [ ] CSRF Protection
- [ ] Rate Limiting on login
- [ ] Login attempt logging

### Phase 3
- [ ] Password Reset via Email
- [ ] Session Management UI
- [ ] Remember Me

### Phase 4
- [ ] Two-Factor Auth (TOTP)
- [ ] OAuth Providers (GitHub, Google)
- [ ] SSO / SAML

---

## Tech Stack

```
bcrypt           → Password hashing
crypto.randomUUID → Session IDs
cookie          → HTTP cookies
```

---

## Files

```
src/
├── components/auth/
│   ├── Login.tsx         ← Login page
│   ├── Setup.tsx         ← First-time setup
│   └── UserSettings.tsx  ← Profile settings
├── lib/
│   ├── auth.ts           ← Auth utilities, password hashing
│   └── db.ts             ← Prisma client
├── middleware.ts         ← Route protection
└── pages/
    ├── login.astro       ← Login route
    ├── setup.astro       ← Setup route
    └── api/auth/         ← Auth API routes
```

---

*Letztes Update: 2026-05-14*