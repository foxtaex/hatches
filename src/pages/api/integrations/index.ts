import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async () => {
  const integrations = await prisma.integration.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { issues: true } } },
  });
  return Response.json(integrations);
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const integration = await prisma.integration.create({ data });
  return Response.json(integration);
};
