"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { AbstraxionProvider } from "@burnt-labs/abstraxion";

import "@burnt-labs/abstraxion/dist/index.css";
import "@burnt-labs/ui/dist/index.css";

const inter = Inter({ subsets: ["latin"] });

const treasuryConfig = {
  treasury: "xion1y2qu7a5s8h3x2h3jjr4y7neyvd5kdxesa5yhdzlzsujqgld9c9eqw27jct",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AbstraxionProvider config={treasuryConfig}>{children}</AbstraxionProvider>
      </body>
    </html>
  );
}
