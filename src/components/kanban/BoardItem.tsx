import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark, faLock } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface BoardMeta {
  id: number;
  name: string;
  teamId: number | null;
}

interface Props {
  b: BoardMeta;
  active: boolean;
  renamingId: number | null;
  renameValue: string;
  onSelect: () => void;
  onRename: () => void;
  onRenameChange: (v: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onDelete: (id: number) => void;
}

export function BoardItem({ b, active, renamingId, renameValue, onSelect, onRename, onRenameChange, onRenameSubmit, onRenameCancel, onDelete }: Props) {
  const isRenaming = renamingId === b.id;

  return (
    <div
      className={`flex items-center group px-3 py-2 cursor-pointer transition-colors ${
        active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
      }`}
      onClick={onSelect}
    >
      <FontAwesomeIcon icon={faLock} className="w-2.5 h-2.5 text-zinc-700 mr-1.5 flex-shrink-0" />
      <span className="flex-1 text-sm truncate">
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") onRenameSubmit();
              if (e.key === "Escape") onRenameCancel();
            }}
            className="w-full bg-zinc-700 border border-zinc-600 text-zinc-200 text-xs rounded px-1.5 py-0.5 outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          b.name
        )}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity ml-1"
      >
        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
      </button>
    </div>
  );
}