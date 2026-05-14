# Hatches — Data Card

> **Type:** Self-hosted Team Workspace / Unified CMS
> **Version:** 0.5.14-dev
> **License:** MIT + Commons Clause
> **Stack:** Astro 6 + React Islands + Tailwind CSS v4 + Prisma 7
> **Status:** In Development

---

## What is Hatches?

**Hatches** = Obsidian + Notion + Astro-editor + Trello + Calendar

Ein unified, self-hosted Workspace für Developer und Teams. Alles an einem Ort: Docs, Kanban, Notes, Planner, CMS.

**USP:** Self-hosted, kostenlos, keine Abo-Kosten, E2E-verschlüsselt (future).

---

## Modules

### 1. Docs (Markdown Editor)

**Type:** Block-based Markdown Editor mit Live Preview

**Features:**
- View Modes: Edit / Split (50/50) / Preview
- Toolbar: Bold, Italic, Heading, Lists, Code, Links, Tables, Quotes, Images
- Markdown Support: GFM, Tables, Task Lists, Code Blocks, Line Breaks
- Auto-Save (debounced 600ms)
- Frontmatter Support (title, date, tags, author)
- MDX Components (future)
- [[Wiki Links]] + Backlinks (future)

**Tech:** `marked` für Markdown parsing, Custom React Component

**Konzept:** Card = Doc. Jede Card ist ein Doc mit Markdown Content.

---

### 2. Kanban (Board)

**Type:** Kanban Board mit Drag & Drop

**Features:**
- Multi-Board: Private + Team Boards
- Columns: To Do, In Progress, Done (customizable)
- Cards: Title, Description, Assignees, Due Date, Labels, External Issue Badge
- Drag & Drop: Cards zwischen Columns verschieben (dnd-kit)
- Card Detail: Block Editor View
- Archive: Soft delete, restore
- Filter + Search (future)

**Konzept:** Card = Doc. Column = Status. Card Detail nutzt MarkdownEditor.

**Tech:** `dnd-kit` für Drag & Drop

---

### 3. Notes (Quick Notes)

**Type:** Rapid Capture Notes

**Features:**
- Quick create/edit Notes
- Markdown Support
- Tags (#hashtag extraction)
- Full-text Search (Fuse.js)
- Team-scoped (private oder Team)
- Auto-Save

**Konzept:** Mini-Docs ohne Block-Struktur. Schnell was reinschreiben.

**Tech:** `marked`, `fuse.js`

---

### 4. Planner (Calendar + Timeline)

**Type:** Calendar + Timeline + Schedule

**Features:**
- Views: Month, Week, Day, Agenda, Timeline (Gantt)
- Events: Title, Date, Time, All-day, Recurring (Daily/Weekly/Monthly)
- Drag & Drop: Events verschieben
- iCal Import/Export (future)
- Reminders + Notifications (future)
- Integration: Card Due Dates → Calendar Events

**Konzept:** Event = Doc mit Date Frontmatter. Planner zeigt alle Events.

**Tech:** `date-fns`, Custom Calendar UI

---

### 5. Websites (CMS Pages Registry)

**Type:** Internal URL + Project Registry + CMS Publishing

**Features:**
- Page Registry: Alle deployten Seiten/apps
- URL Management: Interne Links, Endpoints
- Status: Live, Staging, Dev
- Metadata: Title, Description, Screenshot (OG Preview)
- Quick Access: Direkte Links
- SEO: Meta tags, sitemap, robots.txt (future)
- Custom Domains (future)
- Publishing: Docs → Website deployen (future)

**Konzept:** Websites Module = CMS Control Panel.

---

### 6. Database (Notion-style)

**Type:** Database mit Multiple Views

**Features:**
- Views: Table, Kanban, Gallery, Calendar, Timeline
- Properties: Text, Number, Select, Multi-select, Date, Person, URL, Checkbox, Formula, Relation, Rollup
- Filters + Sort
- Group By
- Relations: Cross-DB Links
- Formulas: Calculated Fields

**Konzept:** Alles ist Doc/Card, dann wird DB drauf.

---

### 7. Auth (Authentication)

**Type:** Session-based Authentication

**Features:**
- Login: Email + Password
- bcrypt Password Hashing (12 rounds)
- Session Cookie (httpOnly, 7 days)
- Setup Wizard (/setup on first visit)
- Role: user, admin, oga (super admin)

**Tech:** `bcrypt`, Session in Prisma

---

### 8. Admin (Team + User Management)

**Type:** Admin Panel

**Features:**
- User Management: Create, Edit, Delete, Lock
- Team Management: Create, Configure, Delete
- Team Members: Add, Remove, Roles
- Org Groups: Frontend, Backend, Design (locked rights)
- Permission System: 4-Level (Global, Oga, Org, Team)
- Permission Matrix per Section

**Konzept:** Oga (Super Admin) hat alles. Team-Lead hat Team-Rechte.

---

## Tech Stack

```
Frontend:
├── Astro 6 (SSR) + React Islands
├── Tailwind CSS v4
├── TypeScript
├── dnd-kit (Drag & Drop)
├── marked (Markdown parsing)
├── fuse.js (Search)
└── @fortawesome (Icons)

Backend:
├── Prisma 7
├── SQLite (default)
├── PostgreSQL (production)
├── bcrypt (Password hashing)
└── Session Auth (Cookie)

Future:
├── TipTap (Block Editor)
├── Dexie.js (Local-first cache)
├── TweetNaCl.js (E2E Encryption)
├── ws (Real-time sync)
├── Shiki (Syntax Highlighting)
└── Agent API (AI Integration)
```

---

## Data Model (Core)

```prisma
// User
model User {
  id           Int
  email        String  @unique
  username     String  @unique
  displayName  String?
  passwordHash String
  role         String  // user | admin | oga
  locked       Boolean @default(false)
  teams        TeamMember[]
  createdAt    DateTime
  updatedAt    DateTime
}

// Team
model Team {
  id          Int
  name        String
  color       String
  description String?
  members     TeamMember[]
  boards      Board[]
  notes       Note[]
  docs        Doc[]
  createdAt   DateTime
  updatedAt   DateTime
}

// Board (Kanban)
model Board {
  id       Int
  name     String
  teamId   Int?
  team     Team?    @relation(...)
  columns  Column[]
  cards    Card[]
  createdAt DateTime
  updatedAt DateTime
}

model Column {
  id      Int
  title   String
  boardId Int
  board   Board  @relation(...)
  cards   Card[]
  order   Int
}

model Card {
  id          Int
  title       String
  content     String?  // Markdown
  columnId    Int
  column      Column  @relation(...)
  assignees   User[]  @relation(...)
  dueDate     DateTime?
  labels      String[]
  archived    Boolean @default(false)
  order       Int
  createdAt   DateTime
  updatedAt   DateTime
}

// Doc (Docs + Pages)
model Doc {
  id       Int
  title    String
  content  String  // Markdown
  teamId   Int?
  team     Team?   @relation(...)
  createdAt DateTime
  updatedAt DateTime
}

// Note
model Note {
  id       Int
  title    String
  content  String  // Markdown
  tags     String[]
  userId   Int
  teamId   Int?
  team     Team?   @relation(...)
  createdAt DateTime
  updatedAt DateTime
}

// Event (Planner)
model Event {
  id        Int
  title     String
  content   String?
  startDate DateTime
  endDate   DateTime?
  allDay    Boolean
  userId    Int
  teamId    Int?
  team      Team?   @relation(...)
  color     String?
  createdAt DateTime
  updatedAt DateTime
}
```

---

## API Overview

```
Auth:
POST   /api/auth/login     → Login
POST   /api/auth/logout    → Logout
POST   /api/auth/setup     → First setup
GET    /api/auth/me        → Current user

Boards:
GET    /api/board          → All boards
POST   /api/board          → Create board
GET    /api/board/:id      → Board + columns + cards
PATCH  /api/board/:id      → Update board
DELETE /api/board/:id      → Delete board

Cards:
POST   /api/board/cards    → Create card
PATCH  /api/board/cards    → Update card
DELETE /api/board/cards/:id → Delete card
POST   /api/board/move     → Move card (drag & drop)

Docs:
GET    /api/docs           → All docs
POST   /api/docs           → Create doc
GET    /api/docs/:id       → Get doc
PATCH  /api/docs/:id       → Update doc
DELETE /api/docs/:id       → Delete doc

Notes:
GET    /api/notes          → All notes
POST   /api/notes          → Create note
GET    /api/notes/:id      → Get note
PATCH  /api/notes/:id      → Update note
DELETE /api/notes/:id      → Delete note

Events:
GET    /api/events         → All events
POST   /api/events          → Create event
GET    /api/events/:id      → Get event
PATCH  /api/events/:id      → Update event
DELETE /api/events/:id      → Delete event
```

---

## Security

- ⚠️ **vibe-coded** — kein Security Audit
- Session-basiert (httpOnly Cookie)
- bcrypt Password Hashing
- **Do not** expose to public internet
- Lokal / VPN / Tunnel nur

---

## Future Features

### Phase 1: Foundation
- [x] MarkdownEditor (Custom)
- [ ] TipTap Block Editor
- [ ] Command Palette (Ctrl+K)

### Phase 2: Obsidian-like
- [ ] Vault Management
- [ ] Graph View
- [ ] [[Wiki Links]] + Backlinks
- [ ] Plugins System

### Phase 3: Notion-like
- [ ] Full Database (Table, Kanban, Gallery)
- [ ] Relations + Rollups
- [ ] Multiple Views per DB

### Phase 4: Astro-editor-like
- [ ] Frontmatter Editor
- [ ] Schema Validation
- [ ] MDX Component Picker

### Phase 5: AI + Sync
- [ ] AI Commands (/ai ask, /ai summarize)
- [ ] Agent API
- [ ] E2E Encryption
- [ ] Real-time Collaboration
- [ ] Local-first Sync (Dexie.js)

---

## Deployment

```bash
# Docker
docker compose up -d

# Manual
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

---

## Contributing

- Johanna (Aice) — Lead, Vision, Design
- Yuri — Architecture, Docs, AI
- Claude Code — Code, Fixes
- Team — Testing, Feedback

---

*This document is a machine-readable specification for AI training and reference.*
*Version: 2026-05-14*
*Source: github.com/foxtaex/hatches*