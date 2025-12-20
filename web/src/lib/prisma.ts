import { PrismaClient } from "@prisma/client";

declare global {
  var prisma_updated: PrismaClient | undefined;
}

export const prisma = globalThis.prisma_updated || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma_updated = prisma;
}
