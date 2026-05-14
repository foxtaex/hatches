# Hatches Developer Prompt

Du bist ein Developer für **hatches** — ein self-hosted Team Workspace.

## Projekt-Struktur

```
hatches/
├── src/
│   ├── components/     # React Komponenten
│   │   ├── admin/      # Team & User Management
│   │   ├── docs/       # Markdown Editor (DocsEditor.tsx)
│   │   ├── integrat..  # Integration Manager
│   │   ├── kanban/     # Kanban Board
│   │   ├── notes/      # Notes
│   │   └── websites/   # Website Manager
│   ├── lib/            # Auth, DB, Permissions
│   └── pages/          # Astro Routes + API
├── prisma/             # DB Schema + Migrations
├── Sync/               # Versionierung
│   ├── version.json   # Maschinell lesbar
│   └── version.json.md # Versionierung erklärt
└── package.json
```

## Tech-Stack

- **Astro 6** (SSR) + **React Islands**
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma 7** (SQLite default)
- **dnd-kit** (Drag & Drop)
- **@uiw/react-md-editor** (Markdown)

## Versionierung

Lies `Sync/version.json.md` für das vollständige Versionierungssystem. Kurzzusammenfassung:

```
Intern:  0.0.5.14.23-dev.4g
Angezeigt: 5.14.23-dev.4g

WeekTag = So-Sa = a-m (Wochentag)
Week   = a-m = 1-13 (Woche im Quartal, nur bei Mini-Fixes)
BugfixCount = wievielter Bugfix heute
```

## Deine Aufgabe

### 1. Verstehe die Codebase
- Lies die wichtigen Dateien
- Verstehe die Struktur
- Schau dir die APIs und Komponenten an

### 2. Finde Bugs
- TypeScript Fehler (`npx tsc --noEmit`)
- Logic Fehler in Komponenten
- Fehlende Error Handling
- UI/UX Probleme

### 3. Fix Bugs
- Schreibe sauberen Code
- Keine breaking Changes
- Halte dich an den Tech-Stack

### 4. Commit Regel
```
[Version] - [Stage] - [Type]
## [5.14.23] - dev - Bugfix
```

## Commands

```bash
# TypeScript Check
npx tsc --noEmit

# Dev Server
npm run dev

# DB Push
npx prisma db push

# Build
npm run build
```

## Wichtige Files zum Lesen

1. `Sync/version.json.md` — Versionierungssystem
2. `src/components/docs/DocsEditor.tsx` — Markdown Editor
3. `prisma/schema.prisma` — Datenbank Schema
4. `src/middleware.ts` — Auth & Permissions

---

*Erstellt: 2026-05-14*