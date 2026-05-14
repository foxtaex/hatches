import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// GET /api/board/archive — list archived cards
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const boardId = url.searchParams.get("boardId");

  const where: Record<string, unknown> = { isArchived: true };
  if (boardId) {
    where.column = { boardId: Number(boardId) };
  }

  const cards = await prisma.card.findMany({
    where,
    include: {
      column: { include: { board: true } },
      assignee: { select: { id: true, displayName: true, username: true } },
      archive: true,
    },
    orderBy: { archivedAt: "desc" },
  });

  return Response.json(cards);
};

// POST /api/board/archive — archive a card
export const POST: APIRoute = async ({ request }) => {
  const { cardId, reason } = await request.json();
  const userId = Number(request.headers.get("x-user-id") || "0");

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return Response.json({ error: "Card not found" }, { status: 404 });

  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      archive: {
        create: {
          archivedById: userId || null,
          reason: reason || null,
        },
      },
    },
    include: {
      column: { include: { board: true } },
      archive: true,
    },
  });

  return Response.json(updated);
};

// DELETE /api/board/archive — restore (unarchive) a card
export const DELETE: APIRoute = async ({ request }) => {
  const { cardId } = await request.json();

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { archive: true },
  });
  if (!card) return Response.json({ error: "Card not found" }, { status: 404 });

  const restored = await prisma.card.update({
    where: { id: cardId },
    data: {
      isArchived: false,
      archivedAt: null,
    },
  });

  // delete archive record
  await prisma.archive.deleteMany({ where: { cardId } });

  return Response.json(restored);
};