import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/db";

// GET /api/docs/[id]/export — download doc as .md file
export const GET: APIRoute = async ({ params }) => {
  const doc = await prisma.doc.findUniqueOrThrow({
    where: { id: Number(params.id) },
  });
  const filename = `${doc.title.replace(/[^a-z0-9äöüÄÖÜß\s-]/gi, "").trim() || "document"}.md`;
  const blob = new Blob([doc.content], { type: "text/markdown;charset=utf-8" });
  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
  });
  return new Response(blob, { status: 200, headers });
};