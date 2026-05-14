import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// GET /api/board/cards?withDueDate=true — cards with due dates (for Planner integration)
export const GET: APIRoute = async ({ locals, url }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const withDueDate = url.searchParams.get("withDueDate") === "true";
  if (!withDueDate) return Response.json([]);

  const cards = await prisma.card.findMany({
    where: { isArchived: false, dueDate: { not: null } },
    include: {
      column: {
        include: {
          board: { select: { id: true, name: true, teamId: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return Response.json(cards);
};

// POST /api/board/cards — create card
export const POST: APIRoute = async ({ request }) => {
  const { title, columnId } = await request.json();
  const count = await prisma.card.count({ where: { columnId } });
  const card = await prisma.card.create({
    data: { title, columnId, position: count },
  });
  return Response.json(card);
};

// PATCH /api/board/cards — update card fields
export const PATCH: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { id } = body;

  const data: Record<string, unknown> = {};
  if (body.title !== undefined)       data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.assigneeId !== undefined)  data.assigneeId = body.assigneeId;
  if (body.priority !== undefined)    data.priority = body.priority;
  if (body.labels !== undefined)      data.labels = body.labels;
  if (body.coverColor !== undefined)  data.coverColor = body.coverColor;
  if (body.checklist !== undefined)   data.checklist = body.checklist;
  // dueDate arrives as ISO string — convert to Date for Prisma
  if (body.dueDate !== undefined)     data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

  const card = await prisma.card.update({ where: { id }, data });
  return Response.json(card);
};

// DELETE /api/board/cards — delete card (deleteMany is idempotent, no error if already gone)
export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  await prisma.card.deleteMany({ where: { id } });
  return Response.json({ ok: true });
};