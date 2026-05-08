import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ${className}`}
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 shadow-sm"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium leading-tight" style={{ color: "var(--muted)" }}>{label}</span>
        <span style={{ color: color || "var(--muted)", opacity: 0.7 }}>{icon}</span>
      </div>
      <p className="text-xl font-bold leading-tight" style={{ color: color || "var(--foreground)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}
