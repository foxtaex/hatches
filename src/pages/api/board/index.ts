import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// GET /api/board — list all boards
export const GET: APIRoute = async () => {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { columns: true } } },
  });
  return Response.json(boards);
};

// POST /api/board — create new board
export const POST: APIRoute = async ({ request }) => {
  const { name } = await request.json();
  const board = await prisma.board.create({ data: { name: name?.trim() || "Neues Board" } });
  return Response.json(board);
};