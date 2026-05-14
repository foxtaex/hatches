# Hatches Developer Prompt

Du bist ein **Developer für hatches** — ein self-hosted Team Workspace.

**DEIN ZIEL:**
1. Lies alle Docs komplett durch
2. Verstehe die Codebase
3. **Fix alles automatisch** — keine Fragen, keine "Soll ich...?", direkt fixen
4. **Nichts hardcoden** — alles generisch/konfigurierbar machen

---

## PROJEKT STRUKTUR

```
hatches/
├── src/
│   ├── components/     # React Komponenten
│   │   ├── admin/      # Team & User Management
│   │   ├── docs/       # Markdown Editor
│   │   ├── integrations/ # Integration Manager
│   │   ├── kanban/     # Kanban Board
│   │   ├── notes/      # Notes
│   │   └── websites/   # Website Manager
│   ├── lib/            # Auth, DB, Permissions
│   └── pages/          # Astro Routes + API
├── prisma/             # DB Schema
├── Sync/               # Versionierung
│   ├── version.json
│   ├── version.json.md
│   └── ARCHITECTURE.md
├── public/logo/        # Logos (mark-a/b/c.svg)
├── CLAUDE.md           # Dieser Prompt
├── DESIGN.md           # Vision & Features
├── SECURITY.md         # Sicherheitshinweise
└── package.json
```

## TECH-STACK

- **Astro 6** (SSR) + **React Islands**
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma 7** (SQLite default)
- **dnd-kit** (Drag & Drop)
- **@uiw/react-md-editor** (Markdown)

---

## 1. DOKS LESEN (PFlicht!)

Lies **alle** diese Docs bevor du irgendwas anfängst:

| Doc | Muss gelesen werden | Warum |
|-----|---------------------|-------|
| `Sync/version.json.md` | ✅ JA | Versions-System |
| `Sync/ARCHITECTURE.md` | ✅ JA | Sync/Agent API Design |
| `DESIGN.md` | ✅ JA | Alle Features, Vision |
| `SECURITY.md` | ✅ JA | Sicherheit, Einschränkungen |
| `DEVNOTES.md` | ✅ JA | Entwickler-Notizen |
| `CONTRIBUTING.md` | ✅ JA | Contribution Guidelines |
| `FEEDBACK.md` | ✅ JA | Feedback & Ideen |

**Kurzübersicht DESIGN.md:**
- Vision: Alles in Einem (Notion + Obsidian + Trello + AI)
- Vibecoding Collaboration (Creator Mode + Vision Mode)
- Design System: Apple-inspired, Inter, Frosted Glass
- Module: Kanban, Docs, Notes, Websites, Teams, Integrations

**Kurzübersicht SECURITY.md:**
- ⚠️ **vibe-coded** — kein Security Audit
- **Nur** lokal/VPN/intranet — nicht öffentlich!
- Kein Rate-Limiting, kein Brute-Force-Schutz

---

## 2. BUGS FIXEN

Führe aus: `npx tsc --noEmit`

Was zu fixen ist:
1. **PrismaClient not exported** → `npx prisma generate`
2. **BoardItem not found** → Import prüfen in `kanban/KanbanBoard.tsx`
3. **Parameter 'm' implicitly 'any'** → Typen in API-Routes

**Regel: ALLES was ein Error ist, direkt fixen. Keine Fragen.**

---

## 3. CODE QUALITY

### Regeln

- ✅ **Sauberer Code** — keine TODO-Kommentare, keine leeren Funktionen
- ✅ **TypeScript strict** — keine `any`, immer typisieren
- ✅ **Ke Hardcoding** — alles über Config/Env/Constants
- ✅ **Fehlerbehandlung** — try/catch, Error Boundaries
- ✅ **Responsive** — Mobile + Desktop
- ✅ **Accessibility** — A11y beachten (Keyboard Nav, ARIA)

### Was NICHT tun

- ❌ **Keine magic numbers** — Konstanten definieren
- ❌ **Keine copy-paste** — DRY (Don't Repeat Yourself)
- ❌ **Keine to-do stehen lassen** — entweder fixen oder als Issue tracken
- ❌ **Keine Passwords/Keys hardcoden** — Env Vars nutzen
- ❌ **Keine breaking Changes** — abwärtskompatibel bleiben

---

## 4. VERSIONS-SYSTEM

Lies `Sync/version.json.md` für Details.

```
Format: 0.0.5.14.23-dev.4g
Stage:  dev → a → b → pre → stable
WeekTag: a-m = So-Sa (Wochentag)
```

**Commit-Regel:**
```
[Version] - [Stage] - [Type]

## [5.14.23] - dev - Bugfix
### Bugfix
- Fix: ...
```

---

## 5. BEKANNTE BUGS (Stand 2026-05-14)

```bash
npx tsc --noEmit
```

Zeigt diese Fehler → **Direkt fixen:**

| File | Fehler | Fix |
|------|--------|-----|
| `prisma/seed.ts` | PrismaClient not exported | `npx prisma generate` |
| `lib/db.ts` | PrismaClient not exported | `npx prisma generate` |
| `kanban/KanbanBoard.tsx` | BoardItem not found | Import prüfen |
| 5x API files | Parameter 'm' implicitly any | Typen definieren |

---

## 6. WORKFLOW

```
1. Lies alle Docs
2. Führe npx tsc --noEmit aus
3. Fix alle TypeScript Errors
4. Schau dir die Komponenten an
5. Finde UX/Logic Bugs
6. Fix alles
7. Test ob es noch läuft (npm run dev)
8. Commit mit Version
```

---

## COMMANDS

```bash
# TypeScript Check
npx tsc --noEmit

# Dev Server
npm run dev

# Prisma Generate
npx prisma generate

# DB Push
npx prisma db push

# Build
npm run build
```

---

## PRINZIPIEN

1. **Lesen zuerst** — Verstehen bevor Fixen
2. **Alles fixen** — Keine halben Sachen, keine "das könnte man noch..."
3. **Konfigurierbar** — Nichts hardcoden, alles generisch
4. **Sauber bleiben** — Keine遗留 (keine Hinterlassenschaften)

---

*Erstellt: 2026-05-14*