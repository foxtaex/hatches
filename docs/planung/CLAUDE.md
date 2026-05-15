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
├── Sync/               # Versionierung (version.json)
├── docs/               # Alle Docs & Planung
│   └── planung/        # Design, Architektur, Features
│       ├── design.md
│       ├── architektur.md
│       ├── devnotes.md
│       ├── feedback.md
│       ├── markdown-cms.md
│       ├── versionierung.md
│       ├── workflow.md      # Plan-First Workflow
│       ├── template.md      # Feature-Plan Template
│       ├── komponenten.md   # Komponenten-Registry
│       └── features/   # Feature-Specs pro Modul
├── public/logo/        # Logos (mark-a/b/c.svg)
├── CLAUDE.md           # Dieser Prompt
├── CONTRIBUTING.md     # Contribution Guidelines
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

## 1. DOCS LESEN (Pflicht!)

Lies **alle** diese Docs bevor du irgendwas anfängst:

| Doc | Muss gelesen werden | Warum |
|-----|---------------------|-------|
| `docs/planung/versionierung.md` | ✅ JA | Versions-System |
| `docs/planung/architektur.md`   | ✅ JA | Architektur & API Design |
| `docs/planung/design.md`        | ✅ JA | Alle Features, Vision |
| `SECURITY.md`                   | ✅ JA | Sicherheit, Einschränkungen |
| `docs/planung/devnotes.md`      | ✅ JA | Entwickler-Notizen |
| `CONTRIBUTING.md`               | ✅ JA | Contribution Guidelines |
| `docs/planung/feedback.md`      | ✅ JA | Feedback & Ideen |
| `docs/planung/workflow.md`      | ✅ JA | Plan-First Workflow |
| `docs/planung/komponenten.md`  | ✅ JA | Alle Komponenten + Props + APIs |
| `docs/planung/features/`        | ✅ JA | Feature-Specs (admin, auth, kanban, …) |

**Kurzübersicht design.md:**
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

**Regel: ALLES was ein Error ist, direkt fixen. Keine Fragen.**

---

## 3. CODE QUALITY

### Regeln

- ✅ **Sauberer Code** — keine TODO-Kommentare, keine leeren Funktionen
- ✅ **TypeScript strict** — keine `any`, immer typisieren
- ✅ **Kein Hardcoding** — alles über Config/Env/Constants
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

Lies `docs/planung/versionierung.md` für Details.

```
Format: 0.5.24.14.15-dev.3f
         └┘└┘└──┘└─┘└─┘└──┘└─┘
Major.Minor.Patch.Minor.Tag-Stage.BugfixCount+WeekTag

WeekTag: a=So b=Mo c=Di d=Mi e=Do f=Fr g=Sa
```

**Jeder Eintrag braucht `date` UND `time` in version.json:**
```json
{
  "date": "2026-05-15",
  "time": "17:45"
}
```

**Commit-Regel:**
```
[Version] - [Stage] - [Type]

## [5.14.15] - dev - Bugfix
### Bugfix
- Fix: ...
```

---

## 5. FEATURE WORKFLOW (Pflicht!)

**Neues Feature = Plan zuerst. Kein Code ohne Plan.**

```
1. Feature-Plan in docs/planung/features/<name>.md erstellen
   → Template: docs/planung/template.md
2. Komponenten planen (Props, State, API Calls)
   → Registry: docs/planung/komponenten.md
3. API Endpoints definieren
4. DB Schema prüfen (Prisma)
5. UI/UX Skizze (ASCII Wireframe)
6. REVIEW — macht der Plan Sinn?
7. IMPLEMENTIEREN (in geplanter Reihenfolge)
8. Status im Plan updaten (📋 → ✅)
9. Komponenten-Registry updaten
```

Vollständiger Workflow: `docs/planung/workflow.md`

## 6. BUG-FIX WORKFLOW

```
1. Lies alle Docs (docs/planung/)
2. Führe npx tsc --noEmit aus
3. Fix alle TypeScript Errors
4. Schau dir die Komponenten an
5. Finde UX/Logic Bugs
6. Fix alles
7. Test: npm run build
8. Version in Sync/version.json + package.json bumpen
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

## ZUKUNFT / ROADMAP

| Version | Feature | Beschreibung |
|---------|---------|-------------|
| **5.14-dev** | Jetzt | Kanban, Docs, Notes, Websites, Teams, Integrations |
| **5.15-dev** | UX + Stability | Theme Toggle, Search, Keyboard Shortcuts |
| **6.0-dev** | Import/Export | JSON/Zip Export, Import von Notion/Jira |
| **6.1-dev** | Sync + E2E | Local-first (Dexie.js), E2E Encryption, Sync Gateway |
| **6.2-dev** | Headless CLI | CLI-only Client, Cron-Sync |
| **6.3-dev** | External Editor | Obsidian/VSCode Integration |
| **7.0-dev** | Agent API | AI Agents SDK, Streaming (WebRTC) |

```
Future (design.md):
├── Native Apps (iOS, Android)
├── AI Events & Triggers
├── GitHatch (integriertes Git Repo)
├── Offline-First mit Sync
├── E2E Encryption
├── Self-Hosted Streaming (WebRTC)
└── Agent SDK für Developer
```

---

## PRINZIPIEN

1. **Lesen zuerst** — Verstehen bevor Fixen
2. **Alles fixen** — Keine halben Sachen
3. **Konfigurierbar** — Nichts hardcoden, alles generisch
4. **Sauber bleiben** — Keine Hinterlassenschaften
5. **Future-Proof** — Code für zukünftige Features vorbereiten

---

*Zuletzt aktualisiert: 2026-05-15*
