import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async ({ locals, url }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const category = url.searchParams.get("category");
  const where: Record<string, unknown> = { isPublic: true };
  if (category && category !== "all") where.category = category;

  const templates = await prisma.template.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      createdBy: { select: { id: true, username: true, displayName: true } },
      team: { select: { id: true, name: true, color: true } },
    },
  });
  return Response.json(templates);
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const { name, description, category, icon, content, isPublic, teamId } = await request.json();
  if (!name?.trim()) return Response.json({ error: "Name erforderlich" }, { status: 400 });
  const template = await prisma.template.create({
    data: {
      name: name.trim(),
      description: description ?? null,
      category: category ?? "general",
      icon: icon ?? "📋",
      content: typeof content === "string" ? content : JSON.stringify(content ?? {}),
      isPublic: isPublic ?? true,
      teamId: teamId ?? null,
      createdById: (locals as any).user.id,
    },
    include: {
      createdBy: { select: { id: true, username: true, displayName: true } },
      team: { select: { id: true, name: true, color: true } },
    },
  });
  return Response.json(template);
};
