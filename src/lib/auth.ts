import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.session.create({ data: { id, userId, expiresAt } });
  return id;
}

export async function getSession(sessionId: string | null | undefined) {
  if (!sessionId) return null;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: { include: { memberships: { include: { team: { include: { permissions: true } } } } } } },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }
  return session;
}

export async function deleteSession(sessionId: string) {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}

export function getSessionCookie(cookies: string | null): string | null {
  if (!cookies) return null;
  const match = cookies.match(/(?:^|;\s*)session=([^;]+)/);
  return match?.[1] ?? null;
}

export async function countUsers() {
  return prisma.user.count();
}

export async function createFirstAdmin(username: string, email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, email, passwordHash, displayName: username, isAdmin: true },
  });

  // Admin-Team erstellen und zuweisen
  const adminTeam = await prisma.team.upsert({
    where: { name: "Administrators" },
    update: {},
    create: {
      name: "Administrators",
      description: "Vollzugriff auf alles",
      color: "#ef4444",
      priority: 100,
      permissions: {
        create: ["board", "docs", "notes", "websites", "integrations", "admin"].map((s) => ({
          section: s,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
        })),
      },
    },
  });

  // Members-Team erstellen (Default für neue User)
  await prisma.team.upsert({
    where: { name: "Members" },
    update: {},
    create: {
      name: "Members",
      description: "Standardmitglieder",
      color: "#3b82f6",
      priority: 10,
      isDefault: true,
      permissions: {
        create: [
          { section: "board", canView: true, canCreate: true, canEdit: true, canDelete: false },
          { section: "docs", canView: true, canCreate: true, canEdit: true, canDelete: false },
          { section: "notes", canView: true, canCreate: true, canEdit: true, canDelete: true },
          { section: "websites", canView: true, canCreate: false, canEdit: false, canDelete: false },
          { section: "integrations", canView: true, canCreate: false, canEdit: false, canDelete: false },
          { section: "admin", canView: false, canCreate: false, canEdit: false, canDelete: false },
        ],
      },
    },
  });

  await prisma.teamMembership.create({ data: { userId: user.id, teamId: adminTeam.id } });
  return user;
}
