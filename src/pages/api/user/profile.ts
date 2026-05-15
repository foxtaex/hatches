import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

// GET /api/user/profile — current user info
export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  return Response.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName ?? null,
    bio: user.bio ?? null,
  });
};

// PATCH /api/user/profile — update displayName and/or bio
export const PATCH: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return new Response(JSON.stringify({ error: "Nicht angemeldet" }), { status: 401 });

  const body = await request.json().catch(() => ({})) as { displayName?: string; bio?: string };
  const data: { displayName?: string | null; bio?: string | null } = {};

  if ("displayName" in body) data.displayName = (body.displayName ?? "").trim() || null;
  if ("bio" in body) data.bio = (body.bio ?? "").trim() || null;

  if (Object.keys(data).length > 0) {
    await prisma.user.update({ where: { id: user.id }, data });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
};
