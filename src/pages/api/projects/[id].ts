import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { accessibleProject, canUseTeam } from "../../../lib/projectAccess";

const projectInclude = {
  team: { select: { id: true, name: true, color: true } },
  folders: { orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }] },
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      board: { select: { id: true, name: true } },
      doc: { select: { id: true, title: true } },
    },
  },
};

export const PATCH: APIRoute = async ({ params, locals, request }) => {
  const id = Number(params.id);
  const user = (locals as any).user;
  const current = Number.isInteger(id) ? await accessibleProject(id, user) : null;
  if (!current) return Response.json({ error: "Projekt nicht gefunden" }, { status: 404 });

  const body = await request.json().catch(() => ({})) as { name?: unknown; description?: unknown; dueDate?: unknown; teamId?: unknown };
  const data: { name?: string; description?: string | null; dueDate?: Date | null; teamId?: number | null } = {};
  if ("name" in body) {
    if (typeof body.name !== "string" || !body.name.trim()) return Response.json({ error: "Projektname erforderlich" }, { status: 400 });
    data.name = body.name.trim().slice(0, 80);
  }
  if ("description" in body) data.description = typeof body.description === "string" ? body.description.trim().slice(0, 500) || null : null;
  if ("dueDate" in body) {
    if (body.dueDate === null || body.dueDate === "") {
      data.dueDate = null;
    } else if (typeof body.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) {
      const dueDate = new Date(`${body.dueDate}T12:00:00.000Z`);
      if (Number.isNaN(dueDate.getTime())) return Response.json({ error: "Ungültiges Fälligkeitsdatum" }, { status: 400 });
      data.dueDate = dueDate;
    } else {
      return Response.json({ error: "Ungültiges Fälligkeitsdatum" }, { status: 400 });
    }
  }
  if ("teamId" in body) {
    const teamId = body.teamId === null || body.teamId === "" ? null : Number(body.teamId);
    if (teamId !== null && (!Number.isInteger(teamId) || !canUseTeam(teamId, user))) {
      return Response.json({ error: "Keine Berechtigung für dieses Team" }, { status: 403 });
    }
    if (teamId === null && !user.isAdmin && current.ownerId !== user.id) {
      return Response.json({ error: "Nur der Projekt-Besitzer kann es auf privat stellen" }, { status: 403 });
    }
    data.teamId = teamId;
  }

  const project = await prisma.project.update({ where: { id }, data, include: projectInclude });
  return Response.json(project);
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const id = Number(params.id);
  const user = (locals as any).user;
  const current = Number.isInteger(id) ? await accessibleProject(id, user) : null;
  if (!current) return Response.json({ error: "Projekt nicht gefunden" }, { status: 404 });
  if (!user.isAdmin && current.ownerId !== user.id) return Response.json({ error: "Keine Berechtigung" }, { status: 403 });
  await prisma.project.delete({ where: { id } });
  return Response.json({ ok: true });
};
