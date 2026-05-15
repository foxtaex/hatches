import { useState, useEffect, useCallback } from "react";
import { de } from "./de";
import { en } from "./en";

export type Language = "de" | "en";

const STORAGE_KEY = "hatches_lang";
const DEFAULT_LANG: Language = "de";
const CHANGE_EVENT = "hatches:lang-change";

/** Translations map */
const translations: Record<Language, typeof de> = { de, en };

/** Read language from localStorage (client only) */
function readLang(): Language {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  return stored === "de" || stored === "en" ? stored : DEFAULT_LANG;
}

/** Persist language and notify all listeners */
export function setLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: lang }));
}

/** Get current language (server-safe) */
export function getLanguage(): Language {
  return readLang();
}

/**
 * Resolve a dot-separated key from the translations object.
 * Returns the key itself if not found (never throws).
 */
function resolve(obj: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] Missing key: "${key}"`);
      }
      return key;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  if (typeof cur !== "string") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] Key "${key}" is not a string`);
    }
    return key;
  }
  return cur;
}

/**
 * Interpolate {{param}} placeholders in a string.
 * @example t("board.cardCount", { count: 5 }) → "5 Karten"
 */
function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{{${k}}}`
  );
}

/**
 * React hook — returns translation function + language switcher.
 * Re-renders automatically when language changes.
 */
export function useTranslation() {
  const [lang, setLangState] = useState<Language>(readLang);

  useEffect(() => {
    function onLangChange(e: Event) {
      setLangState((e as CustomEvent<Language>).detail);
    }
    window.addEventListener(CHANGE_EVENT, onLangChange);
    return () => window.removeEventListener(CHANGE_EVENT, onLangChange);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[lang] as unknown as Record<string, unknown>;
      return interpolate(resolve(dict, key), params);
    },
    [lang]
  );

  const switchLang = useCallback((newLang: Language) => {
    setLanguage(newLang);
  }, []);

  return { t, lang, setLang: switchLang };
}

// Re-export translations for direct access (non-React contexts)
export { de, en };
