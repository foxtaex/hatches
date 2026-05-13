import { useState, useEffect, useRef } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadNotes(); }, []);

  async function loadNotes() {
    const res = await fetch("/api/notes");
    const data: Note[] = await res.json();
    setNotes(data);
    if (data.length > 0) openNote(data[0]);
  }

  function openNote(note: Note) {
    setActiveId(note.id);
    setContent(note.content);
    setTitle(note.title);
  }

  function scheduleSave(id: number, patch: Partial<Note>) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n))
      );
    }, 600);
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    setContent(v);
    if (activeId !== null) scheduleSave(activeId, { content: v });
  }

  function saveTitle() {
    const t = title.trim();
    if (!t) { setTitle(notes.find((n) => n.id === activeId)?.title ?? ""); setEditingTitle(false); return; }
    if (activeId !== null) {
      fetch(`/api/notes/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });
      setNotes((prev) => prev.map((n) => (n.id === activeId ? { ...n, title: t } : n)));
    }
    setEditingTitle(false);
  }

  async function createNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Neue Notiz" }),
    });
    const note: Note = await res.json();
    setNotes((prev) => [note, ...prev]);
    openNote(note);
  }

  async function deleteNote(id: number) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeId === id) {
      if (remaining.length > 0) openNote(remaining[0]);
      else { setActiveId(null); setContent(""); setTitle(""); }
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="p-3 border-b border-zinc-800">
          <button
            onClick={createNote}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5 text-left transition-colors"
          >
            + Neue Notiz
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`flex items-center group px-3 py-2 cursor-pointer transition-colors ${
                activeId === note.id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
              }`}
              onClick={() => openNote(note)}
            >
              <span className="flex-1 text-sm truncate">{note.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 text-xs transition-opacity ml-1"
              >
                ×
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-xs text-zinc-700 px-3 py-4">Keine Notizen</p>
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
                  if (e.key === "Escape") { setTitle(notes.find((n) => n.id === activeId)?.title ?? ""); setEditingTitle(false); }
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
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Notiz schreiben..."
            className="flex-1 bg-zinc-950 text-zinc-200 text-sm font-mono p-6 outline-none resize-none leading-relaxed"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-700">
          Keine Notiz geöffnet
        </div>
      )}
    </div>
  );
}
