import type { APIRoute } from "astro";
import { deleteSession, getSessionCookie } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  const sessionId = getSessionCookie(request.headers.get("cookie"));
  if (sessionId) await deleteSession(sessionId);
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": "session=; Path=/; HttpOnly; Max-Age=0" } }
  );
};
