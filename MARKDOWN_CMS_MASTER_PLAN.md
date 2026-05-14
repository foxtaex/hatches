# Hatches Markdown

> **Version:** 0.1 (Planung)
> **Ziel:** Obsidian + Notion + Astro-editor in einem
> **Team:** Johanna + Yuri + Claude Code

---

## Vision

**Hatches Markdown** = Obsidian (Local-First, Markdown, Graph) + Notion (Blocks, DB, Views) + Astro-editor (Frontmatter, MDX, Schema) + mehr

Ein CMS das:
- Markdown liebt (nicht bekämpft)
- Lokale Dateien behält (nicht wegsperrt)
- Block-basiert arbeitet (wie Notion)
- Vault/Graph hat (wie Obsidian)
- Frontmatter + MDX kann (wie Astro-editor)
- Self-hosted + kostenlos ist
- Mit AI arbeitet (Agent API)

---

## 1. Core Editor (Block Editor)

### 1.1 Block Types
```
Text Block       — Markdown text mit Live Preview
Heading Block    — H1-H6 mit Anker-Links
List Block       — Bullet, Numbered, Todo (checkbox)
Quote Block      — Zitat mit Autor
Code Block       — Syntax Highlighting (Shiki)
Callout Block    — Info/Warning/Error/Debug boxes
Image Block      — Upload + URL + Alt + Caption
Video Block      — Embed (YouTube, Vimeo, etc.)
File Block       — Attachment Download
Embed Block      — Website Preview (OG tags)
Divider Block    — Horizontal rule
Table Block      — Editable table
Database Block   — Embedded Notion-style DB
MDX Block        — React component insertion
```

### 1.2 Slash Commands
```
/text      → Text block
/h1, /h2   → Heading
/bullet    → Bullet list
/numbered  → Numbered list
/todo      → Todo with checkbox
/quote     → Quote block
/code      → Code block (mit language selector)
/callout   → Callout (info/warning/error)
/image     → Image upload/URL
/video     → Video embed
/table     → Table
/divider   → Horizontal rule
/embed     → URL embed preview
/database  → Create/view database
/mdx       → Insert MDX component
/template  → Insert from template library
```

### 1.3 Keyboard Shortcuts
```
Ctrl+B        → Bold
Ctrl+I        → Italic
Ctrl+K        → Link
Ctrl+Shift+K  → Code inline
Ctrl+[        → Decrease indent
Ctrl+]        → Increase indent
Ctrl+/        → Toggle bullet/numbered
Enter         → New block (below)
Shift+Enter   → Hard line break
Backspace     → Merge blocks / delete empty
Ctrl+Enter    → Create todo
/             → Slash command menu
```

---

## 2. Obsidian Features

### 2.1 Vault Management
```
Local Vault     — Ordner auf der Festplatte
Git Integration — Auto-commit, sync
Watch Mode      — Dateiänderungen von außen
Sync            — WebDAV, iCloud, S3, Git
```

### 2.2 Graph View
```
Knowledge Graph — Nodes + Edges
Bidirectional Links — [[page]] syntax
Backlinks       — "Linked here" panel
Orphans         — Unlinked pages
Local Graph     — Single page connections
Filter          — By tag, date, type
Zoom            — Pan + zoom
Tags            — #tag visualization
Clusters        — Auto-group related
```

### 2.3 Plugins System
```
Plugin API      — Extensions möglich
Official Plugins:
├── Daily Notes
├── Templates
├── Sync (Obsidian Sync)
├── Publish (Site)
├── Encrypt (E2E)
└── AI (Agent)
Community Plugins:
├── Kanban
├── Database
├── Calendar
├── Charts
└── + mehr
```

### 2.4 Obsidian-Commands
```
Ctrl+O    → Quick switcher
Ctrl+P    → Command palette
Ctrl+Shift+F → Search in vault
Ctrl+E    → Toggle edit/preview
Ctrl+Tab  → Cycle tabs
Ctrl+W    → Close tab
Ctrl+Shift+E → Graph view
Ctrl+D    → Daily note
Ctrl+R    → Recent files
```

---

## 3. Notion Features

### 3.1 Databases
```
Types:
├── Table      — Spreadsheet-like
├── Board      — Kanban (drag & drop)
├── Gallery    — Card grid
├── Calendar    — Month view
├── Timeline    — Gantt/roadmap
├── List        — Simple list view

Properties:
├── Text
├── Number (+ currency, percent)
├── Select (single)
├── Multi-select (tags)
├── Date (+ time, range)
├── Person (+ teams)
├── Files & Media
├── URL
├── Email
├── Phone
├── Checkbox
├── Formula
├── Relation (→ andere DB)
├── Rollup
└── Created/Edited time
```

### 3.2 Views & Filtering
```
Multiple Views    — Per DB, switchbar
Filters          — AND/OR logic
Sort             — Multi-level
Group            — By property
Hide/Show        — Columns
Kanban grouping  — By status/owner/date
Calendar range   — Start/end date
Timeline layout  — Custom fields
```

### 3.3 Relations & Rollups
```
Linked Pages     — Relation property
Cross-DB Refs   — Rollup aggregates
Count, Sum, Average
Filter in rollup
```

---

## 4. Astro-editor Features

### 4.1 Frontmatter
```
Schema Definition — Per collection
Field Types:
├── String (text, textarea)
├── Number (integer, float)
├── Boolean
├── Date (+ datetime)
├── Enum (select)
├── Array (multi)
├── Object (nested)
└── Reference (relation)

Auto-Generated:
├── title (from filename)
├── date (created/modified)
├── tags (from folder)
└── custom fields
```

### 4.2 MDX Components
```
Component Picker — Cmd+/
Available:
├── <Button>
├── <Card>
├── <Alert>
├── <Tabs>
├── <Accordion>
├── <Gallery>
├── <Code>
├── <Video>
├── <Chart>
└── Custom from /components
```

### 4.3 Focus Modes
```
Write Mode       — Distraction-free
Typewriter Mode  — Cursor centered
Copyedit Mode    — Speech highlighting
Dark/Light       — Theme toggle
Font Size        — Aa - Aa
Line Width       — Narrow/Normal/Wide
Spell Check      — Languages
```

---

## 5. Additional Features

### 5.1 AI Integration
```
Commands:
/ai ask          — Question to AI
/ai summarize    — Current page
/ai expand       — Expand outline
/ai fix          — Fix grammar/spell
/ai translate    — Translate
/ai outline      — Create outline

Agent API:
├── Task creation
├── Auto-tagging
├── Content suggestions
└── Smart search
```

### 5.2 Team Collaboration
```
Real-time        — Cursor positions
Comments         — Inline comments
Suggestions      — Propose changes
Approval         — Review workflow
Version History  — All changes
Permissions      — By page/DB/team
```

### 5.3 Publishing (Future)
```
Static Export    — HTML/ZIP
Astro Integration
Custom Domains
SEO Optimized
Sitemap + RSS
```

---

## 6. Tech Stack

```
Frontend:
├── Astro 6 (SSR)
├── React Islands
├── Tailwind CSS v4
├── TipTap (Block Editor)
├── Shiki (Code Highlighting)
└── marked (Markdown parsing)

Backend:
├── Prisma 7
├── SQLite (default)
├── PostgreSQL (production)
└── Session Auth

Features:
├── dnd-kit (Drag & Drop)
├── Fuse.js (Search)
├── Dexie.js (Local-first cache)
├── TweetNaCl.js (E2E Encryption)
└── ws (Real-time sync)
```

---

## 7. Roadmap

### Phase 1: Foundation (Jetzt)
- [ ] Block Editor (TipTap)
- [ ] Markdown Parser (marked/rehype)
- [ ] Basic View Modes (Edit/Split/Preview)

### Phase 2: Obsidian Features
- [ ] Vault management
- [ ] Graph view
- [ ] [[Links]] + Backlinks
- [ ] Command palette

### Phase 3: Notion Databases
- [ ] Table view
- [ ] Kanban view
- [ ] Gallery view
- [ ] Relations + Rollups

### Phase 4: Astro-editor Features
- [ ] Frontmatter editor
- [ ] Schema definition
- [ ] MDX component picker
- [ ] Focus modes

### Phase 5: AI + Team
- [ ] AI commands (/ai)
- [ ] Agent API
- [ ] Real-time collaboration
- [ ] Comments + suggestions

### Phase 6: Publish
- [ ] Static export
- [ ] Custom domains
- [ ] SEO tools

---

## 8. Contribution

Wer macht was:

```
Johanna (Aice)  → Lead, Vision, Design
Yuri            → Architecture, Docs, AI
Claude Code     → Code, Fixes, Features
Team (Foxtaex, Erik, Syntarex, Harry) → Testing, Feedback
```

---

*Erstellt: 2026-05-14*
*Status: Planning / Vision*