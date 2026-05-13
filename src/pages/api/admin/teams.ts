import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

const SECTIONS = ["board", "docs", "notes", "websites", "integrations", "admin"];

export const GET: APIRoute = async ({ locals }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const teams = await prisma.team.findMany({
    orderBy: { priority: "desc" },
    include: { permissions: true, _count: { select: { memberships: true } } },
  });
  return Response.json(teams);
};

export const POST: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { name, description, color, priority, isDefault } = await request.json();
  const team = await prisma.team.create({
    data: {
      name, description, color: color ?? "#6b7280", priority: priority ?? 0, isDefault: isDefault ?? false,
      permissions: {
        create: SECTIONS.map((s) => ({ section: s, canView: false, canCreate: false, canEdit: false, canDelete: false })),
      },
    },
    include: { permissions: true },
  });
  return Response.json(team);
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id, permissions, ...data } = await request.json();
  await prisma.team.update({ where: { id }, data });
  if (permissions) {
    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { teamId_section: { teamId: id, section: perm.section } },
        update: { canView: perm.canView, canCreate: perm.canCreate, canEdit: perm.canEdit, canDelete: perm.canDelete },
        create: { teamId: id, section: perm.section, canView: perm.canView, canCreate: perm.canCreate, canEdit: perm.canEdit, canDelete: perm.canDelete },
      });
    }
  }
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id } = await request.json();
  await prisma.team.delete({ where: { id } });
  return Response.json({ ok: true });
};
