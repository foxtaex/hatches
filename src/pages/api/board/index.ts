import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

async function visibilityWhere(userId: number, isAdmin: boolean) {
  if (isAdmin) return {};
  const memberships = await prisma.teamMembership.findMany({
    where: { userId },
    select: { teamId: true },
  });
  const teamIds = memberships.map((m) => m.teamId);
  return { OR: [{ teamId: { in: teamIds } }, { teamId: null, ownerId: userId }] };
}

export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  const where = await visibilityWhere(user.id, user.isAdmin);
  const boards = await prisma.board.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { columns: true } },
      team: { select: { id: true, name: true, color: true } },
    },
  });
  return Response.json(boards);
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  try {
    const { name, teamId } = await request.json();
    const selectedTeamId = teamId == null ? null : Number(teamId);
    if (selectedTeamId !== null && !Number.isInteger(selectedTeamId)) {
      return Response.json({ error: "Ungültiges Team" }, { status: 400 });
    }

    if (selectedTeamId !== null && !user.isAdmin) {
      const isMember = await prisma.teamMembership.findUnique({
        where: { userId_teamId: { userId: user.id, teamId: selectedTeamId } },
        select: { id: true },
      });
      if (!isMember) return Response.json({ error: "Keine Berechtigung für dieses Team" }, { status: 403 });
    }

    const board = await prisma.board.create({
      data: {
        name: typeof name === "string" && name.trim() ? name.trim() : "Neues Board",
        teamId: selectedTeamId,
        ownerId: user.id,
      },
      include: {
        _count: { select: { columns: true } },
        team: { select: { id: true, name: true, color: true } },
      },
    });
    return Response.json(board, { status: 201 });
  } catch (error) {
    console.error("Board creation failed", error);
    return Response.json({ error: "Board konnte nicht erstellt werden" }, { status: 500 });
  }
};
