import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

export const POST: APIRoute = async ({ locals, request }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { messages, configId } = await request.json();
  if (!messages?.length) return Response.json({ error: "Keine Nachrichten" }, { status: 400 });

  // Load active config (or specified config)
  const config = configId
    ? await prisma.aiConfig.findUnique({ where: { id: configId } })
    : await prisma.aiConfig.findFirst({ where: { isActive: true } });

  if (!config) return Response.json({ error: "Kein aktiver KI-Provider konfiguriert" }, { status: 503 });

  const baseUrl = config.baseUrl ?? getDefaultBaseUrl(config.provider);
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (config.provider === "anthropic") {
    headers["x-api-key"] = config.apiKey ?? "";
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${config.apiKey ?? ""}`;
  }

  try {
    let body: unknown;
    let endpoint: string;

    if (config.provider === "anthropic") {
      endpoint = `${baseUrl}/v1/messages`;
      body = {
        model: config.model ?? "claude-3-5-haiku-20241022",
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages,
      };
    } else {
      // OpenAI-compatible (openai, deepseek, minimax, ollama, custom)
      endpoint = `${baseUrl}/v1/chat/completions`;
      body = {
        model: config.model ?? "gpt-4o-mini",
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        messages,
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `Provider-Fehler: ${res.status} — ${err}` }, { status: 502 });
    }

    const data = await res.json();

    // Normalize response to { content: string }
    let content = "";
    if (config.provider === "anthropic") {
      content = data.content?.[0]?.text ?? "";
    } else {
      content = data.choices?.[0]?.message?.content ?? "";
    }

    return Response.json({ content, provider: config.provider, model: config.model });
  } catch (e) {
    return Response.json({ error: "Verbindungsfehler zum KI-Provider" }, { status: 502 });
  }
};

function getDefaultBaseUrl(provider: string): string {
  switch (provider) {
    case "anthropic": return "https://api.anthropic.com";
    case "openai": return "https://api.openai.com";
    case "google": return "https://generativelanguage.googleapis.com";
    case "deepseek": return "https://api.deepseek.com";
    case "minimax": return "https://api.minimax.chat";
    case "ollama": return "http://localhost:11434";
    default: return "";
  }
}
