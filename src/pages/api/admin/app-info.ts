import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

export const GET: APIRoute = async ({ locals }) => {
  if (!(locals as any).user?.isAdmin)
    return new Response(JSON.stringify({ error: "Keine Berechtigung" }), { status: 403 });

  // Read display version from Sync/version.json (e.g. "5.14.27-dev.3d")
  let version = "—";
  try {
    const vJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "Sync/version.json"), "utf-8"));
    version = vJson.current_display ?? version;
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
