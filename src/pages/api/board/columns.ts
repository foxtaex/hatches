import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// POST — create column
export const POST: APIRoute = async ({ request }) => {
  const { title, boardId } = await request.json();
  const count = await prisma.column.count({ where: { boardId } });
  const column = await prisma.column.create({
    data: { title, boardId, position: count },
    include: { cards: true },
  });
  return Response.json(column);
};

// PATCH — rename column
export const PATCH: APIRoute = async ({ request }) => {
  const { id, title } = await request.json();
  const column = await prisma.column.update({ where: { id }, data: { title } });
  return Response.json(column);
};

// DELETE — delete column
export const DELETE: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  await prisma.column.delete({ where: { id } });
  return Response.json({ ok: true });
};
