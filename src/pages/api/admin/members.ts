import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

// Add / update membership
export const POST: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { teamId, userId, roleId } = await request.json();
  const membership = await prisma.teamMembership.upsert({
    where: { userId_teamId: { userId, teamId } },
    update: { roleId },
    create: { userId, teamId, roleId },
  });
  return Response.json(membership);
};

// Change role in team
export const PATCH: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { teamId, userId, roleId } = await request.json();
  await prisma.teamMembership.updateMany({ where: { userId, teamId }, data: { roleId } });
  return Response.json({ ok: true });
};

// Remove from team
export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { teamId, userId } = await request.json();
  await prisma.teamMembership.deleteMany({ where: { userId, teamId } });
  return Response.json({ ok: true });
};
