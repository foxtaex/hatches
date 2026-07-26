# Kanban — Kanban Board Specification

> **Component:** `src/components/kanban/`
> **Status:** ✅ Implementiert
> **Version:** v6.0.00-dev
> **Files:** KanbanBoard.tsx, KanbanColumn.tsx, CardItem.tsx, BoardItem.tsx, CardDetailModal.tsx, ArchivePanel.tsx

---

## Overview

Kanban Board mit Multi-Board Support, Drag & Drop, und Team-Scopes.

**Ziel:** Cards = Docs (Markdown Content), Columns = Status.

---

## Architecture

### Components

```
kanban/
├── KanbanBoard.tsx      ← Main Board View + Sidebar
├── KanbanColumn.tsx     ← Column (To Do, In Progress, Done)
├── CardItem.tsx         ← Card in Column
├── CardDetailModal.tsx  ← Card Bearbeitung (Block Editor)
├── BoardItem.tsx        ← Board in Sidebar (Liste)
├── ArchivePanel.tsx     ← Archivierte Cards
├── types.ts             ← TypeScript Interfaces
└── README.md            ← This file
```

### Data Flow

```
Board auswählen
    ↓
Board laden (Columns + Cards)
    ↓
Columns anzeigen
    ↓
Cards per Column (Drag & Drop)
    ↓
Card klick → CardDetailModal (Block Editor)
```

---

## Features

### Board Management

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Multi-Board | ✅ | Private + Team Boards |
| Board erstellen | ✅ | Mit Team-Auswahl |
| Board umbenennen | ✅ | Inline rename |
| Board löschen | ✅ | Mit confirmation |
| Board Farben | ✅ | Team-Farbe |
| Board filtern | ❌ | (future) |

### Column Management

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Column erstellen | ✅ | Button am Ende |
| Column umbenennen | ✅ | Inline |
| Column löschen | ✅ | Leer must be |
| Column sortieren | ❌ | (future) |
| Column limit | ❌ | WIP limit (future) |

### Card Management

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Card erstellen | ✅ | Quick add |
| Card bearbeiten | ✅ | CardDetailModal |
| Card löschen | ✅ | |
| Card archivieren | ✅ | Per Drag & Drop in die Archiv-Spalte |
| Card wiederherstellen | ✅ | Aus dem Archiv in eine normale Spalte ziehen |
| Card verschieben | ✅ | Drag & Drop |
| Assignees | ✅ | User zuweisen |
| Due Date | ✅ | Date picker |
| Labels/Tags | ✅ | Farbige Tags |
| Description | ✅ | Markdown |
| External Issue | ✅ | GitHub/GitLab Badge |

### Drag & Drop

- **dnd-kit** für Drag & Drop
- Cards zwischen Columns verschieben
- Cards in die Archiv-Spalte ziehen und aus ihr wiederherstellen
- Ursprungs-Board der Archivkarten per Dropdown auswählen
- Reihenfolge in Column ändern
- Visual feedback (ghost card)

---

## Card = Doc

**Konzept:** Jede Card ist ein Doc (Markdown Page)

```
Card:
├── title     → Doc title
├── content   → Doc content (Markdown)
├── columnId  → Status (To Do, In Progress, Done)
├── boardId   → Which board
├── teamId    → Team scope (null = private)
├── assignees → User[] (team members)
├── dueDate   → Date (für Planner integration)
├── labels    → String[] (tags)
├── archived  → Boolean
└── order     → Number (position in column)
```

---

## Integration

### Mit Docs (Markdown)
- Card klick → CardDetailModal
- Card Detail = Block Editor View
- Content = Markdown

### Mit Planner (Calendar)
- Due Date → Planner Event
- Card mit Datum = Event
- Overdue highlighting

### Mit Teams
- Private Cards → Nur Owner sieht
- Team Cards → Team Members sehen
- Admin → Alle Cards sehen

---

## API Endpoints

```
GET    /api/board              → Alle Boards (privat + teams)
POST   /api/board              → Board erstellen
GET    /api/board/:id          → Board mit Columns + Cards
PATCH  /api/board/:id          → Board umbenennen
DELETE /api/board/:id          → Board löschen

GET    /api/board/cards        → Alle Cards (oder filter by board/column)
POST   /api/board/cards        → Card erstellen
PATCH  /api/board/cards        → Card aktualisieren
DELETE /api/board/cards/:id    → Card löschen

POST   /api/board/move         → Card verschieben (column + order)
POST   /api/board/columns      → Column erstellen
PATCH  /api/board/columns/:id  → Column umbenennen
DELETE /api/board/columns/:id  → Column löschen

GET    /api/board/archive?boardId=:id → Archivierte Cards eines Ursprungs-Boards
POST   /api/board/archive             → Card archivieren
DELETE /api/board/archive             → Card in eine Zielspalte wiederherstellen oder endgültig löschen
```

---

## Future Enhancements

### Phase 2
- [ ] Card Templates
- [ ] Card Dependencies (blocking)
- [ ] Swimlanes (horizontal groups)
- [ ] Card History (changes)

### Phase 3
- [ ] Board Templates (Sprint Planning, Bug Tracker)
- [ ] Time Tracking
- [ ] Estimate + Actual
- [ ] Card Reviews

### Phase 4 (Notion-like)
- [ ] Database View (Table = Kanban + more)
- [ ] Multiple Views per Board
- [ ] Card Relations (Cross-Board)

---

## UI/UX

### Layout

```
┌────────────────────────────────────────────────────────────┐
│ [Board Name]  [+ Add Column]            [Archive] [Filter]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ To Do        │ │ In Progress  │ │ Done         │        │
│ │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │        │
│ │ │ Card 1   │ │ │ │ Card 3   │ │ │ │ Card 5   │ │        │
│ │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │        │
│ │ ┌──────────┐ │ │              │ │              │        │
│ │ │ Card 2   │ │ │ + Add Card   │ │              │        │
│ │ └──────────┘ │ │              │ │              │        │
│ │ + Add Card    │ │              │ │              │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Sidebar (DocsEditor Style)

```
┌─────────────────┐
│ 🏠 Hatches      │
├─────────────────┤
│ 📋 Boards       │
│   ├── Board 1   │
│   ├── Board 2   │ ← Active
│   └── + New     │
├─────────────────┤
│ 📁 Archive      │
└─────────────────┘
```

---

## Tech Stack

```
@dnd-kit/core      → Drag & Drop
@dnd-kit/sortable  → Sortable lists
@fortawesome       → Icons
Tailwind CSS v4   → Styling
```

---

*Letztes Update: 2026-05-14*
