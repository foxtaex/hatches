import { prisma } from "./db";

interface ProjectUser {
  id: number;
  isAdmin: boolean;
  memberships?: { teamId: number }[];
}

export function projectVisibilityWhere(user: ProjectUser) {
  if (user.isAdmin) return {};
  const teamIds = (user.memberships ?? []).map((membership) => membership.teamId);
  return { OR: [{ teamId: { in: teamIds } }, { teamId: null, ownerId: user.id }] };
}

export async function accessibleProject(projectId: number, user: ProjectUser) {
  return prisma.project.findFirst({
    where: { id: projectId, ...projectVisibilityWhere(user) },
    select: { id: true, ownerId: true, teamId: true },
  });
}

export function canUseTeam(teamId: number | null, user: ProjectUser) {
  if (teamId === null || user.isAdmin) return true;
  return (user.memberships ?? []).some((membership) => membership.teamId === teamId);
}

export async function canAccessBoard(boardId: number, user: ProjectUser) {
  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { ownerId: true, teamId: true } });
  if (!board) return false;
  return user.isAdmin || (board.teamId === null ? board.ownerId === user.id : canUseTeam(board.teamId, user));
}

export async function canAccessDoc(docId: number, user: ProjectUser) {
  const doc = await prisma.doc.findUnique({ where: { id: docId }, select: { ownerId: true, teamId: true } });
  if (!doc) return false;
  return user.isAdmin || (doc.teamId === null ? doc.ownerId === user.id : canUseTeam(doc.teamId, user));
}
