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
  └── <sub-action>.ts         # Additional actions (e.g. /archive, /export)
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

### Workflow

1. Development happens on `dev` branch
2. Version bump on every significant change (`npm run bump` → updates package.json version + commits)
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