export interface CardLabel {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Card {
  id: number;
  title: string;
  description: string | null;
  position: number;
  columnId: number;
  assigneeId: number | null;
  assignee?: { id: number; displayName: string | null; username: string } | null;
  externalIssue?: { externalId: string; url: string | null; integration: { type: string } } | null;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  column?: { id: number; title: string; board?: { id: number; name: string } } | null;
  // Trello/Notion Features
  dueDate: string | null;
  priority: string | null;
  labels: string; // JSON: CardLabel[]
  coverColor: string | null;
  checklist: string; // JSON: ChecklistItem[]
}

export interface Column {
  id: number;
  title: string;
  position: number;
  boardId: number;
  cards: Card[];
}

export interface Board {
  id: number;
  name: string;
  columns: Column[];
}

// Helpers to parse JSON fields safely
export function parseLabels(raw: string | null | undefined): CardLabel[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return []; }
}

export function parseChecklist(raw: string | null | undefined): ChecklistItem[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return []; }
}

export const PRIORITY_CONFIG = {
  urgent: { label: "Dringend", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  high:   { label: "Hoch",     color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  medium: { label: "Mittel",   color: "#eab308", bg: "rgba(234,179,8,0.15)"  },
  low:    { label: "Niedrig",  color: "#22c55e", bg: "rgba(34,197,94,0.15)"  },
} as const;

export const LABEL_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#3CC79A", "#6366f1", "#f43f5e", "#84cc16",
];
