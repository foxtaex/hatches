import type { APIRoute } from "astro";
import { prisma } from "../../../../lib/db";

interface TemplateCard { title: string; description?: string; priority?: string; labels?: { id: string; name: string; color: string }[] }
interface TemplateColumn { title: string; cards?: TemplateCard[] }
interface TemplateBoard { name: string; columns?: TemplateColumn[] }
interface TemplateDoc { title: string; content?: string }
interface TemplateNote { title: string; content?: string }
interface TemplateContent {
  boards?: TemplateBoard[];
  docs?: TemplateDoc[];
  notes?: TemplateNote[];
}

export const POST: APIRoute = async ({ locals, request, params }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const id = Number(params.id);
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template) return Response.json({ error: "Template nicht gefunden" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const teamId: number | null = body.teamId ? Number(body.teamId) : null;

  let content: TemplateContent = {};
  try {
    content = JSON.parse(template.content);
  } catch {
    return Response.json({ error: "Ungültiges Template-Format" }, { status: 400 });
  }

  const created: { boards: number[]; docs: number[] } = {
    boards: [], docs: [],
  };

  // Create boards
  for (const tBoard of content.boards ?? []) {
    const board = await prisma.board.create({
      data: {
        name: tBoard.name,
        teamId,
        ownerId: user.id,
      },
    });
    created.boards.push(board.id);

    for (let ci = 0; ci < (tBoard.columns ?? []).length; ci++) {
      const tCol = tBoard.columns![ci];
      const col = await prisma.column.create({
        data: { title: tCol.title, position: ci, boardId: board.id },
      });

      for (let ki = 0; ki < (tCol.cards ?? []).length; ki++) {
        const tCard = tCol.cards![ki];
        await prisma.card.create({
          data: {
            title: tCard.title,
            description: tCard.description ?? null,
            position: ki,
            columnId: col.id,
            priority: tCard.priority ?? null,
            labels: tCard.labels ? JSON.stringify(tCard.labels) : "[]",
          },
        });
      }
    }
  }

  // Create docs
  for (const tDoc of content.docs ?? []) {
    const doc = await prisma.doc.create({
      data: {
        title: tDoc.title,
        content: tDoc.content ?? "",
        teamId,
        ownerId: user.id,
      },
    });
    created.docs.push(doc.id);
  }

  // Legacy templates may still contain notes. Import them as docs so their
  // content remains usable after removal of the Notes module.
  for (const tNote of content.notes ?? []) {
    const doc = await prisma.doc.create({
      data: {
        title: tNote.title,
        content: tNote.content ?? "",
        teamId,
        ownerId: user.id,
      },
    });
    created.docs.push(doc.id);
  }

  return Response.json({
    ok: true,
    created,
    // Redirect hint: go to first board if created
    redirect: created.boards.length > 0
      ? `/board?boardId=${created.boards[0]}`
      : created.docs.length > 0
        ? `/docs?id=${created.docs[0]}`
        : null,
  });
};
