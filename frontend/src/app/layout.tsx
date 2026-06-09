import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AiAssistant from "@/components/AiAssistant";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "十大機器學習演算法互動學習平台",
  description: "使用 Next.js 和 FastAPI 打造的機器學習演算法教材與互動模擬沙盒",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 flex overflow-hidden">
        {/* Shared Layout Structure */}
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
          {children}
        </main>
        <AiAssistant />
      </body>
    </html>
  );
}
