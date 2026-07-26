import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { TemplateLibrary } from "./TemplateLibrary";
import { useTranslation } from "../../lib/i18n";

interface Props {
  /** Filtert Templates nach Kontext */
  context: "docs" | "board";
  onClose: () => void;
  /** Wird aufgerufen wenn ein Template angewendet wurde */
  onApply?: (redirect: string | null) => void;
}

export function TemplateModal({ context, onClose, onApply }: Props) {
  const { t } = useTranslation();
  // Schließen mit Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleApply(redirect: string | null) {
    onApply?.(redirect);
    // Nach erfolgreichem Anwenden navigieren oder Modal schließen
    if (redirect) {
      window.location.href = redirect;
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-5xl mx-4"
        style={{
          height: "min(80vh, 700px)",
          background: "rgba(16,16,18,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(60,199,154,0.12)" }}
            >
              <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4" style={{ color: "#3CC79A" }} />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                {t("templates.title")}
              </h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                {context === "docs" ? t("templates.modal.docsTitle") : t("templates.modal.boardTitle")} · {t("templates.modal.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseOut={e => (e.currentTarget.style.background = "transparent")}
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Template Library (browse mode) */}
        <div className="flex-1 overflow-hidden">
          <TemplateLibrary
            mode="browse"
            context={context}
            onApply={handleApply}
          />
        </div>
      </div>
    </div>
  );
}
