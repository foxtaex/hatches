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
      columns: { orderBy: { position: "asc" }, select: { id: true, title: true } },
    },
  });
  return Response.json(boards);
};
