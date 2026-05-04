import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sassalão – Gestão para Profissionais de Beleza",
  description: "Organize sua agenda e financeiro de forma simples",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
