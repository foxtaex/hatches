-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Permission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT,
    "token" TEXT,
    "projectKey" TEXT,
    "extraConfig" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExternalIssue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "integrationId" INTEGER NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "url" TEXT,
    "assignee" TEXT,
    "labels" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardId" INTEGER,
    CONSTRAINT "ExternalIssue_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExternalIssue_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "columnId" INTEGER NOT NULL,
    "assigneeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Card_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("columnId", "createdAt", "description", "id", "position", "title", "updatedAt") SELECT "columnId", "createdAt", "description", "id", "position", "title", "updatedAt" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_userId_teamId_key" ON "TeamMembership"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_teamId_section_key" ON "Permission"("teamId", "section");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalIssue_cardId_key" ON "ExternalIssue"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalIssue_integrationId_externalId_key" ON "ExternalIssue"("integrationId", "externalId");
