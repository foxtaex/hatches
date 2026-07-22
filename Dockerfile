# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Prisma's postinstall hook generates the client during npm ci, so the schema
# and Prisma config must already be available in this layer.
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Only copy what's needed to run
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Create data directory for SQLite
RUN mkdir -p /data

EXPOSE 4321

# Run migrations, then start
CMD ["sh", "-c", "DATABASE_URL=file:/data/devtool.db npx prisma migrate deploy && node ./dist/server/entry.mjs"]
