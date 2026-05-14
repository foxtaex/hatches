import { useState, useEffect, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faLock, faCheck, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { MarkdownEditor } from "../docs/MarkdownEditor";

interface TeamOption { id: number; name: string; color: string }
interface Note {
  id: number;
  title: string;
  content: string;
  teamId: number | null;
  team: TeamOption | null;
  updatedAt: string;
}

function extractTags(content: string): string[] {
  const matches = content.match(/#([a-zA-Z0-9_\-äöüÄÖÜß]+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}

export function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [userTeams, setUserTeams] = useState<TeamOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

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
    if (data.length === 0) return;
    const urlId = Number(new URLSearchParams(window.location.search).get("id"));
    const target = (urlId && data.find((n) => n.id === urlId)) || data[0];
    openNote(target);
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

  function handleContentChange(value: string) {
    setContent(value);
    if (activeId !== null) scheduleSave(activeId, { content: value });
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

  // All unique tags across all notes
  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    notes.forEach((n) => {
      extractTags(n.content).forEach((t) => {
        tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
      });
    });
    return [...tagMap.entries()].sort((a, b) => b[1] - a[1]);
  }, [notes]);

  // Filtered notes based on search query and active tag
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    if (activeTag) {
      result = result.filter((n) => extractTags(n.content).includes(activeTag));
    }
    return result;
  }, [notes, searchQuery, activeTag]);

  // Grouping (uses filtered set)
  const privateNotes = filteredNotes.filter((n) => !n.teamId);
  const teamGroups = userTeams
    .map((t) => ({ team: t, items: filteredNotes.filter((n) => n.teamId === t.id) }))
    .filter((g) => g.items.length > 0);
  const knownTeamIds = new Set(userTeams.map((t) => t.id));
  const otherNotes = filteredNotes.filter((n) => n.teamId && !knownTeamIds.has(n.teamId));

  const activeNote = notes.find((n) => n.id === activeId);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.08)] bg-[rgba(18,18,18,0.6)] backdrop-blur-[30px] backdrop-saturate-[180%]">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.08)] flex flex-col gap-2">
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

          {/* Search */}
          <div className="relative">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded pl-7 pr-2 py-1.5 outline-none focus:border-zinc-600 placeholder-zinc-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              >
                <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {allTags.slice(0, 12).map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                    activeTag === tag
                      ? "bg-[rgba(60,199,154,0.2)] text-[#3CC79A] border border-[rgba(60,199,154,0.4)]"
                      : "bg-zinc-900 text-zinc-600 border border-zinc-800 hover:text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  #{tag} <span className="opacity-60">{count}</span>
                </button>
              ))}
            </div>
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
                {/* team.color is a dynamic runtime value — must stay inline */}
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: team.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: team.color }}>{team.name}</span>
              </div>
              {items.map((note) => <NoteItem key={note.id} note={note} active={activeId === note.id} onOpen={() => openNote(note)} onDelete={deleteNote} />)}
            </div>
          ))}

          {/* Other */}
          {otherNotes.map((note) => <NoteItem key={note.id} note={note} active={activeId === note.id} onOpen={() => openNote(note)} onDelete={deleteNote} />)}

          {filteredNotes.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-zinc-700">
                {searchQuery || activeTag ? "Keine Treffer" : "Keine Notizen"}
              </p>
              {activeTag && (
                <button onClick={() => setActiveTag(null)} className="text-[10px] text-zinc-600 hover:text-zinc-400 mt-1 underline">
                  Filter entfernen
                </button>
              )}
            </div>
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
              // Team badge uses dynamic color — must stay inline
              <span
                className="text-xs rounded-full px-2.5 py-0.5 flex-shrink-0"
                style={{ background: activeNote.team.color + "22", color: activeNote.team.color, border: `1px solid ${activeNote.team.color}44` }}
              >
                {activeNote.team.name}
              </span>
            )}
            {!activeNote?.teamId && (
              <span className="text-xs text-zinc-600 flex items-center gap-1 flex-shrink-0">
                <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5" /> Privat
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <MarkdownEditor
              value={content}
              onChange={handleContentChange}
              placeholder="Notiz schreiben..."
            />
          </div>
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
  const tags = useMemo(() => extractTags(note.content).slice(0, 4), [note.content]);
  return (
    <div
      className={`flex flex-col px-3 py-2 cursor-pointer transition-colors group ${active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"}`}
      onClick={onOpen}
    >
      <div className="flex items-center">
        <span className="flex-1 text-sm truncate">{note.title}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity ml-1 flex-shrink-0"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {tags.map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0 rounded-full bg-zinc-900 text-zinc-600 border border-zinc-800">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
