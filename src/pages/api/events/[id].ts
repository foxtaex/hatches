import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const PATCH: APIRoute = async ({ locals, request, params }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const id = Number(params.id);
  const { title, description, start, end, allDay, color, recurring, recurringEnd, teamId } = await request.json();

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description;
  if (start !== undefined) data.start = new Date(start);
  if (end !== undefined) data.end = end ? new Date(end) : null;
  if (allDay !== undefined) data.allDay = allDay;
  if (color !== undefined) data.color = color;
  if (recurring !== undefined) data.recurring = recurring;
  if (recurringEnd !== undefined) data.recurringEnd = recurringEnd ? new Date(recurringEnd) : null;
  if (teamId !== undefined) data.teamId = teamId;

  const event = await prisma.event.update({
    where: { id },
    data,
    include: {
      team: { select: { id: true, name: true, color: true } },
      createdBy: { select: { id: true, username: true, displayName: true } },
    },
  });
  return Response.json(event);
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const id = Number(params.id);
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return Response.json({ error: "Nicht gefunden" }, { status: 404 });
  // Only creator or admin can delete
  const user = (locals as any).user;
  if (event.createdById !== user.id && !user.isAdmin) {
    return Response.json({ error: "Keine Berechtigung" }, { status: 403 });
  }
  await prisma.event.delete({ where: { id } });
  return Response.json({ ok: true });
};
