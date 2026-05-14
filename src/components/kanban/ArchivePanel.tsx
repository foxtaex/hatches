import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faBoxArchive, faTrashCan, faTrashRestore } from "@fortawesome/free-solid-svg-icons";
import type { Card } from "./types";

interface ArchivePanelProps {
  boardId: number | null;
  onClose: () => void;
}

export function ArchivePanel({ boardId, onClose }: ArchivePanelProps) {
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
    <div
      className="flex-shrink-0 flex flex-col"
      style={{
        width: 320,
        background: "rgba(18,18,18,0.95)",
        backdropFilter: "blur(30px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FontAwesomeIcon icon={faBoxArchive} style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }} />
          Archiv
        </span>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300">
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
            style={{
              background: "rgba(40,40,40,0.9)",
              borderRadius: 12,
              padding: 14,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            className="group"
          >
            <p className="text-sm text-zinc-200 mb-1" style={{ wordBreak: "break-word" }}>
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