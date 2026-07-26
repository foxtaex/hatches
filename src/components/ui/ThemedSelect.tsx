import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "../../lib/i18n";

export interface ThemedSelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface ThemedSelectProps {
  value: string;
  options: ThemedSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  compact?: boolean;
}

export function ThemedSelect({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
  compact = false,
}: ThemedSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options[selectedIndex] ?? options[0];

  const enabledIndexes = useMemo(
    () => options.map((option, index) => ({ option, index })).filter(({ option }) => !option.disabled).map(({ index }) => index),
    [options],
  );

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  useEffect(() => {
    if (open) setActiveIndex(selectedIndex);
  }, [open, selectedIndex]);

  const moveActive = (direction: 1 | -1) => {
    if (!enabledIndexes.length) return;
    const currentPosition = enabledIndexes.indexOf(activeIndex);
    const nextPosition = currentPosition < 0
      ? 0
      : (currentPosition + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPosition]);
  };

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) setOpen(true);
            else moveActive(event.key === "ArrowDown" ? 1 : -1);
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open) selectOption(activeIndex);
            else setOpen(true);
          } else if (event.key === "Escape") {
            event.stopPropagation();
            setOpen(false);
          } else if (event.key === "Home" && open) {
            event.preventDefault();
            setActiveIndex(enabledIndexes[0] ?? 0);
          } else if (event.key === "End" && open) {
            event.preventDefault();
            setActiveIndex(enabledIndexes.at(-1) ?? 0);
          }
        }}
        className={`flex w-full items-center gap-2 rounded-lg border border-white/[0.1] bg-zinc-800 text-left text-zinc-200 shadow-sm outline-none transition-colors hover:border-white/[0.18] focus-visible:border-[#3CC79A]/60 focus-visible:ring-2 focus-visible:ring-[#3CC79A]/15 ${compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
      >
        {selected?.icon && <span className="flex w-4 flex-shrink-0 items-center justify-center text-zinc-400">{selected.icon}</span>}
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? t("common.select")}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`h-2.5 w-2.5 flex-shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-full z-[120] mt-1.5 min-w-full overflow-hidden rounded-xl border border-white/[0.11] bg-zinc-900/95 p-1 shadow-[0_16px_45px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onPointerEnter={() => !option.disabled && setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isActive ? "bg-white/[0.09] text-white" : "text-zinc-300 hover:bg-white/[0.06]"}`}
              >
                <span className="flex w-4 flex-shrink-0 items-center justify-center text-zinc-400">{option.icon}</span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <FontAwesomeIcon icon={faCheck} className={`h-3 w-3 text-[#3CC79A] ${isSelected ? "opacity-100" : "opacity-0"}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
