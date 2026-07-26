import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { accessibleProject, canAccessBoard, canAccessDoc } from "../../../lib/projectAccess";

async function validFolder(folderId: number | null, projectId: number) {
  if (folderId === null) return true;
  return Boolean(await prisma.projectFolder.findFirst({ where: { id: folderId, projectId }, select: { id: true } }));
}

export const POST: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  const body = await request.json().catch(() => ({})) as { projectId?: unknown; folderId?: unknown; type?: unknown; targetId?: unknown };
  const projectId = Number(body.projectId);
  const targetId = Number(body.targetId);
  const folderId = body.folderId === null || body.folderId === "" || body.folderId === undefined ? null : Number(body.folderId);
  if (!Number.isInteger(projectId) || !await accessibleProject(projectId, user)) return Response.json({ error: "Projekt nicht gefunden" }, { status: 404 });
  if (!Number.isInteger(targetId) || (folderId !== null && !Number.isInteger(folderId)) || !await validFolder(folderId, projectId)) {
    return Response.json({ error: "Ungültige Auswahl" }, { status: 400 });
  }
  if (body.type !== "board" && body.type !== "doc") return Response.json({ error: "Inhaltstyp noch nicht unterstützt" }, { status: 400 });

  const allowed = body.type === "board" ? await canAccessBoard(targetId, user) : await canAccessDoc(targetId, user);
  if (!allowed) return Response.json({ error: "Inhalt nicht gefunden" }, { status: 404 });

  try {
    const item = await prisma.projectItem.create({
      data: {
        type: body.type,
        projectId,
        folderId,
        boardId: body.type === "board" ? targetId : null,
        docId: body.type === "doc" ? targetId : null,
      },
      include: { board: { select: { id: true, name: true } }, doc: { select: { id: true, title: true } } },
    });
    await prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
    return Response.json(item, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return Response.json({ error: "Dieser Inhalt ist bereits mit einem Projekt verknüpft" }, { status: 409 });
    throw error;
  }
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  const body = await request.json().catch(() => ({})) as { id?: unknown; folderId?: unknown };
  const id = Number(body.id);
  const item = Number.isInteger(id) ? await prisma.projectItem.findUnique({ where: { id }, select: { projectId: true } }) : null;
  if (!item || !await accessibleProject(item.projectId, user)) return Response.json({ error: "Verknüpfung nicht gefunden" }, { status: 404 });
  const folderId = body.folderId === null || body.folderId === "" ? null : Number(body.folderId);
  if ((folderId !== null && !Number.isInteger(folderId)) || !await validFolder(folderId, item.projectId)) {
    return Response.json({ error: "Ungültiger Unterordner" }, { status: 400 });
  }
  const updated = await prisma.projectItem.update({ where: { id }, data: { folderId } });
  await prisma.project.update({ where: { id: item.projectId }, data: { updatedAt: new Date() } });
  return Response.json(updated);
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  const body = await request.json().catch(() => ({})) as { id?: unknown };
  const id = Number(body.id);
  const item = Number.isInteger(id) ? await prisma.projectItem.findUnique({ where: { id }, select: { projectId: true } }) : null;
  if (!item || !await accessibleProject(item.projectId, user)) return Response.json({ error: "Verknüpfung nicht gefunden" }, { status: 404 });
  await prisma.projectItem.delete({ where: { id } });
  await prisma.project.update({ where: { id: item.projectId }, data: { updatedAt: new Date() } });
  return Response.json({ ok: true });
};
