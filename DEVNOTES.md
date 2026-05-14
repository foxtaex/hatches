# Hatches — Dev Notes

## Architecture

### Modular / Component-Based Design

All features must be built as **standalone, composable modules**. The UI is composed entirely of React Islands (Astro islands architecture). New features should follow this pattern:

```
src/components/<feature>/
  ├── <FeatureName>.tsx       # Main component (island)
  ├── <FeatureName>List.tsx   # List/overview view
  ├── <FeatureName>Item.tsx   # Single item/card
  ├── types.ts                # TypeScript interfaces
  └── index.ts                # Re-export main component

src/pages/api/<feature>/
  ├── index.ts                # GET (list) + POST (create)
  ├── [id].ts                 # GET + PATCH + DELETE for single item
  └── <sub-action>.ts         # Additional actions (e.g. /archive, /export)
```

**Rules:**
- Each module has its own component folder
- API routes are co-located with the feature they serve
- No cross-feature imports without going through `src/lib/` shared utilities
- New feature = new component folder + new API route group
- Keep `src/lib/` clean — only truly shared code goes there

### Stack

- **Astro 6** (SSR) + **React 19** Islands
- **Tailwind CSS v4**
- **Prisma 7** (SQLite default, supports PostgreSQL/MySQL/MSSQL)
- **dnd-kit** for drag & drop
- **@uiw/react-md-editor** for markdown editing

### Design System

See **`DESIGN.md`** for complete design specification, color tokens, typography,
and feature descriptions (all 9 feature modules documented).

**Vision:** All-in-one: Notion + Obsidian + Trello + AI Agent Manager + own GitRepo.
No more app-hopping. Everything in one place, but still clean and simple.

**USPs:**
1. All-in-One — Notion + Obsidian + Trello + AI Agent Manager + GitRepo, no app-hopping
2. AI-powered — not just chat, AI that actually works (Harness Agent)
3. Vibecoding-Collaboration — Human + AI, Human approves, AI works
4. Self-hosted & free — no dependency, no subscription
5. Apple-Design — clean, minimal, delightful to use

### Permission System (Four-Tier)

1. **Global Permissions** — team-independent, one-time grant by Oga only
2. **Oga Team** — Super Admin, above everything, grants global rights
3. **Org-Groups** — Area groups (Frontend, Backend, Design...) with:
   - **Locked Rights** — can only be changed by Oga, cannot be passed down
   - **Normal Rights** — can be freely assigned by org/group lead
4. **Team Roles** — team-specific (Full Access, Can Edit, Can Comment, Can View)

### Workflow

1. Development happens on `dev` branch
2. Version bump on every significant change
3. `main` only via PR from `dev`
4. Semantic versioning: `major.minor.patch`

### Key Files

| File | Purpose |
|------|---------|
| `DESIGN.md` | Complete design spec, all features, API routes, database schema |
| `DEVNOTES.md` | This file — architecture, workflow, guidelines |
| `FEEDBACK.md` | User feedback and known issues (from Syntarex, Harry) |

## Version History

| Version | Changes |
|---------|---------|
| 0.0.5 | a516145 — Initial commit |
| 0.0.6 | First patch after split |
| 0.0.7 | fix: import faBoxArchive in KanbanBoard |
| 0.0.8 | docs: add logo SVG and embed in README |
| 0.0.9 | docs: add 3 logo variants (A Vivid, B Subtle, C Outline) |
| 0.1.0 | docs: add DEVNOTES.md with modular architecture guidelines |
| 0.1.1 | feat: full design system + 7 feature modules documented |
| 0.2.0 | feat: redefine as Notion-clone with Apple design |
| 0.3.0 | feat: add AI features (Harness, template generation, automation) |
| 0.3.1 | feat: expand template library with full categories |
| 0.3.2 | feat: make AI provider-agnostic (OpenAI, Anthropic, Google, DeepSeek, MiniMax, Ollama) |
| 0.4.0 | feat: add Planner & Calendar module |
| 0.4.1 | feat: add MiniMax as AI provider |
| 0.5.0 | feat: redefine vision — Vibecoding Collaboration Interface |
| 0.5.1 | feat: add three-tier permission system with Oga super admin |
| 0.5.2 | feat: add Org-Groups for area-based permissions (locked + normal rights) |

## Known Issues (from Feedback)

- **HarryPropper:** Code is good but "very hardcoded" — magic strings, no config system
- **Syntarex:** Needs clear USP vs Notion/Obsidian

## Hatches 2.0 — Future Plans

**AI Events:**
- AI plant automatisch Meetings basierend auf Verfügbarkeit
- Erstellt Erinnerungen und benachrichtigt das Team
- AI Event Intelligence: "Finde einen Slot für alle Team-Members diese Woche"
- Automatische Timezone-Anpassung

**GitHatch:** EU-made Git Repository Management Interface (like GitLab) — independent project, not in this repo.

**Tech Stack:** Rust + Axum (if still relevant at time of development)

**Features:** Like GitLab — repo management, issues, merge requests, CI/CD pipelines, webhooks, SSH keys. Made in Germany, EU-compliant (GDPR, data privacy). Open APIs — no lock-in, other tools can integrate. Can sync with GitHub/GitLab (pull/push) or work standalone.

**License:** Partially open source — self-hosted possible, full feature set requires server infrastructure.

**Future:** Even Super Admins cannot read private data. Private data is encrypted (end-to-end encryption). Privacy by design, even from admins.
