# Hatches — Komponenten-Registry

> **Regel:** Jede Komponente wird hier dokumentiert. Neue Komponenten sofort eintragen.

---

## Übersicht

| Komponente | Datei | Status | Modul |
|-----------|-------|--------|-------|
| `AdminPanel` | `src/components/admin/AdminPanel.tsx` | ✅ Implementiert | Admin |
| `AiChat` | `src/components/ai/AiChat.tsx` | ✅ Implementiert | KI |
| `HatchesLogo` | `src/components/brand/HatchesLogo.tsx` | ✅ Implementiert | Brand |
| `DocsEditor` | `src/components/docs/DocsEditor.tsx` | ✅ Implementiert | Docs |
| `MarkdownEditor` | `src/components/docs/MarkdownEditor.tsx` | ✅ Implementiert | Docs |
| `IntegrationManager` | `src/components/integrations/IntegrationManager.tsx` | ✅ Implementiert | Integrationen |
| `KanbanBoard` | `src/components/kanban/KanbanBoard.tsx` | ✅ Implementiert | Kanban |
| `KanbanColumn` | `src/components/kanban/KanbanColumn.tsx` | ✅ Implementiert | Kanban |
| `CardItem` | `src/components/kanban/CardItem.tsx` | ✅ Implementiert | Kanban |
| `CardDetailModal` | `src/components/kanban/CardDetailModal.tsx` | ✅ Implementiert | Kanban |
| `ArchivePanel` | `src/components/kanban/ArchivePanel.tsx` | ✅ Implementiert | Kanban |
| `Planner` | `src/components/planner/Planner.tsx` | ✅ Implementiert | Planner |
| `SetupWizard` | `src/components/setup/SetupWizard.tsx` | ✅ Implementiert | Setup |
| `TemplateLibrary` | `src/components/templates/TemplateLibrary.tsx` | ✅ Implementiert | Templates |
| `WebsiteManager` | `src/components/websites/WebsiteManager.tsx` | ✅ Implementiert | Websites |

---

## Komponenten-Details

---

### `AdminPanel`

> `src/components/admin/AdminPanel.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** `/admin`

**Props:** keine (self-contained, liest Session via Cookie)

**State (intern):**
- `tab: TabKey` — aktiver Tab
- `roles: Role[]`, `teams: Team[]`, `users: User[]` — geladene Daten
- `workspaceConfig: WorkspaceConfig` — Name, DB-URL
- `appInfo: AppInfo` — Version, Runtime-Infos

**Tabs:**
| Tab-Key | Label | Gruppe |
|---------|-------|--------|
| `roles` | Rollen | Berechtigungen |
| `teams` | Teams | Berechtigungen |
| `users` | Benutzer | Berechtigungen |
| `global-perms` | Globale Rechte | Berechtigungen |
| `org-groups` | Gruppen | Berechtigungen |
| `board` | Kanban | Module |
| `docs` | Docs | Module |
| `planner` | Planner | Module |
| `templates` | Templates | Module |
| `ai` | KI | Module |
| `websites` | Websites | Admin |
| `integrations` | Integrationen | Admin |
| `workspace` | Workspace | Admin |
| `info` | App-Info | Admin |

**API Calls:**
```
GET    /api/admin/roles          → beim Mount
POST   /api/admin/roles          → Rolle erstellen
PATCH  /api/admin/roles/:id      → Rolle + Permissions speichern
DELETE /api/admin/roles/:id      → Rolle löschen

GET    /api/admin/teams          → beim Mount
POST   /api/admin/teams          → Team erstellen
PATCH  /api/admin/teams/:id      → Team bearbeiten
DELETE /api/admin/teams/:id      → Team löschen

GET    /api/admin/users          → beim Mount
PATCH  /api/admin/users/:id      → User bearbeiten
DELETE /api/admin/users/:id      → User löschen

GET    /api/admin/workspace      → beim Mount
PATCH  /api/admin/workspace      → Workspace-Name speichern

GET    /api/admin/app-info       → beim Mount (App-Info Tab)
GET    /api/admin/ai             → beim KI-Tab
POST   /api/admin/ai             → AI-Provider erstellen
PATCH  /api/admin/ai/:id         → AI-Provider bearbeiten
DELETE /api/admin/ai/:id         → AI-Provider löschen
```

**Sub-Komponenten (intern):**
- `RolesTab` — Rollen-Editor mit Permissions-Matrix
- `TeamsTab` — Teams + Mitglieder verwalten
- `UsersTab` — User-Verwaltung
- `GlobalPermsTab` — Globale Berechtigungen
- `OrgGroupsTab` — Platzhalter (Future)
- `WorkspaceTab` — Workspace-Konfiguration
- `AppInfoTab` — Runtime-Info + Version-History (aktuelle Version immer oben)
- `Toggle` — Wiederverwendbarer Toggle-Switch

---

### `AiChat`

> `src/components/ai/AiChat.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** `/ai`

**Props:** keine

**State (intern):**
- `messages: Message[]` — Chat-Verlauf (nur Client, nicht persistiert)
- `input: string` — aktuelles Eingabefeld
- `loading: boolean` — wartet auf Antwort
- `status: AiStatus | null` — Provider-Status (hat Provider? welcher?)

**Was rendert sie?**
- Provider-Status-Banner (kein Provider konfiguriert)
- Nachrichten-Liste (User + Assistant Bubbles, Markdown-rendered)
- Suggestion-Chips (SYSTEM_SUGGESTIONS)
- Textarea-Eingabe + Senden-Button

**API Calls:**
```
GET  /api/admin/ai      → beim Mount (Provider prüfen)
POST /api/ai/chat       → bei jeder Nachricht (Streaming)
```

---

### `HatchesLogo`

> `src/components/brand/HatchesLogo.tsx`  
> **Status:** ✅ Implementiert  
> **Genutzt in:** Layout.astro, SetupWizard.tsx, Login-Seiten

**Props:**
```typescript
interface Props {
  size?: number;          // px, default: 28
  wordmark?: boolean;     // "hatches" Text daneben
  wordmarkSize?: number;  // Font-Size, default: size * 0.64
  label?: string;         // Custom Wordmark-Text
  variant?: "A" | "B" | "C";  // A=vivid/mint, B=dark, C=outline
  className?: string;
}
```

**State (intern):** keiner

**API Calls:** keine

---

### `DocsEditor`

> `src/components/docs/DocsEditor.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** `/docs`

**Props:** keine

**State (intern):**
- `docs: Doc[]` — alle Docs des Users
- `activeId: number | null` — aktives Dokument
- `content: string` — aktueller Markdown-Inhalt
- `title: string` — aktueller Titel
- `editingTitle: boolean` — Titel-Inline-Edit
- `userTeams: TeamOption[]` — Teams für neues Dok
- `viewMode: "edit" | "preview" | "live" | "reverse"` — Editor-Modus
- `creating: boolean` — Neu-Formular sichtbar
- `importing: boolean` — Import-Dialog sichtbar

**Was rendert sie?**
- Sidebar: Doc-Liste + Neu/Import-Buttons
- Hauptbereich: Titel-Edit + `MarkdownEditor`
- Export-Button (Markdown-Download)
- Team-Scope-Selector beim Erstellen

**API Calls:**
```
GET    /api/docs         → beim Mount
POST   /api/docs         → Doc erstellen
PATCH  /api/docs/:id     → Titel/Content speichern (debounced 600ms)
DELETE /api/docs/:id     → Doc löschen
GET    /api/user/teams   → für Team-Selector
```

---

### `MarkdownEditor`

> `src/components/docs/MarkdownEditor.tsx`  
> **Status:** ✅ Implementiert  
> **Genutzt in:** DocsEditor

**Props:**
```typescript
interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  viewMode?: "edit" | "preview" | "split" | "split-reverse";
  onViewModeChange?: (mode: ViewMode) => void;
}
```

**State (intern):**
- `mode: "edit" | "preview" | "split" | "split-reverse"` — Ansichtsmodus
- `selectionStart/End: number` — für Toolbar-Aktionen

**Was rendert sie?**
- Toolbar (Bold, Italic, Heading, Listen, Link, Code, Quote, Tabelle)
- Textarea (Edit-Modus)
- Bearbeitbare Markdown-Preview via `marked`, `contentEditable` und `turndown`
- Normale und umgekehrte Split-View

**API Calls:** keine (reiner Presenter)

---

### `IntegrationManager`

> `src/components/integrations/IntegrationManager.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** via AdminPanel (Tab "integrations")

**Props:** keine

**State (intern):**
- `integrations: Integration[]` — alle konfigurierten Integrationen
- `selectedIntegration: Integration | null` — geöffnetes Issue-Panel
- `editingId: number | null` — bearbeitete Integration

**Unterstützte Typen:** GitHub, GitLab, Jira, Redmine, MantisBT, Confluence, Trello

**Was rendert sie?**
- Liste aller Integrationen mit Status-Badge
- Formular: Neue Integration erstellen/bearbeiten
- `IssuePanel` (inline) — Issues anzeigen + in Kanban importieren

**API Calls:**
```
GET    /api/integrations              → beim Mount
POST   /api/integrations              → Integration erstellen
PATCH  /api/integrations/:id          → Integration bearbeiten
DELETE /api/integrations/:id          → Integration löschen
GET    /api/integrations/:id/issues   → Issues laden
POST   /api/integrations/:id/sync     → Sync auslösen
POST   /api/integrations/:id/import   → Issue als Kanban-Card importieren
GET    /api/board                     → für Column-Selector beim Import
```

---

### `KanbanBoard`

> `src/components/kanban/KanbanBoard.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** `/board`

**Props:** keine

**State (intern):**
- `boards: BoardMeta[]` — alle Boards des Users
- `activeBoard: Board | null` — geöffnetes Board (mit Columns + Cards)
- `activeDragCard: Card | null` — Drag-&-Drop Overlay-Card
- `openCardId: number | null` — geöffnetes CardDetailModal
- `showArchive: boolean` — ArchivePanel sichtbar
- `filterQuery: string` — Suche/Filter

**Was rendert sie?**
- Sidebar: Board-Liste + Neu-Button
- Header: Board-Name, Filter, Archive-Button
- Columns via `KanbanColumn`
- Drag-&-Drop Overlay via `DragOverlay`
- `CardDetailModal` (wenn openCardId gesetzt)
- `ArchivePanel` (wenn showArchive)

**API Calls:**
```
GET    /api/board             → beim Mount
POST   /api/board             → Board erstellen
PATCH  /api/board/:id         → Board umbenennen
DELETE /api/board/:id         → Board löschen
GET    /api/board/:id         → Board laden (columns + cards)
POST   /api/board/cards       → Card erstellen
PATCH  /api/board/cards       → Card aktualisieren
DELETE /api/board/cards/:id   → Card löschen
POST   /api/board/move        → Card verschieben (DnD)
POST   /api/board/columns     → Column erstellen
PATCH  /api/board/columns/:id → Column umbenennen
DELETE /api/board/columns/:id → Column löschen
POST   /api/board/archive/:id → Card archivieren
GET    /api/user/teams        → für Team-Selector
GET    /api/admin/users       → für Assignee-Selector
```

---

### `KanbanColumn`

> `src/components/kanban/KanbanColumn.tsx`  
> **Status:** ✅ Implementiert  
> **Genutzt in:** KanbanBoard

**Props:**
```typescript
interface Props {
  column: Column;               // { id, title, cards: Card[] }
  allBoards: BoardWithCols[];   // für "Move to Board" Menü
  currentBoardId: number;
  onAddCard: (columnId: number, title: string) => void;
  onOpenCard: (id: number) => void;
  onMoveCardToBoard: (cardId: number, targetColumnId: number) => void;
  onRenameColumn: (id: number, title: string) => void;
  onDeleteColumn: (id: number) => void;
}
```

**State (intern):**
- `addingCard: boolean` — Inline-Neu-Formular
- `editingTitle: boolean` — Inline-Rename

**Was rendert sie?**
- Column-Header mit Rename + Delete
- `SortableContext` + `CardItem` Liste
- "+ Card hinzufügen" Button

**API Calls:** keine (alles via Parent-Callbacks)

---

### `CardItem`

> `src/components/kanban/CardItem.tsx`  
> **Status:** ✅ Implementiert  
> **Genutzt in:** KanbanColumn

**Props:**
```typescript
interface Props {
  card: Card;
  allBoards: BoardWithCols[];
  onOpenCard: (id: number) => void;
  onMoveToBoard: (cardId: number, targetColumnId: number) => void;
}
```

**State (intern):**
- `showMovePicker: boolean` — Board-Wechsel-Dropdown

**Was rendert sie?**
- Drag-Handle + Karten-Inhalt
- Labels (Farb-Chips)
- Priority-Badge
- Due-Date (rot wenn überfällig)
- Checklist-Progress-Bar
- Assignee-Avatare
- "Move to Board" Picker

**API Calls:** keine (via Parent)

---

### `CardDetailModal`

> `src/components/kanban/CardDetailModal.tsx`  
> **Status:** ✅ Implementiert  
> **Genutzt in:** KanbanBoard

**Props:**
```typescript
interface Props {
  card: Card;
  users: User[];
  columnName: string;
  currentUserId: number | null;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<Card>) => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
}
```

**State (intern):**
- `title: string`, `desc: string` — editierbare Felder
- `editingTitle/editingDesc: boolean`
- `checklist: ChecklistItem[]`
- `labels: CardLabel[]`
- `assigneeIds: number[]`
- `dueDate: string`
- `priority: string`
- `coverColor: string`

**Was rendert sie?**
- Cover-Farbe Header
- Titel-Inline-Edit
- Beschreibung via `MarkdownEditor` (inline)
- Live-Verknüpfung zu einem Doc als Beschreibung oder Anhang
- Checklist (Add/Toggle/Delete Items)
- Labels (Farb-Picker)
- Priority-Selector
- Due-Date Picker
- Assignees Multi-Select
- Delete / Archive Buttons

**API Calls:** keine direkt (alles via onUpdate/onDelete/onArchive Callbacks zum Parent)

---

### `ArchivePanel`

> `src/components/kanban/ArchivePanel.tsx`  
> **Status:** ✅ Implementiert  
> **Genutzt in:** KanbanBoard

**Props:**
```typescript
interface Props {
  boardId: number;
  onClose: () => void;
  onRestore: (card: Card) => void;
}
```

**State (intern):**
- `cards: Card[]` — archivierte Cards
- `filter: string` — Suchfilter

**Was rendert sie?**
- Slide-in Panel mit archivierten Cards
- Restore-Button pro Card
- Suche

**API Calls:**
```
GET    /api/board/archive?boardId=X   → beim Mount
DELETE /api/board/archive/:id         → Card wiederherstellen
```

---

### `Planner`

> `src/components/planner/Planner.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** `/planner`

**Props:** keine

**State (intern):**
- `events: Event[]` — Kalender-Events
- `dueCards: DueCard[]` — Kanban-Cards mit Due Date
- `viewMode: "month" | "week" | "agenda"` — Ansicht
- `currentDate: Date` — Navigation
- `selectedDate: Date | null` — Tag-Auswahl
- `editingEvent: Event | null` — Bearbeitungs-Formular

**Was rendert sie?**
- Monats-, Wochen- und Agenda-Ansicht
- Events (farbig) + Due-Cards (Badge)
- Event erstellen/bearbeiten Modal
- Navigation (Vor/Zurück/Heute)
- iCal-Export Button

**API Calls:**
```
GET    /api/events            → beim Mount
POST   /api/events            → Event erstellen
PATCH  /api/events/:id        → Event bearbeiten
DELETE /api/events/:id        → Event löschen
GET    /api/board/cards       → Due-Date Cards laden
GET    /api/user/teams        → für Team-Selector
```

---

### `SetupWizard`

> `src/components/setup/SetupWizard.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** `/setup`

**Props:**
```typescript
interface Props {
  initialStep: "db" | "admin" | "restart";
}
```

**State (intern):**
- `step: "db" | "admin" | "restart"` — aktueller Setup-Schritt

**Was rendert sie?**
- Logo-Hero + Progress-Indicator
- Schritt 1 (`DbStep`): DB-Provider-Auswahl + Connection-String
- Schritt 2 (`AdminStep`): Admin-Account erstellen
- Schritt 3 (`RestartStep`): Neustart-Hinweis

**Unterstützte DB-Provider:** SQLite, PostgreSQL, MySQL/MariaDB, SQL Server

**API Calls:**
```
POST /api/setup/db     → DB-Verbindung testen + .env schreiben
POST /api/setup/admin  → Ersten Admin-User erstellen
```

---

### `TemplateLibrary`

> `src/components/templates/TemplateLibrary.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** `/templates`

**Props:**
```typescript
interface Props {
  onApply?: (template: Template) => void;  // für Einbettung in andere Views
  showApply?: boolean;                      // Apply-Button anzeigen
}
```

**State (intern):**
- `templates: Template[]`
- `filterCategory: string` — Kategorie-Filter
- `searchQuery: string` — Suche
- `editingId: number | null`
- `creating: boolean`

**Kategorien:** Alle, Software, Projekt, Marketing, HR, Allgemein

**Was rendert sie?**
- Kategorie-Chips + Suchfeld
- Template-Grid mit Icon, Name, Beschreibung
- Detail-View: Content-Preview + Apply/Edit/Delete
- Erstellen/Bearbeiten-Formular

**API Calls:**
```
GET    /api/templates         → beim Mount
POST   /api/templates         → Template erstellen
PATCH  /api/templates/:id     → Template bearbeiten
DELETE /api/templates/:id     → Template löschen
GET    /api/admin/users       → für createdBy-Anzeige
GET    /api/user/teams        → für Team-Selector
```

---

### `WebsiteManager`

> `src/components/websites/WebsiteManager.tsx`  
> **Status:** ✅ Implementiert  
> **Seite:** via AdminPanel (Tab "websites")

**Props:** keine

**State (intern):**
- `websites: Website[]`
- `editingId: number | null`
- `creating: boolean`

**Website-Felder:** name, url, repoUrl, deployCmd, buildCmd, description, status

**Status-Werte:** `idle | building | deployed | error`

**Was rendert sie?**
- Liste aller Websites mit Status-Badge
- Inline Edit-Formular
- URL + Repo-Link-Buttons

**API Calls:**
```
GET    /api/websites         → beim Mount
POST   /api/websites         → Website erstellen
PATCH  /api/websites/:id     → Website bearbeiten
DELETE /api/websites/:id     → Website löschen
```

---

## Kanban Types (`src/components/kanban/types.ts`)

```typescript
interface Card {
  id: number;
  title: string;
  description: string | null;
  columnId: number;
  boardId: number;
  teamId: number | null;
  assignees: { user: User }[];
  dueDate: string | null;
  labels: string | null;       // JSON: CardLabel[]
  checklist: string | null;    // JSON: ChecklistItem[]
  archived: boolean;
  order: number;
  priority: string | null;     // "low" | "medium" | "high" | "urgent"
  coverColor: string | null;
  externalIssueId: string | null;
  externalIssueUrl: string | null;
  externalIssueType: string | null;
}

interface Column {
  id: number;
  title: string;
  order: number;
  cards: Card[];
}

interface Board {
  id: number;
  name: string;
  teamId: number | null;
  team: TeamOption | null;
  columns: Column[];
}

interface CardLabel {
  text: string;
  color: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}
```

---

## Neue Komponente eintragen

Wenn eine neue Komponente erstellt wird:

1. **Übersichts-Tabelle** oben ergänzen
2. **Detailblock** am richtigen Modul-Ort einfügen:
   - Props (vollständig typisiert)
   - State (was wird lokal gehalten)
   - Was rendert sie?
   - API Calls
3. **Feature-Plan** in `docs/planung/features/` aktualisieren

---

*Erstellt: 2026-05-15*  
*Zuletzt aktualisiert: 2026-07-22*
