import data from "@/data.json";
import { CheckCircle, ArrowLeft, Heart, Award } from "lucide-react";
import Link from "next/link";

export default function ConclusionPage() {
  const conclusionSection = data.sections.find(s => s.title === "結論") || {
    title: "結論",
    paragraphs: [
      "綜上所述，十大機器學習演算法各有其適用領域與特點，從簡單的線性模型到強大的神經網絡，它們構成了數據分析的基石。",
      "透過充分理解每個演算法的原理、應用與限制，我們可以在面對實際問題時做出合理的演算法選擇與模型設計。",
      "未來，隨著資料規模與計算能力的增長，這些演算法也將不斷演化，與深度學習、強化學習等技術融合，孕育出更多創新應用。",
      "希望這份研讀報告能成為你探索機器學習世界的起點，激發更多靈感與實踐。"
    ]
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 fade-in">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回首頁</span>
      </Link>

      <div className="relative p-8 rounded-2xl glass-panel glow-purple border border-zinc-800 space-y-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center glow-purple">
            <Award className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-50">{conclusionSection.title}</h1>
            <p className="text-xs text-zinc-500 font-medium">十大機器學習演算法研讀總結</p>
          </div>
        </div>

        <div className="space-y-4 text-zinc-300 leading-relaxed text-base">
          {conclusionSection.paragraphs.map((para, idx) => (
            <p key={idx} className="indent-8">
              {para}
            </p>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-xl glass-card border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-200 text-lg">學習旅程尚未結束</h2>
          <p className="text-sm text-zinc-500 mt-1">現在就點選左側選單，進入各個演算法的互動沙盒，親自動手調整超參數！</p>
        </div>
        <Link
          href="/algorithms/linear-regression"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 text-sm font-semibold text-white transition-all shadow-md active:scale-95"
        >
          <span>開始第一個演算法</span>
          <Heart className="w-4 h-4 fill-white" />
        </Link>
      </div>
    </div>
  );
}
