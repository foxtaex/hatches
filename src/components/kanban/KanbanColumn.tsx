import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import { CardItem } from "./CardItem";
import type { Card, Column } from "./types";

interface BoardWithCols { id: number; name: string; columns: { id: number; title: string }[] }

interface Props {
  column: Column;
  users: { id: number; displayName: string | null; username: string }[];
  allBoards: BoardWithCols[];
  currentBoardId: number;
  onAddCard: (columnId: number, title: string) => void;
  onUpdateCard: (id: number, data: Partial<Card>) => void;
  onDeleteCard: (id: number) => void;
  onMoveCardToBoard: (cardId: number, targetColumnId: number) => void;
  onRenameColumn: (id: number, title: string) => void;
  onDeleteColumn: (id: number) => void;
}

export function KanbanColumn({ column, users, allBoards, onAddCard, onUpdateCard, onDeleteCard, onMoveCardToBoard, onRenameColumn, onDeleteColumn }: Props) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [colTitle, setColTitle] = useState(column.title);
  const submittingRef = useRef(false);

  const { setNodeRef, isOver } = useDroppable({ id: `col-${column.id}` });
  const cardIds = column.cards.map((c) => `card-${c.id}`);

  function submitCard() {
    if (submittingRef.current) return;
    const t = newCardTitle.trim();
    if (!t) return;
    submittingRef.current = true;
    setNewCardTitle(""); setAddingCard(false);
    onAddCard(column.id, t);
  }

  function saveTitle() {
    const t = colTitle.trim();
    if (!t) { setColTitle(column.title); setEditingTitle(false); return; }
    onRenameColumn(column.id, t);
    setEditingTitle(false);
  }

  return (
    <div className={`flex flex-col w-72 flex-shrink-0 rounded-xl border transition-colors ${isOver ? "border-zinc-500 bg-zinc-800/80" : "border-zinc-700 bg-zinc-900"}`}>
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 group">
        {editingTitle ? (
          <input autoFocus value={colTitle} onChange={(e) => setColTitle(e.target.value)} onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setColTitle(column.title); setEditingTitle(false); } }}
            className="flex-1 bg-zinc-700 text-zinc-100 text-sm font-semibold rounded px-2 py-0.5 outline-none border border-zinc-500" />
        ) : (
          <h3 className="flex-1 text-sm font-semibold text-zinc-300 cursor-pointer hover:text-white" onClick={() => setEditingTitle(true)}>
            {column.title}
          </h3>
        )}
        <span className="text-xs text-zinc-600 tabular-nums">{column.cards.length}</span>
        <button onClick={() => onDeleteColumn(column.id)} title="Spalte loeschen"
          className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2 px-3 pb-2 min-h-[4rem]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              users={users}
              allBoards={allBoards}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              onMoveToBoard={onMoveCardToBoard}
            />
          ))}
        </SortableContext>
      </div>

      <div className="px-3 pb-3">
        {addingCard ? (
          <div className="flex flex-col gap-1">
            <input autoFocus value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitCard(); if (e.key === "Escape") { setNewCardTitle(""); setAddingCard(false); } }}
              placeholder="Karte benennen..."
              className="bg-zinc-700 text-zinc-100 text-sm rounded px-2 py-1.5 outline-none border border-zinc-500 w-full" />
            <div className="flex gap-1">
              <button onClick={submitCard} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded py-1 font-medium transition-colors">Hinzufuegen</button>
              <button onClick={() => { setNewCardTitle(""); setAddingCard(false); }} className="px-2 text-zinc-500 hover:text-zinc-300">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => { submittingRef.current = false; setAddingCard(true); }}
            className="w-full text-left flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded px-2 py-1 transition-colors">
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            Karte hinzufuegen
          </button>
        )}
      </div>
    </div>
  );
}