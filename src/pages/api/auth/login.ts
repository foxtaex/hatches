import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";
import { verifyPassword, createSession } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  const { username, password } = await request.json();

  const user = await prisma.user.findFirst({
    where: { OR: [{ username }, { email: username }], isActive: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: "Ungültige Anmeldedaten" }, { status: 401 });
  }

  const sessionId = await createSession(user.id);

  return Response.json(
    { ok: true, user: { id: user.id, username: user.username, displayName: user.displayName, isAdmin: user.isAdmin } },
    {
      headers: {
        "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`,
      },
    }
  );
};
