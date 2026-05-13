import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { KanbanColumn } from "./KanbanColumn";
import type { Board, Card, Column } from "./types";

export function KanbanBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [users, setUsers] = useState<{ id: number; displayName: string | null; username: string }[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => { loadBoard(); loadUsers(); }, []);

  async function loadBoard() {
    const res = await fetch("/api/board");
    setBoard(await res.json());
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } catch { /* non-admin: kein Zugriff, leer lassen */ }
  }

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
      // Dropped on empty column
      targetColumnId = Number(overStr.replace("col-", ""));
      const targetCol = findColumnById(targetColumnId);
      newPosition = targetCol?.cards.length ?? 0;
    } else {
      // Dropped on a card
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

    // Optimistic update
    setBoard((prev) => {
      if (!prev) return prev;
      const cols = prev.columns.map((col) => ({ ...col, cards: [...col.cards] }));
      const srcCol = cols.find((c) => c.id === sourceCol.id)!;
      const tgtCol = cols.find((c) => c.id === targetColumnId)!;
      const cardIdx = srcCol.cards.findIndex((c) => c.id === cardId);
      const [movedCard] = srcCol.cards.splice(cardIdx, 1);
      movedCard.columnId = targetColumnId;
      tgtCol.cards.splice(newPosition, 0, movedCard);
      // reindex positions
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

  async function addCard(columnId: number, title: string) {
    const res = await fetch("/api/board/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, columnId }),
    });
    const newCard: Card = await res.json();
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
        ),
      };
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
      return {
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          cards: col.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      };
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
      return {
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== id),
        })),
      };
    });
  }

  async function renameColumn(id: number, title: string) {
    await fetch("/api/board/columns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title }),
    });
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns.map((col) => (col.id === id ? { ...col, title } : col)),
      };
    });
  }

  async function deleteColumn(id: number) {
    await fetch("/api/board/columns", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, columns: prev.columns.filter((c) => c.id !== id) };
    });
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
    setNewColTitle("");
    setAddingCol(false);
  }

  if (!board) {
    return <div className="flex-1 flex items-center justify-center text-zinc-600">Laden…</div>;
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex gap-4 overflow-x-auto p-6 items-start">
        {board.columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            users={users}
            onAddCard={addCard}
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") addColumn();
                  if (e.key === "Escape") { setNewColTitle(""); setAddingCol(false); }
                }}
                placeholder="Spaltenname..."
                className="bg-zinc-700 text-zinc-100 text-sm rounded px-2 py-1.5 outline-none border border-zinc-500 w-full"
              />
              <div className="flex gap-1">
                <button
                  onClick={addColumn}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded py-1 font-medium transition-colors"
                >
                  Hinzufügen
                </button>
                <button
                  onClick={() => { setNewColTitle(""); setAddingCol(false); }}
                  className="px-2 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingCol(true)}
              className="w-full text-left text-sm text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-3 transition-colors"
            >
              + Spalte hinzufügen
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
  );
}
