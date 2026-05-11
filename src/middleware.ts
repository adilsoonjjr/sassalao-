import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/planos",
  "/api/auth",
  "/api/webhook",
  "/manifest.webmanifest",
  "/sw.js",
  "/icons",
  "/logo.svg",
  "/api/admin/seed",
  "/api/push/notify",
  "/api/assinatura",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const { NextResponse } = require("next/server");

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (!req.auth?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const user = req.auth.user as {
    planStatus?: string;
    trialEndsAt?: string;
    planEndsAt?: string | null;
  };

  const agora = new Date();
  const valida =
    (user.planStatus === "active" && user.planEndsAt && new Date(user.planEndsAt) > agora) ||
    (user.planStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > agora);

  if (!valida) {
    return NextResponse.redirect(new URL("/planos", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
