import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../dev.db");

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.board.findFirst();
  if (existing) {
    console.log("Already seeded, skipping.");
    return;
  }
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
  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
