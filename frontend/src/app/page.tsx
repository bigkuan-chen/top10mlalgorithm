import Image from "next/image";
import Link from "next/link";
import data from "@/data.json";
import { ALGORITHMS } from "@/components/constants";
import { BookOpen, GraduationCap, ArrowRight, Activity, Terminal } from "lucide-react";


export default function Home() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-10 fade-in">
      {/* Hero Section */}
      <div className="relative p-8 rounded-2xl glass-panel glow-blue overflow-hidden border border-zinc-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>互動式機器學習教材</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-400 leading-tight">
            {data.title}
          </h1>
          
          <p className="text-zinc-400 text-base leading-relaxed">
            機器學習是實現人工智慧的靈魂。本平台將經典的十大機器學習演算法，從理論公式、訓練流程、優缺點分析，到動態互動式沙盒 (Sandbox)，全方位呈現。讓你在調整超參數的過程中，直觀看見決策邊界的變化！
          </p>
        </div>
      </div>

      {/* Main Roadmap Infographic */}
      <div className="p-6 rounded-xl glass-card border border-zinc-800 space-y-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>機器學習演算法地圖</span>
        </h2>
        <div className="relative w-full aspect-[2/1] min-h-[300px] max-h-[500px] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/50 flex items-center justify-center">
          <img 
            src="/images/main_chart.png"
            alt="ML演算法資訊圖表"
            className="object-contain w-full h-full p-2"
          />
        </div>
      </div>

      {/* Intro Paragraphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl glass-card border border-zinc-800 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>研讀引言</span>
          </h2>
          <div className="text-sm text-zinc-400 space-y-3 leading-relaxed">
            {data.intro.slice(0, 5).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl glass-card border border-zinc-800 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>學習指南</span>
          </h2>
          <div className="text-sm text-zinc-400 space-y-3 leading-relaxed">
            {data.intro.slice(5).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Algorithm Quick Links Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-100">快速探索十大演算法</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALGORITHMS.map((algo) => {
            const Icon = algo.icon;
            return (
              <Link
                key={algo.id}
                href={`/algorithms/${algo.id}`}
                className="group p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:bg-zinc-800/20 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 group-hover:text-blue-500 transition-all">
                      {algo.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200 group-hover:text-zinc-100 text-base">
                      {algo.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">
                      {algo.eng}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-zinc-400 mt-6 font-semibold group-hover:text-blue-400 transition-all">
                  <span>進入學習</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
