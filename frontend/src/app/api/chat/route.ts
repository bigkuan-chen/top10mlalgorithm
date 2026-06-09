import { NextRequest, NextResponse } from "next/server";
import curriculumData from "@/data.json";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  current_algorithm?: string | null;
  api_key?: string | null;
}

// Local Fallback QA Engine
function getLocalFallbackResponse(query: string, currentAlgo: string | null | undefined): string {
  const queryLower = query.toLowerCase();
  
  // Map query/context to section
  let targetSection: any = null;
  const sectionMapping: Record<string, string[]> = {
    "linear-regression": ["線性回歸", "linear regression"],
    "logistic-regression": ["邏輯回歸", "logistic regression"],
    "decision-tree": ["決策樹", "decision tree"],
    "random-forest": ["隨機森林", "random forest"],
    "support-vector-machine": ["支持向量機", "svm", "support vector"],
    "k-nearest-neighbors": ["最近鄰", "knn", "k-nearest", "k nearest"],
    "naive-bayes": ["朴素貝葉斯", "naive bayes", "貝氏", "貝葉斯"],
    "k-means-clustering": ["k-means", "kmeans", "k 均值", "k均值", "聚類"],
    "principal-component-analysis": ["pca", "主成分分析", "降維"],
    "neural-networks": ["神經網絡", "neural network", "mlp", "多層感知機"]
  };
  
  let matchedAlgo: string | null = null;
  for (const [algoId, keywords] of Object.entries(sectionMapping)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      matchedAlgo = algoId;
      break;
    }
  }
  
  if (!matchedAlgo && currentAlgo && currentAlgo in sectionMapping) {
    matchedAlgo = currentAlgo;
  }
  
  if (matchedAlgo && curriculumData && curriculumData.sections) {
    const algoTitlePart = sectionMapping[matchedAlgo][0];
    for (const sec of curriculumData.sections) {
      if (sec.title && sec.title.includes(algoTitlePart)) {
        targetSection = sec;
        break;
      }
    }
  }
  
  if (targetSection) {
    const title = targetSection.title || "";
    const paragraphs: string[] = targetSection.paragraphs || [];
    
    const topicKeywords: Record<string, string[]> = {
      "優缺點": ["優點", "缺點", "局限", "好處", "壞處", "限制", "限制性", "敏感"],
      "公式原理": ["公式", "數學", "原理", "假設", "定義", "方程式", "sigmoid", "幾何", "核函數", "特徵值"],
      "訓練步驟": ["訓練", "擬合", "收斂", "優化", "極大似然", "最小化", "損失函數"],
      "資料預處理": ["預處理", "標準化", "特徵選擇", "缺失值", "尺度"],
      "評估指標": ["評估", "指標", "mse", "r2", "準確率", "召回率", "auc", "f1", "accuracy"],
      "參數調整": ["參數", "調參", "正則化", "l1", "l2", "剪枝", "深度", "超參數", "層數", "學習率"],
      "應用場景": ["應用", "案例", "場景", "房價", "信用", "醫療", "流失", "推薦", "情感", "垃圾"],
      "實作與程式": ["程式", "實作", "程式碼", "code", "scikit-learn", "tensorflow", "pytorch", "套件"],
      "常見錯誤": ["常見錯誤", "錯誤", "注意", "尺度差異", "共線性", "不平衡", "過擬合"]
    };
    
    let matchedParagraphs: string[] = [];
    let matchedTopic: string | null = null;
    for (const [topic, kws] of Object.entries(topicKeywords)) {
      if (kws.some(kw => queryLower.includes(kw))) {
        matchedTopic = topic;
        for (const p of paragraphs) {
          if (kws.some(kw => p.includes(kw))) {
            if (!matchedParagraphs.includes(p)) {
              matchedParagraphs.push(p);
            }
          }
        }
        if (matchedParagraphs.length > 0) {
          break;
        }
      }
    }
    
    let response = "";
    if (matchedParagraphs.length > 0) {
      response = `### 📚 課程庫檢索：${title} - ${matchedTopic}\n\n`;
      response += matchedParagraphs.map(p => `- ${p}`).join("\n\n");
    } else {
      response = `### 📚 課程庫檢索：${title} 概述\n\n`;
      response += paragraphs.slice(0, 3).map(p => `- ${p}`).join("\n\n");
    }
    response += "\n\n---\n*💡 提示：系統目前處於「本機教材檢索模式」。若要解鎖通用問答、寫程式等完整 AI 功能，點擊右上方設定齒輪 ⚙️ 貼上您的免費 Gemini API Key，或在 Vercel 後台設定環境變數即可。*";
    return response;
  }
  
  return `### 🤖 歡迎使用機器學習 AI 助教（本機模式）

我是一台本機運作的助教。我可以根據本課程的教材庫為您回答關於十大演算法的問題。

**當前教材包含**：線性回歸、邏輯回歸、決策樹、隨機森林、支持向量機 (SVM)、K 最近鄰 (KNN)、朴素貝葉斯、K-Means 聚類、主成分分析 (PCA) 與神經網絡。

您可以試著問我：
- 「什麼是 SVM 的優缺點？」
- 「KNN 的公式與原理是什麼？」
- 「線性回歸的常見錯誤有哪些？」

---
*💡 提示：點擊右上方設定齒輪 ⚙️，輸入免費申請的 Gemini API Key，或直接在 Vercel 設定環境變數 \`GEMINI_API_KEY\`，即可解鎖完整 Gemini AI 對答與寫程式功能！*`;
}

export async function POST(request: NextRequest) {
  let message = "";
  let current_algorithm: string | null | undefined = undefined;
  let history: ChatMessage[] = [];
  let api_key: string | null | undefined = undefined;

  try {
    const body = (await request.json()) as ChatRequest;
    message = body.message || "";
    current_algorithm = body.current_algorithm;
    history = body.history || [];
    api_key = body.api_key;
    
    // Determine the API Key: prioritize environment variable, then request body
    const geminiApiKey = process.env.GEMINI_API_KEY || api_key;
    
    if (!geminiApiKey) {
      // Return local fallback
      const fallbackResponse = getLocalFallbackResponse(message, current_algorithm);
      return NextResponse.json({ response: fallbackResponse, mode: "local" });
    }
    
    // Call Gemini API
    // 1. Context extraction
    let contextParagraphs = "";
    let algoName = "";
    if (current_algorithm) {
      const sectionMapping: Record<string, [string, string]> = {
        "linear-regression": ["線性回歸", "Linear Regression"],
        "logistic-regression": ["邏輯回歸", "Logistic Regression"],
        "decision-tree": ["決策樹", "Decision Tree"],
        "random-forest": ["隨機森林", "Random Forest"],
        "support-vector-machine": ["支持向量機", "Support Vector Machine"],
        "k-nearest-neighbors": ["K 最近鄰", "K-Nearest Neighbors"],
        "naive-bayes": ["朴素貝葉斯", "Naive Bayes"],
        "k-means-clustering": ["K 均值聚類", "K-Means Clustering"],
        "principal-component-analysis": ["主成分分析", "Principal Component Analysis"],
        "neural-networks": ["神經網絡", "Neural Networks"]
      };
      
      if (current_algorithm in sectionMapping) {
        algoName = sectionMapping[current_algorithm][0];
        if (curriculumData && curriculumData.sections) {
          for (const sec of curriculumData.sections) {
            if (sec.title && sec.title.includes(algoName)) {
              contextParagraphs = (sec.paragraphs || []).join("\n");
              break;
            }
          }
        }
      }
    }
    
    // 2. Prepare system instruction
    let systemInstruction = 
      "你是一個專業、親切的機器學習助教，正在為學生解答「機器學習十大演算法互動學習平台」上的學術問題。\n" +
      "你的回答應該專業、條理清晰，儘量使用繁體中文（台灣習慣用語），並且給出具體的公式解釋、步驟或程式範例。\n" +
      "這個平台涵蓋的十大演算法是：線性回歸、邏輯回歸、決策樹、隨機森林、支持向量機、K最近鄰、朴素貝葉斯、K-Means聚類、主成分分析、神經網絡。\n";
      
    if (contextParagraphs) {
      systemInstruction += 
        `\n目前學生正在瀏覽「${algoName}」單元的教材。如果學生的提問與該演算法有關，請結合以下教材內容進行精準回答，` +
        `保持概念名詞與公式的一致性：\n${contextParagraphs}\n`;
    }
    
    // 3. Format history for Gemini API
    const contents = [];
    for (const msg of history) {
      const role = msg.role === "user" ? "user" : "model";
      contents.push({
        role,
        parts: [{ text: msg.text }]
      });
    }
    
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API HTTP Error ${response.status}: ${errorText}`);
      const fallbackResponse = getLocalFallbackResponse(message, current_algorithm);
      return NextResponse.json({
        response: `*(⚠️ 已自動降級為本機模式：Gemini API 錯誤 - ${response.status})*\n\n` + fallbackResponse,
        mode: "fallback_error"
      });
    }
    
    const resBody = await response.json();
    const aiText = resBody.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) {
      throw new Error("No text returned from Gemini API");
    }
    
    return NextResponse.json({ response: aiText, mode: "gemini" });
  } catch (error: any) {
    console.error("Gemini API Generic Error:", error);
    const fallbackResponse = getLocalFallbackResponse(message, current_algorithm);
    return NextResponse.json({
      response: `*(⚠️ 已自動降級為本機模式：Gemini 呼叫發生異常)*\n\n` + fallbackResponse,
      mode: "fallback_error"
    });
  }
}
