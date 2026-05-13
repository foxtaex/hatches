import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/db";

// GET /api/board/all-columns — all boards with their columns (no cards), for cross-board move picker
export const GET: APIRoute = async () => {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      columns: { orderBy: { position: "asc" }, select: { id: true, title: true } },
    },
  });
  return Response.json(boards);
};