import { MarkdownEditor } from "./MarkdownEditor";
import { TemplateModal } from "../templates/TemplateModal";
import { AiAssistant } from "../ai/AiAssistant";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faLock, faCheck, faFileImport, faFileExport, faEye, faPenToSquare, faCode, faLayerGroup, faRobot } from "@fortawesome/free-solid-svg-icons";

interface TeamOption { id: number; name: string; color: string }
interface Doc {
  id: number;
  title: string;
  content: string;
  teamId: number | null;
  team: TeamOption | null;
  updatedAt: string;
}

export function DocsEditor() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [userTeams, setUserTeams] = useState<TeamOption[]>([]);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "live">("preview");

  // Create form state
  const [creating, setCreating] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createTeamId, setCreateTeamId] = useState<string>("");
  const createRef = useRef(false);
  const [importing, setImporting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [importTeamId, setImportTeamId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadDocs(); loadUserTeams(); }, []);

  async function loadDocs() {
    const res = await fetch("/api/docs");
    const data: Doc[] = await res.json();
    setDocs(data);
    if (data.length === 0) return;
    const urlId = Number(new URLSearchParams(window.location.search).get("id"));
    const target = (urlId && data.find((d) => d.id === urlId)) || data[0];
    openDoc(target);
  }

  async function loadUserTeams() {
    const res = await fetch("/api/user/teams");
    if (res.ok) setUserTeams(await res.json());
  }

  function openDoc(doc: Doc) {
    setActiveId(doc.id);
    setContent(doc.content);
    setTitle(doc.title);
  }

  function scheduleSave(id: number, patch: Partial<Doc>) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/docs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d))
      );
    }, 600);
  }

  function handleContentChange(val: string | undefined) {
    const v = val ?? "";
    setContent(v);
    if (activeId !== null) scheduleSave(activeId, { content: v });
  }

  function saveTitle() {
    const t = title.trim();
    if (!t) { setTitle(docs.find((d) => d.id === activeId)?.title ?? ""); setEditingTitle(false); return; }
    if (activeId !== null) {
      fetch(`/api/docs/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });
      setDocs((prev) => prev.map((d) => (d.id === activeId ? { ...d, title: t } : d)));
    }
    setEditingTitle(false);
  }

  async function createDoc() {
    if (createRef.current) return;
    createRef.current = true;
    const teamId = createTeamId ? Number(createTeamId) : null;
    const t = createTitle.trim() || "Neues Dokument";
    setCreating(false); setCreateTitle(""); setCreateTeamId("");
    const res = await fetch("/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, teamId }),
    });
    const doc: Doc = await res.json();
    setDocs((prev) => [doc, ...prev]);
    openDoc(doc);
    createRef.current = false;
  }

  async function deleteDoc(id: number) {
    await fetch(`/api/docs/${id}`, { method: "DELETE" });
    const remaining = docs.filter((d) => d.id !== id);
    setDocs(remaining);
    if (activeId === id) {
      if (remaining.length > 0) openDoc(remaining[0]);
      else { setActiveId(null); setContent(""); setTitle(""); }
    }
  }

  async function importMarkdown(file: File, teamId: string | null) {
    const fd = new FormData();
    fd.append("file", file);
    if (teamId) fd.append("teamId", teamId);
    const res = await fetch("/api/docs/import", { method: "POST", body: fd });
    if (!res.ok) { alert("Import fehlgeschlagen"); return; }
    const doc: Doc = await res.json();
    setDocs((prev) => [doc, ...prev]);
    openDoc(doc);
    setImporting(false);
  }

  function exportMarkdown(id: number, docTitle: string) {
    window.open(`/api/docs/${id}/export`, "_blank");
  }

  // Grouping
  const privateDocs = docs.filter((d) => !d.teamId);
  const teamGroups = userTeams
    .map((t) => ({ team: t, items: docs.filter((d) => d.teamId === t.id) }))
    .filter((g) => g.items.length > 0);
  const knownTeamIds = new Set(userTeams.map((t) => t.id));
  const otherDocs = docs.filter((d) => d.teamId && !knownTeamIds.has(d.teamId));

  const activeDoc = docs.find((d) => d.id === activeId);

  return (
    <div className="flex-1 flex overflow-hidden" data-color-mode="dark">
      {/* Sidebar */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.08)] bg-[rgba(18,18,18,0.6)] backdrop-blur-[30px] backdrop-saturate-[180%]">
        <div className="flex flex-col gap-2 px-5 py-4 border-b border-[rgba(255,255,255,0.08)]">
          {/* Import modal */}
          {importing && (
            <div className="flex flex-col gap-2 bg-zinc-800 rounded-lg p-3 border border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Markdown importieren</span>
                <button onClick={() => setImporting(false)} className="text-zinc-600 hover:text-zinc-400">
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.txt"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) importMarkdown(f, importTeamId || null); }}
                className="text-xs text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-zinc-700 file:text-zinc-300"
              />
              <select
                value={importTeamId}
                onChange={(e) => setImportTeamId(e.target.value)}
                className="bg-zinc-700 border border-zinc-600 text-zinc-300 text-xs rounded px-2 py-1 outline-none"
              >
                <option value="">🔒 Privat</option>
                {userTeams.map((t) => <option key={t.id} value={t.id}>👥 {t.name}</option>)}
              </select>
            </div>
          )}
          {/* Create button */}
          {creating ? (
            <div className="flex flex-col gap-1.5">
              <input
                autoFocus
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createDoc(); if (e.key === "Escape") { setCreating(false); setCreateTitle(""); setCreateTeamId(""); } }}
                placeholder="Titel..."
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-zinc-500"
              />
              <div className="flex gap-1">
                <select
                  value={createTeamId}
                  onChange={(e) => setCreateTeamId(e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded px-1.5 py-1 outline-none min-w-0"
                >
                  <option value="">🔒 Privat</option>
                  {userTeams.map((t) => <option key={t.id} value={t.id}>👥 {t.name}</option>)}
                </select>
                <button onClick={createDoc} className="text-green-500 hover:text-green-400 px-1">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                </button>
                <button onClick={() => { setCreating(false); setCreateTitle(""); setCreateTeamId(""); }} className="text-zinc-600 hover:text-zinc-400 px-1">
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => { createRef.current = false; setCreating(true); }}
                className="flex-1 flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5 text-left transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Neu
              </button>
              <button
                onClick={() => setImporting(true)}
                className="text-zinc-600 hover:text-zinc-300 px-1.5 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                title="Markdown hochladen"
              >
                <FontAwesomeIcon icon={faFileImport} className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-1">
          {/* Private */}
          {privateDocs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 mt-1">
                <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5 text-zinc-700" />
                <span className="text-[10px] font-semibold text-zinc-700 uppercase tracking-wider">Privat</span>
              </div>
              {privateDocs.map((doc) => <DocItem key={doc.id} doc={doc} active={activeId === doc.id} onOpen={() => openDoc(doc)} onDelete={deleteDoc} />)}
            </div>
          )}

          {/* Teams */}
          {teamGroups.map(({ team, items }) => (
            <div key={team.id}>
              <div className="flex items-center gap-1.5 px-3 py-1 mt-1">
                {/* team.color is a dynamic runtime value — must stay inline */}
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: team.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: team.color }}>{team.name}</span>
              </div>
              {items.map((doc) => <DocItem key={doc.id} doc={doc} active={activeId === doc.id} onOpen={() => openDoc(doc)} onDelete={deleteDoc} />)}
            </div>
          ))}

          {/* Other (admin sees extra teams) */}
          {otherDocs.map((doc) => <DocItem key={doc.id} doc={doc} active={activeId === doc.id} onOpen={() => openDoc(doc)} onDelete={deleteDoc} />)}

          {docs.length === 0 && (
            <p className="text-xs text-zinc-700 px-3 py-4 text-center">Keine Dokumente</p>
          )}
        </nav>
      </aside>

      {/* Editor */}
      {activeId !== null ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(24,24,27,0.8)]">
            <div className="flex-1">
              {editingTitle ? (
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") { setTitle(docs.find((d) => d.id === activeId)?.title ?? ""); setEditingTitle(false); }
                  }}
                  className="text-xl font-semibold bg-transparent text-zinc-100 outline-none border-b border-zinc-500 w-full"
                />
              ) : (
                <h2 className="text-xl font-semibold text-zinc-100 cursor-pointer hover:text-white" onClick={() => setEditingTitle(true)}>
                  {title}
                </h2>
              )}
            </div>
            {activeDoc?.team && (
              // Team badge uses dynamic color — must stay inline
              <span
                className="text-xs rounded-full px-2.5 py-0.5 flex-shrink-0"
                style={{ background: activeDoc.team.color + "22", color: activeDoc.team.color, border: `1px solid ${activeDoc.team.color}44` }}
              >
                {activeDoc.team.name}
              </span>
            )}
            {!activeDoc?.teamId && (
              <span className="text-xs text-zinc-600 flex items-center gap-1 flex-shrink-0">
                <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" /> Privat
              </span>
            )}
            <button
              onClick={() => activeId && exportMarkdown(activeId, title)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
              title="Als .md herunterladen"
            >
              <FontAwesomeIcon icon={faFileExport} className="w-3.5 h-3.5" />
            </button>
            {/* Templates Button */}
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors flex-shrink-0"
              title="Templates"
            >
              <FontAwesomeIcon icon={faLayerGroup} className="w-3 h-3" />
              Templates
            </button>
            {/* KI Button */}
            <button
              onClick={() => setShowAi(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                showAi
                  ? "bg-[rgba(60,199,154,0.15)] text-[#3CC79A]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
              title="KI-Assistent"
            >
              <FontAwesomeIcon icon={faRobot} className="w-3 h-3" />
              KI
            </button>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-0.5 bg-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("edit")}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === "edit" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Nur Editor"
              >
                <FontAwesomeIcon icon={faCode} className="w-3 h-3" />
              </button>
              <button
                onClick={() => setViewMode("live")}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === "live" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Beides (Edit + Preview)"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-3 h-3" />
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === "preview" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Nur Vorschau"
              >
                <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <MarkdownEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Schreibe Markdown..."
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-700">
          Kein Dokument geöffnet
        </div>
      )}

      {/* KI Panel */}
      {showAi && (
        <AiAssistant
          context="docs"
          contextData={{ title, content: content.slice(0, 2000) }}
          onInsertText={(text) => {
            const newContent = content ? content + "\n\n" + text : text;
            setContent(newContent);
            if (activeId !== null) {
              fetch(`/api/docs/${activeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newContent }),
              });
            }
          }}
          onClose={() => setShowAi(false)}
        />
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          context="docs"
          onClose={() => setShowTemplateModal(false)}
          onApply={(redirect) => {
            setShowTemplateModal(false);
            if (redirect) {
              window.location.href = redirect;
            } else {
              loadDocs();
            }
          }}
        />
      )}
    </div>
  );
}

function DocItem({ doc, active, onOpen, onDelete }: { doc: Doc; active: boolean; onOpen: () => void; onDelete: (id: number) => void }) {
  return (
    <div
      className={`flex items-center group px-3 py-2 cursor-pointer transition-colors ${active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"}`}
      onClick={onOpen}
    >
      <span className="flex-1 text-sm truncate">{doc.title}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity ml-1"
      >
        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
      </button>
    </div>
  );
}
