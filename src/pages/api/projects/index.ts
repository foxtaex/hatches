import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { canUseTeam, projectVisibilityWhere } from "../../../lib/projectAccess";

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

export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  const projects = await prisma.project.findMany({
    where: projectVisibilityWhere(user),
    orderBy: { updatedAt: "desc" },
    include: projectInclude,
  });
  return Response.json(projects);
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  const body = await request.json().catch(() => ({})) as { name?: unknown; teamId?: unknown; description?: unknown };
  if (typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "Projektname erforderlich" }, { status: 400 });
  }
  const teamId = body.teamId === null || body.teamId === "" || body.teamId === undefined ? null : Number(body.teamId);
  if (teamId !== null && (!Number.isInteger(teamId) || !canUseTeam(teamId, user))) {
    return Response.json({ error: "Keine Berechtigung für dieses Team" }, { status: 403 });
  }
  const project = await prisma.project.create({
    data: {
      name: body.name.trim().slice(0, 80),
      description: typeof body.description === "string" ? body.description.trim().slice(0, 500) || null : null,
      teamId,
      ownerId: user.id,
    },
    include: projectInclude,
  });
  return Response.json(project, { status: 201 });
};
