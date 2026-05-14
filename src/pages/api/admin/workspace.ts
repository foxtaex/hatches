import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

async function getConfig() {
  return prisma.workspaceConfig.upsert({
    where: { id: 1 },
    create: { id: 1, name: "Hatches" },
    update: {},
  });
}

export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const config = await getConfig();
  return Response.json({ name: config.name });
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  if (!user || !user.isAdmin) return Response.json({ error: "Keine Berechtigung" }, { status: 403 });

  const { name } = await request.json().catch(() => ({})) as { name?: string };
  const trimmed = (name ?? "").trim();
  if (!trimmed) return Response.json({ error: "Name darf nicht leer sein" }, { status: 400 });

  await prisma.workspaceConfig.upsert({
    where: { id: 1 },
    create: { id: 1, name: trimmed },
    update: { name: trimmed },
  });

  return Response.json({ ok: true });
};
