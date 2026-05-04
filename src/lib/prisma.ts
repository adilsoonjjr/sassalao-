import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const raw = process.env.DATABASE_URL ?? "";
  // Remove parâmetros não suportados pelo driver pg
  const connectionString = raw
    .replace(/[&?]channel_binding=[^&]*/g, "")
    .replace(/\?&/, "?");
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as never);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
