import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// GET /api/user/profile — current user info
export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  return Response.json({ id: user.id, username: user.username, displayName: user.displayName ?? null });
};

// PATCH /api/user/profile — update displayName
export const PATCH: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return new Response(JSON.stringify({ error: "Nicht angemeldet" }), { status: 401 });

  const { displayName } = await request.json().catch(() => ({}));
  const name = (displayName ?? "").trim();

  await prisma.user.update({
    where: { id: user.id },
    data: { displayName: name || null },
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
};
