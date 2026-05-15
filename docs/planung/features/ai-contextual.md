# Feature: KI — Kontextueller Assistent

> **Modul:** `src/components/ai/`  
> **Status:** 🔨 In Arbeit  
> **Version:** 0.5.24.15.15-dev  
> **Datum:** 2026-05-15

---

## Was macht dieses Feature?

Die KI ist kein eigenständiger Tab mehr, sondern lebt **in jedem Modul**. Ein kleiner KI-Button öffnet ein kontextbewusstes Panel direkt in Board, Docs und Notizen. Die KI kennt den aktuellen Inhalt und kann direkt handeln — Text einfügen, Board-Strukturen vorschlagen, Karten generieren.

## Warum brauchen wir es?

> Als **Benutzer** möchte ich **die KI direkt dort nutzen wo ich arbeite**,  
> damit ich **den Kontext nicht wechseln muss und sofort Ergebnisse in mein Dokument/Board einfließen lassen kann**.

---

## Architektur

```
┌─────────────────────────────────────────────────┐
│  DocsEditor / KanbanBoard / NotesView           │
│                                                 │
│  Normaler Content              [✨ KI]          │
│                                    ↓            │
│                        ┌───────────────────┐   │
│                        │  AiAssistant      │   │
│                        │  (Slide-in Panel) │   │
│                        │                   │   │
│                        │  [Quick Actions]  │   │
│                        │  ──────────────── │   │
│                        │  Chat-Verlauf     │   │
│                        │  ──────────────── │   │
│                        │  [Eingabe]  [↑]   │   │
│                        └───────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Komponenten

### Neue Komponenten

| Komponente | Datei | Beschreibung |
|-----------|-------|-------------|
| `AiAssistant` | `src/components/ai/AiAssistant.tsx` | Kontext-Panel (ersetzt AiChat als einbettbare Version) |

#### `AiAssistant.tsx`

```typescript
type AiContext = "board" | "docs" | "notes";

interface AiContextData {
  title?: string;      // Aktuelles Dok/Board/Notiz
  content?: string;    // Aktueller Inhalt (auf 2000 Chars gekürzt)
}

interface AiAction {
  type: "insert-text";   // Text in Editor einfügen
  content: string;       // Markdown-Text
}

// (Future) Board-spezifische Action:
// type: "board-structure"
// columns: { title: string; cards: { title: string; description?: string }[] }[]

interface Props {
  context: AiContext;
  contextData?: AiContextData;
  onInsertText?: (text: string) => void;   // In Editor einfügen
  onClose: () => void;
}

// State (intern)
// - messages: Message[]  — Gesprächsverlauf
// - input: string        — Eingabe
// - loading: boolean     — Wartet auf Antwort

// Quick Actions (kontext-spezifisch):
// Board:  ["Sprint planen", "Karten generieren", "Aufgabe beschreiben"]
// Docs:   ["Abschnitt schreiben", "Zusammenfassen", "Verbessern", "Gliederung"]
// Notes:  ["Notiz strukturieren", "Zusammenfassen", "Aktionspunkte"]

// API Calls
// GET  /api/admin/ai      → Provider prüfen (beim Mount)
// POST /api/ai/chat       → Nachricht senden (mit context-System-Prompt)
```

### Geänderte Komponenten

| Komponente | Datei | Was ändert sich |
|-----------|-------|----------------|
| `DocsEditor` | `src/components/docs/DocsEditor.tsx` | KI-Button + AiAssistant einbinden |
| `NotesView` | `src/components/notes/NotesView.tsx` | KI-Button + AiAssistant einbinden |
| `KanbanBoard` | `src/components/kanban/KanbanBoard.tsx` | KI-Button + AiAssistant einbinden |
| `AdminPanel` | `src/components/admin/AdminPanel.tsx` | KI-Tab von Module → Admin Gruppe |
| `Layout.astro` | `src/layouts/Layout.astro` | KI aus Nav entfernen |

---

## API Endpoints

| Method | Route | Änderung |
|--------|-------|---------|
| `POST` | `/api/ai/chat` | Neu: `context` Feld → System-Prompt wird kontext-spezifisch |

### System-Prompts nach Kontext

```typescript
// Board
`Du bist ein KI-Assistent für Hatches, ein Team-Workspace.
Der Nutzer arbeitet am Kanban-Board "${title}".
Hilf bei: Sprint-Planung, Aufgaben-Breakdown, Projekt-Management.
Antworte auf Deutsch (oder der Sprache des Nutzers). Formatiere als Markdown.`

// Docs
`Du bist ein KI-Schreibassistent für Hatches.
Der Nutzer bearbeitet das Dokument "${title}".
${content ? `Aktueller Inhalt (Auszug):\n${content}` : ""}
Hilf bei: Schreiben, Verbessern, Zusammenfassen, Übersetzen.
Antworte in Markdown-Format.`

// Notes
`Du bist ein KI-Assistent für Notizen in Hatches.
Der Nutzer bearbeitet die Notiz "${title}".
${content ? `Aktueller Inhalt:\n${content}` : ""}
Hilf bei: Strukturieren, Zusammenfassen, Aktionspunkte extrahieren.
Antworte in Markdown-Format.`
```

---

## UI/UX

### KI-Button (in Header/Toolbar jedes Moduls)

```
┌─────────────────────────────────────────────────┐
│ Doc-Titel           [Templates] [↓] [✨ KI]     │
└─────────────────────────────────────────────────┘
```

### KI-Panel (slide-in von rechts)

```
┌──────────────────────────────┐
│ ✨ KI-Assistent          [×] │
│ Docs — "Projektplanung"      │
├──────────────────────────────┤
│ Quick Actions:               │
│ [Abschnitt schreiben]        │
│ [Zusammenfassen]             │
│ [Verbessern]  [Gliederung]   │
├──────────────────────────────┤
│                              │
│ 🤖 Wie kann ich helfen?      │
│                              │
│ 👤 Schreib eine Einleitung   │
│                              │
│ 🤖 # Einleitung              │
│    Dieses Projekt...         │
│    [In Editor einfügen ↗]    │
│                              │
├──────────────────────────────┤
│ [Prompt eingeben...] [↑]     │
└──────────────────────────────┘
```

---

## Implementierungs-Reihenfolge

1. **API** — `/api/ai/chat` erweitern um `context` + System-Prompt
2. **`AiAssistant.tsx`** — neue Komponente bauen
3. **`DocsEditor`** — KI-Button + Panel einbinden
4. **`NotesView`** — KI-Button + Panel einbinden
5. **`KanbanBoard`** — KI-Button + Panel einbinden
6. **`AdminPanel`** — KI-Tab von Module → Admin verschieben
7. **`Layout.astro`** — `/ai` aus Nav entfernen
8. **Komponenten-Registry** updaten

---

## Future: Board AI Actions

Wenn die KI im Board-Kontext eine Struktur zurückgibt:

```json
{
  "action": "board-structure",
  "columns": [
    { "title": "Backlog", "cards": [{ "title": "Feature X", "description": "..." }] },
    { "title": "In Progress", "cards": [] },
    { "title": "Done", "cards": [] }
  ]
}
```

→ "Board so erstellen?" Button erscheint → Klick → POST /api/board + /api/board/columns + /api/board/cards

---

## Abhängigkeiten

- [x] `/api/ai/chat` existiert bereits
- [x] `AiConfig` Prisma-Model existiert
- [ ] Board-Action-API (für strukturierte Board-Erstellung aus KI-Antwort) — Future

---

## Was wurde verworfen

- `AiChat.tsx` — eigenständiger Chat-Tab → ❌ wird durch `AiAssistant.tsx` ersetzt
- `/ai` Seite — eigenständige Seite → ❌ aus Nav entfernt, Seite bleibt als Redirect
- KI als "Module" in AdminPanel → verschoben zu "Admin" (Config, nicht Feature)

---

*Erstellt: 2026-05-15*  
*Implementiert: 2026-05-15*
