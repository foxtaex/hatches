import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { hashPassword, verifyPassword } from "../../../lib/auth";

// POST /api/user/password — change own password
export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) return err("Nicht angemeldet", 401);

  const { current, next } = await request.json().catch(() => ({}));
  if (!current || !next) return err("Aktuelles und neues Passwort erforderlich");
  if ((next as string).length < 6) return err("Neues Passwort muss mindestens 6 Zeichen haben");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return err("Benutzer nicht gefunden", 404);

  const ok = await verifyPassword(current, dbUser.passwordHash);
  if (!ok) return err("Aktuelles Passwort falsch");

  const hash = await hashPassword(next);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
};

function err(error: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error }), { status, headers: { "Content-Type": "application/json" } });
}
