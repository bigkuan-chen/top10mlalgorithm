"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  X, 
  Send, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw, 
  Trash2, 
  Key, 
  ExternalLink 
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

// Simple custom Markdown parser for message rendering
const MessageContent = ({ text }: { text: string }) => {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  
  return (
    <div className="space-y-2 text-sm leading-relaxed text-zinc-300">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          // Code block format: ```python\ncode\n```
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "";
          const code = match ? match[2] : part.slice(3, -3);
          return (
            <div key={index} className="my-2.5 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden font-mono text-[11px] shadow-inner">
              {lang && (
                <div className="bg-zinc-900/60 px-3 py-1 text-[9px] text-zinc-500 uppercase font-bold border-b border-zinc-800/50">
                  {lang}
                </div>
              )}
              <pre className="p-3 overflow-x-auto text-emerald-400/90 whitespace-pre">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        } else {
          // Parse lines for bullets and basic bolding/inline codes
          const lines = part.split("\n");
          return (
            <div key={index} className="space-y-1 text-justify">
              {lines.map((line, lIdx) => {
                let isBullet = false;
                let displayLine = line;
                if (line.trim().startsWith("- ")) {
                  isBullet = true;
                  displayLine = line.trim().slice(2);
                } else if (line.trim().startsWith("* ")) {
                  isBullet = true;
                  displayLine = line.trim().slice(2);
                }
                
                // Bold (**text**) and Inline Code (`code`)
                const inlineParts = displayLine.split(/(\*\*.*?\*\*|`.*?`)/g);
                const renderedLine = inlineParts.map((ip, ipIdx) => {
                  if (ip.startsWith("**") && ip.endsWith("**")) {
                    return <strong key={ipIdx} className="text-zinc-100 font-extrabold">{ip.slice(2, -2)}</strong>;
                  } else if (ip.startsWith("`") && ip.endsWith("`")) {
                    return <code key={ipIdx} className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-855 text-blue-400 font-mono text-[11px]">{ip.slice(1, -1)}</code>;
                  }
                  return ip;
                });
                
                if (isBullet) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-2 text-zinc-300">
                      <span className="text-blue-500 mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      <span>{renderedLine}</span>
                    </div>
                  );
                }
                
                return displayLine.trim() ? (
                  <p key={lIdx} className="min-h-[1rem]">{renderedLine}</p>
                ) : (
                  <div key={lIdx} className="h-1"></div>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
};

export default function AiAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [apiKey, setApiKey] = useState("");
  const [tempKey, setTempKey] = useState("");
  const [hasServerKey, setHasServerKey] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Load API Key from localStorage and check server-side configuration on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setTempKey(savedKey);
    }

    const checkServerKey = async () => {
      try {
        const response = await fetch("/api/assistant-config");
        if (response.ok) {
          const data = await response.json();
          setHasServerKey(data.hasApiKey);
        }
      } catch (e) {
        console.error("Failed to check server key configuration", e);
      }
    };
    checkServerKey();
  }, []);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  
  // Parse current algorithm ID from route
  const getAlgoId = (): string | null => {
    const match = pathname.match(/\/algorithms\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  };
  
  const currentAlgoId = getAlgoId();
  
  // Setup dynamic suggestions based on current path
  const getSuggestions = (): string[] => {
    if (!currentAlgoId) {
      if (pathname === "/conclusion") {
        return [
          "如何將這十大演算法應用在實務專案中？",
          "我該如何選擇適合我數據的演算法？",
          "下一步該如何學習深度學習與大語言模型？"
        ];
      }
      return [
        "這個平台涵蓋哪些機器學習演算法？",
        "推薦我一個適合新手的演算法學習順序",
        "什麼是監督式學習與非監督式學習？"
      ];
    }
    
    switch (currentAlgoId) {
      case "linear-regression":
        return [
          "線性回歸的數學公式與原理？",
          "這演算法的優缺點是什麼？",
          "如何調整沙盒中的雜訊 (noise) 和斜率？"
        ];
      case "logistic-regression":
        return [
          "邏輯回歸如何把輸出轉換成機率？",
          "正則化強度 C 參數如何防止過擬合？",
          "決策邊界在邏輯回歸中是線性的嗎？"
        ];
      case "decision-tree":
        return [
          "什麼是資訊增益和基尼係數 (Gini)？",
          "如何透過最大深度 (max_depth) 參數調參？",
          "決策樹為什麼容易過擬合？"
        ];
      case "random-forest":
        return [
          "隨機森林與單一決策樹有什麼差別？",
          "什麼是 Bagging 和隨機特徵選擇？",
          "弱分類器個數 (n_estimators) 會如何影響模型？"
        ];
      case "support-vector-machine":
        return [
          "SVM 的最大分類間隔 (Margin) 是什麼？",
          "什麼是 Kernel Trick？RBF 和 Linear 核有何不同？",
          "支持向量在圖中是指哪些點？"
        ];
      case "k-nearest-neighbors":
        return [
          "KNN 是如何進行分類決策的？",
          "K 值 (n_neighbors) 過大或過小會怎樣？",
          "距離權重方式 (uniform vs distance) 有何差別？"
        ];
      case "naive-bayes":
        return [
          "朴素貝葉斯的「朴素」是指什麼假設？",
          "貝氏定理的公式與垃圾郵件過濾原理？",
          "在沙盒中，它是如何進行分類預測的？"
        ];
      case "k-means-clustering":
        return [
          "K-Means 的運作流程（E步與M步）是怎樣的？",
          "群聚個數 K 該如何選擇？什麼是肘部法？",
          "畫布上的白色星型標記代表什麼？"
        ];
      case "principal-component-analysis":
        return [
          "PCA 降維的主要數學原理是什麼？",
          "什麼是解釋變異量 (Explained Variance)？",
          "PCA 與線性回歸有什麼根本不同？"
        ];
      case "neural-networks":
        return [
          "什麼是反向傳播 (Backpropagation)與梯度下降？",
          "隱藏層結構 (如 8,8) 代表什麼含義？",
          "學習率 (learning rate) 對 Loss 曲線有何影響？"
        ];
      default:
        return ["解釋這個演算法的原理", "這個演算法的優缺點", "程式實作的範例"];
    }
  };
  
  const suggestions = getSuggestions();
  
  // Send message handler
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMsg: Message = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          current_algorithm: currentAlgoId,
          api_key: apiKey || null
        })
      });
      
      if (!response.ok) throw new Error("Chat request failed");
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: "model", text: data.response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev, 
        { 
          role: "model", 
          text: "⚠️ 無法連線至 AI 服務。請確保後端服務正常運作。" 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Save API Key
  const handleSaveApiKey = () => {
    localStorage.setItem("gemini_api_key", tempKey.trim());
    setApiKey(tempKey.trim());
    setShowSettings(false);
  };
  
  // Clear API Key
  const handleClearApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setTempKey("");
    setShowSettings(false);
  };
  
  // Reset Conversation
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* 1. COLLAPSED FLOATING BUBBLE */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-blue-400/20 group glow-blue"
          title="開啟 AI 助教"
          id="ai-assistant-trigger"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
            <Sparkles className="w-3.5 h-3.5 text-blue-200 absolute -top-1.5 -right-1.5 animate-pulse" />
          </div>
        </button>
      )}

      {/* 2. EXPANDED CHAT PANEL */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl rounded-2xl border border-zinc-800/80 bg-zinc-900/95 backdrop-blur-md overflow-hidden glow-indigo ${
            isMaximized ? "w-[650px] h-[750px]" : "w-[380px] h-[550px]"
          }`}
          id="ai-assistant-container"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>ML 演算法助教</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${(apiKey || hasServerKey) ? "bg-emerald-500" : "bg-blue-400 animate-pulse"}`} title={(apiKey || hasServerKey) ? "已連接 Gemini" : "本機課程庫模式"}></span>
                </h3>
                <p className="text-[10px] text-zinc-500 font-medium">
                  {(apiKey || hasServerKey) ? "Gemini 模式" : "本機教材庫"}
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="清除對話紀錄"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${showSettings ? "text-indigo-400 bg-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
                title="金鑰設定"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                title={isMaximized ? "縮小視窗" : "放大視窗"}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowSettings(false);
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors ml-0.5"
                title="關閉助理"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN BODY: CHAT OR SETTINGS */}
          <div className="flex-1 relative flex flex-col min-h-0 bg-zinc-900/30">
            {showSettings ? (
              /* Settings Panel */
              <div className="absolute inset-0 z-10 p-5 bg-zinc-900 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Key className="w-5 h-5" />
                    <h4 className="font-bold text-sm">設定 Gemini API 金鑰</h4>
                  </div>
                  
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    本助理預設使用「本機教材檢索」回答演算法問題。填入個人 API 金鑰後，將可解鎖 **Gemini 1.5 Flash 雲端運算**，支援任何程式實作與機器學習問題。
                  </p>
                  
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-semibold">取得免費金鑰：</span>
                      <a 
                        href="https://aistudio.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-bold hover:underline"
                      >
                        <span>Google AI Studio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      登入 Google 帳號即可免費建立 API Key，每日提供 1500 次免費額度，完全不需信用卡。
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5">
                  {apiKey && (
                    <button
                      onClick={handleClearApiKey}
                      className="flex-1 py-2.5 border border-rose-900/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-xs font-bold rounded-xl transition-all"
                    >
                      清除金鑰
                    </button>
                  )}
                  <button
                    onClick={handleSaveApiKey}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    儲存設定
                  </button>
                </div>
              </div>
            ) : (
              /* Chat Message History */
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  /* Initial State Welcome Card */
                  <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center animate-bounce duration-1000">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-1.5 max-w-[280px]">
                      <h4 className="font-bold text-sm text-zinc-200">
                        {currentAlgoId ? `我是您的 ${currentAlgoId.replace("-", " ").toUpperCase()} 助教` : "歡迎來到機器學習演算法課堂"}
                      </h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        我可以協助您解釋數學公式、探討超參數對沙盒的影響，或提供 PyTorch/Scikit-learn 的程式範例。
                      </p>
                    </div>
                    
                    {!(apiKey || hasServerKey) && (
                      <button
                        onClick={() => setShowSettings(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors font-semibold"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-500" />
                        <span>啟用免費 Gemini 雲端助理</span>
                      </button>
                    )}
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex gap-2.5 max-w-[85%] ${
                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                        msg.role === "user" 
                          ? "bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold" 
                          : "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400"
                      }`}>
                        {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      
                      <div className={`p-3 rounded-2xl border text-sm shadow-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600/90 text-white border-indigo-500 rounded-tr-none text-right font-medium"
                          : "bg-zinc-900 border-zinc-800/80 rounded-tl-none"
                      }`}>
                        {msg.role === "user" ? (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <MessageContent text={msg.text} />
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {loading && (
                  <div className="flex gap-2.5 max-w-[80%]">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="p-3 rounded-2xl border border-zinc-800 bg-zinc-900 rounded-tl-none flex items-center gap-2 text-zinc-500">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs font-medium">助教正在撰寫回覆...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Footer - suggestions and input form */}
          {!showSettings && (
            <div className="p-3 bg-zinc-900/60 border-t border-zinc-800/80 space-y-2">
              {/* Dynamic Quick Suggestions */}
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1 max-h-[85px] overflow-y-auto custom-scrollbar">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700/80 text-[10px] text-zinc-400 hover:text-zinc-200 text-left transition-all active:scale-[0.98] leading-tight"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input Bar */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(input);
                }}
                className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 hover:border-zinc-700 transition-colors focus-within:border-indigo-500 focus-within:hover:border-indigo-500"
              >
                <input
                  type="text"
                  placeholder={(apiKey || hasServerKey) ? "向 AI 助教提問..." : "向教材庫提問..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder-zinc-600 disabled:opacity-50 py-1"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-850 text-white disabled:text-zinc-600 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
