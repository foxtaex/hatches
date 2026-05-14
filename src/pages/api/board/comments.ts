import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

const commentInclude = {
  author: { select: { id: true, username: true, displayName: true } },
} as const;

// GET /api/board/comments?cardId=X
export const GET: APIRoute = async ({ url, locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const cardId = Number(url.searchParams.get("cardId"));
  if (!cardId) return Response.json({ error: "cardId fehlt" }, { status: 400 });

  const comments = await prisma.cardComment.findMany({
    where: { cardId },
    include: commentInclude,
    orderBy: { createdAt: "asc" },
  });
  return Response.json(comments);
};

// POST /api/board/comments — create comment
export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { cardId, content } = await request.json();
  if (!content?.trim()) return Response.json({ error: "Inhalt fehlt" }, { status: 400 });
  if (!cardId) return Response.json({ error: "cardId fehlt" }, { status: 400 });

  const comment = await prisma.cardComment.create({
    data: { cardId, authorId: user.id, content: content.trim() },
    include: commentInclude,
  });
  return Response.json(comment);
};

// DELETE /api/board/comments — delete own comment (admin can delete any)
export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { id } = await request.json();
  const comment = await prisma.cardComment.findUnique({ where: { id } });
  if (!comment) return Response.json({ error: "Kommentar nicht gefunden" }, { status: 404 });
  if (comment.authorId !== user.id && !user.isAdmin) {
    return Response.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  await prisma.cardComment.delete({ where: { id } });
  return Response.json({ ok: true });
};
