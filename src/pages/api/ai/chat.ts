import type { APIRoute } from "astro";
import { prisma } from "../../../lib/db";

type AiContext = "board" | "docs" | "general";

interface ContextData {
  title?: string;
  content?: string;
}

function buildSystemPrompt(context: AiContext, data?: ContextData): string {
  const title = data?.title ? `"${data.title}"` : "Unbekannt";
  const contentHint = data?.content
    ? `\n\nAktueller Inhalt (Auszug):\n${data.content.slice(0, 2000)}`
    : "";

  switch (context) {
    case "board":
      return `Du bist ein KI-Assistent für Hatches, ein selbst gehosteter Team-Workspace.\nDer Nutzer arbeitet am Kanban-Board ${title}.\nHilf bei: Sprint-Planung, Aufgaben-Breakdown, Projekt-Management, Karten-Texten und Team-Koordination.\nAntworte auf Deutsch (oder der Sprache des Nutzers). Formatiere als Markdown.`;

    case "docs":
      return `Du bist ein KI-Schreibassistent für Hatches.\nDer Nutzer bearbeitet das Dokument ${title}.${contentHint}\nHilf beim Schreiben, Verbessern, Zusammenfassen und Übersetzen von Inhalten.\nAntworte in sauberem Markdown-Format ohne zusätzliche Erklärungen, wenn konkrete Textgenerierung gefragt ist.`;

    default:
      return `Du bist ein hilfreicher KI-Assistent für Hatches, einen selbst gehosteten Team-Workspace.\nAntworte hilfreich, präzise und auf Deutsch (oder der Sprache des Nutzers).`;
  }
}

export const POST: APIRoute = async ({ locals, request }) => {
  if (!(locals as any).user) return Response.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { messages, configId, context, contextData } = await request.json();
  if (!messages?.length) return Response.json({ error: "Keine Nachrichten" }, { status: 400 });

  // Prepend system message for context-aware responses
  const systemPrompt = buildSystemPrompt(context ?? "general", contextData);
  const messagesWithSystem = [
    { role: "system" as const, content: systemPrompt },
    ...messages,
  ];

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
      // Anthropic uses a separate `system` field, not a system role in messages
      endpoint = `${baseUrl}/v1/messages`;
      body = {
        model: config.model ?? "claude-3-5-haiku-20241022",
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        system: systemPrompt,
        messages: messages.filter((m: { role: string }) => m.role !== "system"),
      };
    } else {
      // OpenAI-compatible (openai, deepseek, minimax, ollama, custom)
      endpoint = `${baseUrl}/v1/chat/completions`;
      body = {
        model: config.model ?? "gpt-4o-mini",
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        messages: messagesWithSystem,
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
