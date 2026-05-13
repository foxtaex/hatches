# Hatches

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-6-orange)](https://astro.build)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://prisma.io)

> 🇩🇪 [Deutsche Version → README.de.md](README.de.md)

A lean, self-hosted team workspace — your own private Notion alternative for developers. Kanban boards, docs, notes, and integrations, all in one place.

> ⚠️ **Security notice:** Please read [SECURITY.md](SECURITY.md) before deploying. This project is vibe-coded and not hardened for public internet exposure. Run it locally, behind a VPN, or via a tunnel only.

---

## Features

- **Kanban Board** — Multi-board, drag & drop, card assignment, descriptions, external issue badges. Boards can be scoped to a team or kept private.
- **Docs** — Markdown editor with live split-view preview. Docs can be scoped to a team or kept private.
- **Notes** — Quick personal notes. Notes can be scoped to a team or kept private.
- **Websites** — Internal URL & project registry.
- **Integrations** — Import issues from GitHub, GitLab, Jira, Redmine, MantisBT, Confluence, and Trello.
- **Teams & Roles** — Discord-style permission system: create teams, assign roles with granular per-section toggles (view / create / edit / delete).

## Tech Stack

- [Astro 6](https://astro.build) (SSR) + [React](https://react.dev) Islands
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma 7](https://prisma.io) — SQLite (default), PostgreSQL, MySQL, MSSQL
- [dnd-kit](https://dndkit.com) — Drag & Drop
- [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) — Markdown Editor

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Set SESSION_SECRET to a long random value
```

### 3. Migrate the database

```bash
npx prisma db push
```

### 4. Start the dev server

```bash
npm run dev
# → http://localhost:4321
```

On first visit, `/setup` will appear — create your admin account there.

## Switching databases

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

## Project structure

```
src/
├── components/
│   ├── admin/          # Team & user management
│   ├── integrations/   # Integration manager
│   ├── kanban/         # Kanban board (KanbanBoard, Column, CardItem)
│   ├── docs/           # Markdown editor
│   ├── notes/          # Notes
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

## Self-hosting with Docker

```bash
git clone https://github.com/YOUR-USERNAME/hatches.git
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

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the build locally |
| `npx prisma studio` | Open database browser |
| `npx prisma db push` | Apply schema changes |

## License

[MIT](LICENSE)
