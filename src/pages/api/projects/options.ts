import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  const teamIds = user.isAdmin ? null : (user.memberships ?? []).map((membership: { teamId: number }) => membership.teamId);
  const visibility = user.isAdmin ? {} : { OR: [{ teamId: { in: teamIds ?? [] } }, { teamId: null, ownerId: user.id }] };

  const [boards, docs] = await Promise.all([
    prisma.board.findMany({
      where: visibility,
      orderBy: { name: "asc" },
      select: { id: true, name: true, projectItem: { select: { id: true, projectId: true } } },
    }),
    prisma.doc.findMany({
      where: visibility,
      orderBy: { title: "asc" },
      select: { id: true, title: true, projectItem: { select: { id: true, projectId: true } } },
    }),
  ]);
  return Response.json({ boards, docs });
};
