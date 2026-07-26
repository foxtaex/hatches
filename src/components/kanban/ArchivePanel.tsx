import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxArchive, faGripVertical, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ThemedSelect } from "../ui/ThemedSelect";
import { useTranslation } from "../../lib/i18n";
import type { Card } from "./types";

interface BoardOption {
  id: number;
  name: string;
}

interface ArchivePanelProps {
  boards: BoardOption[];
  selectedBoardId: number | null;
  cards: Card[];
  loading: boolean;
  onBoardChange: (boardId: number) => void;
  onClose: () => void;
  onDelete: (cardId: number) => void;
}

function ArchivedCard({ card, onDelete }: { card: Card; onDelete: (cardId: number) => void }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      className="group rounded-xl border border-white/[0.1] bg-[rgba(40,40,40,0.92)] px-3 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-0.5 flex-shrink-0 cursor-grab text-white/20 transition-colors hover:text-white/45 active:cursor-grabbing"
          aria-label={t("board.dragArchivedCard")}
        >
          <FontAwesomeIcon icon={faGripVertical} className="h-3 w-3" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-medium leading-[1.4] text-white/90">{card.title}</p>
          <p className="mt-1 truncate text-[10px] text-white/30">
            {card.column?.board?.name} · {card.column?.title}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { if (confirm(t("board.deleteArchivedConfirm"))) onDelete(card.id); }}
          className="flex-shrink-0 p-1 text-white/15 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
          title={t("board.deletePermanently")}
        >
          <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function ArchivePanel({ boards, selectedBoardId, cards, loading, onBoardChange, onClose, onDelete }: ArchivePanelProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: "archive" });

  return (
    <div
      ref={setNodeRef}
      className={`flex max-h-full w-[320px] flex-shrink-0 flex-col rounded-2xl border bg-[rgba(24,24,26,0.76)] backdrop-blur-[24px] transition-colors ${isOver ? "border-amber-400/55 bg-amber-400/[0.06]" : "border-white/[0.1]"}`}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 pb-3 pt-4">
        <FontAwesomeIcon icon={faBoxArchive} className="h-3.5 w-3.5 text-amber-400/70" />
        <h3 className="flex-1 text-[15px] font-semibold text-white/90">{t("board.archive")}</h3>
        <span className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[13px] font-semibold text-white/45">{cards.length}</span>
        <button type="button" onClick={onClose} className="p-1 text-white/25 transition-colors hover:text-white/65" aria-label={t("common.close")}>
          <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
        </button>
      </div>

      <div className="border-b border-white/[0.06] px-3 py-3">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/30">{t("board.sourceBoard")}</span>
        <ThemedSelect
          value={selectedBoardId === null ? "" : String(selectedBoardId)}
          onChange={(value) => value && onBoardChange(Number(value))}
          ariaLabel={t("board.sourceBoard")}
          compact
          options={boards.map((board) => ({ value: String(board.id), label: board.name }))}
        />
        <p className="mt-2 text-[10px] leading-relaxed text-white/25">{t("board.archiveDragHint")}</p>
      </div>

      <div className="flex min-h-24 flex-col gap-2 overflow-y-auto p-3">
        {loading ? (
          <p className="py-8 text-center text-xs text-white/25">{t("common.loading")}</p>
        ) : cards.length === 0 ? (
          <p className="py-8 text-center text-xs text-white/25">{t("board.noArchivedCards")}</p>
        ) : (
          <SortableContext items={cards.map((card) => `card-${card.id}`)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => <ArchivedCard key={card.id} card={card} onDelete={onDelete} />)}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
