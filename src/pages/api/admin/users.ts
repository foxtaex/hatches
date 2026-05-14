import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { hashPassword } from "../../../lib/auth";

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

export const GET: APIRoute = async ({ locals }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      memberships: {
        include: {
          team: { select: { id: true, name: true, color: true } },
          role: { select: { id: true, name: true, color: true } },
        },
      },
    },
    omit: { passwordHash: true },
  });
  return Response.json(users);
};

export const POST: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { username, email, password, displayName } = await request.json();
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, displayName: displayName || username },
  });
  return Response.json({ id: user.id, username: user.username });
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const currentUser = (locals as any).user;
  const { id, password, invalidateSessions, isOga, ...data } = await request.json();

  // Only Oga can grant/revoke the Oga role
  // Bootstrap: if no Oga exists yet, any admin can claim the role for themselves
  if (isOga !== undefined) {
    if (!currentUser.isOga) {
      const ogaCount = await prisma.user.count({ where: { isOga: true } });
      const isBootstrap = ogaCount === 0 && isOga === true && id === currentUser.id;
      if (!isBootstrap) {
        return Response.json({ error: "Nur Oga kann den Oga-Status vergeben" }, { status: 403 });
      }
    }
    (data as any).isOga = isOga;
  }

  if (password) (data as any).passwordHash = await hashPassword(password);
  if (Object.keys(data).length > 0 || password) {
    await prisma.user.update({ where: { id }, data });
  }
  if (invalidateSessions) {
    await prisma.session.deleteMany({ where: { userId: id } });
  }
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id } = await request.json();
  if (id === (locals as any).user.id) return Response.json({ error: "Eigenen Account nicht löschbar" }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return Response.json({ ok: true });
};
