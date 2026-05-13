import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async () => {
  const websites = await prisma.website.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return Response.json(websites);
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const website = await prisma.website.create({ data });
  return Response.json(website);
};
