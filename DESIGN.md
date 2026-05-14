# Hatches — Design & Feature Specification

> **Vision:** Alles in einem: **Notion + Obsidian + Trello + AI Agent Manager + eigenes GitRepo**. Kein hin und her zwischen apps. Ein Tool, das alles kann — und trotzdem clean und einfach bleibt.

**Background:**
- Hatches stammt aus dem CoreForAi-Ökosystem
- Ursprünglich nicht als eigenständiges Produkt gedacht — wurde es aber für bessere interne Arbeit
- **Kernidee:** Alles in einem Workspace — Notion + Obsidian + Trello + AI + GitRepo
- **Ziel:** Kein App-Hopping mehr. Alles an einem Ort, trotzdem clean und einfach.

---

## USPs (Alleinstellungsmerkmale)

1. **Alles in Einem** — Notion + Obsidian + Trello + AI Agent Manager + eigenes GitRepo, kein App-Hopping
2. **AI-powered** — nicht nur Chat, AI die wirklich *arbeitet* (Harness Agent weist Aufgaben zu, erstellt, automatisiert)
3. **Vibecoding-Collaboration** — Human + AI, Human genehmigt, AI arbeitet
4. **Self-hosted & kostenlos** — keine Abhängigkeit, keine Abo-Kosten
5. **Apple-Design** — clean, minimalistisch, macht Spaß zu benutzen

**Was Hatches kann:**

| Feature | Notion | Obsidian | Trello | Hatches |
|---------|--------|----------|--------|---------|
| Block-Editor | ✅ | ❌ | ❌ | ✅ |
| Lokale Markdown-Dateien | ❌ | ✅ | ❌ | ✅ |
| Kanban Board | ✅ | ❌ | ✅ | ✅ |
| AI Agent Manager | ❌ | ❌ | ❌ | ✅ |
| Eigenes GitRepo (GitHatch) | ❌ | ❌ | ❌ | ✅ |

---

## Vibecoding Collaboration (Core Differentiator)

### Das Problem
- **Vibecoder** erstellt schnell viel Code, aber niemand kann folgen
- **Nicht-Coder** haben Ideen, aber keine Möglichkeit selbst umzusetzen
- **AI Agents** baby-sitten den Menschen statt selbst zu arbeiten

### Die Lösung: Hatches

**Zwei-Modus Interface:**
1. **Creator Mode** (Vibe-Coder / AI) — erstellt, baut, coded
2. **Vision Mode** (Non-Coder / Product Owner) — steuert, genehmigt, gibt Feedback

Der Vision-Modus-Benutzer muss nie selbst coden — nur sagen was er will, AI und Vibe-Coder erledigen den Rest.

### Use Cases

**Mensch + AI:**
- Product Owner sagt: "Ich will eine Login-Seite mit OAuth"
- AI erstellt sie automatisch, Vision Mode-Benutzer genehmigt oder lässt ändern
- Kein Code schreiben müssen

**Nicht-Coder + Vibe-Coder:**
- Nicht-Coder beschreibt Vision in normalen Worten
- Vibe-Coder sieht die Anforderungen und setzt um
- Kollaboration ohne Code-Dominanz

**AI + AI:**
- Zwei AI Agents mit unterschiedlichen Rollen (Frontend-Coder, Backend-Architekt)
- Diskutieren via Hatches, einigen sich auf beste Lösung
- Mensch greift nur ein wenn nötig

### Interface-Features

**Task Board (Vibecoding Style)**
- Aufgaben die AI/Agenten selbstständig bearbeiten können
- Status: To Do → In Progress → Needs Approval → Done
- Mensch wird nur bei "Needs Approval" involviert

**Prompt-to-Feature Pipeline**
1. Natürliche Spracheingabe ("was wäre wenn wir...", "ich will...")
2. AI zerlegt in Tasks
3. Tasks werden automatisch verteilt (an Agent oder Mensch)
4. Ergebnis wird präsentiert, Mensch genehmigt

**Conversation Log**
- Jede Änderung wird protokolliert
- Warum wurde etwas so gebaut? AI erklärt es
- History für späteres Verständnis

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

> **Ziel:** Vibecoding Collaboration Tool — mit Apple-Design, self-hosted, kostenlos.

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

### 6. Team Spaces & Permissions
**Pfad:** `src/components/team/`
**Dateien:** `TeamSpace.tsx`, `MemberList.tsx`, `Permissions.tsx`, `GlobalRoles.tsx`, `OrgGroups.tsx`

**Vier-Ebenen Rechtesystem:**

**1. Globale Rechte (einmalig vergeben, team-unabhängig)**
- Unabhängig von Rolle oder Team — einmal vergeben, gelten überall
- Beispiele: "Kann Team erstellen", "Kann API-Keys sehen", "Kann andere User verwalten"
- Gesetzt von Oga Team-Admins, nicht von Team-Rollen
- **Private Daten** sind verschlüsselt — selbst Oga kann sie nicht lesen (Future)

**2. Oga Team — Super Admin**
- Steht über allem — hat Zugriff auf alle Teams und globalen Einstellungen
- Einzige Rolle die Globale Rechte vergeben kann
- "Oga" = Admin des gesamten Systems
- Mindestens ein Oga muss existieren (der Gründer/Gründerin)

**3. Org-Gruppen (Bereichs-Gruppen)**
- Organisatorische Gruppen für Bereiche: z.B. "Frontend", "Backend", "Design", "Marketing"
- User können mehreren Org-Gruppen angehören
- Org-Gruppen haben festgeschriebene Rechte für bestimmte Bereiche
- **Festgeschriebene Rechte (Locked):** Können nicht frei vergeben werden, nur Oga kann ändern
- **Normale Rechte:** Können frei vom Team-Lead vergeben werden
- Beispiel: "Frontend-Gruppe" hat festgeschriebene Rechte auf /frontend-* Routes, kann intern aber frei vergeben wer was darf

**4. Team-Rollen (Team-spezifisch)**
- Permission Levels: Full Access, Can Edit, Can Comment, Can View
- Team-Member können verschiedene Rollen in verschiedenen Teams haben
- Rollen-definiert: Welche Pages/Databases können gesehen/bearbeitet werden

**Permission-Typen:**
- **Normale Rechte:** Frei vergebbar vom Team-Lead/Org-Gruppen-Lead
- **Festgeschriebene Rechte (Locked):** Nur von Oga änderbar, können nicht "nach unten" weitergegeben werden

**Admin Controls:**
- Oga Team-Einstellungen
- Globale Rechte vergeben/entziehen
- Org-Gruppen erstellen/bearbeiten (locked + normale Rechte)
- Teams erstellen/löschen
- User-Management (globale Sperre, Passwort-Reset)

**API:**
- `GET/POST /api/team` — Teams
- `GET/PATCH/DELETE /api/team/[id]` — Team CRUD
- `GET/POST /api/team/[id]/members` — Members
- `DELETE /api/team/[id]/members/[userId]` — Member entfernen
- `GET/PATCH /api/global/permissions/[userId]` — Globale Rechte (Oga-only)
- `GET/POST /api/global/roles` — Globale Rollen
- `GET/POST /api/org/groups` — Org-Gruppen
- `GET/PATCH/DELETE /api/org/groups/[id]` — Org-Gruppe CRUD
- `POST /api/org/groups/[id]/members` — User zu Org-Gruppe hinzufügen
- `DELETE /api/org/groups/[id]/members/[userId]` — User entfernen
- `GET /api/org/groups/[id]/rights` — Rechte der Org-Gruppe (locked + normal)

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

## AI Features

### AI Provider (Beliebig)
Jeder API-Key verwendbar:

- **OpenAI** — GPT-4, GPT-4o, o1, o3
- **Anthropic** — Claude 3.5/3.7/4 Sonnet, Claude 3 Opus
- **Google** — Gemini 2.0/2.5 Flash, Gemini 2.5 Pro
- **DeepSeek** — V3, R1
- **MiniMax** — MiniMax-M2, MiniMax-M2.7 (beliebig verwendbar via API-Key)
- **Ollama** — Lokale Models (llama3, mistral, etc.)
- **Custom Endpoint** — OpenAI-kompatible API

**Konfiguration:** API-Key, Base URL, Model pro Task, Temperature, Max Tokens, Budget-Limits

### Harness Agent
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
- `OrgGroup` — id, name, description, lockedRights[], normalRights[]
- `OrgGroupMember` — userId, orgGroupId, joinedAt
- `GlobalPermission` — userId, permission (string), grantedBy, grantedAt (team-unabhängig)
- `GlobalRole` — id, name, permissions[] (集合 globaler Rechte)
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

---

## Hatches 2.0 — Future Plans

**AI Events:**
- AI plant automatisch Meetings basierend auf Verfügbarkeit
- Erstellt Erinnerungen und benachrichtigt das Team
- AI Event Intelligence: "Finde einen Slot für alle Team-Members diese Woche"
- Automatische Timezone-Anpassung

**Note:** See **GitHatch** project — internal Git backup and standalone git repo. Not GitHub/GitLab replacement. Users can also use GitHatch directly as their own git repo. Partially open source — not fully local-hostable (control retained).