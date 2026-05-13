import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faLock, faCheck } from "@fortawesome/free-solid-svg-icons";

interface TeamOption { id: number; name: string; color: string }
interface Note {
  id: number;
  title: string;
  content: string;
  teamId: number | null;
  team: TeamOption | null;
  updatedAt: string;
}

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [userTeams, setUserTeams] = useState<TeamOption[]>([]);

  // Create form state
  const [creating, setCreating] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createTeamId, setCreateTeamId] = useState<string>("");
  const createRef = useRef(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadNotes(); loadUserTeams(); }, []);

  async function loadNotes() {
    const res = await fetch("/api/notes");
    const data: Note[] = await res.json();
    setNotes(data);
    if (data.length > 0) openNote(data[0]);
  }

  async function loadUserTeams() {
    const res = await fetch("/api/user/teams");
    if (res.ok) setUserTeams(await res.json());
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
    if (createRef.current) return;
    createRef.current = true;
    const teamId = createTeamId ? Number(createTeamId) : null;
    const t = createTitle.trim() || "Neue Notiz";
    setCreating(false); setCreateTitle(""); setCreateTeamId("");
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, teamId }),
    });
    const note: Note = await res.json();
    setNotes((prev) => [note, ...prev]);
    openNote(note);
    createRef.current = false;
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

  // Grouping
  const privateNotes = notes.filter((n) => !n.teamId);
  const teamGroups = userTeams
    .map((t) => ({ team: t, items: notes.filter((n) => n.teamId === t.id) }))
    .filter((g) => g.items.length > 0);
  const knownTeamIds = new Set(userTeams.map((t) => t.id));
  const otherNotes = notes.filter((n) => n.teamId && !knownTeamIds.has(n.teamId));

  const activeNote = notes.find((n) => n.id === activeId);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="p-3 border-b border-zinc-800">
          {creating ? (
            <div className="flex flex-col gap-1.5">
              <input
                autoFocus
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createNote(); if (e.key === "Escape") { setCreating(false); setCreateTitle(""); setCreateTeamId(""); } }}
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
                <button onClick={createNote} className="text-green-500 hover:text-green-400 px-1">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                </button>
                <button onClick={() => { setCreating(false); setCreateTitle(""); setCreateTeamId(""); }} className="text-zinc-600 hover:text-zinc-400 px-1">
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { createRef.current = false; setCreating(true); }}
              className="w-full flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5 text-left transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Neue Notiz
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-1">
          {/* Private */}
          {privateNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 mt-1">
                <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5 text-zinc-700" />
                <span className="text-[10px] font-semibold text-zinc-700 uppercase tracking-wider">Privat</span>
              </div>
              {privateNotes.map((note) => <NoteItem key={note.id} note={note} active={activeId === note.id} onOpen={() => openNote(note)} onDelete={deleteNote} />)}
            </div>
          )}

          {/* Teams */}
          {teamGroups.map(({ team, items }) => (
            <div key={team.id}>
              <div className="flex items-center gap-1.5 px-3 py-1 mt-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: team.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: team.color }}>{team.name}</span>
              </div>
              {items.map((note) => <NoteItem key={note.id} note={note} active={activeId === note.id} onOpen={() => openNote(note)} onDelete={deleteNote} />)}
            </div>
          ))}

          {/* Other */}
          {otherNotes.map((note) => <NoteItem key={note.id} note={note} active={activeId === note.id} onOpen={() => openNote(note)} onDelete={deleteNote} />)}

          {notes.length === 0 && (
            <p className="text-xs text-zinc-700 px-3 py-4 text-center">Keine Notizen</p>
          )}
        </nav>
      </aside>

      {/* Editor */}
      {activeId !== null ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3">
            <div className="flex-1">
              {editingTitle ? (
                <input
                  autoFocus value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") { setTitle(notes.find((n) => n.id === activeId)?.title ?? ""); setEditingTitle(false); }
                  }}
                  className="text-xl font-semibold bg-transparent text-zinc-100 outline-none border-b border-zinc-500 w-full"
                />
              ) : (
                <h2 className="text-xl font-semibold text-zinc-100 cursor-pointer hover:text-white" onClick={() => setEditingTitle(true)}>
                  {title}
                </h2>
              )}
            </div>
            {activeNote?.team && (
              <span className="text-xs rounded-full px-2.5 py-0.5 flex-shrink-0"
                style={{ background: activeNote.team.color + "22", color: activeNote.team.color, border: `1px solid ${activeNote.team.color}44` }}>
                {activeNote.team.name}
              </span>
            )}
            {!activeNote?.teamId && (
              <span className="text-xs text-zinc-600 flex items-center gap-1 flex-shrink-0">
                <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" /> Privat
              </span>
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

function NoteItem({ note, active, onOpen, onDelete }: { note: Note; active: boolean; onOpen: () => void; onDelete: (id: number) => void }) {
  return (
    <div
      className={`flex items-center group px-3 py-2 cursor-pointer transition-colors ${active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"}`}
      onClick={onOpen}
    >
      <span className="flex-1 text-sm truncate">{note.title}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity ml-1"
      >
        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
      </button>
    </div>
  );
}
