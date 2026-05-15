# Hatches — Konventionen & Namensgebung

> **Gilt für alles.** Neue Datei, neue Komponente, neuer API-Endpoint — diese Regeln gelten immer.

---

## 1. Dateien & Ordner

### Allgemein

| Was | Konvention | Beispiel |
|-----|-----------|---------|
| React-Komponente | `PascalCase.tsx` | `CardDetailModal.tsx` |
| Astro-Seite | `kebab-case.astro` | `admin.astro`, `board.astro` |
| API-Route (Astro) | `kebab-case.ts` | `app-info.ts`, `[id].ts` |
| Utility / Hook | `camelCase.ts` | `useTranslation.ts`, `formatDate.ts` |
| Typ-Datei | `types.ts` | `kanban/types.ts` |
| Konstanten | `constants.ts` | `src/lib/constants.ts` |
| Styles | `kebab-case.css` | `global.css` |

### Ordner-Namensgebung

```
src/
├── components/         ← PascalCase-Unterordner pro Modul
│   ├── admin/
│   ├── ai/
│   ├── brand/
│   ├── docs/
│   ├── integrations/
│   ├── kanban/
│   ├── notes/
│   ├── planner/
│   ├── setup/
│   ├── templates/
│   └── websites/
├── lib/                ← Utilities, Helpers, Clients
│   ├── auth.ts         — Auth-Logik (Session, Middleware)
│   ├── db.ts           — Prisma Client
│   ├── permissions.ts  — Permission-Checks
│   └── i18n/           — Übersetzungen
│       ├── de.ts
│       ├── en.ts
│       └── index.ts
└── pages/
    ├── api/            ← REST API Routes (kebab-case)
    │   ├── admin/
    │   ├── ai/
    │   ├── auth/
    │   ├── board/
    │   ├── docs/
    │   ├── events/
    │   ├── integrations/
    │   ├── notes/
    │   ├── search.ts
    │   ├── setup/
    │   ├── templates/
    │   ├── user/
    │   └── websites/
    └── *.astro         ← Seiten (kebab-case)
```

---

## 2. TypeScript Konventionen

### Typen & Interfaces

```typescript
// Interfaces für Objekte mit Identität (DB-Records, Props)
interface User { id: number; username: string; ... }
interface Props { onClose: () => void; ... }

// Type-Alias für Unions / primitive Aliases
type Language = "de" | "en";
type TabKey = "roles" | "teams" | "users";
type ViewMode = "month" | "week" | "agenda";

// Enums NICHT verwenden — Type-Alias stattdessen
// ❌ enum Status { Active, Inactive }
// ✅ type Status = "active" | "inactive"
```

### Variablen & Konstanten

```typescript
// Konstanten: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DEFAULT_COLOR = "#6b7280";
const PRIORITY_CONFIG = { low: {...}, medium: {...}, high: {...} };

// Reaktive State: camelCase, klare Namen
const [isLoading, setIsLoading] = useState(false);     // ✅
const [loading, setLoading] = useState(false);          // ✅ (kurze Alternative)
const [l, setL] = useState(false);                      // ❌ (zu kurz)

// Boolean-Variablen: is/has/can/show prefix
const [isEditing, setIsEditing] = useState(false);
const [hasError, setHasError] = useState(false);
const [showModal, setShowModal] = useState(false);
const [canDelete, setCanDelete] = useState(false);

// Arrays: Plural
const [users, setUsers] = useState<User[]>([]);
const [templates, setTemplates] = useState<Template[]>([]);

// Einzelnes Objekt: Singular
const [activeUser, setActiveUser] = useState<User | null>(null);
const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
```

### Funktionen

```typescript
// Event-Handler: handle + Verb + Noun
function handleCreateTemplate() { ... }
function handleDeleteCard(id: number) { ... }
function handleSubmitForm(e: FormEvent) { ... }

// Async-Funktionen: beschreibendes Verb
async function loadTemplates() { ... }
async function saveUserSettings() { ... }
async function deleteBoard(id: number) { ... }

// Boolean-Rückgabe: is/has/can prefix
function isValidEmail(email: string): boolean { ... }
function hasPermission(user: User, action: string): boolean { ... }
```

### Props-Interface

```typescript
// Immer "Props" nennen (nicht "TemplateModalProps" etc.)
interface Props {
  // Pflicht zuerst
  template: Template;
  onClose: () => void;
  // Optional danach
  context?: "docs" | "board";
  className?: string;
}
```

---

## 3. API-Konventionen

### Route-Struktur

```
GET    /api/[resource]           → Alle Items (mit optionalen Query-Params)
POST   /api/[resource]           → Erstellen
GET    /api/[resource]/[id]      → Einzelnes Item
PATCH  /api/[resource]/[id]      → Teilweises Update
DELETE /api/[resource]/[id]      → Löschen
POST   /api/[resource]/[id]/[action]  → Aktion (z.B. /apply, /sync, /archive)
```

### Request-Format

```typescript
// POST / PATCH: JSON Body
{ "name": "My Board", "teamId": 3, "type": "board" }

// GET: Query Parameter
/api/templates?category=software&type=doc&q=sprint

// DELETE: Keine Body (ID in URL)
DELETE /api/templates/42
```

### Response-Format

```typescript
// Erfolg (200 / 201):
{ data } // direkt das Objekt oder Array

// Erstellt (201):
{ id: number, ...fields }

// Aktion (200):
{ ok: true, ...meta }

// Fehler (4xx / 5xx):
{ error: "Klare Fehlermeldung auf Deutsch oder Englisch" }

// Validierungsfehler (400):
{ error: "Name erforderlich" }

// Auth-Fehler (401):
{ error: "Nicht angemeldet" }

// Berechtigung (403):
{ error: "Keine Berechtigung" }

// Nicht gefunden (404):
{ error: "Nicht gefunden" }
```

### Auth-Check (Pflicht in jeder Route)

```typescript
export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  // ...
};
```

---

## 4. Komponenten-Konventionen

### Struktur einer Komponente

```typescript
// 1. Imports
import { useState, useEffect } from "react";
// External libraries...
// Internal components...
// Types...
// Utils...

// 2. Typen (Interfaces + Type-Aliases)
interface Template { ... }
type Mode = "browse" | "manage";

// 3. Konstanten (wenn komponentenspezifisch)
const CATEGORIES = [...];

// 4. Sub-Komponenten (kleine, nicht exportierte Helper)
function CategoryChip({ ... }: ...) { ... }

// 5. Hauptkomponente (exportiert)
export function TemplateLibrary({ ... }: Props) {
  // State
  // Effects
  // Handler
  // Render
}
```

### Export-Regeln

```typescript
// Named Export für alles (kein default export)
export function KanbanBoard() { ... }        // ✅
export default function KanbanBoard() { ... } // ❌

// Re-Export aus index.ts (wenn Modul viele Komponenten hat)
// src/components/kanban/index.ts:
// export { KanbanBoard } from "./KanbanBoard";
```

### Props-Regeln

```typescript
// Niemals any in Props
interface Props {
  onDelete: (id: number) => void;  // ✅
  onDelete: (id: any) => void;     // ❌
}

// Optionale Props mit ? markieren
interface Props {
  title: string;       // Pflicht
  subtitle?: string;   // Optional
}

// Callbacks immer on + Verb + Noun
interface Props {
  onClose: () => void;       // ✅
  close: () => void;         // ❌
  handleClose: () => void;   // ❌
}
```

---

## 5. Datenbank / Prisma

### Model-Namensgebung

```prisma
// PascalCase, Singular
model WorkspaceConfig { ... }  // ✅
model workspace_config { ... } // ❌
model Workspaceconfigs { ... } // ❌

// Felder: camelCase
model Template {
  id          Int      @id @default(autoincrement())
  name        String
  isPublic    Boolean  @default(true)   // camelCase ✅
  is_public   Boolean  @default(true)   // snake_case ❌
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### String-Enums in DB

```prisma
// Strings, keine DB-Enums (wegen SQLite-Kompatibilität)
type        String  @default("general")  // "doc"|"board"|"general"
status      String  @default("idle")     // "idle"|"building"|"deployed"|"error"
priority    String?                      // "low"|"medium"|"high"|"urgent"
```

### JSON-Felder in DB

```prisma
// Für Arrays/Objects die SQLite nicht nativ unterstützt
labels    String  @default("[]")   // JSON: CardLabel[]
checklist String  @default("[]")   // JSON: ChecklistItem[]
content   String  @default("{}")   // JSON: TemplateContent
```

---

## 6. Styling-Konventionen

### Tailwind Klassen

```tsx
// Reihenfolge: Layout → Spacing → Sizing → Appearance → Interactivity
<div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors">

// Für komplexe dynamische Styles: style-Attribut (kein cn() / clsx nötig)
<div style={{ background: team.color, opacity: isActive ? 1 : 0.5 }}>

// Transparenz: rgba() direkt (konsistent mit Rest des Designs)
"bg-[rgba(255,255,255,0.05)]"   // ✅
"bg-white/5"                     // ✅ (gleich)
```

### Design-Tokens (CSS Variables)

```css
:root {
  --mint: #3CC79A;
  --mint-dim: rgba(60,199,154,0.12);
  --surface: rgba(18,18,18,0.7);
  --border: rgba(255,255,255,0.08);
  --text-primary: rgba(255,255,255,0.95);
  --text-secondary: rgba(255,255,255,0.6);
  --text-muted: rgba(255,255,255,0.3);
}
```

### Farb-Palette

| Verwendung | Wert |
|-----------|------|
| Accent / Primary | `#3CC79A` (Mint) |
| Hintergrund | `#000` / `rgba(18,18,18,0.7)` |
| Surface | `rgba(255,255,255,0.03–0.08)` |
| Border | `rgba(255,255,255,0.08)` |
| Text Primary | `rgba(255,255,255,0.95)` |
| Text Secondary | `rgba(255,255,255,0.6)` |
| Text Muted | `rgba(255,255,255,0.3)` |
| Danger | `#ef4444` |
| Warning | `#f97316` |
| Success | `#22c55e` |

---

## 7. Git & Commits

### Commit-Format

```
[Version] - [Stage] - [Type]

## [x.y.z] - dev - Feature / Bugfix / Refactor / Docs
### [Type]
- Add: Neue Funktion xyz
- Fix: Bug in KanbanBoard.tsx
- Change: AdminPanel Tabs umbenannt
- Remove: /templates Seite entfernt
```

### Branch-Naming

```
main           — Production-ready
dev            — Development
feature/[name] — Neues Feature (z.B. feature/templates-modal)
fix/[name]     — Bugfix (z.B. fix/kanban-drag-drop)
refactor/[name]— Refactoring
```

---

## 8. i18n (Internationalisierung)

### Sprachschlüssel-Konvention

```typescript
// Format: [modul].[bereich].[schlüssel]
"common.save"           → "Speichern" / "Save"
"common.cancel"         → "Abbrechen" / "Cancel"
"common.delete"         → "Löschen" / "Delete"
"board.addCard"         → "Karte hinzufügen" / "Add card"
"templates.noResults"   → "Keine Templates gefunden" / "No templates found"
"admin.roles.title"     → "Rollen" / "Roles"
```

### Verwendung

```typescript
const { t } = useTranslation();
// ...
<button>{t("common.save")}</button>
<h1>{t("board.title")}</h1>
```

---

## 9. Dokumentation

### Feature-Plan Pflicht

Jedes neue Feature bekommt einen Plan in `docs/planung/features/[name].md`.  
Template: `docs/planung/template.md`

### Komponenten-Registry

Neue Komponente → sofort in `docs/planung/komponenten.md` eintragen.

### Status-Tracking

Nach Implementierung Status im Feature-Plan updaten:
- `📋 Geplant` → `🔨 In Arbeit` → `✅ Implementiert`

---

*Erstellt: 2026-05-15*  
*Zuletzt aktualisiert: 2026-05-15*
