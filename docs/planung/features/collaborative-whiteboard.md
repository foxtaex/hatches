# Feature-Plan: Excalidraw-ähnliches Whiteboard

> **Status:** 📋 Geplant  
> **Zielversion:** noch festzulegen  
> **Ursprünglicher Planstand:** 0.5.24.17  
> **Ersetzt:** ehemaliges Notes-Modul

---

## 1. Vision

Hatches erhält ein integriertes Whiteboard mit einer Bedienung und einem Funktionsumfang ähnlich Excalidraw.

Benutzer können mehrere benannte Whiteboards privat oder im Team anlegen, frei zeichnen sowie Sticky Notes, Formen, Pfeile und Texte platzieren. Die Inhalte werden als JSON in der Datenbank gespeichert.

Die erste Ausbaustufe bietet persistente, im Team sichtbare Boards. Gleichzeitige Bearbeitung durch mehrere Benutzer in Echtzeit ist eine spätere Ausbaustufe.

---

## 2. Technische Grundlage: Excalidraw

**Library:** `@excalidraw/excalidraw`

Warum:
- OSS, MIT licensed
- React component, zero config
- Infinite canvas, hand-drawn feel
- Built-in: sticky notes, shapes, arrows, text, freehand draw, eraser
- Export PNG/SVG
- Dark theme support
- liefert genau die gewünschte Excalidraw-ähnliche Zeichenoberfläche

Geprüfte Alternativen: Fabric.js, Konva.js und tldraw. Sie erfordern für den vorgesehenen Funktionsumfang mehr eigene UI- und Werkzeuglogik, während Excalidraw bereits eine vollständige Zeichenoberfläche bereitstellt.

---

## 3. DB Model

```prisma
model Whiteboard {
  id        String   @id @default(cuid())
  title     String
  data      String   @default("[]") // JSON: ExcalidrawElement[]
  appState  String   @default("{}") // JSON: partial AppState (viewport etc.)
  teamId    String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
  team      Team?    @relation(fields: [teamId], references: [id])
}
```

---

## 4. API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/whiteboards` | List (filtered by team) |
| POST   | `/api/whiteboards` | Create |
| GET    | `/api/whiteboards/[id]` | Get single |
| PATCH  | `/api/whiteboards/[id]` | Update title/data |
| DELETE | `/api/whiteboards/[id]` | Delete |

Auto-save: PATCH called debounced (1s) on every Excalidraw `onChange`.

---

## 5. Component: WhiteboardView

```
WhiteboardView
├── Left sidebar (200px)
│   ├── "+ Neu" button
│   ├── Team filter
│   └── List of whiteboards (card per board)
│       ├── Title (click to open)
│       └── Delete / Rename actions
└── Main area
    ├── Header bar
    │   ├── Whiteboard title (inline edit)
    │   ├── Team badge
    │   ├── Last saved indicator
    │   └── Export PNG button
    └── Excalidraw canvas (fills remaining space)
```

---

## 6. UX Behaviour

- On load: show first whiteboard or empty state "Neues Whiteboard erstellen"
- Auto-save: debounced 1000ms after any change
- Save indicator: "Gespeichert" / "Speichert..."
- Title rename: click title → inline input
- Dark theme: matches app theme (Excalidraw has `theme="dark"`)
- Team scope: "Privat" (no teamId) or select from user's teams

### Spätere Ausbaustufe: Echtzeit-Kollaboration

- Mehrere Benutzer bearbeiten dasselbe Whiteboard gleichzeitig
- Sichtbare Cursor und Teilnehmer
- Konfliktfreie Synchronisierung der Zeichenobjekte
- Anwesenheits- und Verbindungsstatus

---

## 7. Nav Change

`Layout.astro` navigation:
- Add: `{ href: "/whiteboard", label: "Whiteboard" }`

New page: `src/pages/whiteboard.astro`

> Das eigenständige Notes-Modul wurde bereits in Version `0.5.25.17.22-dev.1d` entfernt.

---

## 8. Implementierungs-Reihenfolge

1. ✅ Feature-Plan (dieses Dokument)
2. ⬜ `@excalidraw/excalidraw` installieren
3. ⬜ Prisma-Schema, Migration und `prisma generate`
4. ⬜ API: `/api/whiteboards/index.ts` und `/api/whiteboards/[id].ts`
5. ⬜ Komponente: `src/components/whiteboard/WhiteboardView.tsx`
6. ⬜ Seite: `src/pages/whiteboard.astro`
7. ⬜ Navigation in `Layout.astro` ergänzen
8. ⬜ AdminPanel: Whiteboard-Tab zur Verwaltung aller Boards
9. ⬜ Tests und Build
10. ⬜ Status und Version aktualisieren

---

## 9. ASCII Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ ← Board  Planner  Docs  Whiteboard  Einstellungen            │
├───────────────┼──────────────────────────────────────────────┐
│  Whiteboards  │  Sprint Planning Q2          Gespeichert ✓   │
│  ───────────── │  ──────────────────────────────────────────  │
│  + Neu        │                                              │
│               │                                              │
│  🗂 Team      │        [Excalidraw Canvas]                   │
│               │                                              │
│  ● Sprint Q2  │   Sticky notes, shapes, arrows, freehand    │
│  ○ Brainstorm │                                              │
│  ○ Wireframes │                                              │
│               │                                              │
│  🔒 Privat   │                                              │
│  ○ Ideen      │                                              │
└───────────────┴──────────────────────────────────────────────┘
```
