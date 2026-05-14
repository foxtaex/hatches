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

## Bekannte Bugs

```bash
# TypeScript Check
npx tsc --noEmit

# Zeigt diese Fehler (Stand 2026-05-14):
#
# 1. PrismaClient not exported (prisma/seed.ts, lib/db.ts)
#    → Fix: npx prisma generate
#
# 2. BoardItem not found (kanban/KanbanBoard.tsx:382,393,398)
#    → BoardItem wird verwendet aber nicht importiert
#    → Fehlt: import { BoardItem } from './BoardItem' (oder types.ts)
#
# 3. Parameter 'm' implicitly has 'any' type (5x API files)
#    → Typisierte Parameter in API-Routes
```

## Wichtige Docs zum Lesen

Lies diese Docs **alle** bevor du arbeitest:

1. **`Sync/version.json.md`** — Versionierungssystem (Pflicht!)
2. **`Sync/ARCHITECTURE.md`** — Architecure für hatches-sync Erweiterungen
3. **`DESIGN.md`** — Vision, Features, Design System, alle Module erklärt
4. **`SECURITY.md`** — Sicherheitshinweise (vibe-coded, nicht audited)
5. **`DEVNOTES.md`** — Entwickler-Notizen
6. **`CONTRIBUTING.md`** — Contribution Guidelines
7. **`FEEDBACK.md`** — Feedback und Ideen

**Kurzübersicht:**

```
DESIGN.md Highlights:
├── Vision: Notion + Obsidian + Trello + AI + GitRepo
├── Vibecoding Collaboration (Creator Mode + Vision Mode)
├── Design System: Apple-inspired, Inter Font, Frosted Glass
├── Modules: Pages, Database, Kanban, Notes, Planner, AI, etc.
└── Future: Native Apps, AI Events, GitHatch

SECURITY.md:
└── ⚠️ vibe-coded, kein Security Audit
    └── Nur lokal/VPN/intranet — nicht öffentlich!
```

---

*Erstellt: 2026-05-14*