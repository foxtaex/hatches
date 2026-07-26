import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faLock, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ThemedSelect } from "../ui/ThemedSelect";
import { useTranslation } from "../../lib/i18n";

interface TeamOption {
  id: number;
  name: string;
  color: string;
}

interface BoardSettingsModalProps {
  board: {
    id: number;
    name: string;
    teamId: number | null;
  };
  teams: TeamOption[];
  onClose: () => void;
  onSave: (name: string, teamId: number | null) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function BoardSettingsModal({ board, teams, onClose, onSave, onDelete }: BoardSettingsModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(board.name);
  const [teamId, setTeamId] = useState(board.teamId === null ? "" : String(board.teamId));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function save() {
    const cleanName = name.trim();
    if (!cleanName || saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave(cleanName, teamId ? Number(teamId) : null);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("board.settings.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (deleting || !window.confirm(t("board.settings.deleteConfirm", { name: board.name }))) return;
    setDeleting(true);
    setError("");
    try {
      await onDelete();
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("board.settings.deleteFailed"));
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[700] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-settings-title"
        className="w-full max-w-md overflow-visible rounded-2xl border border-white/[0.1] bg-zinc-950/95 shadow-[0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
      >
        <header className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3CC79A]/10 text-[#3CC79A]">
            <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="board-settings-title" className="text-sm font-semibold text-white/90">{t("board.settings.title")}</h2>
            <p className="truncate text-xs text-white/35">{board.name}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white/70" aria-label={t("common.close")}>
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-col gap-5 p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("common.name")}</span>
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") save(); }}
              maxLength={80}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2.5 text-sm text-white/90 outline-none transition-colors placeholder:text-white/25 focus:border-[#3CC79A]/50"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("board.settings.scope")}</span>
            <ThemedSelect
              value={teamId}
              onChange={setTeamId}
              ariaLabel="Board-Bereich auswählen"
              options={[
                { value: "", label: t("common.private"), icon: <FontAwesomeIcon icon={faLock} className="h-3 w-3" /> },
                ...teams.map((team) => ({
                  value: String(team.id),
                  label: team.name,
                  icon: <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team.color }} />,
                })),
              ]}
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/25">{t("board.settings.scopeHelp")}</p>
          </div>

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-xs text-red-300">{error}</p>}

          <div className="flex items-center gap-2 border-t border-white/[0.07] pt-4">
            <button
              type="button"
              onClick={remove}
              disabled={deleting || saving}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-40"
            >
              <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
              {deleting ? t("board.settings.deleting") : t("board.settings.delete")}
            </button>
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="rounded-xl px-3.5 py-2 text-xs text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/75">{t("common.cancel")}</button>
            <button
              type="button"
              onClick={save}
              disabled={saving || !name.trim()}
              className="rounded-xl bg-[#3CC79A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#34b389] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
