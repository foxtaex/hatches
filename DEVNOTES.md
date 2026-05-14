# Hatches — Dev Notes

## Architecture

### Modular / Component-Based Design

All features must be built as **standalone, composable modules**. The UI is composed entirely of React Islands (Astro islands architecture). New features should follow this pattern:

```
src/components/<feature>/
  ├── <FeatureName>.tsx       # Main component (island)
  ├── <FeatureName>List.tsx   # List/overview view
  ├── <FeatureName>Item.tsx   # Single item/card
  ├── types.ts                # TypeScript interfaces
  └── index.ts                # Re-export main component

src/pages/api/<feature>/
  ├── index.ts                # GET (list) + POST (create)
  ├── [id].ts                 # GET + PATCH + DELETE for single item
  └── <sub-action>.ts          # Additional actions (e.g. /archive, /export)
```

**Rules:**
- Each module has its own component folder
- API routes are co-located with the feature they serve
- No cross-feature imports without going through `src/lib/` shared utilities
- New feature = new component folder + new API route group
- Keep `src/lib/` clean — only truly shared code goes there

### Stack

- **Astro 6** (SSR) + **React 19** Islands
- **Tailwind CSS v4**
- **Prisma 7** (SQLite default, supports PostgreSQL/MySQL/MSSQL)
- **dnd-kit** for drag & drop
- **@uiw/react-md-editor** for markdown editing

### Design System

See **`DESIGN.md`** for complete design specification, color tokens, typography,
and feature descriptions (all 7 modules fully documented).

The `design-system/` folder contains:
- `colors_and_type.css` — CSS custom properties
- `preview/*.html` — Visual component cards
- `ui_kits/hatches/` — React UI kit components

### Workflow

1. Development happens on `dev` branch
2. Version bump on every significant change
3. `main` only via PR from `dev`
4. Semantic versioning: `major.minor.patch`

## Version History

| Version | Commit | Changes |
|---------|--------|---------|
| 0.0.5 | a516145 | Initial commit (archive + md import/export added later) |
| 0.0.6 | - | First patch after split |
| 0.0.7 | 11b94b3 | fix: import faBoxArchive in KanbanBoard |
| 0.0.8 | 20a9030 | docs: add logo SVG and embed in README |
| 0.0.9 | 57b3f93 | docs: add 3 logo variants (A Vivid, B Subtle, C Outline) |
| 0.1.0 | 010c32d | docs: add DEVNOTES.md with modular architecture guidelines |
| 0.1.1 | - | feat: full design system + 7 feature modules documented in DESIGN.md |