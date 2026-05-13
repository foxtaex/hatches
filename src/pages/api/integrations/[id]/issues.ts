import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/db";

export const GET: APIRoute = async ({ params }) => {
  const issues = await prisma.externalIssue.findMany({
    where: { integrationId: Number(params.id) },
    orderBy: { importedAt: "desc" },
  });
  return Response.json(issues);
};

// POST: Issue als Karte importieren
export const POST: APIRoute = async ({ params, request }) => {
  const { issueId, columnId } = await request.json();
  const issue = await prisma.externalIssue.findUniqueOrThrow({ where: { id: issueId } });
  if (issue.cardId) return Response.json({ error: "Bereits als Karte importiert" }, { status: 409 });

  const count = await prisma.card.count({ where: { columnId } });
  const card = await prisma.card.create({
    data: {
      title: issue.title,
      description: issue.description,
      position: count,
      columnId,
    },
  });
  await prisma.externalIssue.update({ where: { id: issueId }, data: { cardId: card.id } });
  return Response.json(card);
};
