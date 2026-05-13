import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const GET: APIRoute = async () => {
  const notes = await prisma.note.findMany({ orderBy: { updatedAt: "desc" } });
  return Response.json(notes);
};

export const POST: APIRoute = async ({ request }) => {
  const { title } = await request.json();
  const note = await prisma.note.create({ data: { title } });
  return Response.json(note);
};
