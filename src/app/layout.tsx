import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const sans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_ORIGIN ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ),
  title: {
    default: "Diagnóstico de oficina · Cambel",
    template: "%s · Cambel",
  },
  description:
    "19 perguntas para oficina mecânica. Custo fixo, markup, caixa e capacidade produtiva, com laudo e PDF na hora.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} h-full antialiased`}>
      <body className={`${sans.className} flex min-h-full flex-col`}>
        {children}
      </body>
    </html>
  );
}
