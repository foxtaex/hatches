import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCat,
  faCode,
  faGhost,
  faImage,
  faRobot,
  faRocket,
  faTrash,
  faUser,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "../../lib/i18n";

interface ProfileAvatarSettingsProps {
  currentAvatar: string | null;
  displayName: string;
}

const ICONS: { value: string; icon: IconDefinition; label: string }[] = [
  { value: "icon:user", icon: faUser, label: "User" },
  { value: "icon:code", icon: faCode, label: "Code" },
  { value: "icon:robot", icon: faRobot, label: "Robot" },
  { value: "icon:rocket", icon: faRocket, label: "Rocket" },
  { value: "icon:ghost", icon: faGhost, label: "Ghost" },
  { value: "icon:cat", icon: faCat, label: "Cat" },
];

function iconForAvatar(avatar: string | null): IconDefinition | null {
  return ICONS.find((item) => item.value === avatar)?.icon ?? null;
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image"));
      image.onload = () => {
        const maxSide = 256;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("canvas"));
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ProfileAvatarSettings({ currentAvatar, displayName }: ProfileAvatarSettingsProps) {
  const { t } = useTranslation();
  const [avatar, setAvatar] = useState<string | null>(currentAvatar);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const icon = iconForAvatar(avatar);
  const initial = displayName.charAt(0).toUpperCase();

  async function chooseFile(file: File | undefined) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError(t("settings.avatar.invalidType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t("settings.avatar.tooLarge"));
      return;
    }
    setProcessing(true);
    setError("");
    try {
      setAvatar(await resizeImage(file));
    } catch {
      setError(t("settings.avatar.processingFailed"));
    } finally {
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    if (saving || processing) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("settings.avatar.saveFailed"));
      window.location.reload();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("settings.avatar.saveFailed"));
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[rgba(24,24,27,0.8)] p-6">
      <div>
        <h2 className="text-base font-semibold text-white/90">{t("settings.avatar.title")}</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-white/35">{t("settings.avatar.description")}</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#3CC79A] to-[#138A6E] text-2xl font-bold text-white shadow-[0_4px_20px_rgba(60,199,154,0.25)]">
          {avatar?.startsWith("data:image/") ? (
            <img src={avatar} alt={t("settings.avatar.previewAlt")} className="h-full w-full object-cover" />
          ) : icon ? (
            <FontAwesomeIcon icon={icon} className="h-7 w-7" />
          ) : (
            initial
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={processing}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2 text-xs text-white/70 transition-colors hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white/90 disabled:opacity-40"
          >
            <FontAwesomeIcon icon={faImage} className="h-3.5 w-3.5 text-[#3CC79A]" />
            {processing ? t("settings.avatar.processing") : t("settings.avatar.upload")}
          </button>
          <p className="text-[11px] text-white/25">{t("settings.avatar.fileHelp")}</p>
        </div>
      </div>

      <div>
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("settings.avatar.chooseIcon")}</span>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((item) => {
            const selected = avatar === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => { setAvatar(item.value); setError(""); }}
                aria-label={item.label}
                aria-pressed={selected}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${selected ? "border-[#3CC79A]/60 bg-[#3CC79A]/15 text-[#3CC79A] ring-2 ring-[#3CC79A]/10" : "border-white/[0.08] bg-white/[0.035] text-white/40 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white/70"}`}
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-xs text-red-300">{error}</p>}

      <div className="flex items-center gap-2 border-t border-white/[0.07] pt-4">
        <button
          type="button"
          onClick={() => { setAvatar(null); setError(""); }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white/35 transition-colors hover:bg-red-500/[0.08] hover:text-red-400"
        >
          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
          {t("settings.avatar.remove")}
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={save}
          disabled={saving || processing || avatar === currentAvatar}
          className="rounded-xl bg-[#3CC79A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#34b389] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </div>
    </section>
  );
}
