import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { accessibleProject } from "../../../lib/projectAccess";

export const POST: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  const body = await request.json().catch(() => ({})) as { projectId?: unknown; name?: unknown };
  const projectId = Number(body.projectId);
  if (!Number.isInteger(projectId) || !await accessibleProject(projectId, user)) {
    return Response.json({ error: "Projekt nicht gefunden" }, { status: 404 });
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "Ordnername erforderlich" }, { status: 400 });
  }
  const existingCount = await prisma.projectFolder.count({ where: { projectId } });
  if (existingCount >= 30) return Response.json({ error: "Maximal 30 Unterordner pro Projekt" }, { status: 400 });
  try {
    const folder = await prisma.projectFolder.create({
      data: { projectId, name: body.name.trim().slice(0, 60), position: existingCount },
    });
    await prisma.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } });
    return Response.json(folder, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return Response.json({ error: "Dieser Ordnername existiert bereits" }, { status: 409 });
    throw error;
  }
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  const body = await request.json().catch(() => ({})) as { id?: unknown; name?: unknown };
  const id = Number(body.id);
  const folder = Number.isInteger(id) ? await prisma.projectFolder.findUnique({ where: { id }, select: { projectId: true } }) : null;
  if (!folder || !await accessibleProject(folder.projectId, user)) return Response.json({ error: "Ordner nicht gefunden" }, { status: 404 });
  if (typeof body.name !== "string" || !body.name.trim()) return Response.json({ error: "Ordnername erforderlich" }, { status: 400 });
  try {
    const updated = await prisma.projectFolder.update({ where: { id }, data: { name: body.name.trim().slice(0, 60) } });
    await prisma.project.update({ where: { id: folder.projectId }, data: { updatedAt: new Date() } });
    return Response.json(updated);
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return Response.json({ error: "Dieser Ordnername existiert bereits" }, { status: 409 });
    throw error;
  }
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  const body = await request.json().catch(() => ({})) as { id?: unknown };
  const id = Number(body.id);
  const folder = Number.isInteger(id) ? await prisma.projectFolder.findUnique({ where: { id }, select: { projectId: true } }) : null;
  if (!folder || !await accessibleProject(folder.projectId, user)) return Response.json({ error: "Ordner nicht gefunden" }, { status: 404 });
  await prisma.projectFolder.delete({ where: { id } });
  await prisma.project.update({ where: { id: folder.projectId }, data: { updatedAt: new Date() } });
  return Response.json({ ok: true });
};
