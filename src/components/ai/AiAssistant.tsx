import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faRobot, faPaperPlane, faSpinner,
  faTriangleExclamation, faArrowTurnDown, faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { marked } from "marked";

// ── Types ─────────────────────────────────────────────────

export type AiContext = "board" | "docs" | "notes";

export interface AiContextData {
  /** Titel des aktuellen Dokuments / Boards / der Notiz */
  title?: string;
  /** Aktueller Inhalt des Editors (wird auf 2000 Zeichen gekürzt) */
  content?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface Props {
  context: AiContext;
  contextData?: AiContextData;
  /** Callback: KI-generierten Text in den Editor einfügen */
  onInsertText?: (text: string) => void;
  onClose: () => void;
}

// ── Quick Actions pro Kontext ─────────────────────────────

const QUICK_ACTIONS: Record<AiContext, { label: string; prompt: string }[]> = {
  docs: [
    { label: "Abschnitt schreiben",  prompt: "Schreib den nächsten Abschnitt basierend auf dem bisherigen Inhalt." },
    { label: "Zusammenfassen",       prompt: "Fasse den aktuellen Inhalt in 3–5 Sätzen zusammen." },
    { label: "Verbessern",           prompt: "Verbessere den Schreibstil des aktuellen Inhalts ohne den Sinn zu ändern." },
    { label: "Gliederung erstellen", prompt: "Erstelle eine strukturierte Gliederung (Markdown-Überschriften) für dieses Dokument." },
  ],
  notes: [
    { label: "Notiz strukturieren",       prompt: "Strukturiere diese Notiz mit sinnvollen Überschriften und Aufzählungen." },
    { label: "Zusammenfassen",            prompt: "Fasse die wichtigsten Punkte dieser Notiz zusammen." },
    { label: "Aktionspunkte extrahieren", prompt: "Extrahiere alle Aktionspunkte und To-dos aus dieser Notiz als Checkliste." },
    { label: "Ideen ausarbeiten",         prompt: "Arbeite die Ideen in dieser Notiz weiter aus und ergänze relevante Details." },
  ],
  board: [
    { label: "Sprint planen",         prompt: "Schlage eine Sprint-Board-Struktur vor (Spalten + typische Aufgaben-Karten)." },
    { label: "Karten generieren",     prompt: "Generiere 5 konkrete Aufgaben-Karten mit Titel und kurzer Beschreibung für dieses Board." },
    { label: "Aufgabe ausformulieren", prompt: "Formuliere eine detaillierte Aufgabenbeschreibung im Markdown-Format." },
    { label: "Retrospektive",         prompt: "Erstelle Fragen für eine Sprint-Retrospektive (Was lief gut? Was verbessern? Aktionen?)." },
  ],
};

const CONTEXT_LABELS: Record<AiContext, string> = {
  docs:  "Docs",
  notes: "Notizen",
  board: "Board",
};

// ── Component ─────────────────────────────────────────────

export function AiAssistant({ context, contextData, onInsertText, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check provider on mount
  useEffect(() => {
    marked.setOptions({ breaks: true, gfm: true });
    fetch("/api/admin/ai")
      .then(r => r.json())
      .then((configs: { isActive: boolean }[]) => {
        setHasProvider(Array.isArray(configs) && configs.some(c => c.isActive));
      })
      .catch(() => setHasProvider(false));
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context,
          contextData: {
            title: contextData?.title,
            content: contextData?.content?.slice(0, 2000),
          },
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.error ?? data.content ?? "Keine Antwort erhalten.",
        timestamp: new Date(),
        error: !!data.error,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Verbindungsfehler. Bitte versuche es erneut.",
        timestamp: new Date(),
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, context, contextData]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }

  function renderMarkdown(content: string) {
    try {
      return { __html: marked.parse(content) as string };
    } catch {
      return { __html: content };
    }
  }

  const quickActions = QUICK_ACTIONS[context];
  const title = contextData?.title ? `— ${contextData.title}` : "";

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: "320px",
        background: "rgba(14,14,16,0.98)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: "rgba(60,199,154,0.15)" }}
          >
            <FontAwesomeIcon icon={faRobot} className="w-3.5 h-3.5" style={{ color: "#3CC79A" }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.88)", lineHeight: 1.2 }}>
              KI-Assistent
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {CONTEXT_LABELS[context]} {title}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseOver={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              onMouseOut={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              title="Verlauf löschen"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseOut={e => (e.currentTarget.style.background = "transparent")}
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* No provider warning */}
      {hasProvider === false && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 mx-3 mt-3 rounded-xl flex-shrink-0"
          style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#f97316" }} />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            Kein KI-Provider aktiv.{" "}
            <a href="/admin" className="underline" style={{ color: "#f97316" }}>
              In Einstellungen konfigurieren
            </a>
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="px-3 pt-3 flex-shrink-0">
          <p className="text-xs mb-2 px-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Schnell-Aktionen
          </p>
          <div className="flex flex-col gap-1.5">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => send(action.prompt)}
                disabled={loading || hasProvider === false}
                className="text-left px-3 py-2 rounded-xl text-sm transition-all disabled:opacity-40"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.7)",
                }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(60,199,154,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(60,199,154,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.role === "user" ? (
              <div
                className="max-w-[90%] px-3 py-2 rounded-2xl text-sm"
                style={{
                  background: "rgba(60,199,154,0.15)",
                  border: "1px solid rgba(60,199,154,0.2)",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div className="w-full">
                <div
                  className={`px-3 py-2.5 rounded-2xl text-sm prose prose-invert prose-sm max-w-none ${msg.error ? "border" : ""}`}
                  style={{
                    background: msg.error ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                    border: msg.error ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    color: msg.error ? "#ef4444" : "rgba(255,255,255,0.82)",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                />
                {/* Insert button for successful assistant messages */}
                {!msg.error && onInsertText && (
                  <button
                    onClick={() => onInsertText(msg.content)}
                    className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                    style={{ color: "rgba(60,199,154,0.8)" }}
                    onMouseOver={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(60,199,154,0.1)";
                      (e.currentTarget as HTMLElement).style.color = "#3CC79A";
                    }}
                    onMouseOut={e => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(60,199,154,0.8)";
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowTurnDown} className="w-2.5 h-2.5" />
                    In Editor einfügen
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" style={{ color: "#3CC79A" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Generiert…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 px-3 pb-3 pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl p-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Frage stellen oder Aufgabe beschreiben…"
            rows={1}
            disabled={loading || hasProvider === false}
            className="flex-1 bg-transparent outline-none resize-none text-sm placeholder:text-white/25 disabled:opacity-50"
            style={{
              color: "rgba(255,255,255,0.88)",
              maxHeight: "160px",
              lineHeight: "1.5",
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading || hasProvider === false}
            className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg transition-all disabled:opacity-30"
            style={{ background: "#3CC79A" }}
            onMouseOver={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#34b389"; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "#3CC79A"; }}
          >
            {loading
              ? <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin text-white" />
              : <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3 text-white" />
            }
          </button>
        </div>
        <p className="text-center mt-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>
          Enter senden · Shift+Enter neue Zeile
        </p>
      </div>
    </div>
  );
}
