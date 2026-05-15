# Feature: [Name]

> **Modul:** `src/components/[ordner]/`  
> **Status:** 📋 Geplant  
> **Version:** —  
> **Datum:** JJJJ-MM-TT  

---

## Was macht dieses Feature?

Kurze Beschreibung in 1–3 Sätzen.

## Warum brauchen wir es?

> Als **[Benutzer/Admin/Oga]** möchte ich **[Funktion]**,  
> damit ich **[Nutzen/Ziel]**.

---

## Komponenten

### Neue Komponenten

| Komponente | Datei | Beschreibung |
|-----------|-------|-------------|
| `FeatureName` | `src/components/x/FeatureName.tsx` | Hauptkomponente |

#### `FeatureName.tsx`

```typescript
// Props
interface Props {
  prop1: string;
  prop2?: number;
  onAction: (id: number) => void;
}

// State (intern)
// - items: Item[]        — geladene Daten
// - loading: boolean     — Ladezustand
// - selected: number | null  — aktive Auswahl

// Was rendered sie?
// - Liste von Items
// - Formular zum Erstellen
// - Action-Buttons

// API Calls
// - GET /api/x           → beim Mount
// - POST /api/x          → beim Erstellen
```

### Geänderte Komponenten

| Komponente | Datei | Was ändert sich |
|-----------|-------|----------------|
| `ExistingComponent` | `src/components/x/Existing.tsx` | Prop Y hinzufügen |

---

## API Endpoints

| Method | Route | Request Body | Response | Auth |
|--------|-------|-------------|----------|------|
| `GET` | `/api/x` | — | `Item[]` | User |
| `POST` | `/api/x` | `{ name: string }` | `Item` | User |
| `PATCH` | `/api/x/[id]` | `Partial<Item>` | `Item` | User |
| `DELETE` | `/api/x/[id]` | — | `{ ok: true }` | Admin |

---

## Datenmodell

```prisma
// Neues Modell (wenn nötig)
model NewModel {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Änderungen an bestehenden Modellen
// User: + newField String?
```

---

## UI/UX

```
┌────────────────────────────────────────┐
│ Feature Title                    [Btn] │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Item 1                    [Edit] │  │
│  │ Item 2                    [Edit] │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [+ Neu erstellen]                     │
└────────────────────────────────────────┘
```

**Interaktionen:**
- Klick auf Item → öffnet Detail
- [+ Neu] → Inline-Formular erscheint
- [Edit] → Inline-Bearbeitung

---

## Implementierungs-Reihenfolge

1. **DB Schema** — Prisma Model + `npx prisma db push`
2. **API Routes** — GET + POST + PATCH + DELETE
3. **TypeScript Types** — Interface / Type in Komponente
4. **Komponente bauen** — Daten laden, anzeigen
5. **Interaktionen** — Create, Edit, Delete
6. **Tests** — Build prüfen, manuell testen
7. **Plan updaten** — Status auf ✅, Version eintragen

---

## Abhängigkeiten

- [ ] Feature X muss vorher fertig sein
- [ ] Prisma Schema braucht Modell Y

---

## Offene Fragen

- [ ] Frage 1?
- [ ] Frage 2?

---

*Erstellt: JJJJ-MM-TT*  
*Implementiert: —*
