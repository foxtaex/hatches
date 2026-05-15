import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../dev.db");

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const DEFAULT_TEMPLATES = [
  {
    name: "Sprint-Planung",
    description: "Kanban-Board für Agile Sprint-Planung mit Standard-Spalten und Beispiel-Karten",
    category: "software",
    icon: "🚀",
    isPublic: true,
    content: JSON.stringify({
      boards: [
        {
          name: "Sprint Board",
          columns: [
            {
              title: "Backlog",
              cards: [
                { title: "Feature A implementieren", description: "Beschreibe das Feature hier", priority: "high" },
                { title: "Bug #123 fixen", priority: "urgent" },
              ],
            },
            { title: "In Arbeit", cards: [] },
            { title: "Review", cards: [] },
            { title: "Erledigt", cards: [] },
          ],
        },
      ],
      docs: [
        {
          title: "Sprint-Notizen",
          content: "## Sprint-Ziel\n\n*Definiere hier das Sprint-Ziel*\n\n## Definition of Done\n\n- [ ] Code reviewed\n- [ ] Tests geschrieben\n- [ ] Deployed\n\n## Retrospektive\n\n### Was lief gut?\n\n### Was kann verbessert werden?\n",
        },
      ],
    }),
  },
  {
    name: "Bug-Tracker",
    description: "Board zur Verfolgung von Bugs nach Priorität und Status",
    category: "software",
    icon: "🛠️",
    isPublic: true,
    content: JSON.stringify({
      boards: [
        {
          name: "Bug Tracker",
          columns: [
            {
              title: "Gemeldet",
              cards: [
                { title: "Beispiel Bug: Login schlägt fehl", description: "Schritte zur Reproduktion:\n1. ...\n2. ...", priority: "high", labels: [{ id: "1", name: "bug", color: "#ef4444" }] },
              ],
            },
            { title: "Bestätigt", cards: [] },
            { title: "In Bearbeitung", cards: [] },
            { title: "Gelöst", cards: [] },
          ],
        },
      ],
    }),
  },
  {
    name: "Meeting Notes",
    description: "Vorlage für strukturierte Meeting-Protokolle mit Agenda und Aufgaben",
    category: "general",
    icon: "📝",
    isPublic: true,
    content: JSON.stringify({
      docs: [
        {
          title: "Meeting Notes",
          content: "## Meeting — {{Datum}}\n\n**Teilnehmer:** \n\n**Moderator:** \n\n---\n\n## Agenda\n\n1. \n2. \n3. \n\n---\n\n## Notizen\n\n\n\n---\n\n## Action Items\n\n| Aufgabe | Person | Fällig |\n|---------|--------|--------|\n| | | |\n",
        },
      ],
    }),
  },
  {
    name: "Projekt-Kickoff",
    description: "Vollständiges Projekt-Starter-Kit mit Board, Dokumentation und Notizen",
    category: "project",
    icon: "🎯",
    isPublic: true,
    content: JSON.stringify({
      boards: [
        {
          name: "Projekt-Tasks",
          columns: [
            { title: "Offen", cards: [{ title: "Anforderungen definieren", priority: "high" }, { title: "Stakeholder identifizieren" }] },
            { title: "In Bearbeitung", cards: [] },
            { title: "Abgeschlossen", cards: [] },
          ],
        },
      ],
      docs: [
        {
          title: "Projektbeschreibung",
          content: "## Projektziel\n\n*Was soll erreicht werden?*\n\n## Scope\n\n**In-Scope:**\n- \n\n**Out-of-Scope:**\n- \n\n## Timeline\n\n| Phase | Start | Ende |\n|-------|-------|------|\n| Planung | | |\n| Entwicklung | | |\n| Testing | | |\n\n## Team\n\n| Name | Rolle |\n|------|-------|\n| | |\n",
        },
      ],
      notes: [
        { title: "Projekt-Ideen & Brainstorming", content: "# Ideen\n\n- \n" },
      ],
    }),
  },
  {
    name: "Wöchentliche Review",
    description: "Vorlage für die wöchentliche Team-Review mit Highlights und Ausblick",
    category: "general",
    icon: "📊",
    isPublic: true,
    content: JSON.stringify({
      docs: [
        {
          title: "Wöchentliche Review",
          content: "## Woche {{KW}} — {{Jahr}}\n\n### ✅ Diese Woche erledigt\n\n- \n- \n\n### 🔄 In Arbeit\n\n- \n\n### 📌 Nächste Woche\n\n- \n- \n\n### 🚧 Blocker\n\n*Gibt es etwas, das dich aufhält?*\n\n### 💡 Notizen\n\n",
        },
      ],
    }),
  },
  {
    name: "Content-Kalender",
    description: "Board-Vorlage für Content-Marketing und Social Media Planung",
    category: "marketing",
    icon: "📱",
    isPublic: true,
    content: JSON.stringify({
      boards: [
        {
          name: "Content-Kalender",
          columns: [
            { title: "Ideen", cards: [{ title: "Blog Post Idee", labels: [{ id: "1", name: "blog", color: "#3b82f6" }] }] },
            { title: "In Arbeit", cards: [] },
            { title: "Review", cards: [] },
            { title: "Veröffentlicht", cards: [] },
          ],
        },
      ],
    }),
  },
  {
    name: "Team-Onboarding",
    description: "Strukturierter Onboarding-Plan für neue Team-Mitglieder",
    category: "hr",
    icon: "👋",
    isPublic: true,
    content: JSON.stringify({
      docs: [
        {
          title: "Onboarding Guide",
          content: "# Willkommen im Team! 🎉\n\n## Erste Schritte\n\n- [ ] Account einrichten\n- [ ] Team-Channels beitreten\n- [ ] Erste Aufgaben kennenlernen\n\n## Woche 1\n\n- Einarbeitung in die Codebase\n- 1:1 Meetings mit Team-Mitgliedern\n\n## Wichtige Links\n\n- [Repository](#)\n- [Docs](#)\n- [Issue Tracker](#)\n\n## Ansprechpartner\n\n| Name | Rolle | Thema |\n|------|-------|-------|\n| | | |\n",
        },
      ],
      notes: [
        { title: "Onboarding-Notizen", content: "# Meine ersten Eindrücke\n\nFragen & Anmerkungen:\n\n- \n" },
      ],
    }),
  },
];

async function main() {
  const existing = await prisma.board.findFirst();
  if (existing) {
    console.log("Board already exists, skipping board seed.");
  } else {
    await prisma.board.create({
      data: {
        name: "Main Board",
        columns: {
          create: [
            {
              title: "Backlog",
              position: 0,
              cards: { create: [{ title: "Projekt aufsetzen", position: 0 }] },
            },
            { title: "In Arbeit", position: 1 },
            { title: "Review", position: 2 },
            { title: "Erledigt", position: 3 },
          ],
        },
      },
    });
    console.log("Board seeded.");
  }

  // Seed default templates (idempotent — skip if already present)
  let seeded = 0;
  for (const tpl of DEFAULT_TEMPLATES) {
    const existing = await prisma.template.findFirst({ where: { name: tpl.name } });
    if (!existing) {
      await prisma.template.create({ data: tpl });
      seeded++;
    }
  }
  console.log(`${DEFAULT_TEMPLATES.length} default templates ready (${seeded} newly created).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
