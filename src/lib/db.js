import { PrismaClient } from "@prisma/client";

// One shared Prisma client. In development Next.js reloads modules often,
// so we cache the client on globalThis to avoid opening too many connections.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
