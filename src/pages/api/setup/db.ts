import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ALLOWED_PROVIDERS = ["sqlite", "postgresql", "postgres", "mysql", "mssql"];

/** Update or insert a key=value line in an .env file string. */
function setEnvVar(content: string, key: string, value: string): string {
  const escaped = value.replace(/"/g, '\\"');
  const line = `${key}="${escaped}"`;
  const regex = new RegExp(`^${key}=.*$`, "m");
  return regex.test(content) ? content.replace(regex, line) : content + `\n${line}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    return await handleSetupDb(request);
  } catch (e: any) {
    console.error("[setup/db] unhandled error:", e);
    return err(`Interner Fehler: ${e?.message ?? String(e)}`);
  }
};

async function handleSetupDb(request: Request) {
  const json = await request.json().catch(() => null);
  if (!json) return err("Ungültige Anfrage");

  const provider: string = (json.provider ?? "").toLowerCase().trim();
  const url: string      = (json.url ?? "").trim();

  if (!ALLOWED_PROVIDERS.includes(provider)) return err("Unbekannter Provider");
  if (!url) return err("URL / Pfad darf nicht leer sein");

  // Basic format validation
  if (provider === "sqlite" && !url.startsWith("file:")) return err('SQLite-URL muss mit "file:" beginnen');
  if (provider === "postgresql" || provider === "postgres") {
    if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) return err("Ungültige PostgreSQL-URL");
  }
  if (provider === "mysql" && !url.startsWith("mysql://")) return err("Ungültige MySQL-URL");
  if (provider === "mssql" && !url.startsWith("sqlserver://")) return err("Ungültige SQL Server-URL");

  // ── Write .env ──────────────────────────────────────────────────────────────
  const envPath = path.resolve(process.cwd(), ".env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
  envContent = setEnvVar(envContent, "DATABASE_PROVIDER", provider === "postgres" ? "postgresql" : provider);
  envContent = setEnvVar(envContent, "DATABASE_URL", url);
  fs.writeFileSync(envPath, envContent, "utf-8");

  // ── Update process.env so prisma db push picks up the new values ────────────
  process.env.DATABASE_PROVIDER = provider;
  process.env.DATABASE_URL       = url;

  // ── Run prisma db push ──────────────────────────────────────────────────────
  try {
    execSync("npx prisma db push", {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_PROVIDER: provider,
        DATABASE_URL: url,
        PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "setup-wizard",
      },
      timeout: 30_000,
      stdio: "pipe",
    });
  } catch (e: any) {
    const msg = (e.stderr?.toString() ?? e.message ?? "Prisma Fehler").slice(0, 500);
    return err(`Datenbankfehler:\n${msg}`);
  }

  // The Prisma client was initialised at server start with the old (empty) config.
  // A fresh restart is needed to pick up the new adapter/connection.
  // We signal this to the client so it shows the restart instructions.
  return ok({ needsRestart: true });
}

function ok(data: object) {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    headers: { "Content-Type": "application/json" },
  });
}
function err(error: string) {
  return new Response(JSON.stringify({ ok: false, error }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
