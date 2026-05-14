import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

function requireAdmin(locals: any) {
  if (!locals.user?.isAdmin) throw new Error("forbidden");
}

export const GET: APIRoute = async ({ locals }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const configs = await prisma.aiConfig.findMany({ orderBy: { createdAt: "desc" } });
  // Mask API keys — only show last 4 chars
  const masked = configs.map((c) => ({
    ...c,
    apiKey: c.apiKey ? "•".repeat(Math.max(0, c.apiKey.length - 4)) + c.apiKey.slice(-4) : null,
  }));
  return Response.json(masked);
};

export const POST: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { provider, name, apiKey, baseUrl, model, temperature, maxTokens } = await request.json();
  if (!provider || !name?.trim()) return Response.json({ error: "Provider und Name erforderlich" }, { status: 400 });
  const config = await prisma.aiConfig.create({
    data: {
      provider,
      name: name.trim(),
      apiKey: apiKey ?? null,
      baseUrl: baseUrl ?? null,
      model: model ?? null,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 2048,
      isActive: false,
    },
  });
  return Response.json({ ...config, apiKey: config.apiKey ? "•".repeat(Math.max(0, config.apiKey.length - 4)) + config.apiKey.slice(-4) : null });
};

export const PATCH: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id, isActive, apiKey, ...rest } = await request.json();

  // If activating this config, deactivate all others first
  if (isActive === true) {
    await prisma.aiConfig.updateMany({ where: { isActive: true }, data: { isActive: false } });
  }

  const data: Record<string, unknown> = { ...rest };
  if (isActive !== undefined) data.isActive = isActive;
  // Only update apiKey if a non-masked value is provided
  if (apiKey !== undefined && !apiKey.includes("•")) data.apiKey = apiKey;

  const config = await prisma.aiConfig.update({ where: { id }, data });
  return Response.json({ ...config, apiKey: config.apiKey ? "•".repeat(Math.max(0, config.apiKey.length - 4)) + config.apiKey.slice(-4) : null });
};

export const DELETE: APIRoute = async ({ locals, request }) => {
  try { requireAdmin(locals); } catch { return Response.json({ error: "Keine Berechtigung" }, { status: 403 }); }
  const { id } = await request.json();
  await prisma.aiConfig.delete({ where: { id } });
  return Response.json({ ok: true });
};
