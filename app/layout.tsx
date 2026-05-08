import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-neue-montreal",
});

export const metadata: Metadata = {
  title: "AST - Artikelstammnummer Höllental",
  description: "Premium internal tool for managing article serial numbers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-foreground font-sans">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
