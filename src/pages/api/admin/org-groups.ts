import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

export const GET: APIRoute = async ({ locals }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const groups = await prisma.orgGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, displayName: true, email: true } },
        },
      },
      _count: { select: { members: true } },
    },
  });
  return Response.json(groups);
};

export const POST: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { name, description, color, lockedRights, normalRights } = await request.json();
  if (!name?.trim()) return Response.json({ error: "Name fehlt" }, { status: 400 });
  const group = await prisma.orgGroup.create({
    data: {
      name: name.trim(),
      description: description ?? null,
      color: color ?? "#6b7280",
      lockedRights: JSON.stringify(lockedRights ?? []),
      normalRights: JSON.stringify(normalRights ?? []),
    },
    include: {
      members: { include: { user: { select: { id: true, username: true, displayName: true, email: true } } } },
      _count: { select: { members: true } },
    },
  });
  return Response.json(group);
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id, name, description, color, lockedRights, normalRights } = await request.json();
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (description !== undefined) data.description = description;
  if (color !== undefined) data.color = color;
  if (lockedRights !== undefined) data.lockedRights = JSON.stringify(lockedRights);
  if (normalRights !== undefined) data.normalRights = JSON.stringify(normalRights);
  const group = await prisma.orgGroup.update({
    where: { id },
    data,
    include: {
      members: { include: { user: { select: { id: true, username: true, displayName: true, email: true } } } },
      _count: { select: { members: true } },
    },
  });
  return Response.json(group);
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id } = await request.json();
  await prisma.orgGroup.delete({ where: { id } });
  return Response.json({ ok: true });
};
