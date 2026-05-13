# Contributing to DevTool

Danke für dein Interesse! Contributions sind willkommen — egal ob Bugfix, Feature oder Dokumentation.

## Vor dem ersten PR

1. Fork das Repo und clone deinen Fork
2. Erstelle einen Feature-Branch: `git checkout -b feat/mein-feature`
3. Setup wie in der README beschrieben (`npm install`, `.env`, `prisma migrate dev`)

## Entwicklung

```bash
npm run dev        # Dev-Server mit Hot-Reload
npx prisma studio  # Datenbank-Browser
```

## Pull Request

- **Ein PR = eine Sache** — bitte kein Mix aus Features und Bugfixes
- Beschreibe kurz was du geändert hast und warum
- Bestehende Funktionalität sollte weiterhin funktionieren

## Bug melden

Einfach ein [GitHub Issue](../../issues/new) öffnen mit:
- Was hast du erwartet?
- Was ist stattdessen passiert?
- Schritte zum Reproduzieren
- Node-Version, Betriebssystem

## Feature vorschlagen

Auch gerne als Issue — kurze Beschreibung des Use-Cases reicht.

## Code-Stil

- TypeScript überall
- Tailwind für Styles (keine inline-styles)
- Astro-Seiten für Routen, React-Komponenten für interaktive Islands
