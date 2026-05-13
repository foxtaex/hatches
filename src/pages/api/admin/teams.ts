import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

export const GET: APIRoute = async ({ locals }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: {
      memberships: {
        include: {
          user: { select: { id: true, username: true, displayName: true } },
          role: { select: { id: true, name: true, color: true } },
        },
      },
    },
  });
  return Response.json(teams);
};

export const POST: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { name, description, color } = await request.json();
  const team = await prisma.team.create({
    data: { name, description, color: color ?? "#6b7280" },
    include: {
      memberships: {
        include: {
          user: { select: { id: true, username: true, displayName: true } },
          role: { select: { id: true, name: true, color: true } },
        },
      },
    },
  });
  return Response.json(team);
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id, ...data } = await request.json();
  await prisma.team.update({ where: { id }, data });
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id } = await request.json();
  await prisma.team.deleteMany({ where: { id } });
  return Response.json({ ok: true });
};
