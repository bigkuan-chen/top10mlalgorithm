"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckCircle, Zap } from "lucide-react";
import { ALGORITHMS } from "@/components/constants";


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-80 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center glow-blue">
          <Zap className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            ML Top 10
          </h1>
          <p className="text-xs text-zinc-500 font-medium">十大機器學習演算法</p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* General */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">課程導覽</h2>
          <div className="space-y-1">
            <Link 
              href="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === "/" 
                  ? "bg-zinc-800/80 text-blue-400 border border-zinc-700/50" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>課程導言 / 前言</span>
            </Link>
          </div>
        </div>

        {/* Algorithm List */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">經典演算法主題</h2>
          <div className="space-y-1">
            {ALGORITHMS.map((algo) => {
              const Icon = algo.icon;
              const isActive = pathname === `/algorithms/${algo.id}`;
              return (
                <Link
                  key={algo.id}
                  href={`/algorithms/${algo.id}`}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-950/40 to-indigo-950/40 text-blue-400 border border-blue-900/50 shadow-md"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isActive ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-500"}`}>
                    {algo.num}
                  </span>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate leading-none font-semibold">{algo.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5 group-hover:text-zinc-400">{algo.eng}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Outro */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">總結</h2>
          <div className="space-y-1">
            <Link 
              href="/conclusion"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === "/conclusion" 
                  ? "bg-zinc-800/80 text-blue-400 border border-zinc-700/50" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>課程總結 / 結論</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Backend Status Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-zinc-400 font-medium">FastAPI Engine</span>
          <span className="text-[10px] text-zinc-600 ml-auto">Localhost:8000</span>
        </div>
      </div>
    </aside>
  );
}
