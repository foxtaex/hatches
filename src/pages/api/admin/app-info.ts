import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

interface ReleaseEntry {
  key: string;
  display: string;
  stage: string;
  date: string;
  time?: string;
  description: string;
  changes: string[];
  status: string;
  isCurrent: boolean;
}

export const GET: APIRoute = async ({ locals }) => {
  if (!(locals as any).user?.isAdmin)
    return new Response(JSON.stringify({ error: "Keine Berechtigung" }), { status: 403 });

  // Read display version + release history from Sync/version.json
  let version = "—";
  let releases: ReleaseEntry[] = [];
  try {
    const vJson = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), "Sync/version.json"), "utf-8")
    );
    version = vJson.current_display ?? version;
    const current: string = vJson.current ?? "";
    releases = Object.entries(vJson.releases ?? {})
      .map(([key, v]: [string, any]) => ({
        key,
        display:     v.display ?? key,
        stage:       v.stage ?? "dev",
        date:        v.date ?? "",
        time:        v.time as string | undefined,
        description: v.description ?? "",
        changes:     (v.changes ?? []) as string[],
        status:      v.status ?? "",
        isCurrent:   key === current,
      }))
      // Newest first: current on top, then sort by date desc, then key desc
      .sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        const dateCmp = b.date.localeCompare(a.date);
        if (dateCmp !== 0) return dateCmp;
        return b.key.localeCompare(a.key);
      });
  } catch {}

  const provider = process.env.DATABASE_PROVIDER ?? "sqlite";
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const maskedUrl = url.replace(/:\/\/([^:@]+):([^@]+)@/, "://$1:••••@");

  return new Response(
    JSON.stringify({
      version,
      releases,
      node: process.version,
      provider,
      url: maskedUrl,
      uptime: Math.floor(process.uptime()),
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
