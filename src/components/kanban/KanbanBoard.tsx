import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faXmark, faPen, faCheck, faTableColumns,
  faArrowRightArrowLeft, faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { KanbanColumn } from "./KanbanColumn";
import type { Board, Card, Column } from "./types";

interface BoardMeta { id: number; name: string; _count: { columns: number } }
interface BoardWithCols { id: number; name: string; columns: { id: number; title: string }[] }

export function KanbanBoard() {
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [users, setUsers] = useState<{ id: number; displayName: string | null; username: string }[]>([]);
  const [allBoards, setAllBoards] = useState<BoardWithCols[]>([]);

  // Sidebar state
  const [addingBoard, setAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [renamingBoardId, setRenamingBoardId] = useState<number | null>(null);
  const [renameBoardValue, setRenameBoardValue] = useState("");

  // Column add state
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => { loadBoards(); loadUsers(); }, []);
  useEffect(() => { if (activeBoardId) loadBoard(activeBoardId); }, [activeBoardId]);
  useEffect(() => { loadAllColumns(); }, [boards]);

  async function loadBoards() {
    const res = await fetch("/api/board");
    const data: BoardMeta[] = await res.json();
    setBoards(data);
    if (data.length > 0) setActiveBoardId((prev) => prev ?? data[0].id);
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

  // ── Board CRUD ───────────────────────────────────────────

  async function createBoard() {
    const name = newBoardName.trim() || "Neues Board";
    const res = await fetch("/api/board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const b: BoardMeta = await res.json();
    setBoards((prev) => [...prev, b]);
    setActiveBoardId(b.id);
    setNewBoardName(""); setAddingBoard(false);
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
    if (activeBoardId === id) {
      const next = remaining[0];
      setActiveBoardId(next?.id ?? null);
    }
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
    // Remove card from current board view
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: prev.columns.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== cardId) })) };
    });
    // Move via existing API
    const res = await fetch("/api/board/all-columns");
    const allB: BoardWithCols[] = await res.json();
    const targetBoard = allB.find((b) => b.columns.some((c) => c.id === targetColumnId));
    const targetColCards = targetBoard ? await fetch(`/api/board/${targetBoard.id}`).then(r => r.json()).then((b: Board) => b.columns.find(c => c.id === targetColumnId)?.cards ?? []) : [];
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
    const t = newColTitle.trim();
    if (!t || !board) return;
    const res = await fetch("/api/board/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, boardId: board.id }),
    });
    const col: Column = await res.json();
    setBoard((prev) => prev ? { ...prev, columns: [...prev.columns, col] } : prev);
    setNewColTitle(""); setAddingCol(false);
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Board Sidebar */}
      <aside className="w-52 flex-shrink-0 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="px-3 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Boards</span>
          <button onClick={() => setAddingBoard(true)} className="text-zinc-600 hover:text-zinc-300 transition-colors" title="Board erstellen">
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          </button>
        </div>

        {addingBoard && (
          <div className="px-3 py-2 border-b border-zinc-800 flex gap-1">
            <input
              autoFocus
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createBoard(); if (e.key === "Escape") { setNewBoardName(""); setAddingBoard(false); } }}
              placeholder="Board Name..."
              className="flex-1 bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-1 outline-none border border-zinc-600 min-w-0"
            />
            <button onClick={createBoard} className="text-green-500 hover:text-green-400">
              <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
            </button>
            <button onClick={() => { setNewBoardName(""); setAddingBoard(false); }} className="text-zinc-600 hover:text-zinc-400">
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-1">
          {boards.map((b) => (
            <div
              key={b.id}
              onClick={() => setActiveBoardId(b.id)}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${activeBoardId === b.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"}`}
            >
              <FontAwesomeIcon icon={faTableColumns} className="w-3 h-3 flex-shrink-0 opacity-60" />
              {renamingBoardId === b.id ? (
                <input
                  autoFocus
                  value={renameBoardValue}
                  onChange={(e) => setRenameBoardValue(e.target.value)}
                  onBlur={() => renameBoard(b.id, renameBoardValue || b.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") renameBoard(b.id, renameBoardValue || b.name);
                    if (e.key === "Escape") setRenamingBoardId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-zinc-700 text-zinc-100 text-xs rounded px-1 py-0.5 outline-none border border-zinc-500 min-w-0"
                />
              ) : (
                <span className="flex-1 text-xs truncate">{b.name}</span>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setRenamingBoardId(b.id); setRenameBoardValue(b.name); }} className="hover:text-zinc-200 transition-colors" title="Umbenennen">
                  <FontAwesomeIcon icon={faPen} className="w-2.5 h-2.5" />
                </button>
                <button onClick={() => deleteBoard(b.id)} className="hover:text-red-400 transition-colors" title="Loeschen">
                  <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Board Content */}
      {!board ? (
        <div className="flex-1 flex items-center justify-center text-zinc-600">Laden…</div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex gap-4 overflow-x-auto p-6 items-start">
            {board.columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                users={users}
                allBoards={allBoards.filter((b) => b.id !== board.id)}
                currentBoardId={board.id}
                onAddCard={addCard}
                onUpdateCard={updateCard}
                onDeleteCard={deleteCard}
                onMoveCardToBoard={moveCardToBoard}
                onRenameColumn={renameColumn}
                onDeleteColumn={deleteColumn}
              />
            ))}

            {/* Add column */}
            <div className="w-72 flex-shrink-0">
              {addingCol ? (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex flex-col gap-2">
                  <input
                    autoFocus
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") { setNewColTitle(""); setAddingCol(false); } }}
                    placeholder="Spaltenname..."
                    className="bg-zinc-700 text-zinc-100 text-sm rounded px-2 py-1.5 outline-none border border-zinc-500 w-full"
                  />
                  <div className="flex gap-1">
                    <button onClick={addColumn} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded py-1 font-medium transition-colors">Hinzufuegen</button>
                    <button onClick={() => { setNewColTitle(""); setAddingCol(false); }} className="px-2 text-zinc-500 hover:text-zinc-300">
                      <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCol(true)}
                  className="w-full text-left flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-3 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  Spalte hinzufuegen
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
        </DndContext>
      )}
    </div>
  );
}