"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const icons: Record<string, React.ReactNode> = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  agendamentos: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  clientes: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  financeiro: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  relatorios: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  historico: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  sair: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/agendamentos", label: "Agendamentos", icon: "agendamentos" },
  { href: "/clientes", label: "Clientes", icon: "clientes" },
  { href: "/financeiro", label: "Financeiro", icon: "financeiro" },
  { href: "/relatorios", label: "Relatórios", icon: "relatorios" },
  { href: "/historico", label: "Histórico", icon: "historico" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="1" x2="12" y2="4" stroke="none"/><path d="M9 14l2 2 4-4"/></svg>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--primary-dark)" }}>Beleza em Dia</p>
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
              <span className="flex-shrink-0">{icons[item.icon]}</span>
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
          <span className="flex-shrink-0">{icons.sair}</span>
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 14l2 2 4-4"/></svg>
          <span className="font-bold text-sm" style={{ color: "var(--primary-dark)" }}>Beleza em Dia</span>
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
