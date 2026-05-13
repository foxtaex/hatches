import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// POST /api/board/cards — create card
export const POST: APIRoute = async ({ request }) => {
  const { title, columnId } = await request.json();
  const count = await prisma.card.count({ where: { columnId } });
  const card = await prisma.card.create({
    data: { title, columnId, position: count },
  });
  return Response.json(card);
};

// PATCH /api/board/cards — update card (title, description, position, columnId)
export const PATCH: APIRoute = async ({ request }) => {
  const { id, ...data } = await request.json();
  const card = await prisma.card.update({ where: { id }, data });
  return Response.json(card);
};

// DELETE /api/board/cards — delete card
export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  await prisma.card.delete({ where: { id } });
  return Response.json({ ok: true });
};
