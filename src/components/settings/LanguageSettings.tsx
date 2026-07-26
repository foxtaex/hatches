import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "../../lib/i18n";
import { ThemedSelect } from "../ui/ThemedSelect";

export function LanguageSettings() {
  const { t, lang, setLang } = useTranslation();

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[rgba(24,24,27,0.8)] p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#3CC79A]/10 text-[#3CC79A]">
          <FontAwesomeIcon icon={faGlobe} className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white/90">{t("settings.language.title")}</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-white/35">{t("settings.language.description")}</p>
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40">{t("settings.language.label")}</span>
        <ThemedSelect
          value={lang}
          onChange={(value) => setLang(value === "en" ? "en" : "de")}
          ariaLabel={t("settings.language.label")}
          options={[
            { value: "de", label: t("settings.language.german"), icon: <span className="text-[10px] font-bold text-white/55">DE</span> },
            { value: "en", label: t("settings.language.english"), icon: <span className="text-[10px] font-bold text-white/55">EN</span> },
          ]}
        />
      </div>
    </section>
  );
}
