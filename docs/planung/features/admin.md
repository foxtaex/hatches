# Admin — Admin Panel Specification

> **Component:** `src/components/admin/`
> **Status:** Implemented (Basic)
> **Files:** (Admin views for teams, users, permissions)

---

## Overview

Admin Panel für Team Management, User Management, und globale Einstellungen.

**Ziel:** Oga (Super Admin) kann alles verwalten.

---

## Components (Future)

```
admin/
├── AdminDashboard.tsx     ← Übersicht + Navigation
├── UserManagement.tsx      ← Users auflisten, bearbeiten
├── TeamManagement.tsx       ← Teams erstellen, konfigurieren
├── OrgGroups.tsx           ← Org-Gruppen (Frontend, Backend...)
├── GlobalRoles.tsx          ← Globale Rollen/Rechte
├── Permissions.tsx          ← Permission Manager
└── README.md              ← This file
```

---

## Features

### User Management

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| User auflisten | ✅ | Tabelle mit Suche |
| User bearbeiten | ✅ | Name, Email, Avatar |
| User löschen | ✅ | Soft delete |
| User sperren | ❌ | Global ban |
| Password reset | ❌ | Admin-initiated |
| Session invalidieren | ❌ | Force logout |

### Team Management

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Team erstellen | ✅ | Name, Farbe, Members |
| Team bearbeiten | ✅ | Rename, color |
| Team löschen | ✅ | (nur wenn leer) |
| Team Members | ✅ | Add/Remove |
| Team Roles | ✅ | Permission levels |
| Team Settings | ❌ | Advanced |

### Org Groups

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Group erstellen | ❌ | Name + Description |
| Group bearbeiten | ❌ | |
| Group löschen | ❌ | |
| Members zuweisen | ❌ | Users → Groups |
| Group Rights | ❌ | Locked + Normal |

### Global Roles / Permissions

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Oga vergeben | ❌ | Super Admin |
| User-Rollen | ❌ | Global |
| API Keys sehen | ❌ | (future) |
| Billing | ❌ | (future) |

---

## Data Model

```typescript
// User
interface User {
  id: number;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: 'user' | 'admin' | 'oga';  // oga = super admin
  locked: boolean;
  createdAt: Date;
}

// Team
interface Team {
  id: number;
  name: string;
  color: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// TeamMember
interface TeamMember {
  userId: number;
  teamId: number;
  role: 'member' | 'lead' | 'admin';
  joinedAt: Date;
}

// OrgGroup
interface OrgGroup {
  id: number;
  name: string;            // "Frontend", "Backend", "Design"
  description: string | null;
  lockedRights: string[];  // Rights that can't be changed
  createdAt: Date;
}

// OrgGroupMember
interface OrgGroupMember {
  userId: number;
  groupId: number;
  joinedAt: Date;
}
```

---

## Permission System

### Four-Level System

```
1. Global Rights (Oga-only)
   └── Kann nur von Oga vergeben werden
   
2. Oga Team (Super Admin)
   └── Hat Zugriff auf alles
   
3. Org Groups
   ├── Locked Rights (nur Oga ändert)
   └── Normal Rights (Lead kann vergeben)
   
4. Team Roles
   ├── Full Access
   ├── Can Edit
   ├── Can Comment
   └── Can View
```

### Permission Matrix

```
Section     │ View │ Create │ Edit │ Delete
────────────┼──────┼───────┼──────┼──────
Board       │  ✓   │   ✓   │  ✓   │   ✓
Docs        │  ✓   │   ✓   │  ✓   │   ✓
Planner     │  ✓   │   ✓   │  ✓   │   ✓
Teams       │  ✓   │   ✗   │  ✗   │   ✗   (nur Oga)
Settings    │  ✓   │   ✗   │  ✗   │   ✗   (nur Oga)
```

---

## API Endpoints

```
# Users
GET    /api/admin/users           → Alle Users
PATCH  /api/admin/users/:id        → User bearbeiten
DELETE /api/admin/users/:id        → User löschen
POST   /api/admin/users/:id/lock   → User sperren

# Teams
GET    /api/admin/teams            → Alle Teams
POST   /api/admin/teams            → Team erstellen
PATCH  /api/admin/teams/:id        → Team bearbeiten
DELETE /api/admin/teams/:id        → Team löschen

# Team Members
GET    /api/admin/teams/:id/members
POST   /api/admin/teams/:id/members
DELETE /api/admin/teams/:id/members/:userId

# Org Groups
GET    /api/org/groups
POST   /api/org/groups
PATCH  /api/org/groups/:id
DELETE /api/org/groups/:id

# Global Roles
GET    /api/global/roles
POST   /api/global/roles
PATCH  /api/global/roles/:id
DELETE /api/global/roles/:id
```

---

## UI/UX

### Admin Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Admin Panel                                    [Logout]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│ │ 👥 Users     │  │ 👥 Teams    │  │ 📁 Org       │        │
│ │    12       │  │    5        │  │    3        │        │
│ └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Recent Activity                          [View All →]  │ │
│ │ ─────────────────────────────────────────────────────  │ │
│ │ • User "X" created Team "Y"              2h ago         │ │
│ │ • User "Z" joined Team "A"               5h ago         │ │
│ │ • New Doc created by "B"                1d ago          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Future Enhancements

### Phase 2
- [ ] Full User Management
- [ ] Team Settings
- [ ] Permission Matrix

### Phase 3
- [ ] Org Groups
- [ ] Global Roles
- [ ] API Key Management

### Phase 4
- [ ] Audit Log
- [ ] Billing (future)
- [ ] Multi-tenant (future)

---

## Tech Stack

```
Prisma           → Database
Session Auth     → Authentication
RBAC             → Role-based access control
```

---

*Letztes Update: 2026-05-14*
