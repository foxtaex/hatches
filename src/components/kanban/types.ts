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
