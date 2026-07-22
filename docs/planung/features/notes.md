# Notes — Quick Notes Specification

> **Component:** `src/components/notes/`
> **Status:** ❌ Entfernt in 0.5.25.17.22-dev.1d
> **Files:** NotesView.tsx, NoteEditor.tsx

---

## Overview

Dieses eigenständige Modul wurde entfernt, weil es funktional vollständig mit Docs überlappte. Bestehende Datenbankeinträge bleiben aus Gründen der Datensicherheit erhalten; ältere Template-Notizen werden beim Anwenden als Docs importiert.

**Ziel:** Schnell was reinschreiben, durchsuchen, finden.

---

## Components

```
notes/
├── NotesView.tsx      ← Sidebar + Note List
├── NoteEditor.tsx      ← Editor für einzelne Note
└── README.md          ← This file
```

---

## Features

### Note Management

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Note erstellen | ✅ | Quick create |
| Note bearbeiten | ✅ | Live edit |
| Note löschen | ✅ | Mit confirmation |
| Note suchen | ✅ | Full-text search |
| Note teilen | ❌ | (future) |

### Organization

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Tags | ✅ | #tag support |
| Sort by date | ✅ | Newest first |
| Sort by title | ❌ | (future) |
| Folders | ❌ | (future) |
| Pin/Favorite | ❌ | (future) |

### Editor

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Markdown | ✅ | Full MD support |
| Live Preview | ✅ | (uses MarkdownEditor) |
| Auto-save | ✅ | Debounced 600ms |
| Character count | ❌ | (future) |
| Word count | ❌ | (future) |

---

## Data Model

```typescript
interface Note {
  id: number;
  title: string;
  content: string;        // Markdown
  tags: string[];          // Extracted from #hashtags
  userId: number;         // Owner
  teamId: number | null;  // null = private
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints

```
GET    /api/notes              → Alle Notes (privat + team)
POST   /api/notes              → Note erstellen
GET    /api/notes/:id          → Note abrufen
PATCH  /api/notes/:id          → Note aktualisieren
DELETE /api/notes/:id          → Note löschen
```

---

## UI/UX

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Notes                                        [+ New Note]   │
├───────────────────┬─────────────────────────────────────────┤
│ Search: [________]│ Title: [________________________]      │
│                   │                                         │
│ ── Recent ────────│ Here is my note content...              │
│ 📝 Note 1    2h   │                                         │
│ 📝 Note 2    5h   │ ## Heading                              │
│ 📝 Note 3    1d   │ Some text with **bold** and _italic_.   │
│                   │                                         │
│ ── Tags ─────────-│ - Item 1                               │
│ #work       (3)  │ - Item 2                               │
│ #idea        (2) │                                         │
│ #todo        (1)│ #some-tag                              │
│                   │                                         │
└───────────────────┴─────────────────────────────────────────┘
```

### Sidebar

```
┌───────────────────┐
│ 📝 Notes          │
├───────────────────┤
│ 🔍 Search         │
│ [________________]│
│                   │
│ Recent            │
│ ├── Note 1   2h   │
│ ├── Note 2   5h   │
│ └── Note 3   1d   │
│                   │
│ Tags              │
│ ├── #work     (3) │
│ ├── #idea      (2)│
│ └── #todo      (1)│
│                   │
│ ── Team Notes ─── │
│ 👥 Team A         │
│ 👥 Team B         │
└───────────────────┘
```

---

## Integration

### Mit Docs
- Notes sind Mini-Docs (simplified)
- Notes können zu Docs konvertiert werden (future)

### Mit Kanban
- Notes mit Due Date → Planner Events

### Mit Teams
- Private Notes → Nur Owner
- Team Notes → Team Members

---

## Future Enhancements

### Phase 2
- [ ] Pin/Favorite Notes
- [ ] Folder Organization
- [ ] Sort Options (date, title, tags)

### Phase 3
- [ ] Note Templates
- [ ] Note Sharing
- [ ] Real-time Collaboration

### Phase 4
- [ ] Canvas View (Visual notes)
- [ ] Mind Map
- [ ] Sketch Mode

---

## Tech Stack

```
MarkdownEditor    → Rendering (from docs/)
marked            → Markdown parsing
fuse.js           → Fuzzy search
```

---

*Letztes Update: 2026-07-22 — Modul aus UI, Navigation, APIs, Suche und Berechtigungen entfernt*
