import type { APIRoute } from "astro";
import { prisma } from "../../../../../lib/db";

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

export const POST: APIRoute = async ({ locals, request, params }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const orgGroupId = Number(params.id);
  const { userId } = await request.json();
  const member = await prisma.orgGroupMember.upsert({
    where: { userId_orgGroupId: { userId, orgGroupId } },
    update: {},
    create: { userId, orgGroupId },
    include: { user: { select: { id: true, username: true, displayName: true, email: true } } },
  });
  return Response.json(member);
};

export const DELETE: APIRoute = async ({ locals, request, params }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const orgGroupId = Number(params.id);
  const { userId } = await request.json();
  await prisma.orgGroupMember.deleteMany({ where: { userId, orgGroupId } });
  return Response.json({ ok: true });
};
