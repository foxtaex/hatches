import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// GET /api/board/[id] — full board with columns + cards
// Query params: ?includeArchived=1 to also show archived cards
export const GET: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  const includeArchived = new URL(request.url).searchParams.get("includeArchived") === "1";

  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            where: includeArchived ? {} : { isArchived: false },
            orderBy: { position: "asc" },
            include: {
              assignee: { select: { id: true, displayName: true, username: true } },
              externalIssue: { include: { integration: { select: { type: true } } } },
              linkedDoc: { select: { id: true, title: true, content: true, updatedAt: true } },
            },
          },
        },
      },
    },
  });
  if (!board) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(board);
};

// PATCH /api/board/[id] — update board settings
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const id = Number(params.id);
  const user = (locals as any).user;
  if (!Number.isInteger(id)) return Response.json({ error: "Ungültiges Board" }, { status: 400 });

  const current = await prisma.board.findUnique({ where: { id }, select: { id: true, ownerId: true, teamId: true } });
  if (!current) return Response.json({ error: "Board nicht gefunden" }, { status: 404 });

  const body = await request.json().catch(() => ({})) as { name?: unknown; teamId?: unknown };
  const data: { name?: string; teamId?: number | null } = {};

  if ("name" in body) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return Response.json({ error: "Name erforderlich" }, { status: 400 });
    }
    data.name = body.name.trim().slice(0, 80);
  }

  if ("teamId" in body) {
    const selectedTeamId = body.teamId === null || body.teamId === "" ? null : Number(body.teamId);
    if (selectedTeamId !== null && !Number.isInteger(selectedTeamId)) {
      return Response.json({ error: "Ungültiges Team" }, { status: 400 });
    }

    if (!user.isAdmin && selectedTeamId === null && current.ownerId !== user.id) {
      return Response.json({ error: "Nur der Board-Besitzer kann es auf privat stellen" }, { status: 403 });
    }

    if (!user.isAdmin && selectedTeamId !== null) {
      const membership = await prisma.teamMembership.findUnique({
        where: { userId_teamId: { userId: user.id, teamId: selectedTeamId } },
        select: { id: true },
      });
      if (!membership) return Response.json({ error: "Keine Berechtigung für dieses Team" }, { status: 403 });
    }
    data.teamId = selectedTeamId;
  }

  const board = await prisma.board.update({
    where: { id },
    data,
    include: {
      _count: { select: { columns: true } },
      team: { select: { id: true, name: true, color: true } },
    },
  });
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
