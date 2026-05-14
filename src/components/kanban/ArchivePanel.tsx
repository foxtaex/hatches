import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faBoxArchive, faTrashCan, faTrashRestore } from "@fortawesome/free-solid-svg-icons";
import type { Card } from "./types";

interface ArchivePanelProps {
  boardId: number | null;
  onClose: () => void;
  onRestore: () => void;
}

export function ArchivePanel({ boardId, onClose, onRestore }: ArchivePanelProps) {
  const [archivedCards, setArchivedCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchive();
  }, [boardId]);

  async function loadArchive() {
    setLoading(true);
    const res = await fetch(`/api/board/archive?boardId=${boardId}`);
    if (res.ok) setArchivedCards(await res.json());
    setLoading(false);
  }

  async function restoreCard(cardId: number) {
    await fetch("/api/board/archive", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    loadArchive();
    onRestore();
  }

  async function deleteArchivedCard(cardId: number) {
    await fetch("/api/board/cards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cardId }),
    });
    loadArchive();
  }

  return (
    <div className="flex-shrink-0 flex flex-col w-[320px] bg-[rgba(18,18,18,0.95)] backdrop-blur-[30px] border-l border-[rgba(255,255,255,0.08)] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgba(255,255,255,0.08)]">
        <span className="text-[17px] font-semibold text-[rgba(255,255,255,0.9)] flex items-center gap-2">
          <FontAwesomeIcon icon={faBoxArchive} className="text-[15px] text-[rgba(255,255,255,0.5)]" />
          Archiv
        </span>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loading && <p className="text-xs text-zinc-600 text-center py-8">Laden...</p>}
        {!loading && archivedCards.length === 0 && (
          <p className="text-xs text-zinc-600 text-center py-8">Keine archivierten Karten</p>
        )}
        {archivedCards.map((card) => (
          <div
            key={card.id}
            className="group bg-[rgba(40,40,40,0.9)] rounded-xl p-[14px] border border-[rgba(255,255,255,0.1)]"
          >
            <p className="text-sm text-zinc-200 mb-1 break-words">
              {card.title}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-600">
                {card.column?.board?.name} / {card.column?.title}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => restoreCard(card.id)}
                className="text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Wiederherstellen"
              >
                <FontAwesomeIcon icon={faTrashRestore} className="w-3 h-3" />
              </button>
              <button
                onClick={() => deleteArchivedCard(card.id)}
                className="text-xs text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Loeschen"
              >
                <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
