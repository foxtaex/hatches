<div align="center">
  <img src="public/logo/mark-b.svg" width="160" alt="Hatches Logo — Mark B (Subtle)" />
  <h1>hatches</h1> 
</div>

<div align="center">
A lean, self-hosted team workspace
<br/>
<em>Your own private Notion alternative for developers</em>
<br/><br/>

[![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT%20+%20Commons%20Clause-blue.svg)](LICENSE)
<img src="https://img.shields.io/badge/Astro-6-ff6b35?logo=astro" alt="Astro 6"/>
<img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19"/>
<img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma 7"/>
<img src="https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss" alt="Tailwind CSS v4"/>
<br/>
![Stars](https://img.shields.io/github/stars/foxtaex/hatches?style=flat-square)
<img src="https://img.shields.io/github/v/release/foxtaex/hatches?include_prereleases&label=version" alt="Version"/>
<img src="https://img.shields.io/badge/version-v6.0.00--dev-blue" alt="Current development version"/>

</div>

> 🇩🇪 [Deutsche Version → README.de.md](README.de.md)

---

## ✨ What is Hatches?

Hatches is a lightweight self-hosted collaboration platform focused on developers and technical teams.

It combines:
- 📋 **Kanban boards** — Multi-board workflow with drag & drop
- 🗂️ **Projects** — Link existing boards and Docs into a shared project structure with one optional folder level; project deadlines appear clearly labeled in Planner
- 📝 **Docs** — Markdown editor with live preview
- 👥 **Teams & Roles** — Discord-style permission system
- 🔗 **Integrations** — Internal URL & project registry - GitHub, GitLab, Jira, and more
- 🌍 **German & English** — Switch the workspace interface language from account settings

into one modern workspace you fully control. No subscriptions, no vendor lock-in.

---

## 🚀 Features

### 📋 Kanban Boards
Multi-board workflow management with **drag & drop support**, card assignment, team scoping, and a board-filtered archive column that supports dragging cards in and back out.

### 📝 Docs
Markdown documentation with an editable WYSIWYG preview, highlighted fenced code blocks, raw Markdown editing, normal and reversed split views, import/export, templates, and private or team scopes.

### 🗂️ Hatches project home
The Hatches home page groups existing boards and Docs without copying them. Projects can be private or team-scoped and support one optional subfolder level, ready for future Whiteboard links.

### 🌐 Websites
Internal service and project registry — keep track of internal URLs and deployed services.

### 👥 Teams & Roles
**Discord-inspired permission system** with granular access control per section (view / create / edit / delete).

### 🔗 Integrations
Import issues from **GitHub, GitLab, Jira, Trello, Redmine, MantisBT, Confluence** and more.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Astro 6](https://astro.build) (SSR) + React Islands |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Database | [Prisma 7](https://prisma.io) — SQLite, PostgreSQL, MySQL, MSSQL |
| Drag & Drop | [dnd-kit](https://dndkit.com) |
| Editor | [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) |

---

## ⚡ Quick Start

```bash
# 1. Clone & install
git clone https://github.com/foxtaex/hatches.git
cd hatches
npm install

# 2. Configure
cp .env.example .env
# Set SESSION_SECRET to a long random string

# 3. Database
npx prisma db push

# 4. Run
npm run dev
# → http://localhost:4321
```

Open `/setup` on first visit to create your admin account.

---

## 🐳 Docker Setup

```bash
git clone https://github.com/foxtaex/hatches.git
cd hatches

cp .env.example .env
# Set SESSION_SECRET to a long random string!

docker compose up -d
```

The app is available at `http://localhost:4321`. Open `/setup` on first visit to create the admin account.

### PostgreSQL instead of SQLite

Uncomment the `postgres` block in `docker-compose.yml` and update the environment variables in the `hatches` service accordingly (comments in the file explain the steps).

### Data & updates

- **SQLite:** The `.db` file lives in the `hatches-data` Docker volume — persisted across container restarts.
- **Updates:** `docker compose pull && docker compose up -d` — migrations run automatically on startup.

---

## 💾 Switching Databases

Update `DATABASE_PROVIDER` and `DATABASE_URL` in `.env`, then:

```bash
# Change provider in prisma/schema.prisma (sqlite → postgresql etc.)
npx tsx scripts/db-switch.ts
```

| Provider | `DATABASE_PROVIDER` | Example URL |
|---|---|---|
| SQLite | `sqlite` | `file:./dev.db` |
| PostgreSQL | `postgresql` | `postgresql://user:pass@localhost:5432/hatches` |
| MySQL | `mysql` | `mysql://user:pass@localhost:3306/hatches` |
| MSSQL | `mssql` | `sqlserver://localhost:1433;database=hatches;...` |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # Team & user management
│   ├── docs/           # Markdown editor (DocsEditor)
│   ├── integrations/   # Integration manager
│   ├── kanban/         # Kanban board (Board, Column, Card)
│   └── websites/       # Website manager
├── lib/
│   ├── auth.ts         # Session, password hashing
│   ├── db.ts           # Prisma client (multi-DB)
│   ├── permissions.ts  # Role-based permissions
│   └── integrations/   # Providers (GitHub, GitLab, Jira, …)
├── middleware.ts        # Auth + permissions guard
└── pages/              # Astro routes + API endpoints

prisma/
├── schema.prisma       # Database schema
└── seed.ts             # Seed data
```

---

## ⚙️ Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build locally |
| `npx prisma studio` | Open database browser |
| `npx prisma db push` | Apply schema changes |

---

## ⚠️ Security Notice

> Please read [SECURITY.md](SECURITY.md) before deploying.

Hatches is **vibe-coded and not audited** for security vulnerabilities. It is not hardened for direct public internet exposure.

**Recommended deployment scenarios:**
- ✅ Local machine only (`localhost`)
- ✅ Private home/office network (intranet)
- ✅ Behind a VPN (WireGuard, Tailscale, etc.)
- ✅ Internal tunnel to intranet (Cloudflare Tunnel, ngrok)
- ❌ **Do not** expose directly to the public internet

---

## 🤝 Contributors

- [@Foxtaex](https://github.com/foxtaex) — Founder & Lead Development
- [@CoreForAi](https://github.com/CoreForAi) — Design & Development

## 🤝 Thanks

- Syntarex
- HarryPropper — (Discord)

---

## 📜 License

**MIT + Commons Clause** — free for personal use and self-hosting.

Commercial use (selling, hosted SaaS, paid services) requires a separate license.

> Commercial licenses available on request — [open an issue](https://github.com/foxtaex/hatches/issues)

See [LICENSE](LICENSE) for the full terms.
