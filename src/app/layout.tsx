import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Market Vale — Negócios do Vale do Ribeira",
    template: "%s | Market Vale",
  },
  description:
    "O Vale do Ribeira conectado em um só lugar. Encontre confeitarias, cafeterias, advocacia, mercados, lojas e muito mais na sua região.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}