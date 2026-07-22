# Feature: Karten mit Docs verknüpfen

> **Modul:** `src/components/kanban/`
> **Status:** ✅ Implementiert
> **Version:** 0.5.26.18.22-dev.1d
> **Datum:** 2026-07-22

## Was macht dieses Feature?

Eine Kanban-Karte kann genau ein Markdown-Dokument live verknüpfen. Das Doc wird wahlweise als Kartenbeschreibung gerendert oder als separater Anhang mit Link zu Docs angezeigt.

## Warum brauchen wir es?

> Als Benutzer möchte ich umfangreiche Inhalte nicht doppelt in Karte und Docs pflegen, damit Änderungen am zentralen Markdown-Dokument automatisch an der Karte sichtbar sind.

## Komponenten

| Komponente | Änderung |
|---|---|
| `CardDetailModal` | Doc-Auswahl, Modus-Auswahl, verknüpfte Beschreibung bzw. Anhang |
| `Card` | `linkedDocId`, `linkedDocMode`, eingebettete Doc-Metadaten |

## API

| Methode | Route | Änderung |
|---|---|---|
| `GET` | `/api/docs` | Sichtbare Docs für den Picker verwenden |
| `PATCH` | `/api/board/cards` | `linkedDocId` und `linkedDocMode` speichern und Zugriff prüfen |
| `GET` | `/api/board/:id` | Verknüpftes Doc zusammen mit Karten laden |

## Datenmodell

```prisma
model Card {
  linkedDocId   Int?
  linkedDocMode String? // "description" | "attachment"
  linkedDoc     Doc?    @relation(fields: [linkedDocId], references: [id], onDelete: SetNull)
}
```

## UI/UX

```text
Karten-Modal
├── Beschreibung
│   └── Doc-Inhalt, wenn Modus "Beschreibung"
└── Eigenschaften
    └── Dokument
        ├── Doc auswählen
        ├── Als Beschreibung | Als Anhang
        └── Verknüpfung entfernen
```

## Datensicherheit

- Es wird nur eine Referenz gespeichert; Doc-Inhalte werden nicht kopiert.
- Benutzer können nur Docs verknüpfen, die sie über `/api/docs` sehen dürfen.
- Wird ein Doc gelöscht, setzt die Datenbank die Kartenreferenz auf `null`.

## Implementierungs-Reihenfolge

1. Prisma-Schema und Migration
2. Board-/Card-API
3. TypeScript-Typen
4. Picker und Darstellung im Karten-Modal
5. Build und TypeScript prüfen

*Implementiert: 2026-07-22*
