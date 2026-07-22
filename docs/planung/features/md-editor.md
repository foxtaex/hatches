# MD-Editor — Markdown Editor Specification

> **Component:** `src/components/docs/MarkdownEditor.tsx`
> **Status:** ✅ Implementiert
> **Version:** 0.5.26.18.22-dev.1d
> **Replaces:** @uiw/react-md-editor

---

## Overview

Eigener Markdown Editor mit Live Preview — inspiriert von iA Writer + Astro-editor.

**Ziel:** Block-basiert wie Notion, aber für Markdown-Natives.

---

## Features

### View Modes

| Mode | Beschreibung |
|------|-------------|
| **Edit** | Nur Text-Editor (Monaco-style) |
| **Split** | Editor links, Preview rechts (50/50) |
| **Reverse Split** | Bearbeitbare Vorschau links, Markdown rechts (50/50) |
| **Preview** | Direkt bearbeitbare WYSIWYG-Vorschau |

### Toolbar

```
Bold        → **text**
Italic      → _text_
Strike      → ~~text~~
Heading     → ## text
Bullet List → - item
Numbered    → 1. item
Link        → [text](url)
Image       → ![alt](url)
Code        → `code`
Code-block  → ```[Sprache]    <- wie Discord
              Code
              ```
Quote       → > text
Divider     → ---
Table       → | Header | → Generate table
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+Shift+K` | Codeblock |
| `Tab` | 2 Spaces indent |
| `Enter` | New line |
| `Backspace` | Delete |

### Markdown Support

- **GFM** — GitHub Flavored Markdown
- **Tables** — Pipe tables
- **Task Lists** — `- [x]` or `- [ ]`
- **Code Blocks** — With language hint
- **Syntax Highlighting** — `js`, `ts`, `python`, `css`, `html` und weitere Sprachen via highlight.js
- **Line Breaks** — `br` tags via `breaks: true`

---

## Component API

```tsx
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  viewMode?: "edit" | "preview" | "split" | "split-reverse";
  onViewModeChange?: (mode: ViewMode) => void;
}
```

**Usage:**
```tsx
<MarkdownEditor
  value={content}
  onChange={setContent}
  placeholder="Schreibe Markdown..."
/>
```

---

## Future Enhancements

### Doc-Kommentare und PDF-Export
- [ ] Kommentare an markierten Textstellen
- [ ] Antworten und Erledigt-Status
- [ ] Druckfreundlicher PDF-Export
- [ ] Details: [`doc-comments-pdf-export.md`](./doc-comments-pdf-export.md)

### Smart Tables
- [ ] Visuelle Bearbeitung von Markdown-Tabellen als Zellenraster
- [ ] Zeilen und Spalten verwalten, sortieren und filtern
- [ ] Einfache Formeln und CSV-Import/-Export
- [ ] Verlustfreier Wechsel zwischen Smart-Table- und Markdown-Ansicht
- [ ] Details: [`smart-tables.md`](./smart-tables.md)

### Phase 2 (Block Editor)
- [ ] TipTap Integration (Block-basiert)
- [ ] Drag & Drop Blöcke
- [ ] Inline Formatting Toolbar
- [ ] Slash Commands (`/`, `/h1`, `/code`, etc.)

### Phase 3 (Obsidian-like)
- [ ] [[Wiki Links]]
- [ ] Backlinks Panel
- [ ] Graph View
- [ ] Command Palette (Ctrl+K)

### Phase 4 (Astro-editor-like)
- [ ] Frontmatter Editor (Sidebar)
- [ ] Schema Validation
- [ ] MDX Component Picker (Cmd+/)

---

## Tech Stack

```
marked         → Markdown parsing
highlight.js   → Syntax Highlighting für Codeblöcke
marked-highlight → Verbindung zwischen Parser und Highlighter
turndown       → WYSIWYG-HTML zurück zu Markdown
turndown-plugin-gfm → Tabellen, Task Lists, Strikethrough erhalten
shiki          → Syntax highlighting (future)
@tiptap/core   → Block editor (future)
react-split    → Split view resize
```

---

## Files

```
src/components/docs/
├── MarkdownEditor.tsx  ← Main component (jetzt)
├── DocsEditor.tsx      ← Wrapper mit Sidebar
├── SimpleMDE.tsx       ← (deprecated, renamed)
└── BlockEditor.tsx     ← (future, TipTap)
```

---

*Letztes Update: 2026-07-22 — Codeblöcke, Syntax-Highlighting und WYSIWYG-Synchronisierung stabilisiert*
