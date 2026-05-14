import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { useState, useEffect, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faXmark, faPen, faCheck, faTableColumns,
  faTrash, faLock, faUsers, faBoxArchive, faFilter, faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { KanbanColumn } from "./KanbanColumn";
import { ArchivePanel } from "./ArchivePanel";
import { CardDetailModal } from "./CardDetailModal";
import type { Board, Card, Column } from "./types";
import { parseLabels, PRIORITY_CONFIG } from "./types";

interface TeamOption { id: number; name: string; color: string }

interface BoardItemProps {
  b: BoardMeta;
  active: boolean;
  renamingId: number | null;
  renameValue: string;
  onSelect: () => void;
  onRename: () => void;
  onRenameChange: (v: string) => void;
  onRenameSubmit: (id: number, name: string) => void;
  onRenameCancel: () => void;
  onDelete: (id: number) => void;
}

function BoardItem({ b, active, renamingId, renameValue, onSelect, onRename, onRenameChange, onRenameSubmit, onRenameCancel, onDelete }: BoardItemProps) {
  const isRenaming = renamingId === b.id;
  return (
    <div
      className={`flex items-center group px-3 py-2 cursor-pointer transition-colors ${active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"}`}
      onClick={!isRenaming ? onSelect : undefined}
    >
      <FontAwesomeIcon icon={faTableColumns} className="w-3 h-3 flex-shrink-0 mr-2 opacity-60" />
      {isRenaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRenameSubmit(b.id, renameValue);
            if (e.key === "Escape") onRenameCancel();
          }}
          onBlur={() => onRenameSubmit(b.id, renameValue)}
          className="flex-1 bg-zinc-700 text-zinc-100 text-sm rounded px-1.5 py-0.5 outline-none border border-zinc-500 min-w-0"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-sm truncate">{b.name}</span>
      )}
      {!isRenaming && (
        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
          <button
            onClick={(e) => { e.stopPropagation(); onRename(); }}
            className="text-zinc-600 hover:text-zinc-300 p-0.5 transition-colors"
          >
            <FontAwesomeIcon icon={faPen} className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
            className="text-zinc-600 hover:text-red-500 p-0.5 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}

interface BoardMeta {
  id: number; name: string;
  teamId: number | null;
  team: TeamOption | null;
  _count: { columns: number };
}
interface BoardWithCols { id: number; name: string; columns: { id: number; title: string }[] }

export function KanbanBoard() {
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [users, setUsers] = useState<{ id: number; displayName: string | null; username: string }[]>([]);
  const [allBoards, setAllBoards] = useState<BoardWithCols[]>([]);
  const [userTeams, setUserTeams] = useState<TeamOption[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; displayName: string | null } | null>(null);

  // Sidebar state
  const [addingBoard, setAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardTeamId, setNewBoardTeamId] = useState<string>("");
  const [renamingBoardId, setRenamingBoardId] = useState<number | null>(null);
  const [renameBoardValue, setRenameBoardValue] = useState("");

  // Column add state
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");

  // Archive panel state
  const [showArchive, setShowArchive] = useState(false);

  // Card detail modal state
  const [openCardId, setOpenCardId] = useState<number | null>(null);

  // Filter state
  interface BoardFilter {
    assigneeId: number | null;
    priority: string | null;
    labelName: string | null;
    due: "overdue" | "today" | "week" | null;
    text: string;
  }
  const EMPTY_FILTER: BoardFilter = { assigneeId: null, priority: null, labelName: null, due: null, text: "" };
  const [filter, setFilter] = useState<BoardFilter>(EMPTY_FILTER);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const isFiltered = filter.assigneeId !== null || filter.priority !== null ||
    filter.labelName !== null || filter.due !== null || filter.text.trim() !== "";

  // All unique labels across the current board (for filter UI)
  const allLabels = useMemo(() => {
    if (!board) return [] as { name: string; color: string }[];
    const map = new Map<string, string>();
    board.columns.forEach((col) =>
      col.cards.forEach((card) =>
        parseLabels(card.labels).forEach((l) => map.set(l.name, l.color))
      )
    );
    return Array.from(map.entries()).map(([name, color]) => ({ name, color }));
  }, [board]);

  // Filtered view of the board (client-side, no extra API call)
  const filteredBoard = useMemo((): Board | null => {
    if (!board || !isFiltered) return board;
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const endOfWeek = new Date(now.getTime() + 7 * 86_400_000);
    return {
      ...board,
      columns: board.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => {
          if (filter.assigneeId !== null && card.assigneeId !== filter.assigneeId) return false;
          if (filter.priority !== null && card.priority !== filter.priority) return false;
          if (filter.labelName !== null) {
            if (!parseLabels(card.labels).some((l) => l.name === filter.labelName)) return false;
          }
          if (filter.due !== null) {
            const due = card.dueDate ? new Date(card.dueDate) : null;
            if (!due) return false;
            if (filter.due === "overdue" && due >= now) return false;
            if (filter.due === "today" && (due < now || due > endOfToday)) return false;
            if (filter.due === "week" && due > endOfWeek) return false;
          }
          if (filter.text.trim() !== "") {
            const q = filter.text.toLowerCase();
            if (!card.title.toLowerCase().includes(q) &&
                !(card.description ?? "").toLowerCase().includes(q)) return false;
          }
          return true;
        }),
      })),
    };
  }, [board, filter, isFiltered]);

  // Double-submit guards
  const creatingBoardRef = useRef(false);
  const addingColRef = useRef(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { loadBoards(); loadUsers(); loadUserTeams(); loadCurrentUser(); }, []);
  useEffect(() => { if (activeBoardId) loadBoard(activeBoardId); }, [activeBoardId]);
  useEffect(() => { loadAllColumns(); }, [boards]);

  async function loadBoards() {
    const res = await fetch("/api/board");
    const data: BoardMeta[] = await res.json();
    setBoards(data);
    if (data.length === 0) return;
    const urlId = Number(new URLSearchParams(window.location.search).get("boardId"));
    if (urlId && data.some((b) => b.id === urlId)) {
      setActiveBoardId(urlId);
    } else {
      setActiveBoardId((prev) => prev ?? data[0].id);
    }
  }

  async function loadBoard(id: number) {
    const res = await fetch(`/api/board/${id}`);
    setBoard(await res.json());
  }

  async function loadAllColumns() {
    const res = await fetch("/api/board/all-columns");
    if (res.ok) setAllBoards(await res.json());
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } catch { /* non-admin */ }
  }

  async function loadCurrentUser() {
    const res = await fetch("/api/user/profile");
    if (res.ok) setCurrentUser(await res.json());
  }

  async function loadUserTeams() {
    const res = await fetch("/api/user/teams");
    if (res.ok) setUserTeams(await res.json());
  }

  // ── Board CRUD ───────────────────────────────────────────

  async function createBoard() {
    if (creatingBoardRef.current) return;
    const name = newBoardName.trim() || "Neues Board";
    const teamId = newBoardTeamId ? Number(newBoardTeamId) : null;
    creatingBoardRef.current = true;
    setNewBoardName(""); setNewBoardTeamId(""); setAddingBoard(false);
    const res = await fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, teamId }),
    });
    const b: BoardMeta = await res.json();
    setBoards((prev) => [...prev, b]);
    setActiveBoardId(b.id);
    creatingBoardRef.current = false;
  }

  async function renameBoard(id: number, name: string) {
    await fetch(`/api/board/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)));
    if (board?.id === id) setBoard((prev) => prev ? { ...prev, name } : prev);
    setRenamingBoardId(null);
  }

  async function deleteBoard(id: number) {
    const res = await fetch(`/api/board/${id}`, { method: "DELETE" });
    if (!res.ok) { const e = await res.json(); alert(e.error); return; }
    const remaining = boards.filter((b) => b.id !== id);
    setBoards(remaining);
    if (activeBoardId === id) setActiveBoardId(remaining[0]?.id ?? null);
  }

  // ── Drag & Drop ──────────────────────────────────────────

  function findCard(cardId: number): Card | null {
    if (!board) return null;
    for (const col of board.columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  }

  function findColumnByCardId(cardId: number): Column | null {
    if (!board) return null;
    return board.columns.find((col) => col.cards.some((c) => c.id === cardId)) ?? null;
  }

  function findColumnById(colId: number): Column | null {
    return board?.columns.find((c) => c.id === colId) ?? null;
  }

  function findCardWithColumn(cardId: number): { card: Card; columnName: string } | null {
    if (!board) return null;
    for (const col of board.columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) return { card, columnName: col.title };
    }
    return null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    const id = Number(String(active.id).replace("card-", ""));
    setActiveCard(findCard(id));
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);
    if (!over || !board) return;
    const cardId = Number(String(active.id).replace("card-", ""));
    const overStr = String(over.id);
    let targetColumnId: number;
    let newPosition: number;
    if (overStr.startsWith("col-")) {
      targetColumnId = Number(overStr.replace("col-", ""));
      const targetCol = findColumnById(targetColumnId);
      newPosition = targetCol?.cards.length ?? 0;
    } else {
      const overCardId = Number(overStr.replace("card-", ""));
      const targetCol = findColumnByCardId(overCardId);
      if (!targetCol) return;
      targetColumnId = targetCol.id;
      const overCard = targetCol.cards.find((c) => c.id === overCardId);
      newPosition = overCard?.position ?? 0;
    }
    const sourceCol = findColumnByCardId(cardId);
    if (!sourceCol) return;
    if (sourceCol.id === targetColumnId && findCard(cardId)?.position === newPosition) return;

    setBoard((prev) => {
      if (!prev) return prev;
      const cols = prev.columns.map((col) => ({ ...col, cards: [...col.cards] }));
      const srcCol = cols.find((c) => c.id === sourceCol.id)!;
      const tgtCol = cols.find((c) => c.id === targetColumnId)!;
      const cardIdx = srcCol.cards.findIndex((c) => c.id === cardId);
      const [movedCard] = srcCol.cards.splice(cardIdx, 1);
      movedCard.columnId = targetColumnId;
      tgtCol.cards.splice(newPosition, 0, movedCard);
      srcCol.cards.forEach((c, i) => (c.position = i));
      tgtCol.cards.forEach((c, i) => (c.position = i));
      return { ...prev, columns: cols };
    });

    await fetch("/api/board/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, targetColumnId, newPosition }),
    });
  }

  // ── Card CRUD ────────────────────────────────────────────

  async function addCard(columnId: number, title: string) {
    const res = await fetch("/api/board/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, columnId }),
    });
    const newCard: Card = await res.json();
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: prev.columns.map((col) => col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col) };
    });
  }

  async function updateCard(id: number, data: Partial<Card>) {
    await fetch("/api/board/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: prev.columns.map((col) => ({ ...col, cards: col.cards.map((c) => (c.id === id ? { ...c, ...data } : c)) })) };
    });
  }

  async function archiveCard(id: number) {
    await fetch("/api/board/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: id }),
    });
    // Remove card from board view immediately
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: prev.columns.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== id) })) };
    });
  }

  async function deleteCard(id: number) {
    await fetch("/api/board/cards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: prev.columns.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== id) })) };
    });
  }

  async function moveCardToBoard(cardId: number, targetColumnId: number) {
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: prev.columns.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== cardId) })) };
    });
    const res = await fetch("/api/board/all-columns");
    const allB: BoardWithCols[] = await res.json();
    const targetBoard = allB.find((b) => b.columns.some((c) => c.id === targetColumnId));
    const targetColCards = targetBoard
      ? await fetch(`/api/board/${targetBoard.id}`).then(r => r.json()).then((b: Board) => b.columns.find(c => c.id === targetColumnId)?.cards ?? [])
      : [];
    await fetch("/api/board/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, targetColumnId, newPosition: targetColCards.length }),
    });
    loadAllColumns();
  }

  // ── Column CRUD ──────────────────────────────────────────

  async function renameColumn(id: number, title: string) {
    await fetch("/api/board/columns", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title }) });
    setBoard((prev) => prev ? { ...prev, columns: prev.columns.map((col) => (col.id === id ? { ...col, title } : col)) } : prev);
  }

  async function deleteColumn(id: number) {
    await fetch("/api/board/columns", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setBoard((prev) => prev ? { ...prev, columns: prev.columns.filter((c) => c.id !== id) } : prev);
  }

  async function addColumn() {
    if (addingColRef.current) return;
    const t = newColTitle.trim();
    if (!t || !board) return;
    addingColRef.current = true;
    setNewColTitle(""); setAddingCol(false);
    const res = await fetch("/api/board/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, boardId: board.id }),
    });
    const col: Column = await res.json();
    setBoard((prev) => prev ? { ...prev, columns: [...prev.columns, col] } : prev);
    addingColRef.current = false;
  }

  // ── Sidebar grouping ─────────────────────────────────────

  const privateBoards = boards.filter((b) => !b.teamId);
  const teamBoardGroups = userTeams
    .map((t) => ({ team: t, items: boards.filter((b) => b.teamId === t.id) }))
    .filter((g) => g.items.length > 0);

  // also catch boards from teams not in userTeams (e.g. admin sees all)
  const knownTeamIds = new Set(userTeams.map((t) => t.id));
  const otherTeamBoards = boards.filter((b) => b.teamId && !knownTeamIds.has(b.teamId));

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Board Sidebar */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col bg-[rgba(18,18,18,0.6)] backdrop-blur-[30px] backdrop-saturate-[180%] border-r border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgba(255,255,255,0.08)]">
          <span className="text-[17px] font-semibold text-[rgba(255,255,255,0.9)] flex items-center gap-2 tracking-[-0.3px]">
            <FontAwesomeIcon icon={faTableColumns} className="text-[15px] text-[rgba(255,255,255,0.5)]" />
            Boards
          </span>
          <button
            onClick={() => { creatingBoardRef.current = false; setAddingBoard(true); }}
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
            title="Board erstellen"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          </button>
          <button onClick={() => setShowArchive(true)} className="text-zinc-600 hover:text-yellow-500 transition-colors" title="Archiv">
            <FontAwesomeIcon icon={faBoxArchive} className="w-3.5 h-3.5" />
          </button>
        </div>

        {addingBoard && (
          <div className="px-3 py-2 border-b border-zinc-800 flex flex-col gap-1.5">
            <input
              autoFocus
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createBoard(); if (e.key === "Escape") { setNewBoardName(""); setNewBoardTeamId(""); setAddingBoard(false); } }}
              placeholder="Board Name..."
              className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-1 outline-none border border-zinc-600"
            />
            <div className="flex gap-1">
              <select
                value={newBoardTeamId}
                onChange={(e) => setNewBoardTeamId(e.target.value)}
                className="flex-1 bg-zinc-800 text-zinc-300 text-xs rounded px-1.5 py-1 outline-none border border-zinc-700 min-w-0"
              >
                <option value="">🔒 Privat</option>
                {userTeams.map((t) => (
                  <option key={t.id} value={t.id}>👥 {t.name}</option>
                ))}
              </select>
              <button onClick={createBoard} className="text-green-500 hover:text-green-400 px-1">
                <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
              </button>
              <button onClick={() => { setNewBoardName(""); setNewBoardTeamId(""); setAddingBoard(false); }} className="text-zinc-600 hover:text-zinc-400 px-1">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-1">
          {/* Private boards */}
          {privateBoards.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 mt-1">
                <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5 text-zinc-700" />
                <span className="text-[10px] font-semibold text-zinc-700 uppercase tracking-wider">Privat</span>
              </div>
              {privateBoards.map((b) => <BoardItem key={b.id} b={b} active={activeBoardId === b.id} renamingId={renamingBoardId} renameValue={renameBoardValue} onSelect={() => setActiveBoardId(b.id)} onRename={() => { setRenamingBoardId(b.id); setRenameBoardValue(b.name); }} onRenameChange={setRenameBoardValue} onRenameSubmit={() => renameBoard(b.id, renameBoardValue)} onRenameCancel={() => setRenamingBoardId(null)} onDelete={deleteBoard} />)}
            </div>
          )}

          {/* Team boards */}
          {teamBoardGroups.map(({ team, items }) => (
            <div key={team.id}>
              <div className="flex items-center gap-1.5 px-3 py-1 mt-1">
                {/* team.color is a dynamic runtime value — must stay inline */}
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: team.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: team.color }}>{team.name}</span>
              </div>
              {items.map((b) => <BoardItem key={b.id} b={b} active={activeBoardId === b.id} renamingId={renamingBoardId} renameValue={renameBoardValue} onSelect={() => setActiveBoardId(b.id)} onRename={() => { setRenamingBoardId(b.id); setRenameBoardValue(b.name); }} onRenameChange={setRenameBoardValue} onRenameSubmit={() => renameBoard(b.id, renameBoardValue)} onRenameCancel={() => setRenamingBoardId(null)} onDelete={deleteBoard} />)}
            </div>
          ))}

          {/* Boards from teams admin can see but aren't in userTeams */}
          {otherTeamBoards.map((b) => <BoardItem key={b.id} b={b} active={activeBoardId === b.id} renamingId={renamingBoardId} renameValue={renameBoardValue} onSelect={() => setActiveBoardId(b.id)} onRename={() => { setRenamingBoardId(b.id); setRenameBoardValue(b.name); }} onRenameChange={setRenameBoardValue} onRenameSubmit={() => renameBoard(b.id, renameBoardValue)} onRenameCancel={() => setRenamingBoardId(null)} onDelete={deleteBoard} />)}

          {boards.length === 0 && (
            <p className="text-xs text-zinc-700 px-3 py-4 text-center">Noch keine Boards</p>
          )}
        </nav>
      </aside>

      {/* Board Content */}
      {!board ? (
        <div className="flex-1 flex items-center justify-center text-zinc-600">
          {boards.length === 0 ? "Board erstellen →" : "Laden…"}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* ── Filter Bar ─────────────────────────────── */}
            <div className="flex items-center gap-2 px-6 pt-4 pb-2 flex-shrink-0 flex-wrap">
              {/* Text search */}
              <div className="relative">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
                <input
                  value={filter.text}
                  onChange={(e) => setFilter((f) => ({ ...f, text: e.target.value }))}
                  placeholder="Karten suchen…"
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white/80 text-xs rounded-lg pl-7 pr-3 py-1.5 outline-none focus:border-[rgba(60,199,154,0.35)] w-44 placeholder:text-white/25 transition-colors"
                />
              </div>

              {/* Filter dropdown button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterPanel((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${isFiltered ? "border-[rgba(60,199,154,0.5)] text-[#3CC79A] bg-[rgba(60,199,154,0.08)]" : "border-[rgba(255,255,255,0.08)] text-white/50 hover:text-white/80 hover:border-[rgba(255,255,255,0.15)]"}`}
                >
                  <FontAwesomeIcon icon={faFilter} className="w-2.5 h-2.5" />
                  Filter
                </button>

                {/* Dropdown panel */}
                {showFilterPanel && (
                  <div className="absolute left-0 top-full mt-1 z-40 bg-[rgba(28,28,32,0.98)] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl p-4 w-64 flex flex-col gap-4">

                    {/* Assignee */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">Zugewiesen</p>
                      <select
                        value={filter.assigneeId ?? ""}
                        onChange={(e) => setFilter((f) => ({ ...f, assigneeId: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-white/80 text-xs rounded-lg px-2.5 py-1.5 outline-none"
                      >
                        <option value="">Alle</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.displayName || u.username}</option>
                        ))}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">Priorität</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.entries(PRIORITY_CONFIG) as [string, { label: string; color: string; bg: string }][]).map(([k, cfg]) => (
                          <button
                            key={k}
                            onClick={() => setFilter((f) => ({ ...f, priority: f.priority === k ? null : k }))}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all"
                            style={{
                              color: cfg.color,
                              background: filter.priority === k ? cfg.bg : "rgba(255,255,255,0.05)",
                              border: `1px solid ${filter.priority === k ? cfg.color + "60" : "rgba(255,255,255,0.08)"}`,
                            }}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Labels */}
                    {allLabels.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">Label</p>
                        <div className="flex flex-wrap gap-1.5">
                          {allLabels.map((l) => (
                            <button
                              key={l.name}
                              onClick={() => setFilter((f) => ({ ...f, labelName: f.labelName === l.name ? null : l.name }))}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all"
                              style={{
                                color: l.color,
                                background: filter.labelName === l.name ? l.color + "30" : "rgba(255,255,255,0.05)",
                                border: `1px solid ${filter.labelName === l.name ? l.color + "60" : "rgba(255,255,255,0.08)"}`,
                              }}
                            >
                              {l.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Due date */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">Fällig</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(["overdue", "today", "week"] as const).map((k) => {
                          const labels = { overdue: "⚠ Überfällig", today: "Heute", week: "Diese Woche" };
                          return (
                            <button
                              key={k}
                              onClick={() => setFilter((f) => ({ ...f, due: f.due === k ? null : k }))}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all ${filter.due === k ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-[rgba(255,255,255,0.08)] text-white/50 hover:text-white/80"}`}
                            >
                              {labels[k]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => { setFilter(EMPTY_FILTER); setShowFilterPanel(false); }}
                      className="text-xs text-white/30 hover:text-white/60 transition-colors text-left"
                    >
                      Alle Filter entfernen
                    </button>
                  </div>
                )}
              </div>

              {/* Active filter chips */}
              {filter.assigneeId !== null && (
                <span className="flex items-center gap-1 text-[10px] bg-[rgba(255,255,255,0.08)] text-white/60 rounded-full px-2 py-0.5">
                  👤 {users.find((u) => u.id === filter.assigneeId)?.displayName || users.find((u) => u.id === filter.assigneeId)?.username || "?"}
                  <button onClick={() => setFilter((f) => ({ ...f, assigneeId: null }))} className="text-white/40 hover:text-white/80"><FontAwesomeIcon icon={faXmark} className="w-2 h-2" /></button>
                </span>
              )}
              {filter.priority !== null && (
                <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5" style={{ background: PRIORITY_CONFIG[filter.priority as keyof typeof PRIORITY_CONFIG].bg, color: PRIORITY_CONFIG[filter.priority as keyof typeof PRIORITY_CONFIG].color }}>
                  {PRIORITY_CONFIG[filter.priority as keyof typeof PRIORITY_CONFIG].label}
                  <button onClick={() => setFilter((f) => ({ ...f, priority: null }))} className="opacity-60 hover:opacity-100"><FontAwesomeIcon icon={faXmark} className="w-2 h-2" /></button>
                </span>
              )}
              {filter.labelName !== null && (
                <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5" style={{ background: (allLabels.find((l) => l.name === filter.labelName)?.color ?? "#888") + "30", color: allLabels.find((l) => l.name === filter.labelName)?.color ?? "#888" }}>
                  🏷 {filter.labelName}
                  <button onClick={() => setFilter((f) => ({ ...f, labelName: null }))} className="opacity-60 hover:opacity-100"><FontAwesomeIcon icon={faXmark} className="w-2 h-2" /></button>
                </span>
              )}
              {filter.due !== null && (
                <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 rounded-full px-2 py-0.5">
                  {{ overdue: "⚠ Überfällig", today: "📅 Heute", week: "📅 Diese Woche" }[filter.due]}
                  <button onClick={() => setFilter((f) => ({ ...f, due: null }))} className="opacity-60 hover:opacity-100"><FontAwesomeIcon icon={faXmark} className="w-2 h-2" /></button>
                </span>
              )}

              {/* Hidden card count */}
              {isFiltered && (() => {
                const total = board.columns.reduce((s, c) => s + c.cards.length, 0);
                const visible = (filteredBoard?.columns ?? []).reduce((s, c) => s + c.cards.length, 0);
                const hidden = total - visible;
                return hidden > 0 ? (
                  <span className="text-[10px] text-white/30 ml-auto">{hidden} Karte{hidden !== 1 ? "n" : ""} ausgeblendet</span>
                ) : null;
              })()}
            </div>

          <div className="flex-1 flex gap-4 overflow-x-auto px-6 pb-6 items-start">
            {(filteredBoard ?? board).columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                allBoards={allBoards.filter((b) => b.id !== board.id)}
                currentBoardId={board.id}
                onAddCard={addCard}
                onOpenCard={setOpenCardId}
                onMoveCardToBoard={moveCardToBoard}
                onRenameColumn={renameColumn}
                onDeleteColumn={deleteColumn}
              />
            ))}

            {/* Add column */}
            <div className="w-[320px] flex-shrink-0">
              {addingCol ? (
                <div className="flex flex-col gap-2 bg-[rgba(28,28,28,0.7)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-3">
                  <input
                    autoFocus
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") { setNewColTitle(""); setAddingCol(false); } }}
                    placeholder="Spaltenname..."
                    className="bg-zinc-700 text-zinc-100 text-sm rounded px-2 py-1.5 outline-none border border-zinc-500 w-full"
                  />
                  <div className="flex gap-1">
                    <button onClick={addColumn} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded py-1 font-medium transition-colors">Hinzufügen</button>
                    <button onClick={() => { setNewColTitle(""); setAddingCol(false); }} className="px-2 text-zinc-500 hover:text-zinc-300">
                      <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { addingColRef.current = false; setAddingCol(true); }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.6)] bg-transparent border border-dashed border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)] rounded-2xl p-4 cursor-pointer transition-[border-color,color] duration-200"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  Spalte hinzufügen
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="bg-zinc-700 rounded-lg p-3 border border-zinc-500 shadow-xl w-72 opacity-90">
                <p className="text-sm text-zinc-100">{activeCard.title}</p>
              </div>
            )}
          </DragOverlay>
          </div>{/* end flex-col wrapper */}
        </DndContext>
      )}

      {showArchive && activeBoardId !== null && (
        <ArchivePanel
          boardId={activeBoardId}
          onClose={() => setShowArchive(false)}
          onRestore={() => loadBoard(activeBoardId)}
        />
      )}

      {openCardId !== null && (() => {
        const found = findCardWithColumn(openCardId);
        if (!found) return null;
        return (
          <CardDetailModal
            card={found.card}
            users={users}
            columnName={found.columnName}
            currentUserId={currentUser?.id ?? null}
            onClose={() => setOpenCardId(null)}
            onUpdate={updateCard}
            onDelete={(id) => { deleteCard(id); setOpenCardId(null); }}
            onArchive={(id) => { archiveCard(id); setOpenCardId(null); }}
          />
        );
      })()}
    </div>
  );
}
