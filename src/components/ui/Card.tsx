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
  icon: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 shadow-sm"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: color || "var(--foreground)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}
