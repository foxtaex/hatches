import { defineMiddleware } from "astro:middleware";
import { getSession, getSessionCookie, countUsers } from "./lib/auth";
import { can, type Section } from "./lib/permissions";

const PUBLIC_PATHS = ["/login", "/setup", "/api/auth/login", "/api/auth/register", "/api/setup/"];
const SECTION_MAP: Record<string, Section> = {
  "/board":     "board",
  "/docs":      "docs",
  "/planner":   "planner",
  "/templates": "templates",
  "/admin":     "admin",
};

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Setup-Redirect: Noch keine User (oder DB noch nicht eingerichtet) → /setup
  const isSetupPath = pathname === "/setup" || pathname.startsWith("/api/setup/") || pathname.startsWith("/api/auth");
  if (!isSetupPath) {
    let userCount = 0;
    try { userCount = await countUsers(); } catch { /* DB tables don't exist yet */ }
    if (userCount === 0) return context.redirect("/setup");
  }

  // Öffentliche Routen
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return next();

  // Session prüfen
  const sessionId = getSessionCookie(context.request.headers.get("cookie"));
  const session = await getSession(sessionId);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Nicht angemeldet" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return context.redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  // User in context
  (context.locals as any).user = session.user;
  (context.locals as any).sessionId = session.id;

  // Berechtigungs-Check für bekannte Sections
  const section = Object.entries(SECTION_MAP).find(([prefix]) => pathname.startsWith(prefix))?.[1];
  if (section && !can(session.user as any, section, "view")) {
    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Keine Berechtigung" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    return context.redirect("/board");
  }

  return next();
});
