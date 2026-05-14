import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const PATCH: APIRoute = async ({ locals, request, params }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const id = Number(params.id);
  const { name, description, category, icon, content, isPublic, teamId } = await request.json();

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (description !== undefined) data.description = description;
  if (category !== undefined) data.category = category;
  if (icon !== undefined) data.icon = icon;
  if (content !== undefined) data.content = typeof content === "string" ? content : JSON.stringify(content);
  if (isPublic !== undefined) data.isPublic = isPublic;
  if (teamId !== undefined) data.teamId = teamId;

  const template = await prisma.template.update({ where: { id }, data });
  return Response.json(template);
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const id = Number(params.id);
  const user = (locals as any).user;
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template) return Response.json({ error: "Nicht gefunden" }, { status: 404 });
  if (template.createdById !== user.id && !user.isAdmin) {
    return Response.json({ error: "Keine Berechtigung" }, { status: 403 });
  }
  await prisma.template.delete({ where: { id } });
  return Response.json({ ok: true });
};

export const GET: APIRoute = async ({ locals, params }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const id = Number(params.id);
  const template = await prisma.template.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, username: true, displayName: true } },
      team: { select: { id: true, name: true, color: true } },
    },
  });
  if (!template) return Response.json({ error: "Nicht gefunden" }, { status: 404 });
  return Response.json(template);
};
