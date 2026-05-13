import MDEditor from "@uiw/react-md-editor";
import { useState, useEffect, useRef } from "react";

interface Doc {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

export function DocsEditor() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    const res = await fetch("/api/docs");
    const data: Doc[] = await res.json();
    setDocs(data);
    if (data.length > 0 && activeId === null) {
      openDoc(data[0]);
    }
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
    const res = await fetch("/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Neues Dokument" }),
    });
    const doc: Doc = await res.json();
    setDocs((prev) => [doc, ...prev]);
    openDoc(doc);
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

  return (
    <div className="flex-1 flex overflow-hidden" data-color-mode="dark">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="p-3 border-b border-zinc-800">
          <button
            onClick={createDoc}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5 text-left transition-colors"
          >
            + Neues Dokument
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-1">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center group px-3 py-2 cursor-pointer transition-colors ${
                activeId === doc.id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
              }`}
              onClick={() => openDoc(doc)}
            >
              <span className="flex-1 text-sm truncate">{doc.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 text-xs transition-opacity ml-1"
              >
                ×
              </button>
            </div>
          ))}
          {docs.length === 0 && (
            <p className="text-xs text-zinc-700 px-3 py-4">Keine Dokumente</p>
          )}
        </nav>
      </aside>

      {/* Editor */}
      {activeId !== null ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900">
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
              <h2
                className="text-xl font-semibold text-zinc-100 cursor-pointer hover:text-white"
                onClick={() => setEditingTitle(true)}
              >
                {title}
              </h2>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <MDEditor
              value={content}
              onChange={handleContentChange}
              height="100%"
              preview="live"
              className="h-full"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-700">
          Kein Dokument geöffnet
        </div>
      )}
    </div>
  );
}
