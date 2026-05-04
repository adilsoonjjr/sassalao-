import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SessionProvider from "@/components/SessionProvider";
import TrialBanner from "@/components/TrialBanner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as {
    planStatus?: string;
    trialEndsAt?: string;
  };

  const isTrial = user.planStatus === "trial";
  const diasRestantes = isTrial && user.trialEndsAt
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / 86400000)
    : 0;

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {isTrial && diasRestantes <= 3 && (
            <TrialBanner diasRestantes={diasRestantes} />
          )}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8" style={{ background: "var(--background)" }}>
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
