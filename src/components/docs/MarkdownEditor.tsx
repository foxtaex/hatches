import { useState, useRef, useEffect, useMemo } from "react";
import { renderMarkdown } from "../../lib/markdown";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold, faItalic, faStrikethrough, faHeading,
  faListOl, faListUl, faLink, faImage,
  faCode, faQuoteRight, faMinus, faTable, faTerminal,
  faEye, faCode as faCodeIcon, faColumns, faRightLeft,
} from "@fortawesome/free-solid-svg-icons";

interface ToolbarButton {
  icon: typeof faBold;
  label: string;
  action: string;
  prefix: string;
  suffix: string;
  block?: boolean;
}

const TOOLBAR: ToolbarButton[] = [
  { icon: faBold, label: "Fett (Ctrl+B)", action: "bold", prefix: "**", suffix: "**" },
  { icon: faItalic, label: "Kursiv (Ctrl+I)", action: "italic", prefix: "_", suffix: "_" },
  { icon: faStrikethrough, label: "Durchgestrichen", action: "strike", prefix: "~~", suffix: "~~" },
  { icon: faHeading, label: "Heading", action: "heading", prefix: "## ", suffix: "", block: true },
  { icon: faListUl, label: "Bullet List", action: "ul", prefix: "- ", suffix: "", block: true },
  { icon: faListOl, label: "Numbered List", action: "ol", prefix: "1. ", suffix: "", block: true },
  { icon: faLink, label: "Link (Ctrl+K)", action: "link", prefix: "[", suffix: "](url)" },
  { icon: faImage, label: "Image", action: "image", prefix: "![", suffix: "](url)" },
  { icon: faCode, label: "Inline Code", action: "code", prefix: "`", suffix: "`" },
  { icon: faTerminal, label: "Codeblock (Ctrl+Shift+K)", action: "codeblock", prefix: "```\n", suffix: "\n```", block: true },
  { icon: faQuoteRight, label: "Quote", action: "quote", prefix: "> ", suffix: "", block: true },
  { icon: faMinus, label: "Divider", action: "divider", prefix: "\n---\n", suffix: "", block: true },
  { icon: faTable, label: "Table", action: "table", prefix: "", suffix: "" },
];

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export type ViewMode = "edit" | "preview" | "split" | "split-reverse";

export function MarkdownEditor({ value, onChange, placeholder = "Schreibe Markdown...", viewMode, onViewModeChange }: MarkdownEditorProps) {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewFocusedRef = useRef(false);
  const turndown = useMemo(() => {
    const service = new TurndownService({
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
      headingStyle: "atx",
    });
    service.use(gfm);
    return service;
  }, []);
  const activeViewMode = viewMode ?? internalViewMode;
  const setViewMode = (mode: ViewMode) => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  function insertFormat(action: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    const btn = TOOLBAR.find((b) => b.action === action);
    if (!btn) return;

    let newValue: string;
    let newCursorStart: number;
    let newCursorEnd: number;

    switch (action) {
      case "bold":
        newValue = `${before}**${selected || "bold"}**${after}`;
        newCursorStart = start + 2;
        newCursorEnd = newCursorStart + (selected || "bold").length;
        break;
      case "italic":
        newValue = `${before}_${selected || "italic"}_${after}`;
        newCursorStart = start + 1;
        newCursorEnd = newCursorStart + (selected || "italic").length;
        break;
      case "strike":
        newValue = `${before}~~${selected || "strike"}~~${after}`;
        newCursorStart = start + 2;
        newCursorEnd = newCursorStart + (selected || "strike").length;
        break;
      case "heading":
        newValue = `${before}## ${selected || "Heading"}${after}`;
        newCursorStart = start + 3;
        newCursorEnd = newCursorStart + (selected || "Heading").length;
        break;
      case "ul":
        newValue = `${before}- ${selected || "List item"}${after}`;
        newCursorStart = start + 2;
        newCursorEnd = newCursorStart + (selected || "List item").length;
        break;
      case "ol":
        newValue = `${before}1. ${selected || "List item"}${after}`;
        newCursorStart = start + 3;
        newCursorEnd = newCursorStart + (selected || "List item").length;
        break;
      case "link":
        newValue = `${before}[${selected || "link text"}](url)${after}`;
        newCursorStart = start + 1;
        newCursorEnd = start + 1 + (selected || "link text").length;
        break;
      case "image":
        newValue = `${before}![${selected || "alt text"}](url)${after}`;
        newCursorStart = start + 2;
        newCursorEnd = start + 2 + (selected || "alt text").length;
        break;
      case "code":
        newValue = `${before}\`${selected || "code"}\`${after}`;
        newCursorStart = start + 1;
        newCursorEnd = newCursorStart + (selected || "code").length;
        break;
      case "codeblock": {
        const code = selected || "code";
        const leadingBreak = before && !before.endsWith("\n") ? "\n" : "";
        const trailingBreak = after && !after.startsWith("\n") ? "\n" : "";
        const prefix = `${leadingBreak}\`\`\`\n`;
        newValue = `${before}${prefix}${code}\n\`\`\`${trailingBreak}${after}`;
        newCursorStart = start + prefix.length;
        newCursorEnd = newCursorStart + code.length;
        break;
      }
      case "quote":
        newValue = `${before}> ${selected || "quote"}${after}`;
        newCursorStart = start + 2;
        newCursorEnd = newCursorStart + (selected || "quote").length;
        break;
      case "divider":
        newValue = `${before}\n---\n${after}`;
        newCursorStart = start + 5;
        newCursorEnd = newCursorStart;
        break;
      case "table":
        newValue = `${before}\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |\n${after}`;
        newCursorStart = start + 3;
        newCursorEnd = newCursorStart + 6;
        break;
      default:
        return;
    }

    onChange(newValue);
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const ctrl = e.ctrlKey || e.metaKey;

    // Keyboard shortcuts
    if (ctrl && e.key === "b") { e.preventDefault(); insertFormat("bold"); return; }
    if (ctrl && e.key === "i") { e.preventDefault(); insertFormat("italic"); return; }
    if (ctrl && e.key === "k") { e.preventDefault(); insertFormat("link"); return; }
    if (ctrl && e.shiftKey && e.key.toLowerCase() === "x") { e.preventDefault(); insertFormat("strike"); return; }
    if (ctrl && e.shiftKey && e.key.toLowerCase() === "k") { e.preventDefault(); insertFormat("codeblock"); return; }

    // Tab key → insert 2 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const newValue = value.substring(0, start) + "  " + value.substring(start);
      onChange(newValue);
      requestAnimationFrame(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      });
    }
  }

  const html = (() => {
    try { return renderMarkdown(value); }
    catch { return ""; }
  })();

  // Keep the WYSIWYG surface in sync with external Markdown changes without
  // replacing its DOM while the user is typing (which would move the caret).
  useEffect(() => {
    if (previewRef.current && !previewFocusedRef.current && previewRef.current.innerHTML !== html) {
      previewRef.current.innerHTML = html;
    }
  }, [html, activeViewMode]);

  function markdownFromPreview(): string | null {
    const element = previewRef.current;
    if (!element) return null;
    return turndown.turndown(element.innerHTML);
  }

  function handlePreviewInput() {
    const markdown = markdownFromPreview();
    if (markdown !== null) onChange(markdown);
  }

  return (
    <div className="flex flex-col h-full" data-color-mode="dark">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[rgba(255,255,255,0.08)] bg-zinc-900 overflow-x-auto">
        {TOOLBAR.map((btn) => (
          <button
            key={btn.action}
            onClick={() => insertFormat(btn.action)}
            className="flex items-center justify-center w-7 h-7 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors flex-shrink-0"
            title={btn.label}
          >
            <FontAwesomeIcon icon={btn.icon} className="w-3.5 h-3.5" />
          </button>
        ))}

        {/* Standalone mode toggle. DocsEditor provides its own header controls. */}
        {!onViewModeChange && <div className="ml-auto flex items-center gap-0.5 bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("edit")}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
              activeViewMode === "edit" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Nur Editor"
          >
            <FontAwesomeIcon icon={faCodeIcon} className="w-3 h-3" />
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
              activeViewMode === "split" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Beides"
          >
            <FontAwesomeIcon icon={faColumns} className="w-3 h-3" />
          </button>
          <button
            onClick={() => setViewMode("split-reverse")}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
              activeViewMode === "split-reverse" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Vorschau links, Markdown rechts"
          >
            <FontAwesomeIcon icon={faRightLeft} className="w-3 h-3" />
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
              activeViewMode === "preview" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Nur Vorschau"
          >
            <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
          </button>
        </div>}
      </div>

      {/* Editor Area */}
      <div className={`flex-1 flex overflow-hidden ${activeViewMode === "split-reverse" ? "flex-row-reverse" : ""}`}>
        {/* Edit Area */}
        {activeViewMode !== "preview" && (
          <div className={`${activeViewMode === "split" ? "w-1/2 border-r border-[rgba(255,255,255,0.08)]" : activeViewMode === "split-reverse" ? "w-1/2 border-l border-[rgba(255,255,255,0.08)]" : "w-full"} flex flex-col`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 w-full bg-zinc-950 text-zinc-200 p-6 resize-none outline-none font-mono text-sm leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview Area */}
        {activeViewMode !== "edit" && (
          <div
            className={`${activeViewMode === "split" || activeViewMode === "split-reverse" ? "w-1/2" : "w-full"} overflow-y-auto bg-zinc-900`}
          >
            <div
              ref={previewRef}
              className="markdown-preview markdown-preview-editable min-h-full p-6 text-zinc-200 max-w-none outline-none"
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="Markdown-Vorschau bearbeiten"
              aria-multiline="true"
              data-placeholder="In der Vorschau schreiben…"
              onFocus={() => { previewFocusedRef.current = true; }}
              onInput={handlePreviewInput}
              onBlur={() => {
                const markdown = markdownFromPreview();
                previewFocusedRef.current = false;
                if (markdown === null) return;
                onChange(markdown);
                // Normalize exactly the DOM content that was just edited. This
                // avoids restoring an older render while React updates value.
                if (previewRef.current) previewRef.current.innerHTML = renderMarkdown(markdown);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
