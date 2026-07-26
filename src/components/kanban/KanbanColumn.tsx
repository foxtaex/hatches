import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";
import { CardItem } from "./CardItem";
import type { Column } from "./types";
import { useTranslation } from "../../lib/i18n";

interface BoardWithCols { id: number; name: string; columns: { id: number; title: string }[] }

interface Props {
  column: Column;
  allBoards: BoardWithCols[];
  currentBoardId: number;
  onAddCard: (columnId: number, title: string) => void;
  onOpenCard: (id: number) => void;
  onMoveCardToBoard: (cardId: number, targetColumnId: number) => void;
  onRenameColumn: (id: number, title: string) => void;
  onDeleteColumn: (id: number) => void;
}

export function KanbanColumn({ column, allBoards, onAddCard, onOpenCard, onMoveCardToBoard, onRenameColumn, onDeleteColumn }: Props) {
  const { t } = useTranslation();
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
    <div
      className={`w-[320px] flex-shrink-0 rounded-2xl flex flex-col bg-[rgba(28,28,28,0.7)] backdrop-blur-[20px] backdrop-saturate-[180%] shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-[border-color] duration-300 ${isOver ? "border border-[rgba(255,255,255,0.2)]" : "border border-[rgba(255,255,255,0.1)]"}`}
    >
      <div className="flex items-center gap-2 group px-4 pt-4 pb-3">
        {editingTitle ? (
          <input
            autoFocus
            value={colTitle}
            onChange={(e) => setColTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setColTitle(column.title); setEditingTitle(false); } }}
            className="flex-1 text-sm font-semibold rounded px-2 py-0.5 outline-none bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.95)] border border-[rgba(255,255,255,0.2)]"
          />
        ) : (
          <h3
            className="flex-1 text-[15px] font-semibold text-[rgba(255,255,255,0.9)] cursor-pointer tracking-[-0.3px] m-0"
            onClick={() => setEditingTitle(true)}
          >
            {column.title}
          </h3>
        )}
        <span className="text-[13px] font-semibold text-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-md">
          {column.cards.length}
        </span>
        <button
          onClick={() => onDeleteColumn(column.id)}
          title={t("board.deleteColumn")}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.7)] p-1"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2 min-h-[4rem] px-3 pb-2">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              allBoards={allBoards}
              onOpenCard={onOpenCard}
              onMoveToBoard={onMoveCardToBoard}
            />
          ))}
        </SortableContext>
      </div>

      <div className="px-3 pb-3">
        {addingCard ? (
          <div className="flex flex-col gap-1">
            <input
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitCard(); if (e.key === "Escape") { setNewCardTitle(""); setAddingCard(false); } }}
              placeholder={t("board.cardTitlePlaceholder")}
              className="bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.95)] rounded-md p-2 text-sm outline-none w-full"
            />
            <div className="flex gap-1">
              <button
                onClick={submitCard}
                className="flex-1 bg-gradient-to-br from-blue-500 to-blue-800 text-white rounded-md py-1.5 text-xs font-medium cursor-pointer"
              >
                {t("common.add")}
              </button>
              <button
                onClick={() => { setNewCardTitle(""); setAddingCard(false); }}
                className="px-2 text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.7)] transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { submittingRef.current = false; setAddingCard(true); }}
            className="w-full flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.5)] bg-transparent rounded p-2 cursor-pointer transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            {t("board.addCard")}
          </button>
        )}
      </div>
    </div>
  );
}
