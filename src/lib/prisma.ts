import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

declare global {
  // eslint-disable-next-line no-var
  var __prismaInstance: PrismaClient | undefined;
}

// Lazy — never called at module evaluation (build-time safe)
function getClient(): PrismaClient {
  if (global.__prismaInstance) return global.__prismaInstance;

  const url = (process.env.DATABASE_URL ?? "").trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeonHttp(url, {} as any);
  const client = new PrismaClient({ adapter } as never);

  if (process.env.NODE_ENV !== "production") global.__prismaInstance = client;
  return client;
}

// Proxy defers getClient() until first property access (request time, not build time)
export const prisma = new Proxy({} as PrismaClient, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_, prop: string) { return (getClient() as any)[prop]; },
});
