import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // No login inicial carrega os dados do usuário
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { id: true, name: true, email: true, planStatus: true, trialEndsAt: true, planEndsAt: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.planStatus = dbUser.planStatus;
          token.trialEndsAt = dbUser.trialEndsAt?.toISOString();
          token.planEndsAt = dbUser.planEndsAt?.toISOString() ?? null;
        }
      }
      // Ao forçar atualização (ex: após pagamento)
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { planStatus: true, trialEndsAt: true, planEndsAt: true },
        });
        if (dbUser) {
          token.planStatus = dbUser.planStatus;
          token.trialEndsAt = dbUser.trialEndsAt?.toISOString();
          token.planEndsAt = dbUser.planEndsAt?.toISOString() ?? null;
        }
      }
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
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
