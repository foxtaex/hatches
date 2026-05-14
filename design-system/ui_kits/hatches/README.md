# Hatches UI Kit

High-fidelity React component recreations of the Hatches application interface.

## Overview

This UI kit provides working, interactive components that demonstrate the visual design and behavior of the Hatches team workspace application. Components are simplified for prototyping — they show realistic interactions without backend dependencies.

## Structure

- `index.html` — Main demo page with navigation and view switching
- `Navigation.jsx` — Top navigation bar with branding, nav items, and user menu
- `KanbanBoard.jsx` — Complete kanban board with sidebar, columns, and cards

## Components

### Navigation
Top navigation bar with:
- Brand logo and name
- Section navigation (Board, Docs, Notizen, Websites, Integrationen)
- Admin section toggle for admin users
- User avatar and logout button

### KanbanBoard
Full kanban interface with:
- Board sidebar with list of boards
- Multi-column drag-and-drop layout (visual only, no actual drag)
- Card items with titles, descriptions, assignees, and external issue badges
- Add board, add column, add card workflows
- Team indicators on boards

## Usage

Open `index.html` in a browser to see the full interactive demo. Components are modular and can be copied into other prototypes.

## Design Fidelity

These components match the pixel-perfect design of the production Hatches application:
- Exact color values from colors_and_type.css
- FontAwesome 6.7.2 icons
- System font stack
- Zinc color palette with dark backgrounds
- 48px navigation height
- 4px border radius on buttons/inputs
- Consistent hover states and transitions

## Notes

- Components use inline styles for portability
- No actual drag-and-drop library (dnd-kit) — visual only
- Mock data embedded for demonstration
- German language UI labels match production
