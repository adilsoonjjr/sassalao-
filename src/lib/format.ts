export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateShort(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
