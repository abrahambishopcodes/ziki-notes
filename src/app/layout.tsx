import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notes · Zedu · ziki",
  description: "Shared do's, don'ts and gotchas for every agent on the project.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} antialiased`}>
      <body className="min-h-screen font-sans text-sm">
        <TopNav />
        <main className="mx-auto w-full max-w-[1120px] px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
