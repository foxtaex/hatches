# Hatches — Design & Feature Specification

> **Vision:** Notion-Alternative mit Apple-Design-Ästhetik — clean, minimalistisch, self-hosted & kostenlos. Entwickelt von **CoreForAi** als Erweiterung ihres internen Dev-Tools.

**Background:** Hatches stammt aus dem CoreForAi-Ökosystem — es war ursprünglich ein internes Dev-Tool, das zu einer vollwertigen Workspace-Plattform erweitert wurde. Inter (der Font) war bereits Teil des CoreForAi-Design-Systems.

## Design Philosophy

### Apple-Inspired Minimalism
- **Clean surfaces** — Weiß/helles Grau statt dunklem Zinc
- **SF Pro** als Primärfont (system-ui fallback chain)
- **Großzügiger Whitespace** —，空气感，breathing room
- **Subtle shadows** für Tiefe statt harter Borders
- **Smooth animations** — 300ms ease-out, spring-feel bei Interaktionen
- **Gradients** dezent eingesetzt (z.B. акценты, highlights)
- **Transparenz** mit backdrop-blur für overlays

### Notion-Referenz
- **Block-basiertes Layout** — alles ist ein Block
- **Sidebar + Content Area** — основной Layout
- **Inline Editing** — Doppelklick zum Bearbeiten
- **Slash Commands** — `/` für schnelle Actions
- **Database Views** — Table, Board, Gallery, Calendar, Timeline
- **Nestable Seiten** — Hierarchie mit Drag & Drop

### Dark Mode (Toggle)
- **Licht nach dark** — erstelle hellen Modus, dann dark als Alternative
- **Dark: #1c1c1e** surfaces, **#2c2c2e** borders, **#f5f5f7** text
- **Accent: #007AFF** (Apple Blue) für primary actions
- **Kein reines Schwarz** — Apple verwendet "fab التجميل" dark grays

### Content Style
- **German UI** (z.B. "Anmelden", "Speichern", "Notizen")
- **Clean labels** — kein Marketing-Sprech
- **Emoji erlaubt** für personality ( Unlike current design system)
- **Großzügige Typografie** — mehr line-height, größere Schriften

---

## Design System

**Quelle:** `design-system/` (im Repo enthalten)

### Visual DNA (Apple-Inspired)
- **Light-first:** #ffffff surfaces, #f5f5f7 body, #e5e5e5 borders
- **High contrast:** #000 active text, #86868b secondary text
- **Accent:** #007AFF (Apple Blue) for primary actions
- **Generous spacing:** 16px–24px padding, relaxed line-height (1.6)
- **Inter** as primary font (clean, modern, Google Fonts)
- **Subtle shadows:** rgba(0,0,0,0.08) for depth, no harsh borders
- **Smooth transitions:** 300ms ease-out, spring feel
- **Gradients:** subtle (e.g. frosted glass overlays)
- **Transparencies:** backdrop-blur for modals, overlays

### Dark Mode
- **#1c1c1e** surface, **#2c2c2e** borders, **#f5f5f7** text
- **Accent:** #0A84FF (Apple Blue dark variant)
- **Frosted glass:** backdrop-blur with rgba(255,255,255,0.08) panels

### Content Style
- **German UI** throughout (e.g., "Anmelden", "Speichern", "Notizen")
- **Direct, utilitarian** language — no marketing fluff
- **Developer-first** terminology
- **UPPERCASE brand text** with wide letter-spacing (HATCHES)
- **No emoji** — pure text and icons only

### Color Palette (CSS Custom Properties)
See `design-system/colors_and_type.css` für vollständige Token-Definition.

### Typography
- **Font:** Inter (CoreForAi Design System) — clean, modern, Google Fonts
- **Fallback:** system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Mono:** 'JetBrains Mono', ui-monospace, 'SF Mono', monospace
- **Scale:** 14px–24px range
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line-height:** 1.6 for body text (generous)
- **Letter-spacing:** -0.01em for headings, normal for body

> **CoreForAi:** Inter ist Teil des CoreForAi-Design-Systems, das auch in anderen CoreForAi-Produkten verwendet wird.

---

## Features & Module

> **Ziel:** Notion-Klon — aber mit Apple-Design, self-hosted, kostenlos.

Jedes Feature ist ein **eigenständiger, modularer Baustein** mit:
- Eigener Component-Ordner (`src/components/<feature>/`)
- Eigener API-Gruppe (`src/pages/api/<feature>/`)
- Eigenen Typen (`types.ts`)

### 1. Pages / Docs (Block Editor)
**Pfad:** `src/components/editor/`
**Dateien:** `BlockEditor.tsx`, `BlockToolbar.tsx`, `SlashCommand.tsx`

**Features:**
- **Block-basiertes Layout** — jeder Absatz/Headline/List ist ein Block
- **Slash Commands** — `/h1`, `/h2`, `/bullet`, `/numbered`, `/todo`, `/quote`, `/code`, `/divider`
- **Inline Editing** — Doppelklick oder Enter zum Bearbeiten
- **Drag & Drop** Blöcke neu anordnen (dnd-kit)
- **Nestable Blöcke** — Aufgabenlisten mit Sub-Items
- **Rich Text** — Bold, Italic, Code, Links inline
- **Embeds** — Code-Blöcke mit Syntax-Highlighting, Bilder, Dateien
- **Auto-Save** (debounced 600ms)
- **Version History** — ältere Versionen wiederherstellen
- **Export** als Markdown, PDF, HTML

**API:**
- `GET /api/pages` — Alle Seiten
- `POST /api/pages` — Seite erstellen
- `GET /api/pages/[id]` — Einzelne Seite mit Blöcken
- `PATCH /api/pages/[id]` — Metadaten (Titel, Icon, Cover)
- `DELETE /api/pages/[id]` — Seite löschen
- `GET /api/pages/[id]/blocks` — Blöcke der Seite
- `POST /api/pages/[id]/blocks` — Block hinzufügen
- `PATCH /api/pages/[id]/blocks/[blockId]` — Block aktualisieren
- `DELETE /api/pages/[id]/blocks/[blockId]` — Block löschen
- `POST /api/pages/[id]/blocks/reorder` — Blöcke neu anordnen
- `POST /api/pages/[id]/blocks/[blockId]/children` — Kind-Block
- `GET /api/pages/[id]/versions` — Version History

---

### 2. Database Views (Tables & More)
**Pfad:** `src/components/database/`
**Dateien:** `DatabaseView.tsx`, `TableView.tsx`, `BoardView.tsx`, `GalleryView.tsx`, `CalendarView.tsx`, `TimelineView.tsx`

**Features:**
- **Multiple Views** pro Database — Table, Board (Kanban), Gallery, Calendar, Timeline
- **Custom Properties** — Text, Number, Select, Multi-Select, Date, Person, Files, URL, Checkbox, Formula
- **Filter & Sort** — nach Property filtern, multiple Sort-Kriterien
- **Group By** — Zeilen nach Property gruppieren
- **Inline Editing** — Zellen direkt bearbeiten
- **Relation** — Links zwischen Databases (Linked Databases)
- **Formula** — berechnete Felder (ähnlich Notion)
- **Aggregation** — Count, Sum, Average über Groups

**API:**
- `GET /api/databases` — Alle Databases
- `POST /api/databases` — Database erstellen
- `GET /api/databases/[id]` — Database mit Properties
- `PATCH /api/databases/[id]` — Database umbenennen/Properties
- `DELETE /api/databases/[id]` — Database löschen
- `GET /api/databases/[id]/items` — Items mit Views
- `POST /api/databases/[id]/items` — Item erstellen
- `PATCH /api/databases/[id]/items/[itemId]` — Item aktualisieren
- `DELETE /api/databases/[id]/items/[itemId]` — Item löschen
- `POST /api/databases/[id]/views` — View erstellen
- `PATCH /api/databases/[id]/views/[viewId]` — View updaten

---

### 3. Kanban Board
**Pfad:** `src/components/kanban/`
**Dateien:** `KanbanBoard.tsx`, `KanbanColumn.tsx`, `CardItem.tsx`, `ArchivePanel.tsx`, `types.ts`

**Features:**
- **View Mode:** Kanban/Board für Databases (siehe Database Views)
- **Card-Management:** erstellen, bearbeiten, archivieren
- **External Issue Badges:** GitHub, GitLab, Jira Integration
- **Assignees:** User zuweisen, Due Dates
- **Filter/Suche:** im Board

**API:** (Teil von Database API)
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
- **Schnelle Notizen** — einzelne Seite ohne Block-Struktur
- **Markdown-Support** — headings, lists, code, links
- **Tagging** — Notizen mit Tags versehen
- **Full-Text Search** — durchsuchen
- **Sidebar-Liste** — alle Notizen mit Preview

**API:**
- `GET /api/notes` — Alle Notizen
- `POST /api/notes` — Notiz erstellen
- `GET /api/notes/[id]` — Einzelne Notiz
- `PATCH /api/notes/[id]` — Notiz aktualisieren
- `DELETE /api/notes/[id]` — Notiz löschen

---

### 5. Sidebar & Navigation
**Pfad:** `src/components/sidebar/`
**Dateien:** `Sidebar.tsx`, `SidebarItem.tsx`, `QuickFinder.tsx`

**Features:**
- **Favorites** — Pin oft genutzte Seiten
- **Trash** — Gelöschte Seiten (30 Tage)
- **Search** — QuickFinder (Cmd+K) für Seiten/Databases
- **Nested Pages** — Drag & Drop Hierarchie
- **Toggle Sections** —-collapse/expand Page groups
- **Workspace Switcher** — zwischen Teams/Pages
- **Dark/Light Mode Toggle** — persisten

**API:**
- `GET /api/navigation` — Seitenstruktur
- `PATCH /api/navigation/reorder` — Reihenfolge updaten
- `POST /api/navigation/favorites` — Favorit hinzufügen
- `DELETE /api/navigation/favorites/[id]` — Favorit entfernen

---

### 6. Team Spaces
**Pfad:** `src/components/team/`
**Dateien:** `TeamSpace.tsx`, `MemberList.tsx`, `Permissions.tsx`

**Features:**
- **Workspace per Team** — eigene Pages, Databases, Members
- **Member Management** — einladen, rollen zuweisen, entfernen
- **Permission Levels:** Full Access, Can Edit, Can Comment, Can View
- **Admin Controls** — Team-Einstellungen

**API:**
- `GET /api/team` — Teams auflisten
- `POST /api/team` — Team erstellen
- `GET /api/team/[id]` — Team Details
- `PATCH /api/team/[id]` — Team aktualisieren
- `DELETE /api/team/[id]` — Team löschen
- `GET /api/team/[id]/members` — Members
- `POST /api/team/[id]/members` — Member einladen
- `DELETE /api/team/[id]/members/[userId]` — Member entfernen

---

### 7. Integrations
**Pfad:** `src/components/integrations/`
**Dateien:** `IntegrationManager.tsx`, `SyncPanel.tsx`
**Lib:** `src/lib/integrations/`

**Features:**
- **GitHub:** Issues → Cards, PR Reviews, Actions Status
- **GitLab:** Issues, MRs, Pipelines
- **Jira:** Issues sync, Custom Fields
- **Slack:** Notifications, Slash Commands
- **Figma:** File embeds (als Link-Vorschau)
- **URL Previews:** Link-Vorschau für alle URLs
- **Webhooks:** eigene Webhooks für Automation

**API:**
- `GET /api/integrations` — Alle Integrationen
- `POST /api/integrations` — Integration erstellen
- `GET /api/integrations/[id]` — Einzelne
- `PATCH /api/integrations/[id]` — Aktualisieren
- `DELETE /api/integrations/[id]` — Löschen
- `POST /api/integrations/[id]/sync` — Sync trigger

---

### 8. Auth & User Settings
**Pfad:** `src/components/auth/`
**Dateien:** `Login.tsx`, `Setup.tsx`, `UserSettings.tsx`

**Features:**
- **Email/Passwort** Login (bcrypt)
- **Session-basiert** (Cookie)
- **Profile:** Name, Avatar, Email, Passwort ändern
- **Appearance:** Theme (Light/Dark/System), Font Size
- **Notifications:** Email-Notifications für Erwähnungen, Due Dates
- **Export:** Alle eigenen Daten exportieren (GDPR)

**API:**
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `POST /api/auth/register` — Registrierung (nur im Setup)
- `PATCH /api/auth/profile` — Profile updaten
- `GET /api/auth/export` — Daten exportieren

---

## UI-Komponenten (Design System)

Apple-inspiriertes Design mit:
- **Clean surfaces** — #ffffff, #f5f5f7
- **SF Pro / system fonts** — Apple-like typography
- **Subtle shadows** für depth
- **Smooth 300ms transitions** mit spring feel
- **Frosted glass** — backdrop-blur für overlays
- **Transparenz** — rgba overlays

Siehe `design-system/ui_kits/hatches/` für React-Komponenten:
- `Navigation.jsx` — Sidebar-Navigation
- `KanbanBoard.jsx` — Kanban Board
- `DocsEditor.jsx` — Block Editor
- `UserAccount.jsx` — User Panel
- `AdminSettings.jsx` — Admin Settings

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
- `Integration` — id, type, config (JSON), teamId

---

## Workflow & Versionierung

1. **dev-Branch:** Alle Features auf `dev` entwickeln
2. **Version bump:** Bei jedem Update `package.json` erhöhen
3. **main:** Nur via PR von `dev` — keine direkten Commits
4. **Modular:** Jedes Feature = eigener Component-Ordner + API-Gruppe