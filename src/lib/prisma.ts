import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function makePrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL ?? "";

  // Neon HTTP adapter for Vercel serverless (no WebSocket needed)
  if (connectionString.startsWith("postgresql://") || connectionString.startsWith("postgres://")) {
    const adapter = new PrismaNeonHttp(connectionString);
    return new PrismaClient({ adapter } as never);
  }

  // Fallback for local dev (should also use postgresql:// in .env)
  return new PrismaClient({ datasourceUrl: connectionString } as never);
}

export const prisma: PrismaClient = global.__prisma ?? makePrisma();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
