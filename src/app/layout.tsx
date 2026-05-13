import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Beleza em Dia – Agenda e Financeiro para Profissionais de Beleza",
  description: "Organize sua agenda e financeiro de forma simples",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Beleza em Dia",
  },
  icons: {
    icon: "/logo.svg",
    apple: [
      { url: "/logo.svg" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#e8829a",
  width: "device-width",
  initialScale: 1,
  maximumScale:1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
