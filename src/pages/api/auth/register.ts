import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { hashPassword, createSession, countUsers, createFirstAdmin } from "../../../lib/auth";
import { getSessionCookie, getSession } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  const { username, email, password, displayName } = await request.json();

  if (!username || !email || !password || password.length < 6) {
    return Response.json({ error: "Ungültige Eingabe" }, { status: 400 });
  }

  const total = await countUsers();

  // Erster User: wird Admin, kein Auth nötig
  if (total === 0) {
    const user = await createFirstAdmin(username, email, password);
    const sessionId = await createSession(user.id);
    return Response.json(
      { ok: true },
      { headers: { "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}` } }
    );
  }

  // Weitere User: nur Admins dürfen registrieren
  const sessionId = getSessionCookie(request.headers.get("cookie"));
  const session = await getSession(sessionId);
  if (!session?.user.isAdmin) {
    return Response.json({ error: "Nur Admins können User anlegen" }, { status: 403 });
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (existing) return Response.json({ error: "Username oder E-Mail bereits vergeben" }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, displayName: displayName || username },
  });

  return Response.json({ ok: true, user: { id: user.id, username: user.username } });
};
