import Link from "next/link";

export default function TrialBanner({ diasRestantes }: { diasRestantes: number }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 text-sm font-medium"
      style={{ background: diasRestantes <= 1 ? "var(--danger)" : "var(--warning)", color: "white" }}
    >
      <span>
        ⏳ {diasRestantes <= 0
          ? "Seu período de teste expirou hoje"
          : `Seu teste gratuito termina em ${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}`}
      </span>
      <Link
        href="/planos"
        className="px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:opacity-85"
        style={{ background: "white", color: diasRestantes <= 1 ? "var(--danger)" : "var(--warning)" }}
      >
        Assinar agora
      </Link>
    </div>
  );
}
