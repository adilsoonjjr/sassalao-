"use client";
import Link from "next/link";

export default function PagamentoPendentePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-2">Pagamento em análise</h1>
        <p className="mb-6" style={{ color: "var(--muted)" }}>
          Seu pagamento está sendo processado. Assim que confirmado, seu acesso será liberado automaticamente.
        </p>
        <Link
          href="/planos"
          className="inline-block px-6 py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-85"
          style={{ background: "var(--primary)" }}
        >
          Ver status do plano
        </Link>
      </div>
    </div>
  );
}
