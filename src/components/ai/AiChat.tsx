import { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane, faRobot, faUser, faSpinner, faTrash,
  faGear, faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { marked } from "marked";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface AiStatus {
  hasProvider: boolean;
  provider?: string;
  model?: string;
}

const SYSTEM_SUGGESTIONS = [
  "Erkläre kurz was Hatches ist",
  "Hilf mir beim Schreiben eines Markdown-Dokuments",
  "Erstelle eine Sprint-Planung für ein Software-Projekt",
  "Was sind Best Practices für Kanban-Boards?",
];

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    marked.setOptions({ breaks: true, gfm: true });
    checkProvider();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function checkProvider() {
    try {
      const res = await fetch("/api/admin/ai");
      const configs = await res.json();
      const active = Array.isArray(configs) ? configs.find((c: { isActive: boolean }) => c.isActive) : null;
      setStatus({
        hasProvider: !!active,
        provider: active?.provider,
        model: active?.model,
      });
    } catch {
      setStatus({ hasProvider: false });
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Resize textarea back
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error, timestamp: new Date(), error: true }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content, timestamp: new Date() }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant", content: "Verbindungsfehler. Bitte versuche es erneut.", timestamp: new Date(), error: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }

  function clearChat() {
    if (messages.length === 0) return;
    setMessages([]);
  }

  function renderContent(content: string) {
    try {
      return { __html: marked.parse(content) as string };
    } catch {
      return { __html: content };
    }
  }

  function formatTime(d: Date) {
    return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  if (status === null) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
        <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!status.hasProvider) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
          <FontAwesomeIcon icon={faRobot} className="w-8 h-8 text-white/20" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white/80 mb-1">Kein KI-Provider konfiguriert</h2>
          <p className="text-sm text-white/40 max-w-sm">
            Um den KI-Chat zu nutzen, muss zuerst ein Provider eingerichtet werden.
          </p>
        </div>
        <a
          href="/admin"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[rgba(60,199,154,0.15)] text-[#3CC79A] border border-[rgba(60,199,154,0.3)] hover:bg-[rgba(60,199,154,0.25)] transition-colors"
        >
          <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5" />
          Admin → KI-Provider konfigurieren
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[rgba(60,199,154,0.15)] flex items-center justify-center">
            <FontAwesomeIcon icon={faRobot} className="w-4 h-4 text-[#3CC79A]" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white/90">KI-Assistent</span>
            {status.provider && (
              <span className="ml-2 text-xs text-white/30">
                {status.provider}{status.model ? ` · ${status.model}` : ""}
              </span>
            )}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
            Chat leeren
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(60,199,154,0.12)] flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faRobot} className="w-7 h-7 text-[#3CC79A]" />
              </div>
              <h3 className="text-base font-semibold text-white/80 mb-1">Wie kann ich helfen?</h3>
              <p className="text-sm text-white/35">Stell mir eine Frage oder wähle einen Vorschlag.</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {SYSTEM_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="text-left text-sm px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-white/50 hover:text-white/80 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === "user"
                    ? "bg-[rgba(60,199,154,0.2)] text-[#3CC79A]"
                    : msg.error
                      ? "bg-[rgba(239,68,68,0.15)] text-red-400"
                      : "bg-[rgba(255,255,255,0.08)] text-white/50"
                }`}>
                  <FontAwesomeIcon
                    icon={msg.role === "user" ? faUser : msg.error ? faTriangleExclamation : faRobot}
                    className="w-3.5 h-3.5"
                  />
                </div>

                {/* Bubble */}
                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[rgba(60,199,154,0.15)] text-white/90 rounded-tr-sm"
                      : msg.error
                        ? "bg-[rgba(239,68,68,0.1)] text-red-300 border border-[rgba(239,68,68,0.2)] rounded-tl-sm"
                        : "bg-[rgba(255,255,255,0.06)] text-white/85 rounded-tl-sm"
                  }`}>
                    {msg.role === "user" ? (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      <div
                        className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2 prose-li:my-0.5 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800"
                        dangerouslySetInnerHTML={renderContent(msg.content)}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-white/20 px-1">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[rgba(255,255,255,0.08)]">
                  <FontAwesomeIcon icon={faRobot} className="w-3.5 h-3.5 text-white/50" />
                </div>
                <div className="bg-[rgba(255,255,255,0.06)] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl px-4 py-3 focus-within:border-[rgba(60,199,154,0.4)] transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Schreibe eine Nachricht… (Enter zum Senden, Shift+Enter für neue Zeile)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/25 outline-none resize-none leading-relaxed"
              style={{ minHeight: "24px", maxHeight: "200px" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#3CC79A] hover:bg-[#34b389] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-white/20 text-center mt-2">KI kann Fehler machen — kritische Informationen prüfen</p>
        </div>
      </div>
    </div>
  );
}
