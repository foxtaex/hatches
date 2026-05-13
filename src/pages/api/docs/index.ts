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
  const docs = await prisma.doc.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { team: { select: { id: true, name: true, color: true } } },
  });
  return Response.json(docs);
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  const { title, teamId } = await request.json();
  const doc = await prisma.doc.create({
    data: {
      title: title?.trim() || "Neues Dokument",
      teamId: teamId ?? null,
      ownerId: user.id,
    },
    include: { team: { select: { id: true, name: true, color: true } } },
  });
  return Response.json(doc);
};
