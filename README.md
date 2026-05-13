# DevTool - Es ist noch ein Prototyp

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-6-orange)](https://astro.build)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://prisma.io)

Internes Dev-Team-Tool — eine schlanke Notion-Alternative für Entwickler-Teams. Self-hosted, Open Source.

## Features

- **Kanban Board** — Drag & Drop, Karten-Zuweisung, Beschreibungen, externe Issue-Badges
- **Docs** — Markdown-Editor mit Live-Preview (Split-View)
- **Notizen** — persönliche Schnellnotizen
- **Websites** — interne URL-Verwaltung
- **Integrationen** — Issues von GitHub, GitLab, Jira, Redmine, MantisBT, Confluence und Trello importieren
- **Benutzerverwaltung** — Teams, Rollen und granulare Berechtigungen (Burning-Board-Stil)

## Tech Stack

- [Astro 6](https://astro.build) (SSR) + [React](https://react.dev) Islands
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma 7](https://prisma.io) — SQLite (default), PostgreSQL, MySQL, MSSQL
- [dnd-kit](https://dndkit.com) — Drag & Drop
- [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) — Markdown Editor

## Setup

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
# .env nach Bedarf anpassen (Datenbank, Session-Secret)
```

### 3. Datenbank migrieren

```bash
npx prisma migrate dev
```

### 4. (Optional) Seed-Daten laden

```bash
npx prisma db seed
```

### 5. Dev-Server starten

```bash
npm run dev
# → http://localhost:4321
```

Beim ersten Aufruf wird `/setup` angezeigt — dort den ersten Admin-Account anlegen.

## Datenbank wechseln

`DATABASE_PROVIDER` und `DATABASE_URL` in `.env` anpassen, dann:

```bash
# provider in prisma/schema.prisma ändern (sqlite → postgresql etc.)
npx tsx scripts/db-switch.ts
```

| Provider | `DATABASE_PROVIDER` | Beispiel-URL |
|---|---|---|
| SQLite | `sqlite` | `file:./dev.db` |
| PostgreSQL | `postgresql` | `postgresql://user:pass@localhost:5432/devtool` |
| MySQL | `mysql` | `mysql://user:pass@localhost:3306/devtool` |
| MSSQL | `mssql` | `sqlserver://localhost:1433;database=devtool;...` |

## Projektstruktur

```
src/
├── components/
│   ├── admin/          # Team- & Benutzerverwaltung
│   ├── integrations/   # Integrations-Manager
│   ├── kanban/         # Kanban Board (KanbanBoard, Column, CardItem)
│   ├── docs/           # Markdown-Editor
│   ├── notes/          # Notizen
│   └── websites/       # Website-Manager
├── lib/
│   ├── auth.ts         # Session, Passwort-Hashing
│   ├── db.ts           # Prisma-Client (multi-DB)
│   ├── permissions.ts  # Team-Berechtigungen
│   └── integrations/   # Provider (GitHub, GitLab, Jira, …)
├── middleware.ts        # Auth + Permissions Guard
└── pages/              # Astro-Routen + API-Endpunkte

prisma/
├── schema.prisma       # Datenbank-Schema
├── migrations/         # SQL-Migrationen
└── seed.ts             # Seed-Daten (Board + Spalten)
```

## Self-Hosting mit Docker

### Schnellstart

```bash
git clone https://github.com/DEIN-USERNAME/devtool.git
cd devtool

# .env anlegen — SESSION_SECRET MUSS geändert werden!
cp .env.example .env

docker compose up -d
```

Die App ist danach unter `http://localhost:4321` erreichbar.
Beim ersten Aufruf `/setup` öffnen und den Admin-Account anlegen.

### PostgreSQL statt SQLite

In `docker-compose.yml` den `postgres`-Block auskommentieren und die Umgebungsvariablen im `devtool`-Service anpassen.

### Updates

```bash
docker compose pull && docker compose up -d
```

Migrationen laufen automatisch beim Start.

## Commands

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Dev-Server starten |
| `npm run build` | Produktions-Build |
| `npm run preview` | Build lokal testen |
| `npx prisma studio` | Datenbank-Browser öffnen |
| `npx prisma migrate dev` | Neue Migration anwenden |
