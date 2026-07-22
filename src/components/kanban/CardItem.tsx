import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faXmark, faArrowRightArrowLeft, faChevronRight, faPaperclip, faFileLines } from "@fortawesome/free-solid-svg-icons";
import type { Card } from "./types";
import { parseLabels, parseChecklist, PRIORITY_CONFIG } from "./types";

interface BoardWithCols { id: number; name: string; columns: { id: number; title: string }[] }

interface Props {
  card: Card;
  allBoards: BoardWithCols[];
  onOpenCard: (id: number) => void;
  onMoveToBoard: (cardId: number, targetColumnId: number) => void;
}

export function CardItem({ card, allBoards, onOpenCard, onMoveToBoard }: Props) {
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [moveHoverBoard, setMoveHoverBoard] = useState<number | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `card-${card.id}` });

  // dnd-kit transform is a runtime value — must stay inline
  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "all 0.3s cubic-bezier(0.4,0,0.2,1)",
    opacity: isDragging ? 0.4 : 1,
  };

  const labels = parseLabels(card.labels);
  const checklist = parseChecklist(card.checklist);
  const doneCount = checklist.filter((i) => i.done).length;
  const checkProgress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;
  const dueDateObj = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDateObj ? dueDateObj < new Date() : false;
  const priorityCfg = card.priority
    ? PRIORITY_CONFIG[card.priority as keyof typeof PRIORITY_CONFIG]
    : null;
  const usesDocDescription = card.linkedDocMode === "description" && Boolean(card.linkedDoc);

  const hasDocAttachment = card.linkedDocMode === "attachment" && card.linkedDocId !== null;
  const hasMetaRow = priorityCfg || dueDateObj || checklist.length > 0 || card.assignee || hasDocAttachment;

  return (
    <div ref={setNodeRef} style={dndStyle} className="group relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover-lift">

      {/* Cover color strip — dynamic runtime value must stay inline */}
      {card.coverColor && (
        <div className="h-8 w-full" style={{ background: card.coverColor }} />
      )}

      <div className="bg-[rgba(40,40,40,0.92)] px-3 pt-3 pb-2.5">

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {labels.map((l) => (
              <span
                key={l.id}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full leading-tight"
                style={{ background: l.color + "30", color: l.color }}
              >
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* Title + drag handle + move-board button */}
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 text-[rgba(255,255,255,0.2)] cursor-grab flex-shrink-0 hover:text-[rgba(255,255,255,0.4)] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <FontAwesomeIcon icon={faGripVertical} className="text-xs" />
          </div>

          <p
            className="flex-1 text-[14px] font-medium text-[rgba(255,255,255,0.92)] break-words leading-[1.4] min-w-0 cursor-pointer"
            onClick={() => onOpenCard(card.id)}
          >
            {card.title}
          </p>

          {allBoards.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowMovePicker(!showMovePicker); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-blue-400 flex-shrink-0 mt-0.5"
              title="Zu anderem Board verschieben"
            >
              <FontAwesomeIcon icon={faArrowRightArrowLeft} className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Description preview */}
        {usesDocDescription && card.linkedDoc ? (
          <div
            className="mt-2 ml-5 flex cursor-pointer items-center gap-2 rounded-lg border border-[rgba(60,199,154,0.16)] bg-[rgba(60,199,154,0.06)] px-2.5 py-1.5"
            onClick={() => onOpenCard(card.id)}
            title={`Doc: ${card.linkedDoc.title}`}
          >
            <FontAwesomeIcon icon={faFileLines} className="h-3 w-3 flex-shrink-0 text-[#3CC79A]" />
            <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-white/55">{card.linkedDoc.title}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#3CC79A]/70">Doc</span>
          </div>
        ) : card.description && (
          <p
            className="text-[11px] text-white/35 mt-1.5 ml-5 line-clamp-2 leading-relaxed cursor-pointer"
            onClick={() => onOpenCard(card.id)}
          >
            {card.description}
          </p>
        )}

        {/* Meta row: priority · due date · checklist count · assignee avatar */}
        {hasMetaRow && (
          <div
            className="flex items-center gap-2 mt-2.5 ml-5 flex-wrap cursor-pointer"
            onClick={() => onOpenCard(card.id)}
          >
            {priorityCfg && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ color: priorityCfg.color, background: priorityCfg.bg }}
              >
                {priorityCfg.label}
              </span>
            )}

            {dueDateObj && (
              <span className={`text-[10px] font-medium ${isOverdue ? "text-red-400" : "text-white/40"}`}>
                {isOverdue ? "⚠ " : "📅 "}
                {dueDateObj.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
              </span>
            )}

            {checklist.length > 0 && (
              <span className={`text-[10px] font-medium ${checkProgress === 100 ? "text-[#3CC79A]" : "text-white/40"}`}>
                ☑ {doneCount}/{checklist.length}
              </span>
            )}

            {hasDocAttachment && (
              <span className="flex items-center text-[#3CC79A]" title={card.linkedDoc?.title ?? "Dokument angehängt"}>
                <FontAwesomeIcon icon={faPaperclip} className="h-2.5 w-2.5" />
              </span>
            )}

            {card.assignee && (
              <span
                className="ml-auto text-[10px] font-bold bg-zinc-700 text-zinc-300 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                title={card.assignee.displayName ?? card.assignee.username}
              >
                {(card.assignee.displayName ?? card.assignee.username)[0].toUpperCase()}
              </span>
            )}
          </div>
        )}

        {/* Checklist progress bar */}
        {checklist.length > 0 && (
          <div className="mt-2 ml-5 h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${checkProgress}%`,
                background: checkProgress === 100 ? "#3CC79A" : "#6366f1",
              }}
            />
          </div>
        )}
      </div>

      {/* Cross-board move picker */}
      {showMovePicker && allBoards.length > 0 && (
        <div
          className="absolute right-0 top-full mt-1 z-50 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl min-w-[180px] py-1 text-sm"
          onMouseLeave={() => setMoveHoverBoard(null)}
        >
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
                    <button
                      key={col.id}
                      onClick={() => { onMoveToBoard(card.id, col.id); setShowMovePicker(false); setMoveHoverBoard(null); }}
                      className="w-full text-left px-3 py-1.5 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-sm truncate"
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => setShowMovePicker(false)}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-zinc-600 hover:text-zinc-400 text-xs border-t border-zinc-700 mt-1"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3 h-3" /> Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}
