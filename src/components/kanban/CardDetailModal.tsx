import { useState, useEffect, useRef } from "react";
import { renderMarkdown } from "../../lib/markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark, faUser, faCalendar, faTag, faFlag,
  faPlus, faTrash, faBoxArchive, faCheck, faPen,
  faCircleCheck, faDroplet, faMessage, faFileLines, faPaperclip, faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import type { Card, CardLabel, ChecklistItem } from "./types";
import {
  parseLabels, parseChecklist, PRIORITY_CONFIG, LABEL_COLORS
} from "./types";

interface User {
  id: number;
  displayName: string | null;
  username: string;
}

interface DocOption {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

interface Props {
  card: Card;
  users: User[];
  columnName: string;
  currentUserId: number | null;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<Card>) => Promise<boolean>;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
}

const COVER_COLORS = [
  "#1e1b4b", "#172554", "#14532d", "#422006", "#450a0a",
  "#3b0764", "#0c4a6e", "#064e3b", "#713f12", "#881337",
  "#3CC79A", "#6366f1", "#f97316", "#ef4444", "#8b5cf6",
];

export function CardDetailModal({ card, users, columnName, currentUserId, onClose, onUpdate, onDelete, onArchive }: Props) {
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.description ?? "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [labels, setLabels] = useState<CardLabel[]>(parseLabels(card.labels));
  const [checklist, setChecklist] = useState<ChecklistItem[]>(parseChecklist(card.checklist));
  const [newCheckItem, setNewCheckItem] = useState("");
  const [addingCheckItem, setAddingCheckItem] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [docs, setDocs] = useState<DocOption[]>([]);
  const [docLinkError, setDocLinkError] = useState("");
  const [linkedDocId, setLinkedDocId] = useState<number | null>(card.linkedDocId);
  const [linkedDocMode, setLinkedDocMode] = useState<"description" | "attachment" | null>(card.linkedDocMode);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Comments
  interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: { id: number; username: string; displayName: string | null };
  }
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // Load comments on mount
  useEffect(() => {
    fetch(`/api/board/comments?cardId=${card.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setComments(data); });
  }, [card.id]);

  useEffect(() => {
    fetch("/api/docs")
      .then((response) => response.ok ? response.json() : [])
      .then((data) => { if (Array.isArray(data)) setDocs(data); });
  }, []);

  const linkedDoc = docs.find((doc) => doc.id === linkedDocId) ??
    (card.linkedDoc?.id === linkedDocId ? card.linkedDoc : null);
  const linkedDocHtml = linkedDoc && linkedDocMode === "description"
    ? renderMarkdown(linkedDoc.content)
    : "";

  async function updateDocLink(linkedDocId: number | null, linkedDocMode: "description" | "attachment" | null) {
    setDocLinkError("");
    const selectedDoc = docs.find((doc) => doc.id === linkedDocId) ?? null;
    try {
      const ok = await onUpdate(card.id, { linkedDocId, linkedDocMode, linkedDoc: selectedDoc } as Partial<Card>);
      if (!ok) throw new Error("Dokument konnte nicht verknüpft werden");
      setLinkedDocId(linkedDocId);
      setLinkedDocMode(linkedDocMode);
    } catch (error) {
      setDocLinkError(error instanceof Error ? error.message : "Dokument konnte nicht verknüpft werden");
    }
  }

  async function submitComment() {
    const text = newComment.trim();
    if (!text || submittingComment) return;
    setSubmittingComment(true);
    const res = await fetch("/api/board/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id, content: text }),
    });
    if (res.ok) {
      const created: Comment = await res.json();
      setComments((prev) => [...prev, created]);
      setNewComment("");
    }
    setSubmittingComment(false);
  }

  async function deleteComment(id: number) {
    const res = await fetch("/api/board/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  function formatCommentDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" }) +
      " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  function patch(data: Partial<Card>) {
    void onUpdate(card.id, data);
  }

  function saveTitle() {
    const t = title.trim();
    if (!t) { setTitle(card.title); setEditingTitle(false); return; }
    patch({ title: t });
    setEditingTitle(false);
  }

  function saveDesc() {
    patch({ description: desc || null });
    setEditingDesc(false);
  }

  function saveLabels(next: CardLabel[]) {
    setLabels(next);
    patch({ labels: JSON.stringify(next) } as any);
  }

  function saveChecklist(next: ChecklistItem[]) {
    setChecklist(next);
    patch({ checklist: JSON.stringify(next) } as any);
  }

  function addLabel() {
    if (!newLabelName.trim()) return;
    const next: CardLabel[] = [
      ...labels,
      { id: Date.now().toString(), name: newLabelName.trim(), color: newLabelColor }
    ];
    saveLabels(next);
    setNewLabelName("");
    setShowLabelPicker(false);
  }

  function removeLabel(id: string) {
    saveLabels(labels.filter(l => l.id !== id));
  }

  function addCheckItem() {
    const t = newCheckItem.trim();
    if (!t) return;
    const next: ChecklistItem[] = [
      ...checklist,
      { id: Date.now().toString(), text: t, done: false }
    ];
    saveChecklist(next);
    setNewCheckItem("");
  }

  function toggleCheckItem(id: string) {
    saveChecklist(checklist.map(i => i.id === id ? { ...i, done: !i.done } : i));
  }

  function removeCheckItem(id: string) {
    saveChecklist(checklist.filter(i => i.id !== id));
  }

  const doneCount = checklist.filter(i => i.done).length;
  const checkProgress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;

  const dueDateObj = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDateObj ? dueDateObj < new Date() : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-[rgba(18,18,20,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Cover */}
        {card.coverColor && (
          <div className="h-16 flex-shrink-0" style={{ background: card.coverColor }} />
        )}

        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">{columnName}</p>
            {editingTitle ? (
              <textarea
                ref={titleRef}
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveTitle(); } if (e.key === "Escape") { setTitle(card.title); setEditingTitle(false); } }}
                className="w-full bg-transparent text-white/95 text-xl font-semibold resize-none outline-none border-b border-[rgba(60,199,154,0.5)] pb-1 leading-snug"
                rows={2}
              />
            ) : (
              <h2
                className="text-xl font-semibold text-white/95 leading-snug cursor-pointer hover:text-white transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                {card.title}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-white/40 hover:text-white/80 transition-colors mt-0.5"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-6 pb-3">
            {labels.map(l => (
              <span
                key={l.id}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: l.color + "30", color: l.color, border: `1px solid ${l.color}50` }}
                onClick={() => removeLabel(l.id)}
                title="Klicken zum Entfernen"
              >
                {l.name}
                <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5 opacity-60" />
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faPen} className="w-3 h-3 text-white/30" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Beschreibung</span>
              </div>
              {linkedDocMode === "description" && linkedDoc ? (
                <div className="rounded-xl border border-[rgba(60,199,154,0.18)] bg-[rgba(60,199,154,0.04)] px-4 py-3">
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                    <span className="flex min-w-0 items-center gap-2 text-xs text-[#3CC79A]">
                      <FontAwesomeIcon icon={faFileLines} className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{linkedDoc.title}</span>
                    </span>
                    <a href={`/docs?id=${linkedDoc.id}`} className="text-white/30 hover:text-white/70" title="Dokument öffnen">
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="markdown-preview text-sm" dangerouslySetInnerHTML={{ __html: linkedDocHtml }} />
                </div>
              ) : editingDesc ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    autoFocus
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    rows={4}
                    placeholder="Beschreibung hinzufügen…"
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white/90 text-sm rounded-xl px-4 py-3 outline-none focus:border-[rgba(60,199,154,0.4)] resize-none transition-colors placeholder:text-white/25"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveDesc} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3CC79A] hover:bg-[#34b389] text-white text-xs font-medium transition-colors">
                      <FontAwesomeIcon icon={faCheck} className="w-3 h-3" /> Speichern
                    </button>
                    <button onClick={() => { setDesc(card.description ?? ""); setEditingDesc(false); }} className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="min-h-[56px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-sm cursor-pointer transition-colors"
                >
                  {desc
                    ? <p className="text-white/75 leading-relaxed whitespace-pre-wrap">{desc}</p>
                    : <p className="text-white/25 italic">Beschreibung hinzufügen…</p>
                  }
                </div>
              )}
            </div>

            {linkedDocMode === "attachment" && linkedDoc && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPaperclip} className="h-3 w-3 text-white/30" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Anhang</span>
                </div>
                <a
                  href={`/docs?id=${linkedDoc.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 hover:bg-white/[0.07]"
                >
                  <FontAwesomeIcon icon={faFileLines} className="h-4 w-4 text-[#3CC79A]" />
                  <span className="flex-1 truncate text-sm text-white/75">{linkedDoc.title}</span>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3 text-white/30" />
                </a>
              </div>
            )}

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-3 h-3 text-white/30" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Checkliste</span>
                  {checklist.length > 0 && (
                    <span className="text-xs text-white/40">{doneCount}/{checklist.length}</span>
                  )}
                </div>
              </div>

              {checklist.length > 0 && (
                <div className="mb-3">
                  <div className="h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${checkProgress}%`, background: checkProgress === 100 ? "#3CC79A" : "#6366f1" }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {checklist.map(item => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <button
                          onClick={() => toggleCheckItem(item.id)}
                          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                            item.done
                              ? "bg-[#3CC79A] border-[#3CC79A]"
                              : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
                          }`}
                        >
                          {item.done && <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5 text-white" />}
                        </button>
                        <span className={`flex-1 text-sm transition-colors ${item.done ? "line-through text-white/30" : "text-white/80"}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => removeCheckItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {addingCheckItem ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newCheckItem}
                    onChange={e => setNewCheckItem(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { addCheckItem(); } if (e.key === "Escape") { setAddingCheckItem(false); setNewCheckItem(""); } }}
                    placeholder="Aufgabe hinzufügen…"
                    className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white/90 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[rgba(60,199,154,0.4)] placeholder:text-white/25 transition-colors"
                  />
                  <button onClick={addCheckItem} className="px-3 py-1.5 rounded-lg bg-[#3CC79A] hover:bg-[#34b389] text-white text-xs transition-colors">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                  </button>
                  <button onClick={() => { setAddingCheckItem(false); setNewCheckItem(""); }} className="px-2 text-white/30 hover:text-white/60 transition-colors">
                    <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCheckItem(true)}
                  className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  Aufgabe hinzufügen
                </button>
              )}
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon icon={faMessage} className="w-3 h-3 text-white/30" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Kommentare
                </span>
                {comments.length > 0 && (
                  <span className="text-xs text-white/30">{comments.length}</span>
                )}
              </div>

              {/* Comment list */}
              {comments.length > 0 && (
                <div className="flex flex-col gap-3 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="group flex gap-2.5">
                      {/* Avatar */}
                      <span className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {(c.author.displayName ?? c.author.username)[0].toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-white/70">
                            {c.author.displayName ?? c.author.username}
                          </span>
                          <span className="text-[10px] text-white/25">
                            {formatCommentDate(c.createdAt)}
                          </span>
                          {currentUserId === c.author.id && (
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 ml-auto text-white/20 hover:text-red-400 transition-all flex-shrink-0"
                              title="Löschen"
                            >
                              <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap break-words">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New comment input */}
              <div className="flex gap-2 items-end">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); }
                  }}
                  placeholder="Kommentar schreiben… (Enter zum Senden)"
                  rows={2}
                  className="flex-1 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(60,199,154,0.35)] text-white/80 text-sm rounded-xl px-3 py-2.5 outline-none resize-none placeholder:text-white/20 transition-colors"
                />
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#3CC79A] hover:bg-[#34b389] disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                  title="Senden"
                >
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar — Properties */}
          <div className="w-52 flex-shrink-0 border-l border-[rgba(255,255,255,0.07)] px-4 py-5 flex flex-col gap-4 overflow-y-auto">

            {/* Assignee */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faUser} className="w-3 h-3" /> Zugewiesen
              </p>
              <select
                value={card.assigneeId ?? ""}
                onChange={e => patch({ assigneeId: e.target.value ? Number(e.target.value) : null })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white/80 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-[rgba(60,199,154,0.4)] transition-colors"
              >
                <option value="">Niemand</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.displayName || u.username}</option>
                ))}
              </select>
            </div>

            {/* Linked document */}
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                <FontAwesomeIcon icon={faFileLines} className="h-3 w-3" /> Dokument
              </p>
              <select
                value={linkedDocId ?? ""}
                onChange={(event) => updateDocLink(event.target.value ? Number(event.target.value) : null, event.target.value ? (linkedDocMode ?? "attachment") : null)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-2.5 py-2 text-xs text-white/80 outline-none focus:border-[rgba(60,199,154,0.4)]"
              >
                <option value="">Kein Dokument</option>
                {docs.map((doc) => <option key={doc.id} value={doc.id}>{doc.title}</option>)}
              </select>
              {linkedDocId && (
                <div className="mt-1.5 grid grid-cols-2 gap-1">
                  <button
                    onClick={() => updateDocLink(linkedDocId, "description")}
                    className={`rounded-md px-1.5 py-1 text-[10px] ${linkedDocMode === "description" ? "bg-[rgba(60,199,154,0.15)] text-[#3CC79A]" : "bg-white/[0.04] text-white/35 hover:text-white/60"}`}
                  >
                    Beschreibung
                  </button>
                  <button
                    onClick={() => updateDocLink(linkedDocId, "attachment")}
                    className={`rounded-md px-1.5 py-1 text-[10px] ${linkedDocMode === "attachment" ? "bg-[rgba(60,199,154,0.15)] text-[#3CC79A]" : "bg-white/[0.04] text-white/35 hover:text-white/60"}`}
                  >
                    Anhang
                  </button>
                </div>
              )}
              {docLinkError && <p className="mt-1 text-[10px] text-red-400">{docLinkError}</p>}
            </div>

            {/* Priority */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faFlag} className="w-3 h-3" /> Priorität
              </p>
              <select
                value={card.priority ?? ""}
                onChange={e => patch({ priority: e.target.value || null })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white/80 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-[rgba(60,199,154,0.4)] transition-colors"
              >
                <option value="">Keine</option>
                <option value="low">🟢 Niedrig</option>
                <option value="medium">🟡 Mittel</option>
                <option value="high">🟠 Hoch</option>
                <option value="urgent">🔴 Dringend</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" /> Fällig am
              </p>
              <input
                type="date"
                value={card.dueDate ? card.dueDate.slice(0, 10) : ""}
                onChange={e => patch({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null } as any)}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white/80 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-[rgba(60,199,154,0.4)] transition-colors"
              />
              {dueDateObj && (
                <p className={`text-[10px] mt-1 ${isOverdue ? "text-red-400" : "text-white/30"}`}>
                  {isOverdue ? "⚠ Überfällig" : `In ${Math.ceil((dueDateObj.getTime() - Date.now()) / 86400000)} Tagen`}
                </p>
              )}
            </div>

            {/* Labels */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faTag} className="w-3 h-3" /> Labels
              </p>
              <div className="flex flex-col gap-1.5">
                {labels.map(l => (
                  <div key={l.id} className="flex items-center gap-2 group">
                    <span
                      className="flex-1 text-xs px-2 py-0.5 rounded-md font-medium truncate"
                      style={{ background: l.color + "25", color: l.color }}
                    >
                      {l.name}
                    </span>
                    <button onClick={() => removeLabel(l.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all flex-shrink-0">
                      <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
              {showLabelPicker ? (
                <div className="mt-2 flex flex-col gap-2">
                  <input
                    autoFocus
                    value={newLabelName}
                    onChange={e => setNewLabelName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addLabel(); if (e.key === "Escape") setShowLabelPicker(false); }}
                    placeholder="Label Name"
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white/90 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[rgba(60,199,154,0.4)] transition-colors placeholder:text-white/25"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {LABEL_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewLabelColor(c)}
                        className={`w-5 h-5 rounded-full transition-all ${newLabelColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-[rgba(18,18,20,0.98)] scale-110" : "hover:scale-110"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={addLabel} className="flex-1 text-xs py-1 rounded-lg bg-[#3CC79A] hover:bg-[#34b389] text-white transition-colors">
                      Hinzufügen
                    </button>
                    <button onClick={() => setShowLabelPicker(false)} className="px-2 text-white/30 hover:text-white/60 transition-colors">
                      <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLabelPicker(true)}
                  className="mt-1.5 flex items-center gap-1.5 text-[10px] text-white/35 hover:text-white/60 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" /> Label hinzufügen
                </button>
              )}
            </div>

            {/* Cover Color */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faDroplet} className="w-3 h-3" /> Cover
              </p>
              {showCoverPicker ? (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {COVER_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => { patch({ coverColor: c }); setShowCoverPicker(false); }}
                        className={`w-6 h-6 rounded-md transition-all hover:scale-110 ${card.coverColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-[rgba(18,18,20,0.98)]" : ""}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  {card.coverColor && (
                    <button
                      onClick={() => { patch({ coverColor: null }); setShowCoverPicker(false); }}
                      className="text-[10px] text-white/35 hover:text-red-400 transition-colors text-left"
                    >
                      Cover entfernen
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowCoverPicker(true)}
                  className={`w-full h-7 rounded-lg border border-[rgba(255,255,255,0.1)] transition-colors hover:border-[rgba(255,255,255,0.2)] text-xs text-white/30`}
                  style={card.coverColor ? { background: card.coverColor } : {}}
                >
                  {!card.coverColor && "Farbe wählen"}
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(255,255,255,0.07)]" />

            {/* Actions */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { onArchive(card.id); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-[rgba(255,255,255,0.06)] transition-colors text-left"
              >
                <FontAwesomeIcon icon={faBoxArchive} className="w-3.5 h-3.5" /> Archivieren
              </button>
              <button
                onClick={() => { if (confirm("Karte wirklich löschen?")) { onDelete(card.id); onClose(); } }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400/70 hover:text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-colors text-left"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /> Löschen
              </button>
            </div>

            {/* External Issue */}
            {card.externalIssue && (
              <div className="text-[10px] text-white/25 border-t border-[rgba(255,255,255,0.07)] pt-3 mt-1">
                <span className="uppercase tracking-wider">{card.externalIssue.integration.type}</span>
                {" "}#{card.externalIssue.externalId}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
