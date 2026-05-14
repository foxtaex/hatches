import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// POST /api/docs/import — create doc from uploaded markdown file
export const POST: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim();
  const teamIdStr = formData.get("teamId") as string | null;

  if (!file || !file.name) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const content = await file.text();
  const fileName = file.name.replace(/\.(md|markdown|txt)$/i, "");
  const docTitle = title || fileName || "Importiertes Dokument";
  const teamId = teamIdStr ? Number(teamIdStr) : null;

  const doc = await prisma.doc.create({
    data: {
      title: docTitle,
      content,
      teamId,
      ownerId: user.id,
    },
    include: { team: { select: { id: true, name: true, color: true } } },
  });

  return Response.json(doc, { status: 201 });
};