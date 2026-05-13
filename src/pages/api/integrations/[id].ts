import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const PATCH: APIRoute = async ({ params, request }) => {
  const data = await request.json();
  const integration = await prisma.integration.update({ where: { id: Number(params.id) }, data });
  return Response.json(integration);
};

export const DELETE: APIRoute = async ({ params }) => {
  await prisma.integration.delete({ where: { id: Number(params.id) } });
  return Response.json({ ok: true });
};
