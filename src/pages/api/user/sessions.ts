import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { getSessionCookie } from "../../../lib/auth";

export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const sessions = await prisma.session.findMany({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, expiresAt: true },
  });

  return Response.json(sessions);
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { id } = await request.json();

  // Make sure the session belongs to this user
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session || session.userId !== user.id) {
    return Response.json({ error: "Sitzung nicht gefunden" }, { status: 404 });
  }

  await prisma.session.delete({ where: { id } });
  return Response.json({ ok: true });
};
