import "dotenv/config";
import { defineConfig } from "prisma/config";

function cleanUrl(url: string) {
  return url
    .replace(/[&?]channel_binding=[^&]*/g, "")
    .replace(/\?&/, "?")
    .replace(/\?$/, "");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: cleanUrl(process.env.DATABASE_URL ?? ""),
  },
});
