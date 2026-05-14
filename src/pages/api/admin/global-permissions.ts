import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

const VALID_PERMISSIONS = ["canCreateTeam", "canManageUsers", "canSeeApiKeys", "canManageIntegrations"] as const;

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

export const GET: APIRoute = async ({ locals }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const perms = await prisma.globalPermission.findMany({
    include: {
      user: { select: { id: true, username: true, displayName: true, email: true } },
      grantedBy: { select: { id: true, username: true, displayName: true } },
    },
    orderBy: { grantedAt: "desc" },
  });
  return Response.json(perms);
};

export const POST: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { userId, permission } = await request.json();
  if (!VALID_PERMISSIONS.includes(permission)) {
    return Response.json({ error: "Ungültige Berechtigung" }, { status: 400 });
  }
  const perm = await prisma.globalPermission.upsert({
    where: { userId_permission: { userId, permission } },
    update: { grantedById: (locals as any).user.id, grantedAt: new Date() },
    create: { userId, permission, grantedById: (locals as any).user.id },
    include: {
      user: { select: { id: true, username: true, displayName: true, email: true } },
      grantedBy: { select: { id: true, username: true, displayName: true } },
    },
  });
  return Response.json(perm);
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id } = await request.json();
  await prisma.globalPermission.delete({ where: { id } });
  return Response.json({ ok: true });
};
