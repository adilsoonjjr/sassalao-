import type { NextAuthConfig } from "next-auth";

// Config edge-safe: sem Prisma, só verifica JWT
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // providers são adicionados apenas no auth.ts full
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return !!auth?.user;
    },
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.planStatus = token.planStatus as string;
        session.user.trialEndsAt = token.trialEndsAt as string;
        session.user.planEndsAt = (token.planEndsAt as string) ?? null;
      }
      return session;
    },
  },
};
