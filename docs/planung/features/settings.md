# Settings — User & Workspace Settings

> **Component:** `src/components/settings/`
> **Status:** Implemented (Basic)
> **Files:** UserSettings.tsx (Profile, Appearance)

---

## Overview

User Settings und Workspace-Einstellungen.

**Ziel:** Personalisierung + Konfiguration ohne Admin.

---

## Components

```
settings/
├── UserSettings.tsx      ← Profile, Appearance, Notifications
├── WorkspaceSettings.tsx ← (future) Workspace config
├── SecuritySettings.tsx  ← (future) Password, 2FA
├── ApiKeys.tsx           ← (future) API Keys für Agent API
└── README.md           ← This file
```

---

## User Settings

### Profile

| Setting | Status | Beschreibung |
|---------|--------|-------------|
| Display Name | ✅ | Angezeigter Name |
| Username | ✅ | Login-Name |
| Email | ✅ | Email-Adresse |
| Avatar | ✅ | Bild-Upload |
| Bio | ❌ | Kurzbeschreibung |

### Appearance

| Setting | Status | Beschreibung |
|---------|--------|-------------|
| Theme | ✅ | Dark/Light/System |
| Font Size | ❌ | (future) |
| Sidebar Position | ❌ | Left/Right (future) |
| Compact Mode | ❌ | (future) |
| Animations | ❌ | Enable/Disable |

### Notifications

| Setting | Status | Beschreibung |
|---------|--------|-------------|
| Email for mentions | ❌ | (future) |
| Email for due dates | ❌ | (future) |
| Push notifications | ❌ | (future) |
| Desktop notifications | ❌ | (future) |

### Security (Future)

| Setting | Status | Beschreibung |
|---------|--------|-------------|
| Change Password | ❌ | |
| Two-Factor Auth | ❌ | |
| Active Sessions | ❌ | |
| API Keys | ❌ | Für Agent API |

---

## Workspace Settings (Future)

| Setting | Status | Beschreibung |
|---------|--------|-------------|
| Workspace Name | ❌ | |
| Workspace Logo | ❌ | |
| Default Team | ❌ | |
| Default Permissions | ❌ | |

---

## API Endpoints

```
# Profile
PATCH  /api/auth/profile      → Profile aktualisieren
POST   /api/auth/avatar       → Avatar hochladen

# Settings (future)
GET    /api/settings
PATCH  /api/settings

# Security (future)
POST   /api/auth/change-password
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/disable
DELETE /api/auth/sessions
GET    /api/auth/sessions
```

---

## UI/UX

### User Settings Page

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                      [Back →]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ Profile ─────────────────────────────────────────────┐  │
│ │ Avatar: [👤] [Upload New]                             │  │
│ │                                                         │  │
│ │ Display Name: [________________________] [Johanna]      │  │
│ │ Username:   [________________________] [johanna]      │  │
│ │ Email:      [________________________] [j@...]         │  │
│ │                                                         │  │
│ │                                        [Save Profile]  │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ Appearance ────────────────────────────────────────────┐  │
│ │                                                         │  │
│ │ Theme:  ○ Dark  ● Light  ○ System                      │  │
│ │                                                         │  │
│ │ Font Size:  [────●────] 14px                           │  │
│ │                                                         │  │
│ │ Compact Mode:  [Toggle]                                │  │
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ Security ──────────────────────────────────────────────┐  │
│ │                                                         │  │
│ │ Password:        [••••••••] [Change]                   │  │
│ │ Two-Factor Auth: [Not enabled] [Enable]                │  │
│ │                                                         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Future Enhancements

### Phase 2
- [ ] Full Profile Editing
- [ ] Theme Options (Custom colors)
- [ ] Notification Settings

### Phase 3
- [ ] Password Change
- [ ] 2FA
- [ ] Session Management

### Phase 4
- [ ] API Keys
- [ ] Workspace Settings
- [ ] Export/Import Settings

---

## Tech Stack

```
Form handling      → React state
Avatar upload     → FormData + API
Theme storage     → localStorage + API
```

---

*Letztes Update: 2026-05-14*