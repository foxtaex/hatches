<div align="center">
  <img src="public/logo/mark-b.svg" width="130" alt="Hatches Logo" />
  <h1>hatches</h1>
  <p>
    Ein schlanker, selbst gehosteter Team-Workspace<br />
    <em>Deine private Notion-Alternative für Entwickler-Teams</em>
  </p>

[![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT%20+%20Commons%20Clause-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-6-orange)](https://astro.build)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://prisma.io)
![Version](https://img.shields.io/badge/Version-0.5.26-blue)

</div>

> 🇬🇧 [English version → README.md](README.md)

Kanban-Boards, Docs, Planung, Vorlagen, KI und Integrationen in einer App — vollständig unter deiner Kontrolle.

> ⚠️ **Sicherheitshinweis:** Bitte [SECURITY.md](SECURITY.md) vor dem Deployment lesen. Dieses Projekt ist Vibe-Coded und nicht für den öffentlichen Internetzugang gehärtet. Nur lokal, hinter einem VPN oder über einen Tunnel betreiben.

---

## ✨ Features

- **Kanban Board** — Multi-Board, Drag & Drop, Karten-Zuweisung, Beschreibungen, externe Issue-Badges. Boards können einem Team zugeordnet oder privat gehalten werden.
- **Docs** — Markdown-Editor mit direkt bearbeitbarer WYSIWYG-Vorschau, synchronisierter Bearbeitung, farbigen Codeblöcken, normaler und umgekehrter Split-Ansicht, Import/Export und Team- oder Privat-Scope.
- **Karten mit Docs verknüpfen** — Ein Doc kann als Kartenbeschreibung angezeigt oder als Anhang mit Titel und Doc-Kennzeichnung verknüpft werden.
- **Planer** — Aufgaben und Termine zentral planen.
- **Vorlagen** — Wiederverwendbare Templates für strukturierte Arbeitsabläufe.
- **Kontextbezogene KI** — KI-Unterstützung direkt im Workspace.
- **Websites** — Interne URL- & Projektverwaltung.
- **Integrationen** — Issues von GitHub, GitLab, Jira, Redmine, MantisBT, Confluence und Trello importieren.
- **Teams & Rollen** — Discord-artiges Rechtesystem: Teams anlegen, Rollen mit granularen Berechtigungen pro Bereich konfigurieren (Lesen / Erstellen / Bearbeiten / Löschen).

## 🛠 Tech Stack

- [Astro 6](https://astro.build) (SSR) + [React 19](https://react.dev) Islands
- [TypeScript 6](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma 7](https://prisma.io) — SQLite (Standard), PostgreSQL, MySQL, MSSQL
- [dnd-kit](https://dndkit.com) — Drag & Drop
- [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) — Markdown-Editor
- [marked](https://marked.js.org) + [highlight.js](https://highlightjs.org) — Markdown und Syntaxhervorhebung

## ⚡ Setup

Voraussetzung: **Node.js 22.12 oder neuer**.

### 1. Abhängigkeiten installieren

```bash
npm install
npx prisma generate
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
# SESSION_SECRET auf einen langen Zufallswert setzen
```

### 3. Datenbank anlegen

```bash
npx prisma db push
```

### 4. Dev-Server starten

```bash
npm run dev
# → http://localhost:4321
```

Beim ersten Aufruf erscheint `/setup` — dort den Admin-Account anlegen.

## 💾 Datenbank wechseln

`DATABASE_PROVIDER` und `DATABASE_URL` in `.env` anpassen, dann:

```bash
# Provider in prisma/schema.prisma ändern (sqlite → postgresql etc.)
npx tsx scripts/db-switch.ts
```

| Provider | `DATABASE_PROVIDER` | Beispiel-URL |
|---|---|---|
| SQLite | `sqlite` | `file:./dev.db` |
| PostgreSQL | `postgresql` | `postgresql://user:pass@localhost:5432/hatches` |
| MySQL | `mysql` | `mysql://user:pass@localhost:3306/hatches` |
| MSSQL | `mssql` | `sqlserver://localhost:1433;database=hatches;...` |

## 📁 Projektstruktur

```
src/
├── components/
│   ├── admin/          # Team- & Benutzerverwaltung
│   ├── ai/             # Kontextbezogene KI
│   ├── integrations/   # Integrations-Manager
│   ├── kanban/         # Kanban Board (KanbanBoard, Column, CardItem)
│   ├── docs/           # Markdown-Editor
│   ├── planner/        # Aufgaben- und Terminplanung
│   ├── templates/      # Wiederverwendbare Vorlagen
│   └── websites/       # Website-Manager
├── lib/
│   ├── auth.ts         # Session, Passwort-Hashing
│   ├── db.ts           # Prisma-Client (multi-DB)
│   ├── permissions.ts  # Rollenbasierte Berechtigungen
│   └── integrations/   # Provider (GitHub, GitLab, Jira, …)
├── middleware.ts        # Auth + Permissions Guard
└── pages/              # Astro-Routen + API-Endpunkte

prisma/
├── schema.prisma       # Datenbank-Schema
├── migrations/         # Datenbank-Migrationen
└── seed.ts             # Seed-Daten
```

## 🐳 Self-Hosting mit Docker

```bash
git clone https://github.com/foxtaex/hatches.git
cd hatches

cp .env.example .env
# SESSION_SECRET auf einen langen Zufallswert setzen!

docker compose up -d
```

Die App ist unter `http://localhost:4321` erreichbar. Beim ersten Aufruf `/setup` öffnen und den Admin-Account anlegen.

### PostgreSQL statt SQLite

In `docker-compose.yml` den `postgres`-Block auskommentieren und die Umgebungsvariablen im `hatches`-Service anpassen (Kommentare in der Datei erklären die Schritte).

### Daten & Updates

- **SQLite:** Die `.db`-Datei liegt im Docker Volume `hatches-data` — bleibt über Container-Neustarts erhalten.
- **Updates:** `docker compose pull && docker compose up -d` — Migrationen laufen automatisch beim Start.

## ⚙️ Befehle

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Dev-Server starten |
| `npm run build` | Produktions-Build erstellen |
| `npm run preview` | Build lokal testen |
| `npm run seed` | Beispieldaten anlegen |
| `npx prisma generate` | Prisma-Client erzeugen |
| `npx prisma studio` | Datenbank-Browser öffnen |
| `npx prisma db push` | Schema-Änderungen anwenden |

## 🧰 Fehlerbehebung

### `npm error enoent Could not read package.json`

Dieser Fehler bedeutet, dass der Befehl im falschen Ordner ausgeführt wurde. Zuerst in das Projektverzeichnis wechseln:

```bash
cd hatches
npm install
```

### `Cannot find module '.prisma/client/default'`

Den Prisma-Client im Projektverzeichnis neu erzeugen:

```bash
npx prisma generate
```

## 📜 Lizenz

**MIT + Commons Clause** — kostenlos für private Nutzung und Self-Hosting.  
Kommerzielle Nutzung (Verkauf, gehosteter SaaS, bezahlte Dienstleistungen) erfordert eine separate Lizenz.

> Kommerzielle Lizenzen auf Anfrage — [Issue öffnen](https://github.com/foxtaex/hatches/issues)

Vollständige Bedingungen: [LICENSE](LICENSE)
