import { PrismaClient } from "@prisma/client";
import path from "node:path";

const provider = (process.env.DATABASE_PROVIDER ?? "sqlite").toLowerCase();
const url = process.env.DATABASE_URL ?? "file:./dev.db";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

async function createAdapter() {
  if (provider === "sqlite") {
    const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
    // Resolve the file path from DATABASE_URL (e.g. "file:./dev.db" → absolute path)
    const filePart = url.startsWith("file:") ? url.slice(5) : url;
    const dbPath = path.resolve(process.cwd(), filePart);
    return new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  }
  if (provider === "postgresql" || provider === "postgres") {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    return new PrismaPg({ connectionString: url });
  }
  // MySQL and MSSQL use the Prisma binary engine — no adapter needed
  return null;
}

function createPrisma(adapter: any) {
  if (adapter) return new PrismaClient({ adapter });
  // MySQL / MSSQL: URL comes from DATABASE_URL env var (prisma.config.ts)
  return new PrismaClient();
}

// Top-level await — module waits before exports become available
const adapter = await createAdapter();
export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrisma(adapter);
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
