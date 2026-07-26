import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

async function visibleBoardIds(user: { id: number; isAdmin: boolean }) {
  if (user.isAdmin) {
    return (await prisma.board.findMany({ select: { id: true } })).map((board) => board.id);
  }
  const memberships = await prisma.teamMembership.findMany({
    where: { userId: user.id },
    select: { teamId: true },
  });
  return (await prisma.board.findMany({
    where: {
      OR: [
        { ownerId: user.id, teamId: null },
        { teamId: { in: memberships.map((membership) => membership.teamId) } },
      ],
    },
    select: { id: true },
  })).map((board) => board.id);
}

// GET /api/board/archive — list archived cards from one visible source board
export const GET: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const rawBoardId = new URL(request.url).searchParams.get("boardId");
  const boardId = rawBoardId === null ? null : Number(rawBoardId);
  if (boardId !== null && !Number.isInteger(boardId)) {
    return Response.json({ error: "Ungültiges Board" }, { status: 400 });
  }

  const boardIds = await visibleBoardIds(user);
  if (boardId !== null && !boardIds.includes(boardId)) {
    return Response.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const cards = await prisma.card.findMany({
    where: {
      isArchived: true,
      column: { boardId: boardId ?? { in: boardIds } },
    },
    include: {
      column: { include: { board: true } },
      assignee: { select: { id: true, displayName: true, username: true } },
      archive: true,
    },
    orderBy: { archivedAt: "desc" },
  });

  return Response.json(cards);
};

// POST /api/board/archive — archive a visible card
export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const { cardId, reason } = await request.json();
  const id = Number(cardId);
  if (!Number.isInteger(id)) return Response.json({ error: "Ungültige Karte" }, { status: 400 });

  const boardIds = await visibleBoardIds(user);
  const card = await prisma.card.findFirst({
    where: { id, column: { boardId: { in: boardIds } } },
    include: { column: { include: { board: true } } },
  });
  if (!card) return Response.json({ error: "Karte nicht gefunden" }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    if (!card.isArchived) {
      await tx.card.updateMany({
        where: { columnId: card.columnId, isArchived: false, position: { gt: card.position } },
        data: { position: { decrement: 1 } },
      });
    }
    return tx.card.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archive: {
          upsert: {
            create: { archivedById: user.id, reason: typeof reason === "string" ? reason : null },
            update: { archivedById: user.id, reason: typeof reason === "string" ? reason : null, archivedAt: new Date() },
          },
        },
      },
      include: {
        column: { include: { board: true } },
        assignee: { select: { id: true, displayName: true, username: true } },
        archive: true,
      },
    });
  });

  return Response.json(updated);
};

// DELETE /api/board/archive — restore an archived card into a visible target column
export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  const body = await request.json();
  const cardId = Number(body.cardId);
  if (!Number.isInteger(cardId)) return Response.json({ error: "Ungültige Karte" }, { status: 400 });

  const boardIds = await visibleBoardIds(user);
  const card = await prisma.card.findFirst({
    where: { id: cardId, isArchived: true, column: { boardId: { in: boardIds } } },
  });
  if (!card) return Response.json({ error: "Archivierte Karte nicht gefunden" }, { status: 404 });

  if (body.permanently === true) {
    await prisma.card.delete({ where: { id: cardId } });
    return Response.json({ ok: true });
  }

  const requestedColumnId = body.targetColumnId === undefined ? card.columnId : Number(body.targetColumnId);
  const targetColumn = await prisma.column.findFirst({
    where: { id: requestedColumnId, boardId: { in: boardIds } },
    select: { id: true },
  });
  if (!targetColumn) return Response.json({ error: "Zielspalte nicht gefunden" }, { status: 404 });

  const activeCount = await prisma.card.count({ where: { columnId: targetColumn.id, isArchived: false } });
  const requestedPosition = Number(body.newPosition);
  const newPosition = Number.isInteger(requestedPosition)
    ? Math.max(0, Math.min(requestedPosition, activeCount))
    : activeCount;

  const restored = await prisma.$transaction(async (tx) => {
    await tx.card.updateMany({
      where: { columnId: targetColumn.id, isArchived: false, position: { gte: newPosition } },
      data: { position: { increment: 1 } },
    });
    const result = await tx.card.update({
      where: { id: cardId },
      data: {
        columnId: targetColumn.id,
        position: newPosition,
        isArchived: false,
        archivedAt: null,
      },
    });
    await tx.archive.deleteMany({ where: { cardId } });
    return result;
  });

  return Response.json(restored);
};
