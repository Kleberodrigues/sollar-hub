import type { Metadata } from "next";
import { Inter, Lora, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700"]
});

export const metadata: Metadata = {
  title: "PsicoMapa - Diagnóstico de Riscos Psicossociais",
  description:
    "Plataforma completa para diagnóstico e gestão de riscos psicossociais em organizações conforme NR-1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${lora.variable} ${playfair.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
