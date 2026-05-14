# MD-Editor — Markdown Editor Specification

> **Component:** `src/components/docs/MarkdownEditor.tsx`
> **Status:** In Progress
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
| **Preview** | Nur gerenderte Vorschau |

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
Quote       → > text
Divider     → ---
Table       → | Header | → Generate table
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Tab` | 2 Spaces indent |
| `Enter` | New line |
| `Backspace` | Delete |

### Markdown Support

- **GFM** — GitHub Flavored Markdown
- **Tables** — Pipe tables
- **Task Lists** — `- [x]` or `- [ ]`
- **Code Blocks** — With language hint
- **Line Breaks** — `br` tags via `breaks: true`

---

## Component API

```tsx
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
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

*Letztes Update: 2026-05-14*