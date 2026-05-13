/**
 * Wechselt den Datenbankprovider in schema.prisma und führt Migrationen aus.
 * Verwendung: npm run db:switch
 *
 * .env-Variablen:
 *   DATABASE_PROVIDER  sqlite | postgresql | mysql | sqlserver
 *   DATABASE_URL       Verbindungsstring für den gewählten Provider
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");

const provider = (process.env.DATABASE_PROVIDER ?? "sqlite").toLowerCase();
const validProviders = ["sqlite", "postgresql", "mysql", "sqlserver"];

if (!validProviders.includes(provider)) {
  console.error(`Ungültiger Provider: "${provider}". Erlaubt: ${validProviders.join(", ")}`);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, "utf8");

// Provider-Zeile ersetzen
schema = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql|mysql|sqlserver)"/,
  `provider = "${provider}"`
);

fs.writeFileSync(schemaPath, schema, "utf8");
console.log(`✔ schema.prisma auf Provider "${provider}" gesetzt`);

// Prisma-Client neu generieren + Migrationen
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  execSync("npx prisma migrate dev --name switch-provider", { stdio: "inherit" });
  console.log("✔ Migration erfolgreich");
} catch (e) {
  console.error("Migration fehlgeschlagen:", e);
  process.exit(1);
}
