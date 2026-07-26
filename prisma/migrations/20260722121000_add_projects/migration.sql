CREATE TABLE "Project" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "teamId" INTEGER,
  "ownerId" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ProjectFolder" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "projectId" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectFolder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ProjectItem" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "type" TEXT NOT NULL,
  "projectId" INTEGER NOT NULL,
  "folderId" INTEGER,
  "boardId" INTEGER,
  "docId" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProjectItem_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ProjectFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ProjectItem_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProjectItem_docId_fkey" FOREIGN KEY ("docId") REFERENCES "Doc" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Project_teamId_idx" ON "Project"("teamId");
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");
CREATE UNIQUE INDEX "ProjectFolder_projectId_name_key" ON "ProjectFolder"("projectId", "name");
CREATE INDEX "ProjectFolder_projectId_position_idx" ON "ProjectFolder"("projectId", "position");
CREATE UNIQUE INDEX "ProjectItem_boardId_key" ON "ProjectItem"("boardId");
CREATE UNIQUE INDEX "ProjectItem_docId_key" ON "ProjectItem"("docId");
CREATE INDEX "ProjectItem_projectId_idx" ON "ProjectItem"("projectId");
CREATE INDEX "ProjectItem_folderId_idx" ON "ProjectItem"("folderId");
