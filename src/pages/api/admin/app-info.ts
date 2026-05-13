import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

export const GET: APIRoute = async ({ locals }) => {
  if (!(locals as any).user?.isAdmin)
    return new Response(JSON.stringify({ error: "Keine Berechtigung" }), { status: 403 });

  // Read package.json for version
  let version = "0.0.1";
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8"));
    version = pkg.version ?? version;
  } catch {}

  const provider = process.env.DATABASE_PROVIDER ?? "sqlite";
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  // Mask password in URL
  const maskedUrl = url.replace(/:\/\/([^:@]+):([^@]+)@/, "://$1:••••@");

  return new Response(
    JSON.stringify({
      version,
      node: process.version,
      provider,
      url: maskedUrl,
      uptime: Math.floor(process.uptime()),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
