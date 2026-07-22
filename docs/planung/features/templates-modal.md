# Feature: Templates als Modal

> **Modul:** `src/components/templates/`  
> **Status:** 🔨 In Arbeit  
> **Version:** 0.5.24.14.15-dev  
> **Datum:** 2026-05-15

---

## Was macht dieses Feature?

Templates werden nicht mehr als eigenständige Seite angezeigt, sondern als kontextsensitives Modal — direkt aus Docs und Board heraus aufrufbar. Templates haben einen neuen `type`-Filter (`"doc" | "board" | "general"`), der bestimmt, in welchem Kontext sie erscheinen.

## Warum brauchen wir es?

> Als **Benutzer** möchte ich **Templates direkt aus dem Board oder Docs-Editor aufrufen**,  
> damit ich **ohne Seitenwechsel ein Template anwenden kann**.

---

## Komponenten

### Neue Komponenten

| Komponente | Datei | Beschreibung |
|-----------|-------|-------------|
| `TemplateModal` | `src/components/templates/TemplateModal.tsx` | Modal-Wrapper um TemplateLibrary |

#### `TemplateModal.tsx`

```typescript
// Props
interface Props {
  context: "docs" | "board";   // Filtert Templates nach Typ
  onClose: () => void;
  onApply: (result: ApplyResult) => void;  // Erhält apply-API Antwort
}

interface ApplyResult {
  ok: boolean;
  created: { boards: number[]; docs: number[] };
  redirect: string | null;
}

// State (intern)
// - selectedTemplate: Template | null  — für Confirm-Dialog
// - applyTeamId: string               — Team-Auswahl beim Anwenden
// - applying: boolean                 — Lade-Zustand

// Was rendert sie?
// - Glassmorphism-Modal-Overlay (fixed, zIndex 9999)
// - Inline TemplateLibrary (mode="browse", context=context)
// - Confirm-Dialog wenn Template ausgewählt: Team-Auswahl + Anwenden

// API Calls
// - POST /api/templates/:id/apply  → beim Anwenden
```

### Geänderte Komponenten

| Komponente | Datei | Was ändert sich |
|-----------|-------|----------------|
| `TemplateLibrary` | `src/components/templates/TemplateLibrary.tsx` | Props: `mode`, `context`, `type` im Formular |
| `DocsEditor` | `src/components/docs/DocsEditor.tsx` | Templates-Button + TemplateModal State |
| `KanbanBoard` | `src/components/kanban/KanbanBoard.tsx` | Templates-Button + TemplateModal State |
| `AdminPanel` | `src/components/admin/AdminPanel.tsx` | Tab "templates" (manage mode) |
| `Layout.astro` | `src/layouts/Layout.astro` | Templates aus Nav entfernen |

---

## API Endpoints

| Method | Route | Änderung |
|--------|-------|---------|
| `GET` | `/api/templates?type=doc` | Neu: `type` als Filter |
| `POST` | `/api/templates` | Neu: `type` Feld |
| `PATCH` | `/api/templates/:id` | Neu: `type` Feld |
| `POST` | `/api/templates/:id/apply` | Unverändert |

---

## Datenmodell

```prisma
// Änderung an Template-Modell:
model Template {
  // Neu hinzugefügt:
  type        String   @default("general") // "doc" | "board" | "general"
}
```

---

## UI/UX

```
DocsEditor Header:
┌─────────────────────────────────────────────────┐
│ Doc Title         [Preview] [Edit] [📋 Templates]│
└─────────────────────────────────────────────────┘

Templates Modal (über allem):
┌─────────────────────────────────────────────────────────┐
│ 📋 Templates                                        [×] │
├─────────────────────────────────────────────────────────┤
│ [Alle] [Software] [Projekt] [Marketing] [HR] [Allgemein]│
│ 🔍 Template suchen...                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 📋           │  │ 🚀           │  │ 💼           │  │
│  │ Sprint Plan  │  │ Onboarding   │  │ Bug Report   │  │
│  │ Software     │  │ HR           │  │ Software     │  │
│  │ [Anwenden]   │  │ [Anwenden]   │  │ [Anwenden]   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

Confirm-Dialog (nach Klick auf "Anwenden"):
┌──────────────────────────────────┐
│ Template anwenden                │
│                                  │
│ "Sprint Planning Template"       │
│                                  │
│ Team: [Kein Team ▼]              │
│                                  │
│ [Abbrechen]  [✓ Anwenden]        │
└──────────────────────────────────┘
```

**Template-Typen:**
- `"doc"` — erscheint in Docs-Context (Markdown-Inhalte)
- `"board"` — erscheint in Board-Context (Columns + Cards)
- `"general"` — erscheint in beiden Contexts

**Interaktionen:**
- Klick auf Template-Karte → Confirm-Dialog
- [Anwenden] → POST /apply → auf erstellten Inhalt navigieren
- [×] → Modal schließen
- Esc → Modal schließen

---

## Implementierungs-Reihenfolge

1. **DB Schema** — `type` Feld zu Template hinzufügen + `npx prisma db push`
2. **API** — GET: `type` Filter; POST/PATCH: `type` Feld
3. **TemplateLibrary** — `mode` + `context` Props; `type` im Formular
4. **TemplateModal** — neue Komponente
5. **DocsEditor** — Templates-Button + Modal einbinden
6. **KanbanBoard** — Templates-Button + Modal einbinden
7. **AdminPanel** — "templates" Tab hinzufügen (TemplateLibrary manage mode)
8. **Layout.astro** — Templates aus Nav entfernen
9. **Komponenten-Registry** updaten

---

## Abhängigkeiten

- [x] TemplateLibrary existiert bereits
- [x] Apply-API existiert bereits
- [ ] AdminPanel braucht templates-Tab

---

*Erstellt: 2026-05-15*  
*Implementiert: 2026-05-15*
