# Hatches — Design & Feature Specification

> **Vision:** Notion-Alternative mit Apple-Design-Ästhetik — clean, minimalistisch, self-hosted & kostenlos. Entwickelt von **CoreForAi** für bessere interne Zusammenarbeit — konkret und fertig für die Zukunft.

**Background:**
- Hatches stammt aus dem CoreForAi-Ökosystem
- Ursprünglich nicht als eigenständiges Produkt gedacht — wurde es aber für bessere interne Arbeit
- **Ziel:** Ein konkretes, fertiges Tool — kein Halbfertiges, keine Kompromisse

---

## Design System

### Apple-Inspired Minimalism
- **Light-first:** #ffffff surfaces, #f5f5f7 body, #e5e5e5 borders
- **Inter** als Primärfont (CoreForAi Design System, Google Fonts)
- **Großzügiger Whitespace** — breathing room
- **Subtle shadows** rgba(0,0,0,0.08) für Tiefe statt harter Borders
- **Smooth 300ms transitions** mit spring feel
- **Frosted glass** backdrop-blur für overlays
- **Dark Mode:** #1c1c1e surfaces, #2c2c2e borders, #f5f5f7 text

### Content Style
- **German UI** (z.B. "Anmelden", "Speichern", "Notizen")
- **Clean labels** — kein Marketing-Sprech
- **Emoji erlaubt** für personality
- **UPPERCASE brand text** (HATCHES)

### Assets
- `public/logo/mark-a.svg` — Logo A (Vivid: mint squircle, white H)
- `public/logo/mark-b.svg` — Logo B (Subtle: dark squircle, glowing H)
- `public/logo/mark-c.svg` — Logo C (Outline: neon-edge stroke)
- `public/favicon.svg` — Favicon

---

## Features & Module

> **Ziel:** Notion-Klon — aber mit Apple-Design, self-hosted, kostenlos.

Jedes Feature ist ein **eigenständiger, modularer Baustein**:
- Component-Ordner: `src/components/<feature>/`
- API-Gruppe: `src/pages/api/<feature>/`
- Typen: `types.ts`

### 1. Pages / Docs (Block Editor)
**Pfad:** `src/components/editor/`
**Dateien:** `BlockEditor.tsx`, `BlockToolbar.tsx`, `SlashCommand.tsx`

**Features:**
- Block-basiertes Layout — jeder Absatz/Headline/List ist ein Block
- Slash Commands — `/h1`, `/h2`, `/bullet`, `/numbered`, `/todo`, `/quote`, `/code`, `/divider`
- Inline Editing — Doppelklick oder Enter zum Bearbeiten
- Drag & Drop Blöcke neu anordnen (dnd-kit)
- Nestable Blöcke — Aufgabenlisten mit Sub-Items
- Rich Text — Bold, Italic, Code, Links inline
- Embeds — Code-Blöcke mit Syntax-Highlighting, Bilder, Dateien
- Auto-Save (debounced 600ms)
- Version History — ältere Versionen wiederherstellen
- Export als Markdown, PDF, HTML

**API:**
- `GET /api/pages` — Alle Seiten
- `POST /api/pages` — Seite erstellen
- `GET /api/pages/[id]` — Einzelne Seite mit Blöcken
- `PATCH /api/pages/[id]` — Metadaten (Titel, Icon, Cover)
- `DELETE /api/pages/[id]` — Seite löschen
- `GET/POST/PATCH/DELETE /api/pages/[id]/blocks/[blockId]` — Block CRUD
- `POST /api/pages/[id]/blocks/reorder` — Blöcke neu anordnen
- `GET /api/pages/[id]/versions` — Version History

---

### 2. Database Views (Tables & More)
**Pfad:** `src/components/database/`
**Dateien:** `DatabaseView.tsx`, `TableView.tsx`, `BoardView.tsx`, `GalleryView.tsx`, `CalendarView.tsx`, `TimelineView.tsx`

**Features:**
- Multiple Views pro Database — Table, Board, Gallery, Calendar, Timeline
- Custom Properties — Text, Number, Select, Multi-Select, Date, Person, Files, URL, Checkbox, Formula
- Filter & Sort — nach Property filtern, multiple Sort-Kriterien
- Group By — Zeilen nach Property gruppieren
- Inline Editing — Zellen direkt bearbeiten
- Relation — Links zwischen Databases
- Formula — berechnete Felder (ähnlich Notion)
- Aggregation — Count, Sum, Average über Groups

**API:**
- `GET /api/databases` — Alle Databases
- `POST /api/databases` — Database erstellen
- `GET/PATCH/DELETE /api/databases/[id]` — Database CRUD
- `GET/POST /api/databases/[id]/items` — Items
- `PATCH/DELETE /api/databases/[id]/items/[itemId]` — Item updaten
- `POST /api/databases/[id]/views` — View erstellen

---

### 3. Kanban Board
**Pfad:** `src/components/kanban/`
**Dateien:** `KanbanBoard.tsx`, `KanbanColumn.tsx`, `CardItem.tsx`, `ArchivePanel.tsx`, `types.ts`

**Features:**
- Kanban View für Databases
- Card-Management: erstellen, bearbeiten, archivieren
- External Issue Badges: GitHub, GitLab, Jira Integration
- Assignees und Due Dates
- Filter/Suche im Board

**API:** (Teil von Database)
- `POST /api/board/cards` — Karte erstellen
- `PATCH /api/board/cards` — Karte aktualisieren
- `DELETE /api/board/cards` — Karte löschen
- `GET /api/board/archive` — Archivierte Karten
- `POST /api/board/archive` — Karte archivieren
- `DELETE /api/board/archive` — Karte wiederherstellen

---

### 4. Quick Notes
**Pfad:** `src/components/notes/`
**Dateien:** `NotesView.tsx`, `NoteEditor.tsx`

**Features:**
- Schnelle Notizen ohne Block-Struktur
- Markdown-Support — headings, lists, code, links
- Tagging — Notizen mit Tags versehen
- Full-Text Search — durchsuchen
- Sidebar-Liste mit Preview

**API:**
- `GET/POST /api/notes` — Notizen auflisten/erstellen
- `GET/PATCH/DELETE /api/notes/[id]` — Notiz CRUD

---

### 5. Sidebar & Navigation
**Pfad:** `src/components/sidebar/`
**Dateien:** `Sidebar.tsx`, `SidebarItem.tsx`, `QuickFinder.tsx`

**Features:**
- Favorites — Pin oft genutzte Seiten
- Trash — Gelöschte Seiten (30 Tage)
- Search — QuickFinder (Cmd+K) für Seiten/Databases
- Nested Pages — Drag & Drop Hierarchie
- Toggle Sections — collapse/expand Page groups
- Workspace Switcher — zwischen Teams/Pages
- Dark/Light Mode Toggle — persistent

**API:**
- `GET /api/navigation` — Seitenstruktur
- `PATCH /api/navigation/reorder` — Reihenfolge updaten
- `POST/DELETE /api/navigation/favorites/[id]` — Favoriten

---

### 6. Team Spaces
**Pfad:** `src/components/team/`
**Dateien:** `TeamSpace.tsx`, `MemberList.tsx`, `Permissions.tsx`

**Features:**
- Workspace pro Team — eigene Pages, Databases, Members
- Member Management — einladen, Rollen zuweisen, entfernen
- Permission Levels: Full Access, Can Edit, Can Comment, Can View
- Admin Controls — Team-Einstellungen

**API:**
- `GET/POST /api/team` — Teams
- `GET/PATCH/DELETE /api/team/[id]` — Team CRUD
- `GET/POST /api/team/[id]/members` — Members
- `DELETE /api/team/[id]/members/[userId]` — Member entfernen

---

### 7. Integrations
**Pfad:** `src/components/integrations/`
**Dateien:** `IntegrationManager.tsx`, `SyncPanel.tsx`
**Lib:** `src/lib/integrations/`

**Features:**
- GitHub: Issues → Cards, PR Reviews, Actions Status
- GitLab: Issues, MRs, Pipelines
- Jira: Issues sync, Custom Fields
- Slack: Notifications, Slash Commands
- URL Previews: Link-Vorschau für alle URLs
- Webhooks: eigene Webhooks für Automation

**API:**
- `GET/POST /api/integrations` — Integrationen
- `GET/PATCH/DELETE /api/integrations/[id]` — Integration CRUD
- `POST /api/integrations/[id]/sync` — Sync trigger

---

### 8. Auth & User Settings
**Pfad:** `src/components/auth/`
**Dateien:** `Login.tsx`, `Setup.tsx`, `UserSettings.tsx`

**Features:**
- Email/Passwort Login (bcrypt)
- Session-basiert (Cookie)
- Profile: Name, Avatar, Email, Passwort ändern
- Appearance: Theme (Light/Dark/System), Font Size
- Notifications: Email für Erwähnungen, Due Dates
- Export: Alle eigenen Daten exportieren (GDPR)

**API:**
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `POST /api/auth/register` — Registrierung (nur im Setup)
- `PATCH /api/auth/profile` — Profile updaten
- `GET /api/auth/export` — Daten exportieren

---

### 9. Planner & Calendar
**Pfad:** `src/components/planner/`
**Dateien:** `Planner.tsx`, `CalendarView.tsx`, `Timeline.tsx`, `SchedulePanel.tsx`

**Features:**
- Calendar View — Monat, Woche, Tag-Ansicht
- Timeline View — Horizontale Zeitleiste für Projekte/Meilensteine
- Schedule — Termine, Deadlines, Erinnerungen
- Drag & Drop — Events verschieben, Dauer ändern
- Ressourcen-Belegung — Wer ist wann verfügbar (Team-Kalender)
- Meilenstein-Marker — Wichtige Termine hervorheben
- iCal Import/Export — Externe Kalender einbinden
- Recurring Events — täglich, wöchentlich, monatlich
- AI-Integration — "Plane Meeting am Freitag 14:00" → AI checkt Verfügbarkeit

**Views:** Month Grid, Week Agenda, Day Timeline, Gantt/Timeline

**API:**
- `GET/POST /api/events` — Events
- `GET/PATCH/DELETE /api/events/[id]` — Event CRUD
- `POST /api/events/import` — iCal importieren
- `GET /api/events/export` — iCal exportieren
- `GET /api/calendar/[year]/[month]` — Kalender-Daten

---

## AI Features (CoreForAi Integration)

> **Ziel:** Hatches wird nicht nur ein Workspace — sondern ein **AI-powered Workspace**.

### AI Provider (Beliebig)
Jeder API-Key verwendbar:

- **OpenAI** — GPT-4, GPT-4o, o1, o3
- **Anthropic** — Claude 3.5/3.7/4 Sonnet, Claude 3 Opus
- **Google** — Gemini 2.0/2.5 Flash, Gemini 2.5 Pro
- **DeepSeek** — V3, R1
- **MiniMax** — MiniMax-M2, MiniMax-M2.7 (Text + Vision + Audio)
  - Music Generation — AI generierte Musik für Podcasts/Meetings
  - Voice Synthesis — Meeting-Notes als MP3/WAV
  - Image Generation — Cover-Images für Pages generieren
- **Ollama** — Lokale Models (llama3, mistral, etc.)
- **Custom Endpoint** — OpenAI-kompatible API

**Konfiguration:** API-Key, Base URL, Model pro Task, Temperature, Max Tokens, Budget-Limits

### CoreForAi Harness
AI Agent der konfiguriert wird und oben drauf sitzt:

- Aufgaben aus Konversationen erkennt und automatisch zuweist
- Dokumente zusammenfasst und Key-Points extrahiert
- Templates basierend auf Context vorschlägt
- Erinnerungen und Deadlines verwaltet
- Team-Mitglieder automatisch zuweist basierend auf Skills/Verfügbarkeit

**Harness bearbeiten:**
- Prompt-Templates pro Team anpassen
- Behavior rules setzen (z.B. "Wenn Issue erstellt wird, automatisch zu Board hinzufügen")
- Integration-Commands definieren
- AI-Trigger konfigurieren (z.B. täglicher Standup-Bericht)

### AI Agent Commands
- `/ai task <beschreibung>` — Erstellt Aufgabe im Board
- `/ai summarize` — Fasst aktuelle Seite/Dokument zusammen
- `/ai assign <person> <aufgabe>` — Weist direkt zu
- `/ai template <projekt-typ>` — Generiert passendes Template
- `/ai remind <was> <wann>` — Erstellt Erinnerung

**API:**
- `GET/POST /api/ai/chat` — Chat mit Agent
- `POST /api/ai/command` — Slash Command
- `POST /api/ai/generate` — Content generieren
- `GET/PATCH /api/ai/harness` — Harness Config

---

### Template Library

**Zweck:** Schnellstart für jedes Projekt — Templates sind fix und fertig.

**Kategorien:**

**Software Development**
- Sprint Planning (Board: To Do, In Progress, Review, Done)
- Bug Tracker (Table: Priority, Status, Assignee, Labels)
- Feature Request (Page + Database Combo)
- Release Checklist (mit Due Dates, Assignees)
- PR Review Workflow (GitHub Integration + Board)

**Project Management**
- Projektplanung (Timeline View + Tasks)
- Meeting Notes (Page: Agenda, Notes, Action-Items)
- OKR Tracking (Database: Metrics, Updates)
- Team Onboarding (Page + Checklists pro Tag)

**Marketing & Content**
- Content Calendar (Calendar View)
- Campaign Tracker (Board: Ideation, Draft, Review, Live)
- Social Media Posts (Database: Platform, Status, Schedule)

**HR & Administration**
- Employee Onboarding (Checklist + Docs)
- Expense Tracking (Table: Category, Amount, Status)
- Vacation Request (Form + Approval Workflow)

**General**
- Knowledge Base (Nested Pages Struktur)
- Personal Dashboard (Notes + Quick Actions)
- Weekly Review (Page Template: Sections)

**Features:**
- One-Click importieren → direkt einsatzbereit
- Eigenes Template erstellen → als Blueprint speichern
- AI-generiertes Template → basierend auf Beschreibung
- Template teilen → öffentlich oder nur Team
- Template bearbeiten → Changes gelten für neue Kopien

**API:**
- `GET/POST /api/templates` — Templates
- `GET/PATCH/DELETE /api/templates/[id]` — Template CRUD
- `GET /api/templates/categories` — Kategorien
- `POST /api/templates/import/[templateId]` — Template importieren
- `POST /api/templates/generate` — AI-generiert Template

---

### Automation Rules
Trigger + Action für wiederkehrende Workflows:

- Trigger: Issue erstellt (GitHub) → Action: Karte im Board erstellen
- Trigger: Deadline erreicht → Action: Team benachrichtigen
- Trigger: Neue Page erstellt → Action: AI-Template vorschlagen
- Trigger: Voice-Nachricht → Action: Transkribieren + Action-Items erstellen

**API:**
- `GET/POST /api/automation/rules` — Regeln
- `GET/PATCH/DELETE /api/automation/rules/[id]` — Regel CRUD
- `POST /api/automation/rules/[id]/trigger` — Regel testen

---

## Database Schema (Prisma)

**Core Models:**
- `User` — id, email, name, avatarUrl, passwordHash, settings (JSON)
- `Team` — id, name, icon, members[]
- `TeamMember` — userId, teamId, role
- `Session` — id, userId, token, expiresAt

**Content Models:**
- `Page` — id, title, icon, cover, parentId, teamId, createdById, isDeleted, deletedAt
- `Block` — id, pageId, type, content (JSON), order, parentId, createdById

**Database Models:**
- `Database` — id, pageId, name, properties (JSON)
- `DatabaseItem` — id, databaseId, values (JSON), createdById
- `DatabaseView` — id, databaseId, type, config (JSON)

**Other:**
- `Note` — id, title, content, tags[], userId, teamId
- `Event` — id, title, start, end, recurring, reminders
- `Integration` — id, type, config (JSON), teamId
- `Template` — id, name, category, content (JSON), isPublic, teamId

---

## Workflow & Versionierung

1. **dev-Branch:** Alle Features auf `dev` entwickeln
2. **Version bump:** Bei jedem Update `package.json` erhöhen
3. **main:** Nur via PR von `dev` — keine direkten Commits
4. **Modular:** Jedes Feature = eigener Component-Ordner + API-Gruppe