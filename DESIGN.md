# Hatches — Design & Feature Specification

## Design System

**Quelle:** `design-system/` (im Repo enthalten)

### Visual DNA
- **Dark-first:** zinc-950 body, zinc-900 surfaces, zinc-800 borders
- **Low contrast:** zinc-400 inactive, zinc-100 active text
- **Minimal accents:** blue-600 primary, green/red for states
- **Dense layout:** tight spacing, 48px nav height
- **System fonts only:** no custom webfonts
- **FontAwesome 6.7.2 icons** exclusively
- **No gradients, textures, or shadows** — flat, solid colors only
- **Fast transitions:** 200ms color changes, no spring physics

### Content Style
- **German UI** throughout (e.g., "Anmelden", "Speichern", "Notizen")
- **Direct, utilitarian** language — no marketing fluff
- **Developer-first** terminology
- **UPPERCASE brand text** with wide letter-spacing (HATCHES)
- **No emoji** — pure text and icons only

### Color Palette (CSS Custom Properties)
See `design-system/colors_and_type.css` für vollständige Token-Definition.

### Typography
- System fonts: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Mono: `ui-monospace, 'SF Mono', 'Cascadia Code', monospace`
- Scale: 12px–24px range (tight)
- Weights: 400, 500, 600, 700

---

## Features & Module

Jedes Feature ist ein **eigenständiger, modularer Baustein** mit:
- Eigener Component-Ordner (`src/components/<feature>/`)
- Eigener API-Gruppe (`src/pages/api/<feature>/`)
- Eigenen Typen (`types.ts`)

### 1. Kanban Board
**Pfad:** `src/components/kanban/`
**Dateien:** `KanbanBoard.tsx`, `KanbanColumn.tsx`, `CardItem.tsx`, `ArchivePanel.tsx`, `types.ts`

**Features:**
- Multi-Board Support (privat + Team-boards)
- Drag & Drop (dnd-kit) — Karten zwischen Spalten und Boards verschieben
- Card-Management: erstellen, bearbeiten, löschen, zuweisen
- Spalten: umbenennen, hinzufügen, löschen
- Archiv-System: Karten archivieren, wiederherstellen, endgültig löschen
- External Issue Badges (GitHub, GitLab, Jira, etc.)
- Filter/Suche in Board-Ansicht

**API:**
- `GET /api/board` — Alle Boards auflisten
- `POST /api/board` — Board erstellen
- `GET /api/board/[id]` — Einzelnes Board mit Spalten & Karten
- `PATCH /api/board/[id]` — Board umbenennen
- `DELETE /api/board/[id]` — Board löschen
- `POST /api/board/columns` — Spalte erstellen
- `PATCH /api/board/columns` — Spalte umbenennen
- `DELETE /api/board/columns` — Spalte löschen
- `POST /api/board/cards` — Karte erstellen
- `PATCH /api/board/cards` — Karte aktualisieren
- `DELETE /api/board/cards` — Karte löschen
- `POST /api/board/move` — Karte verschieben
- `GET /api/board/archive` — Archivierte Karten
- `POST /api/board/archive` — Karte archivieren
- `DELETE /api/board/archive` — Karte wiederherstellen

---

### 2. Docs (Markdown)
**Pfad:** `src/components/docs/`
**Dateien:** `DocsEditor.tsx`

**Features:**
- Markdown-Editor mit Live-Split-View (Preview)
- Dokumente erstellen, bearbeiten, löschen
- Team-Scope (privat oder Team-basiert)
- Auto-Save (debounced 600ms)
- **Import:** .md/.markdown/.txt Dateien hochladen
- **Export:** Dokumente als .md Datei herunterladen

**API:**
- `GET /api/docs` — Alle Docs auflisten
- `POST /api/docs` — Doc erstellen
- `GET /api/docs/[id]` — Einzelnes Doc
- `PATCH /api/docs/[id]` — Doc aktualisieren
- `DELETE /api/docs/[id]` — Doc löschen
- `POST /api/docs/import` — Markdown-Datei importieren (FormData)
- `GET /api/docs/[id]/export` — Doc als .md downloaden

---

### 3. Notes (Quick Notes)
**Pfad:** `src/components/notes/`
**Dateien:** `NotesView.tsx`

**Features:**
- Schnelle persönliche Notizen
- Team-Scope (privat oder Team-basiert)
- Erstellen, bearbeiten, löschen
- Titel + Content (Markdown-light)

**API:**
- `GET /api/notes` — Alle Notizen
- `POST /api/notes` — Notiz erstellen
- `GET /api/notes/[id]` — Einzelne Notiz
- `PATCH /api/notes/[id]` — Notiz aktualisieren
- `DELETE /api/notes/[id]` — Notiz löschen

---

### 4. Websites (URL Registry)
**Pfad:** `src/components/websites/`
**Dateien:** `WebsiteManager.tsx`

**Features:**
- Interne URL-Registrierung
- Repo-URL, Deploy-Befehl, Build-Befehl
- Status-Anzeige (idle, deployed, error)
- Beschreibungstext

**API:**
- `GET /api/websites` — Alle Websites
- `POST /api/websites` — Website hinzufügen
- `GET /api/websites/[id]` — Einzelne Website
- `PATCH /api/websites/[id]` — Website aktualisieren
- `DELETE /api/websites/[id]` — Website löschen

---

### 5. Integrations
**Pfad:** `src/components/integrations/`
**Dateien:** `IntegrationManager.tsx`
**Lib:** `src/lib/integrations/` (Provider-Implementierungen)

**Features:**
- Issues importieren von: GitHub, GitLab, Jira, Redmine, MantisBT, Confluence, Trello
- Integration hinzufügen/bearbeiten/löschen
- Sync von Issues → Cards im Kanban
- External Issue Badge-Anzeige auf Cards

**API:**
- `GET /api/integrations` — Alle Integrationen
- `POST /api/integrations` — Integration erstellen
- `GET /api/integrations/[id]` — Einzelne Integration
- `PATCH /api/integrations/[id]` — Integration aktualisieren
- `DELETE /api/integrations/[id]` — Integration löschen
- `GET /api/integrations/[id]/issues` — Issues abrufen
- `POST /api/integrations/[id]/sync` — Sync triggern

**Provider:** `src/lib/integrations/github.ts`, `jira.ts`, `gitlab.ts`, `redmine.ts`, `mantisbt.ts`, `confluence.ts`, `types.ts`

---

### 6. Teams & Roles (Admin)
**Pfad:** `src/components/admin/`
**Dateien:** `AdminPanel.tsx`

**Features:**
- Teams erstellen, umbenennen, löschen
- Team-Mitglieder hinzufügen/entfernen
- Rollen definieren mit granularen Permissions
- Permission-Toggles: view / create / edit / delete pro Section
- User Management: erstellen, deaktivieren, Rechte ändern
- Discord-Style Permission-System

**API:**
- `GET /api/admin/users` — Alle User
- `POST /api/admin/users` — User erstellen
- `GET /api/admin/teams` — Alle Teams
- `POST /api/admin/teams` — Team erstellen
- `PATCH /api/admin/teams/[id]` — Team aktualisieren
- `DELETE /api/admin/teams/[id]` — Team löschen
- `GET /api/admin/roles` — Alle Rollen
- `POST /api/admin/roles` — Rolle erstellen
- `GET /api/admin/members` — Team-Memberships
- `POST /api/admin/members` — Member hinzufügen
- `PATCH /api/admin/members/[id]` — Membership aktualisieren
- `DELETE /api/admin/members/[id]` — Member entfernen

---

### 7. Auth (Sessions)
**Pfad:** `src/lib/auth.ts`

**Features:**
- Username/Email + Passwort Login
- Session-basiert (cookie)
- bcrypt Passwort-Hashing
- Setup-Wizard für ersten Admin
- Rate-Limiting (geplant)

**API:**
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `POST /api/auth/register` — Registrierung (nur im Setup-Modus)

---

## UI-Komponenten (Design System)

Siehe `design-system/ui_kits/hatches/` für vollständige React-Komponenten:
- `Navigation.jsx` — Sidebar-Navigation
- `KanbanBoard.jsx` — Kanban Board Komponente
- `DocsEditor.jsx` — Markdown Editor
- `UserAccount.jsx` — User Account Panel
- `AdminSettings.jsx` — Admin Settings

---

## Workflow & Versionierung

1. **dev-Branch:** Alle Features werden auf `dev` entwickelt
2. **Version bump:** Bei jedem Update `package.json` Version incrementieren
3. **main:** Nur via PR vom `dev` — keine direkten Commits auf main
4. **Modular:** Jedes Feature = eigener Component-Ordner + API-Gruppe

---

## Database Schema (Prisma)

Siehe `prisma/schema.prisma` — alle Modelle:
- `User`, `Session`, `Team`, `TeamMembership`, `Role`, `Permission`
- `Board`, `Column`, `Card`, `Archive`
- `Doc`, `Note`, `Website`
- `Integration`, `ExternalIssue`