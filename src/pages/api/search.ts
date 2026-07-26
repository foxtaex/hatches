import type { APIRoute } from "astro";
import { prisma } from "../../lib/db";
import { projectVisibilityWhere } from "../../lib/projectAccess";

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
      JSON.stringify({ cards: [], docs: [], boards: [], projects: [], events: [], templates: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const teamIds = user.isAdmin
    ? []
    : (await prisma.teamMembership.findMany({
        where: { userId: user.id },
        select: { teamId: true },
      })).map((membership) => membership.teamId);
  const contentVisibility: any = user.isAdmin
    ? {}
    : { OR: [{ teamId: { in: teamIds } }, { teamId: null, ownerId: user.id }] };
  const eventVisibility: any = user.isAdmin
    ? {}
    : { OR: [{ teamId: { in: teamIds } }, { teamId: null, createdById: user.id }] };

  const [cards, docs, boards, projects, events, templates] = await Promise.all([
    prisma.card.findMany({
      where: {
        isArchived: false,
        column: { board: contentVisibility },
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
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
            board: { select: { id: true, name: true } },
          },
        },
      },
      take: 5,
    }),
    prisma.doc.findMany({
      where: {
        AND: [
          contentVisibility,
          { OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ] },
        ],
      },
      select: {
        id: true, title: true, teamId: true,
        team: { select: { name: true, color: true } },
      },
      take: 5,
    }),
    prisma.board.findMany({
      where: { AND: [contentVisibility, { name: { contains: q } }] },
      select: { id: true, name: true },
      take: 5,
    }),
    prisma.project.findMany({
      where: {
        AND: [
          projectVisibilityWhere(user),
          { OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ] },
        ],
      },
      select: { id: true, name: true, description: true },
      take: 5,
    }),
    prisma.event.findMany({
      where: {
        AND: [
          eventVisibility,
          { OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ] },
        ],
      },
      select: {
        id: true, title: true, start: true, color: true,
        team: { select: { name: true, color: true } },
      },
      take: 5,
    }),
    prisma.template.findMany({
      where: {
        isPublic: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      },
      select: { id: true, name: true, icon: true, category: true },
      take: 5,
    }),
  ]);

  return new Response(JSON.stringify({ cards, docs, boards, projects, events, templates }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
