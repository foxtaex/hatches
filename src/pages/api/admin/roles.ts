import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

const SECTIONS = ["board", "docs", "notes", "websites", "integrations", "admin"];

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

export const GET: APIRoute = async ({ locals }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const roles = await prisma.role.findMany({
    orderBy: { priority: "desc" },
    include: { permissions: true, _count: { select: { memberships: true } } },
  });
  return Response.json(roles);
};

export const POST: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { name, description, color, isDefault, priority } = await request.json();
  const role = await prisma.role.create({
    data: {
      name, description, color: color ?? "#6b7280",
      isDefault: isDefault ?? false, priority: priority ?? 0,
      permissions: {
        create: SECTIONS.map((s) => ({ section: s, canView: false, canCreate: false, canEdit: false, canDelete: false })),
      },
    },
    include: { permissions: true, _count: { select: { memberships: true } } },
  });
  return Response.json(role);
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id, permissions, ...data } = await request.json();
  if (Object.keys(data).length > 0) {
    await prisma.role.update({ where: { id }, data });
  }
  if (permissions) {
    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { roleId_section: { roleId: id, section: perm.section } },
        update: { canView: perm.canView, canCreate: perm.canCreate, canEdit: perm.canEdit, canDelete: perm.canDelete },
        create: { roleId: id, section: perm.section, canView: perm.canView, canCreate: perm.canCreate, canEdit: perm.canEdit, canDelete: perm.canDelete },
      });
    }
  }
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id } = await request.json();
  const count = await prisma.role.count();
  if (count <= 1) return Response.json({ error: "Mindestens eine Rolle muss bestehen bleiben" }, { status: 400 });
  await prisma.role.deleteMany({ where: { id } });
  return Response.json({ ok: true });
};
