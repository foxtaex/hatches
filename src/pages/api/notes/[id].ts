import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const PATCH: APIRoute = async ({ params, request }) => {
  const data = await request.json();
  const note = await prisma.note.update({
    where: { id: Number(params.id) },
    data,
  });
  return Response.json(note);
};

export const DELETE: APIRoute = async ({ params }) => {
  await prisma.note.deleteMany({ where: { id: Number(params.id) } });
  return Response.json({ ok: true });
};
