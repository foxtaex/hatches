import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// GET /api/user/teams — returns the teams the current user is a member of
// (no admin required — used for scope picker in Board/Docs/Notes)
export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json([], { status: 401 });

  if (user.isAdmin) {
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    });
    return Response.json(teams);
  }

  const memberships = await prisma.teamMembership.findMany({
    where: { userId: user.id },
    include: { team: { select: { id: true, name: true, color: true } } },
  });
  return Response.json(memberships.map((m) => m.team));
};
