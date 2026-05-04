"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/agendamentos", label: "Agendamentos", icon: "📅" },
  { href: "/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/relatorios", label: "Relatórios", icon: "📊" },
  { href: "/historico", label: "Histórico", icon: "🗂️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">✂️</span>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--primary-dark)" }}>Sassalão</p>
            <p className="text-xs truncate max-w-[140px]" style={{ color: "var(--muted)" }}>{session?.user?.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--primary-dark)" : "var(--foreground)",
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition-all hover:opacity-80"
          style={{ color: "var(--danger)" }}
        >
          <span className="text-lg">🚪</span>
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 shadow-sm" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">✂️</span>
          <span className="font-bold text-sm" style={{ color: "var(--primary-dark)" }}>Sassalão</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-2xl p-1">
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setMobileOpen(false)}>
          <div className="fixed inset-0 bg-black/30" />
          <div
            className="fixed top-0 left-0 h-full w-64 flex flex-col shadow-xl"
            style={{ background: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 shadow-sm"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        <NavContent />
      </aside>

      {/* Mobile spacer */}
      <div className="md:hidden h-14 shrink-0" />
    </>
  );
}
