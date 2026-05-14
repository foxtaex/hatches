import type { APIRoute } from "astro";
import { prisma } from "../../lib/db";

export const GET: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";

  if (q.length < 2) {
    return new Response(
      JSON.stringify({ cards: [], docs: [], notes: [], boards: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const [cards, docs, notes, boards] = await Promise.all([
    prisma.card.findMany({
      where: {
        isArchived: false,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        columnId: true,
        isArchived: true,
        column: {
          select: {
            board: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      take: 5,
    }),
    prisma.doc.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        teamId: true,
        team: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      take: 5,
    }),
    prisma.note.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        teamId: true,
        team: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      take: 5,
    }),
    prisma.board.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
      },
      take: 5,
    }),
  ]);

  return new Response(JSON.stringify({ cards, docs, notes, boards }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
