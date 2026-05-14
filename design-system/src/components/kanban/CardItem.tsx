import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faPen, faXmark, faUser, faArrowRightArrowLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import type { Card } from "./types";

interface BoardWithCols { id: number; name: string; columns: { id: number; title: string }[] }

interface Props {
  card: Card;
  users: { id: number; displayName: string | null; username: string }[];
  allBoards: BoardWithCols[];
  onUpdate: (id: number, data: Partial<Card>) => void;
  onDelete: (id: number) => void;
  onMoveToBoard: (cardId: number, targetColumnId: number) => void;
}

export function CardItem({ card, users, allBoards, onUpdate, onDelete, onMoveToBoard }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [showDesc, setShowDesc] = useState(false);
  const [desc, setDesc] = useState(card.description ?? "");
  const [showAssignee, setShowAssignee] = useState(false);
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [moveHoverBoard, setMoveHoverBoard] = useState<number | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `card-${card.id}` });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  function saveTitle() {
    const trimmed = title.trim();
    if (!trimmed) { setTitle(card.title); setEditing(false); return; }
    onUpdate(card.id, { title: trimmed });
    setEditing(false);
  }

  function saveDesc() {
    onUpdate(card.id, { description: desc || null });
    setShowDesc(false);
  }

  return (
    <div ref={setNodeRef} style={style}
      className="bg-zinc-800 rounded-lg p-3 group border border-zinc-700 hover:border-zinc-500 transition-colors relative">
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners}
          className="mt-1 text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing flex-shrink-0">
          <FontAwesomeIcon icon={faGripVertical} className="w-3 h-3" />
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setTitle(card.title); setEditing(false); } }}
              className="w-full bg-zinc-700 text-zinc-100 text-sm rounded px-2 py-0.5 outline-none border border-zinc-500" />
          ) : (
            <p className="text-sm text-zinc-100 cursor-pointer hover:text-white break-words" onClick={() => setEditing(true)}>
              {card.title}
            </p>
          )}

          {card.description && !showDesc && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{card.description}</p>
          )}

          {showDesc && (
            <div className="mt-2">
              <textarea autoFocus value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={saveDesc}
                rows={3} placeholder="Beschreibung..."
                className="w-full bg-zinc-700 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none border border-zinc-500 resize-none" />
            </div>
          )}

          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {card.externalIssue && (
              <span className="text-xs bg-zinc-700 text-zinc-400 rounded px-1.5 py-0.5">
                {card.externalIssue.integration.type} #{card.externalIssue.externalId}
              </span>
            )}
            {showAssignee ? (
              <select autoFocus value={card.assigneeId ?? ""}
                onChange={(e) => { onUpdate(card.id, { assigneeId: e.target.value ? Number(e.target.value) : null }); setShowAssignee(false); }}
                onBlur={() => setShowAssignee(false)}
                className="bg-zinc-700 text-zinc-200 text-xs rounded px-1.5 py-0.5 outline-none border border-zinc-500">
                <option value="">— Niemand</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.displayName || u.username}</option>)}
              </select>
            ) : (
              <button onClick={() => setShowAssignee(true)}
                className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors" title="Zuweisen">
                <FontAwesomeIcon icon={faUser} className="w-2.5 h-2.5" />
                {card.assignee
                  ? <span className="bg-zinc-700 rounded px-1.5 py-0.5">{card.assignee.displayName || card.assignee.username}</span>
                  : <span>zuweisen</span>}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setShowDesc(!showDesc)} className="text-zinc-500 hover:text-zinc-300 transition-colors" title="Beschreibung">
            <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
          </button>
          {allBoards.length > 0 && (
            <button onClick={() => setShowMovePicker(!showMovePicker)} className="text-zinc-500 hover:text-blue-400 transition-colors" title="Zu anderem Board verschieben">
              <FontAwesomeIcon icon={faArrowRightArrowLeft} className="w-3 h-3" />
            </button>
          )}
          <button onClick={() => onDelete(card.id)} className="text-zinc-600 hover:text-red-400 transition-colors" title="Loeschen">
            <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Cross-board move picker */}
      {showMovePicker && allBoards.length > 0 && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl min-w-[180px] py-1 text-sm"
          onMouseLeave={() => setMoveHoverBoard(null)}>
          <p className="text-xs text-zinc-500 px-3 py-1.5 border-b border-zinc-700">Verschieben nach Board</p>
          {allBoards.map((b) => (
            <div key={b.id} className="relative" onMouseEnter={() => setMoveHoverBoard(b.id)}>
              <button className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-zinc-300 hover:bg-zinc-700 transition-colors text-left">
                <span className="truncate">{b.name}</span>
                <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 flex-shrink-0 text-zinc-500" />
              </button>
              {moveHoverBoard === b.id && b.columns.length > 0 && (
                <div className="absolute left-full top-0 ml-1 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl min-w-[160px] py-1">
                  {b.columns.map((col) => (
                    <button key={col.id}
                      onClick={() => { onMoveToBoard(card.id, col.id); setShowMovePicker(false); setMoveHoverBoard(null); }}
                      className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-sm truncate">
                      {col.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setShowMovePicker(false)} className="w-full flex items-center gap-1.5 px-3 py-1.5 text-zinc-600 hover:text-zinc-400 text-xs border-t border-zinc-700 mt-1">
            <FontAwesomeIcon icon={faXmark} className="w-3 h-3" /> Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}