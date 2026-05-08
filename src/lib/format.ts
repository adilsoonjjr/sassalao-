export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function localDate(date: string | Date): Date {
  // Evita bug de fuso: "2026-05-08T00:00:00Z" em UTC-3 vira dia 7.
  // Extrai YYYY-MM-DD e cria date no fuso local.
  const str = typeof date === "string" ? date : date.toISOString();
  const [y, m, d] = str.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: string | Date) {
  return localDate(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateShort(date: string | Date) {
  return localDate(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatDateTime(date: string | Date, horario?: string) {
  const d = localDate(date);
  const base = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  return horario ? `${base} às ${horario}` : base;
}

export function statusLabel(status: string) {
  switch (status) {
    case "agendado": return "Agendado";
    case "concluido": return "Concluído";
    case "cancelado": return "Cancelado";
    default: return status;
  }
}

export function statusColor(status: string) {
  switch (status) {
    case "agendado": return "var(--warning)";
    case "concluido": return "var(--success)";
    case "cancelado": return "var(--danger)";
    default: return "var(--muted)";
  }
}

export function pagamentoLabel(p: string | null) {
  switch (p) {
    case "pix": return "Pix";
    case "dinheiro": return "Dinheiro";
    case "credito": return "Cartão Crédito";
    case "debito": return "Cartão Débito";
    case "transferencia": return "Transferência";
    default: return p || "–";
  }
}
