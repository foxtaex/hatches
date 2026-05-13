import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async () => {
  const docs = await prisma.doc.findMany({ orderBy: { updatedAt: "desc" } });
  return Response.json(docs);
};

export const POST: APIRoute = async ({ request }) => {
  const { title } = await request.json();
  const doc = await prisma.doc.create({ data: { title } });
  return Response.json(doc);
};
