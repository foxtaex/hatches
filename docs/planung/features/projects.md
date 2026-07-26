# Feature: Projekte

> **Status:** ✅ Implementiert
> **Version:** v6.0.00-dev
> **Datum:** 2026-07-22

## Ziel

Projekte bilden eine gemeinsame Klammer um bereits vorhandene Boards und Docs. Die Inhalte werden nur verknüpft, nicht kopiert. So kann ein Projekt beispielsweise das Doc „Anforderungen“ und das Board „Bugs“ enthalten.

## Verhalten

- Projekte sind privat oder einem Team zugeordnet.
- Projekte können optional ein Fälligkeitsdatum erhalten und erscheinen dann im Planner.
- Ein Board oder Doc kann höchstens einem Projekt zugeordnet sein.
- Inhalte können direkt im Projekt oder in einem Unterordner liegen.
- Es gibt bewusst nur eine Unterordner-Ebene.
- Entfernen einer Verknüpfung löscht das Board oder Doc nicht.
- Löschen eines Projekts erhält alle verknüpften Inhalte.
- Das generische `ProjectItem.type`-Feld ist für spätere Whiteboards vorbereitet.

## Datenmodell

- `Project` — Name, Beschreibung, optionales Fälligkeitsdatum, Team/Owner
- `ProjectFolder` — Unterordner mit Position, direkt einem Projekt zugeordnet
- `ProjectItem` — Verknüpfung zu Board oder Doc, optional einem Unterordner zugeordnet

## UI und API

- Seite: `/projects`
- `/projects` ist die Hatches-Startseite; `/` und der Logo-Klick führen dorthin.
- Es gibt bewusst keinen separaten Projekte-Eintrag in der Hauptnavigation.
- Komponente: `src/components/projects/ProjectWorkspace.tsx`
- APIs: `/api/projects`, `/api/projects/[id]`, `/api/projects/deadlines`, `/api/projects/folders`, `/api/projects/items`, `/api/projects/options`

## Sicherheit

Projekt- und Inhaltszugriffe werden serverseitig nach Owner, Team-Mitgliedschaft oder Admin-Recht gefiltert. Die globale Suche verwendet dieselben Sichtbarkeitsgrenzen.
