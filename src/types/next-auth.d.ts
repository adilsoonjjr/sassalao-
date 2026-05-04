import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      planStatus: string;
      trialEndsAt: string;
      planEndsAt: string | null;
    };
  }
}
