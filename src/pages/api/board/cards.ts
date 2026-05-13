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

// PATCH /api/board/cards — update card
export const PATCH: APIRoute = async ({ request }) => {
  const { id, ...data } = await request.json();
  const card = await prisma.card.update({ where: { id }, data });
  return Response.json(card);
};

// DELETE /api/board/cards — delete card (deleteMany is idempotent, no error if already gone)
export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  await prisma.card.deleteMany({ where: { id } });
  return Response.json({ ok: true });
};