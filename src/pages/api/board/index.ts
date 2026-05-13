import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async () => {
  const board = await prisma.board.findFirst({
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
  return Response.json(board);
};
