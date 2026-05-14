import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async ({ locals, url }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const teamId = url.searchParams.get("teamId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (teamId) where.teamId = Number(teamId);
  if (from || to) {
    where.start = {};
    if (from) (where.start as any).gte = new Date(from);
    if (to) (where.start as any).lte = new Date(to);
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { start: "asc" },
    include: {
      team: { select: { id: true, name: true, color: true } },
      createdBy: { select: { id: true, username: true, displayName: true } },
    },
  });
  return Response.json(events);
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const { title, description, start, end, allDay, color, recurring, recurringEnd, teamId } = await request.json();
  if (!title?.trim() || !start) return Response.json({ error: "Titel und Startdatum erforderlich" }, { status: 400 });
  const event = await prisma.event.create({
    data: {
      title: title.trim(),
      description: description ?? null,
      start: new Date(start),
      end: end ? new Date(end) : null,
      allDay: allDay ?? false,
      color: color ?? "#3CC79A",
      recurring: recurring ?? null,
      recurringEnd: recurringEnd ? new Date(recurringEnd) : null,
      teamId: teamId ?? null,
      createdById: (locals as any).user.id,
    },
    include: {
      team: { select: { id: true, name: true, color: true } },
      createdBy: { select: { id: true, username: true, displayName: true } },
    },
  });
  return Response.json(event);
};
