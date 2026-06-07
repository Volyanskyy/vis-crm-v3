/**
 * Path: src/lib/prisma.ts
 *
 * Призначення:
 * Єдиний Prisma client для Next.js app.
 * Працює через Prisma 7 + @prisma/adapter-pg + pg.
 * У dev-режимі кешується в globalThis, щоб уникати створення нових з'єднань
 * при hot reload.
 */

import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool =
  globalForPrisma.pgPool ??
  new pg.Pool({
    connectionString,
    max: 10,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
  globalForPrisma.prisma = prisma;
}
