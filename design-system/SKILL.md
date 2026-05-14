---
name: hatches-design
description: Use this skill to generate well-branded interfaces and assets for Hatches, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Key Design Principles

**Hatches** is a lean, self-hosted team workspace for developers with a dark, minimal aesthetic.

### Visual DNA
- **Dark-first:** zinc-950 body, zinc-900 surfaces, zinc-800 borders
- **Low contrast:** zinc-400 inactive, zinc-100 active text
- **Minimal accents:** blue-600 primary, green/red for states
- **Dense layout:** tight spacing, 48px nav height
- **System fonts only:** no custom webfonts
- **FontAwesome 6.7.2 icons** exclusively
- **No gradients, textures, or shadows** — flat, solid colors only
- **Fast transitions:** 200ms color changes, no spring physics

### Content Style
- **German UI** throughout (e.g., "Anmelden", "Speichern", "Notizen")
- **Direct, utilitarian** language — no marketing fluff
- **Developer-first** terminology
- **UPPERCASE brand text** with wide letter-spacing (HATCHES)
- **No emoji** — pure text and icons only

### Component Patterns
- **Inputs:** zinc-800 bg, zinc-700 border, 10px padding
- **Buttons:** blue-600 primary, zinc-700 secondary, medium weight
- **Navigation:** 48px height, rounded items with icon+label
- **Cards:** zinc-900 bg, border-bottom dividers, no drop shadows
- **Hover states:** Lighter background, brighter text

See colors_and_type.css for complete token definitions and ui_kits/hatches/ for working component examples.
