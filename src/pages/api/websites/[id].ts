import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const PATCH: APIRoute = async ({ params, request }) => {
  const data = await request.json();
  const website = await prisma.website.update({
    where: { id: Number(params.id) },
    data,
  });
  return Response.json(website);
};

export const DELETE: APIRoute = async ({ params }) => {
  await prisma.website.delete({ where: { id: Number(params.id) } });
  return Response.json({ ok: true });
};
