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
    <div style={{
      width: 320,
      flexShrink: 0,
      borderRadius: 16,
      border: isOver ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.1)",
      background: "rgba(28,28,28,0.7)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      display: "flex",
      flexDirection: "column" as const,
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      transition: "border-color 0.3s",
    }}>
      <div className="flex items-center gap-2 group" style={{ padding: "16px 16px 12px" }}>
        {editingTitle ? (
          <input autoFocus value={colTitle} onChange={(e) => setColTitle(e.target.value)} onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setColTitle(column.title); setEditingTitle(false); } }}
            className="flex-1 text-sm font-semibold rounded px-2 py-0.5 outline-none" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.95)", border: "1px solid rgba(255,255,255,0.2)" }} />
        ) : (
          <h3 style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", cursor: "pointer", letterSpacing: "-0.3px", margin: 0 }} onClick={() => setEditingTitle(true)}>
            {column.title}
          </h3>
        )}
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 6 }}>{column.cards.length}</span>
        <button onClick={() => onDeleteColumn(column.id)} title="Spalte loeschen"
          className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", padding: 4 }}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 12 }} />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2 min-h-[4rem]" style={{ padding: "0 12px 8px 12px" }}>
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

      <div style={{ padding: "0 12px 12px 12px" }}>
        {addingCard ? (
          <div className="flex flex-col gap-1">
            <input autoFocus value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitCard(); if (e.key === "Escape") { setNewCardTitle(""); setAddingCard(false); } }}
              placeholder="Karte benennen..."
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.95)", borderRadius: 6, padding: 8, fontSize: 14, outline: "none", width: "100%" }} />
            <div className="flex gap-1">
              <button onClick={submitCard} style={{ flex: 1, background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)", color: "white", border: "none", borderRadius: 6, padding: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Hinzufuegen</button>
              <button onClick={() => { setNewCardTitle(""); setAddingCard(false); }} style={{ padding: "6px 8px", background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => { submittingRef.current = false; setAddingCard(true); }}
            style={{ width: "100%", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.25)", background: "transparent", border: "none", borderRadius: 4, padding: 8, cursor: "pointer", transition: "background-color 200ms, color 200ms" }}>
            <FontAwesomeIcon icon={faPlus} style={{ width: 12 }} />
            Karte hinzufuegen
          </button>
        )}
      </div>
    </div>
  );
}