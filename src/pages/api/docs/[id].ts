import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async ({ params }) => {
  const doc = await prisma.doc.findUniqueOrThrow({
    where: { id: Number(params.id) },
  });
  return Response.json(doc);
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const data = await request.json();
  const doc = await prisma.doc.update({
    where: { id: Number(params.id) },
    data,
  });
  return Response.json(doc);
};

export const DELETE: APIRoute = async ({ params }) => {
  await prisma.doc.delete({ where: { id: Number(params.id) } });
  return Response.json({ ok: true });
};
