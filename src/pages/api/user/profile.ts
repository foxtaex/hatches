import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

const AVATAR_ICONS = new Set(["user", "code", "robot", "rocket", "ghost", "cat"]);
const MAX_AVATAR_BYTES = 300 * 1024;

function normalizeAvatar(value: unknown): { valid: true; value: string | null } | { valid: false } {
  if (value === null || value === "") return { valid: true, value: null };
  if (typeof value !== "string") return { valid: false };

  if (value.startsWith("icon:")) {
    const icon = value.slice(5);
    return AVATAR_ICONS.has(icon) ? { valid: true, value: `icon:${icon}` } : { valid: false };
  }

  const match = value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return { valid: false };

  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_AVATAR_BYTES) return { valid: false };

  const mime = match[1];
  const isPng = mime === "png" && bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = mime === "jpeg" && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = mime === "webp" && bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if (!isPng && !isJpeg && !isWebp) return { valid: false };

  return { valid: true, value };
}

// GET /api/user/profile — current user info
export const GET: APIRoute = async ({ locals }) => {
  const user = (locals as any).user;
  if (!user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });
  return Response.json({
    id: user.id,
    username: user.username,
    displayName: user.displayName ?? null,
    bio: user.bio ?? null,
    avatar: user.avatar ?? null,
  });
};

// PATCH /api/user/profile — update displayName and/or bio
export const PATCH: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return new Response(JSON.stringify({ error: "Nicht angemeldet" }), { status: 401 });

  const body = await request.json().catch(() => ({})) as { displayName?: string; bio?: string; avatar?: unknown };
  const data: { displayName?: string | null; bio?: string | null; avatar?: string | null } = {};

  if ("displayName" in body) data.displayName = (body.displayName ?? "").trim() || null;
  if ("bio" in body) data.bio = (body.bio ?? "").trim() || null;
  if ("avatar" in body) {
    const avatar = normalizeAvatar(body.avatar);
    if (!avatar.valid) return Response.json({ error: "Ungültiges Profilbild oder Icon" }, { status: 400 });
    data.avatar = avatar.value;
  }

  if (Object.keys(data).length > 0) {
    await prisma.user.update({ where: { id: user.id }, data });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
};
