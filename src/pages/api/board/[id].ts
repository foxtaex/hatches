import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// GET /api/board/[id] — full board with columns + cards
export const GET: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: {
              assignee: { select: { id: true, displayName: true, username: true } },
              externalIssue: { include: { integration: { select: { type: true } } } },
            },
          },
        },
      },
    },
  });
  if (!board) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(board);
};

// PATCH /api/board/[id] — rename board
export const PATCH: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  const { name } = await request.json();
  const board = await prisma.board.update({ where: { id }, data: { name: name.trim() } });
  return Response.json(board);
};

// DELETE /api/board/[id] — delete board (cascades to columns + cards)
export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  const count = await prisma.board.count();
  if (count <= 1) return Response.json({ error: "Letztes Board kann nicht geloescht werden" }, { status: 400 });
  await prisma.board.delete({ where: { id } });
  return Response.json({ ok: true });
};