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
  const { id, password, ...data } = await request.json();
  if (password) (data as any).passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id }, data });
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id } = await request.json();
  if (id === (locals as any).user.id) return Response.json({ error: "Eigenen Account nicht löschbar" }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return Response.json({ ok: true });
};
