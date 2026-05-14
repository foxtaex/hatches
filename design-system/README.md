# Hatches Design System

A comprehensive design system for **Hatches** — a lean, self-hosted team workspace and Notion alternative for developers.

## Product Context

Hatches is a developer-focused collaboration platform with a dark, minimal aesthetic. It provides:

- **Kanban Board** — Multi-board drag & drop with card assignment and external issue badges
- **Docs** — Markdown editor with live split-view preview
- **Notes** — Quick personal note-taking
- **Websites** — Internal URL & project registry
- **Integrations** — Import from GitHub, GitLab, Jira, Redmine, MantisBT, Confluence, Trello
- **Teams & Roles** — Discord-style permission system with granular section toggles

## Tech Stack

- Astro 6 (SSR) + React Islands
- Tailwind CSS v4
- FontAwesome 6.7.2 for icons
- Prisma 7 with SQLite/PostgreSQL/MySQL/MSSQL support
- dnd-kit for drag & drop
- @uiw/react-md-editor for Markdown

## Source Materials

This design system is built from the GitHub repository:
- **Repository:** [foxtaex/hatches](https://github.com/foxtaex/hatches)
- **License:** MIT + Commons Clause

Users with access to this repository can explore component implementations, database schemas, and integration patterns in greater depth.

## Design System Contents

### Core Files
- `colors_and_type.css` — Color palette and typography system
- `assets/` — Logos, icons, and brand imagery (logo.svg)
- `preview/` — Visual component cards for the Design System tab

### UI Kits
- `ui_kits/hatches/` — High-fidelity React component recreations of the main application

### Preview Cards
The Design System tab includes visual cards for:
- **Colors:** Background palette (zinc-950 to zinc-600), foreground colors, accent colors
- **Typography:** H1, H2, body, caption, brand text specimens
- **Components:** Buttons, form inputs, navigation bar, user account view
- **Spacing:** Spacing tokens (4px–48px), border radius system

---

## Index

This design system includes:

1. **README.md** (this file) — Overview, content fundamentals, visual foundations, iconography
2. **colors_and_type.css** — Complete CSS custom properties for colors, typography, spacing, and shadows
3. **assets/logo.svg** — Hatches logo (Astro-inspired wrench/tool icon)
4. **preview/** — 10 HTML cards demonstrating color scales, typography, buttons, inputs, navigation, spacing, radius, and user account view
5. **ui_kits/hatches/** — Interactive React UI kit with Navigation and KanbanBoard components
6. **SKILL.md** — Agent skill definition for using this design system

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Direct and utilitarian** — no marketing fluff, just functional labels
- **Developer-first language** — technical terms without explanation (e.g. "Integrationen", "Prisma", "SSR")
- **Lowercase headings** in UI (navigation, buttons) — German language throughout the UI
- **Second-person** ("you") implied but minimal — mostly noun-based labels
- **No emoji** — pure text and FontAwesome icons only

### Copy Style
- **Casing:** Sentence case for most UI text; UPPERCASE for brand ("HATCHES" in nav)
- **Buttons:** Action verbs (Anmelden, Speichern, Erstellen, Abmelden)
- **Navigation:** Nouns (Board, Docs, Notizen, Websites, Integrationen, Admin)
- **Microcopy:** Minimal explanatory text — interface should be self-evident
- **Placeholders:** Clear and specific (e.g. "Benutzername oder E-Mail", "Neues Board")

### Language
- **Primary language:** German (de)
- Interface uses German labels and terms consistently
- Technical terms and brand names remain in English (Hatches, Kanban, Markdown)

### Content Patterns
- **Sparse UI text** — relies heavily on icons + short labels
- **No help text or tooltips** by default — assumes technically savvy users
- **Error messages** are direct: "Ungültiger Benutzername oder Passwort"
- **Empty states** use simple placeholder text without illustration

---

## VISUAL FOUNDATIONS

### Color System
- **Dark-first design** — zinc-950 body, zinc-900 surfaces, zinc-800 borders
- **Low contrast by default** — zinc-400 for inactive elements, zinc-100 for active
- **Minimal accent usage** — blue-600 for primary actions, green for success, red for errors
- **No gradients** — flat colors throughout
- **Transparency:** None — solid colors only, no rgba/opacity layers

### Typography
- **System fonts only** — no custom webfonts
- **Font stack:** system-ui, -apple-system fallback chain
- **Mono for code:** ui-monospace with SF Mono fallback
- **Scale:** Tight (12px–24px range) — no display sizes
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Letter-spacing:** WIDEST (0.1em) for brand text only; normal elsewhere

### Layout & Spacing
- **Dense information architecture** — minimal padding, tight gaps
- **12-column grid implied** but not enforced — components use flex/gap
- **Consistent spacing:** 4px increments (0.25rem base)
- **Navigation height:** Fixed 48px (3rem)
- **Full-bleed surfaces** — no max-width containers; uses flex-1 to fill

### Backgrounds
- **Solid dark colors** — zinc-950, zinc-900, zinc-800 stepped hierarchy
- **No textures or patterns**
- **No images in UI** — pure color backgrounds
- **Border separation** preferred over box-shadow for depth

### Borders & Shadows
- **Borders:** 1px solid, zinc-800 default
- **No drop shadows** on UI elements
- **No inner shadows**
- **Border radius:** Minimal — 4px–6px on buttons/inputs, never large rounded

### Animation & Interaction
- **Transitions:** Fast (200ms) color/background changes
- **No spring physics** or bounce easing
- **Hover states:** Lighter background (zinc-800 → zinc-700), brighter text (zinc-400 → zinc-100)
- **Active/focus states:** zinc-700 background, zinc-500 border
- **No scale transforms** on hover
- **Drag & drop** uses dnd-kit — visual feedback via opacity/positioning only

### Cards & Containers
- **No card component** — sections use border-bottom dividers instead
- **Flat surfaces** — zinc-900 containers on zinc-950 body
- **List items** have border-bottom, hover changes background
- **Modals/panels** use zinc-900 background with zinc-800 border

### Iconography Style
- **FontAwesome 6.7.2** solid icons exclusively
- **Size:** Uniform, typically 14px (text-sm equivalent)
- **Color:** zinc-400/500/600 depending on hierarchy
- **Spacing:** 6px (gap-1.5) between icon and label
- **No custom SVG icons** — FontAwesome provides all needed glyphs

### Visual Hierarchy
- **Color-based hierarchy** — not size/weight
- **Active states** use lighter zinc shades + solid backgrounds
- **Disabled states** use darker zinc-600 with reduced opacity
- **Danger actions** use red-600, not outlined or ghost styles

### Component Patterns
- **Inputs:** zinc-800 bg, zinc-700 border, zinc-100 text, 10px vertical padding
- **Buttons:** blue-600 primary, zinc-700 secondary, 10px vertical padding, medium weight
- **Navigation items:** Rounded (4px), text-sm, horizontal flex with icon+label
- **Form fields:** Full-width by default, stacked with gap-4
- **Tables:** Border-bottom rows, no outer border, tight cell padding

---

## ICONOGRAPHY

### Icon System
Hatches uses **FontAwesome 6.7.2** (Free Solid icons) exclusively, loaded via CDN:
```
https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css
```

### Usage Patterns
- **Navigation icons:** fa-table-columns (Board), fa-book (Docs), fa-note-sticky (Notes), fa-globe (Websites), fa-plug (Integrations), fa-shield-halved (Admin)
- **Action icons:** fa-plus (add), fa-xmark (close/cancel), fa-pen (edit), fa-trash (delete), fa-check (confirm)
- **Status icons:** fa-lock (private), fa-users (team/shared), fa-screwdriver-wrench (tools/devtools)
- **User icons:** fa-user (single user), fa-right-from-bracket (logout)
- **Utility icons:** fa-arrow-right-arrow-left (move/transfer), fa-chevron-right (expand/navigate)

### Icon Styling
- **Size:** Inline with text (typically 14px / 0.875rem)
- **Color:** Inherits from parent or set to zinc-400/500/600
- **Spacing:** 6px gap (gap-1.5) between icon and adjacent text
- **Width:** Fixed width (w-3.5, 14px) for alignment in lists
- **No badges or overlays** on icons
- **No animated icons** — static glyphs only

### Icon-First Design
- Most UI actions lead with an icon, followed by a text label
- Icons are never used alone without accessible labels
- Icon + label pairs are horizontally aligned with flexbox

### Assets
- **Logo:** `assets/logo.svg` — Astro-inspired wrench/tool icon
- **No emoji** — not part of the visual system
- **No custom icon sprites** — FontAwesome provides complete coverage

### When Not to Use Icons
- Long-form text content (docs, notes)
- Form input placeholder text
- Error messages
- Modal/dialog body content

---

This design system provides everything needed to create on-brand interfaces, prototypes, and assets for Hatches.
