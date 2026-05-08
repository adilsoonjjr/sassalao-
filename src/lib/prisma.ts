import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    const { neon } = require("@neondatabase/serverless");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const adapter = new PrismaNeon(neon(url));
    return new PrismaClient({ adapter } as never);
  }

  if (url.startsWith("file:")) {
    const Database = require("better-sqlite3");
    const { PrismaLibSQL } = require("@prisma/adapter-better-sqlite3");
    const db = new Database(url.replace("file:", ""));
    const adapter = new PrismaLibSQL(db);
    return new PrismaClient({ adapter } as never);
  }

  // Build time sem URL válida — cliente inerte (não conecta)
  return new PrismaClient();
}

// Lazy singleton — só instancia na primeira query, não no import
let _client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (!_client) {
    _client = global.__prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") global.__prisma = _client;
  }
  return _client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    return (getClient() as never)[prop];
  },
});
