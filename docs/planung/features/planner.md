# Planner — Calendar + Timeline Specification

> **Component:** `src/components/planner/`
> **Status:** Planned
> **Files:** (future) Planner.tsx, CalendarView.tsx, TimelineView.tsx, SchedulePanel.tsx

---

## Overview

Calendar + Timeline + Schedule — Planung und Zeitmanagement.

**Ziel:** Events = Docs mit Date Frontmatter.

---

## Components (Future)

```
planner/
├── Planner.tsx           ← Main Container + Navigation
├── CalendarView.tsx       ← Month / Week / Day View
├── TimelineView.tsx       ← Horizontal Timeline (Gantt-style)
├── SchedulePanel.tsx      ← Upcoming Events Sidebar
├── EventModal.tsx         ← Event erstellen/bearbeiten
└── README.md             ← This file
```

---

## Views

### Calendar View

| View | Beschreibung |
|------|-------------|
| **Month** | Month grid (like Google Calendar) |
| **Week** | 7-day horizontal view |
| **Day** | Single day with hour slots |
| **Agenda** | List of upcoming events |

### Timeline View

```
┌─────────────────────────────────────────────────────────────────┐
│ Today                                              May 2026    │
├─────────────────────────────────────────────────────────────────┤
│                                                   │            │
│ Project A  ══════════════░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│            ├─────────────┤     ├──────────────────┤            │
│            │ Phase 1    │     │ Phase 2          │            │
│                                                   │            │
│ Project B  ════════════════════════════░░░░░░░░░░░░░░░░░░░░░ │
│            ├────────────────────────────┤                       │
│            │ Main Development          │ (overdue)             │
│                                                   │            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### Event Management

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Event erstellen | ❌ | Click on calendar |
| Event bearbeiten | ❌ | Click event → modal |
| Event löschen | ❌ | Delete button |
| Event verschieben | ❌ | Drag & drop |
| All-day event | ❌ | Toggle |
| Recurring event | ❌ | Daily/Weekly/Monthly |

### Calendar Features

| Feature | Status | Beschreibung |
|---------|--------|-------------|
| Month navigation | ❌ | Prev/Next buttons |
| Today button | ❌ | Jump to today |
| Event preview | ❌ | Hover/tap event |
| Event colors | ❌ | By category/project |
| Time zones | ❌ | (future) |

### Integration

| Integration | Status | Beschreibung |
|-------------|--------|-------------|
| Kanban Due Dates | ❌ | Card due date → Calendar |
| iCal Import | ❌ | External calendars |
| iCal Export | ❌ | Share calendar |
| Reminders | ❌ | AI notifications (future) |

---

## Data Model

```typescript
interface Event {
  id: number;
  title: string;
  content: string;        // Markdown (optional notes)
  startDate: Date;        // Start + Time
  endDate: Date;          // End + Time (optional)
  allDay: boolean;         // All-day event
  recurring: RecurringRule | null;
  
  // Organization
  userId: number;
  teamId: number | null;
  
  // Categorization
  color: string;           // Event color
  projectId: number | null;
  
  // Reminders
  reminders: number[];    // Minutes before (e.g. [15, 60])
  
  createdAt: Date;
  updatedAt: Date;
}

interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;       // Every N days/weeks/months
  endDate: Date | null;   // Until when
  count: number | null;   // How many times
}
```

---

## API Endpoints

```
GET    /api/events              → Alle Events (mit date range)
POST   /api/events              → Event erstellen
GET    /api/events/:id          → Event abrufen
PATCH  /api/events/:id          → Event aktualisieren
DELETE /api/events/:id          → Event löschen

GET    /api/calendar/:year/:month  → Month data

POST   /api/events/import       → iCal import
GET    /api/events/export      → iCal export
```

---

## UI/UX

### Month View

```
┌─────────────────────────────────────────────────────────────┐
│ ← May 2026                                          Today → │
├─────────────────────────────────────────────────────────────┤
│ Sun    Mon    Tue    Wed    Thu    Fri    Sat               │
├─────────────────────────────────────────────────────────────┤
│  27     28     29     30      1      2      3               │
│               ●●●                            (3 events)     │
│  4      5      6      7       8      9     10                │
│                                            (all day event)  │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Event Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Event                                              [Close X]│
├─────────────────────────────────────────────────────────────┤
│ Title: [________________________________]                   │
│                                                             │
│ Date:  [14.05.2026]  Time: [09:00] - [10:00]               │
│         [ ] All-day event                                    │
│                                                             │
│ Repeat: [Never ▼] [Daily] [Weekly] [Monthly]               │
│                                                             │
│ Color: [●] [●] [●] [●] [●] [●]                             │
│                                                             │
│ Reminders: [15 min before ▼] [+ Add]                        │
│                                                             │
│ Notes:                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                          │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                         [Delete]  [Cancel]  [Save]          │
└─────────────────────────────────────────────────────────────┘
```

---

## Future Enhancements

### Phase 2
- [ ] Basic Calendar View
- [ ] Event CRUD
- [ ] Month/Week/Day navigation

### Phase 3
- [ ] Timeline View (Gantt)
- [ ] Drag & Drop
- [ ] Recurring Events
- [ ] iCal Import/Export

### Phase 4
- [ ] Resource Calendar (Team availability)
- [ ] Project Timeline
- [ ] Milestones
- [ ] AI Scheduling

---

## Tech Stack

```
date-fns           → Date handling
react-big-calendar → Calendar UI (or custom)
dnd-kit            → Drag & Drop
```

---

*Letztes Update: 2026-05-14*
