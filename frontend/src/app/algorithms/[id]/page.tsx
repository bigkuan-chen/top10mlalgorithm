"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import data from "@/data.json";
import { ALGORITHMS } from "@/components/constants";
import SandboxVisualizer from "@/components/SandboxVisualizer";

import { 
  ArrowLeft, 
  BookOpen, 
  Sliders, 
  Code, 
  Play, 
  Info,
  CheckCircle,
  HelpCircle,
  Terminal,
  RefreshCw,
  Sparkles
} from "lucide-react";

// Get standard code snippets for each algorithm
const getCodeSnippets = (id: string, name: string) => {
  return {
    sklearn: `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 1. 準備數據
# 這裡使用模擬的數據格式
X = np.random.randn(150, 2)
y = (X[:, 0] + X[:, 1] > 0).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. 建立並訓練模型
${
  id === "linear-regression" ? `from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)

# 3. 預測與評估
predictions = model.predict(X_test)
print("Fitted Coefficients:", model.coef_)` :
  id === "logistic-regression" ? `from sklearn.linear_model import LogisticRegression
model = LogisticRegression(C=1.0)
model.fit(X_train, y_train)

# 3. 預測與評估
predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))` :
  id === "decision-tree" ? `from sklearn.tree import DecisionTreeClassifier
model = DecisionTreeClassifier(max_depth=4)
model.fit(X_train, y_train)

# 3. 預測與評估
predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))` :
  id === "random-forest" ? `from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=100, max_depth=4)
model.fit(X_train, y_train)

# 3. 預測與評估
predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))` :
  id === "support-vector-machine" ? `from sklearn.svm import SVC
model = SVC(C=1.0, kernel='rbf', gamma='scale')
model.fit(X_train, y_train)

# 3. 預測與評估
predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))` :
  id === "k-nearest-neighbors" ? `from sklearn.neighbors import KNeighborsClassifier
model = KNeighborsClassifier(n_neighbors=5, weights='uniform')
model.fit(X_train, y_train)

# 3. 預測與評估
predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))` :
  id === "naive-bayes" ? `from sklearn.naive_bayes import GaussianNB
model = GaussianNB()
model.fit(X_train, y_train)

# 3. 預測與評估
predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))` :
  id === "k-means-clustering" ? `from sklearn.cluster import KMeans
model = KMeans(n_clusters=3, random_state=42)
model.fit(X)

# 3. 聚類中心與預測
labels = model.labels_
centroids = model.cluster_centers_
print("Inertia:", model.inertia_)` :
  id === "principal-component-analysis" ? `from sklearn.decomposition import PCA
model = PCA(n_components=2)
X_projected = model.fit_transform(X)

print("Explained Variance Ratio:", model.explained_variance_ratio_)` :
  `from sklearn.neural_network import MLPClassifier
model = MLPClassifier(hidden_layer_sizes=(8, 8), max_iter=200, random_state=42)
model.fit(X_train, y_train)

# 3. 預測與評估
predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))`
}`,
    pytorch: `${
      id === "linear-regression" ? `import torch
import torch.nn as nn
import torch.optim as optim

# 1. 定義線性模型
class LinearRegressionModel(nn.Module):
    def __init__(self):
        super(LinearRegressionModel, self).__init__()
        self.linear = nn.Linear(1, 1)

    def forward(self, x):
        return self.linear(x)

# 2. 初始化模型、損失函數與優化器
model = LinearRegressionModel()
criterion = nn.MSELoss()
optimizer = optim.SGD(model.parameters(), lr=0.01)` :
      id === "logistic-regression" ? `import torch
import torch.nn as nn
import torch.optim as optim

# 1. 定義邏輯回歸模型
class LogisticRegressionModel(nn.Module):
    def __init__(self, input_dim):
        super(LogisticRegressionModel, self).__init__()
        self.linear = nn.Linear(input_dim, 1)

    def forward(self, x):
        return torch.sigmoid(self.linear(x))

# 2. 初始化模型、BCELoss與優化器
model = LogisticRegressionModel(input_dim=2)
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)` :
      id === "neural-networks" ? `import torch
import torch.nn as nn
import torch.optim as optim

# 1. 定義多層感知機 (MLP)
class MultiLayerPerceptron(nn.Module):
    def __init__(self, input_dim):
        super(MultiLayerPerceptron, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 8),
            nn.ReLU(),
            nn.Linear(8, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.network(x)

# 2. 訓練配置
model = MultiLayerPerceptron(input_dim=2)
criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)` :
      `# 本演算法通常直接使用 Scikit-Learn 等統計庫實作。
# 若使用 PyTorch 實作，可透過張量運算（如矩陣分解、距離矩陣計算等）來手動實作該算法。
import torch

# 以 ${name} 為例：請參考 Scikit-Learn 範例。`
    }`,
    tensorflow: `${
      id === "linear-regression" ? `import tensorflow as tf
from tensorflow.keras import layers, models

# 建立簡單的單層神經元來模擬線性回歸
model = models.Sequential([
    layers.Input(shape=(1,)),
    layers.Dense(units=1)
])

model.compile(optimizer='sgd', loss='mse')` :
      id === "logistic-regression" ? `import tensorflow as tf
from tensorflow.keras import layers, models

# 建立邏輯回歸模型
model = models.Sequential([
    layers.Input(shape=(2,)),
    layers.Dense(units=1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])` :
      id === "neural-networks" ? `import tensorflow as tf
from tensorflow.keras import layers, models

# 建立多層感知機模型 (MLP)
model = models.Sequential([
    layers.Input(shape=(2,)),
    layers.Dense(8, activation='relu'),
    layers.Dense(8, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])` :
      `# 本演算法通常直接使用 Scikit-Learn 實作。
# 在 TensorFlow 2.x 中，非深度學習算法（如樹模型、聚類）可以使用 TensorFlow Decision Forests (TF-DF) 擴充套件。
import tensorflow as tf
# 請參考 scikit-learn 標籤頁以取得最優實作`
    }`
  };
};

export default function AlgorithmPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState<"curriculum" | "sandbox" | "code">("curriculum");
  const [codeTab, setCodeTab] = useState<"sklearn" | "pytorch" | "tensorflow">("sklearn");

  // State for Sandbox parameters
  const [params, setParams] = useState<any>({});
  // State for Naive Bayes text classification
  const [nbText, setNbText] = useState("Win money cash prize free rewards online now");
  const [nbResult, setNbResult] = useState<any>(null);
  const [nbPredicting, setNbPredicting] = useState(false);
  
  // State for Simulation Results
  const [simResults, setSimResults] = useState<any>({
    data: [],
    boundary: [],
    line: [],
    centroids: [],
    support_vectors: [],
    metrics: {}
  });
  const [loadingSim, setLoadingSim] = useState(false);

  // Match the route parameter to the exact section inside data.json
  const algoConfig = ALGORITHMS.find(a => a.id === id);
  const section = data.sections.find(s => {
    const titleMatch = s.title.toLowerCase();
    return algoConfig && titleMatch.includes(algoConfig.name.toLowerCase()) || titleMatch.includes(id.replace("-", " "));
  });

  // Set default parameters when the algorithm changes
  useEffect(() => {
    if (!id) return;
    let defaults: any = {};
    if (id === "linear-regression") {
      defaults = { n_samples: 100, noise: 5.0, slope: 2.5, intercept: 5.0 };
    } else if (id === "logistic-regression") {
      defaults = { n_samples: 150, noise: 0.1, C: 1.0 };
    } else if (id === "decision-tree") {
      defaults = { n_samples: 150, max_depth: 4, min_samples_split: 2 };
    } else if (id === "random-forest") {
      defaults = { n_samples: 150, n_estimators: 10, max_depth: 4 };
    } else if (id === "support-vector-machine") {
      defaults = { n_samples: 150, C: 1.0, kernel: "rbf", gamma: 0.5 };
    } else if (id === "k-nearest-neighbors") {
      defaults = { n_samples: 150, n_neighbors: 5, weights: "uniform" };
    } else if (id === "naive-bayes") {
      defaults = { n_samples: 150, noise: 0.2 };
    } else if (id === "k-means-clustering") {
      defaults = { n_samples: 150, n_clusters: 3 };
    } else if (id === "principal-component-analysis") {
      defaults = { n_samples: 150, noise: 0.1 };
    } else if (id === "neural-networks") {
      defaults = { n_samples: 150, hidden_layer_sizes: "8,8", learning_rate_init: 0.01, max_iter: 200 };
    }
    setParams(defaults);
    setSimResults({ data: [], boundary: [], line: [], centroids: [], support_vectors: [], metrics: {} });
    setActiveTab("curriculum");
  }, [id]);

  // Fetch simulation data from FastAPI
  const runSimulation = async (customParams = params) => {
    if (!id) return;
    setLoadingSim(true);
    try {
      const response = await fetch(`http://localhost:8000/api/simulate/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customParams),
      });
      if (!response.ok) throw new Error("Simulation request failed");
      const result = await response.ok ? await response.json() : null;
      if (result) {
        setSimResults(result);
      }
    } catch (e) {
      console.error(e);
      // Mock some offline data just in case backend is not running
      generateMockFallback();
    } finally {
      setLoadingSim(false);
    }
  };

  const predictNaiveBayesText = async () => {
    setNbPredicting(true);
    try {
      const response = await fetch("http://localhost:8000/api/simulate/naive-bayes/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nbText }),
      });
      if (response.ok) {
        const res = await response.json();
        setNbResult(res);
      }
    } catch (e) {
      console.error(e);
      // offline mock
      setNbResult({
        text: nbText,
        label: nbText.toLowerCase().includes("free") || nbText.toLowerCase().includes("win") ? "spam" : "ham",
        probability_spam: nbText.toLowerCase().includes("free") ? 0.95 : 0.05,
        probability_ham: nbText.toLowerCase().includes("free") ? 0.05 : 0.95,
      });
    } finally {
      setNbPredicting(false);
    }
  };

  // Generate some local mock data if python server is not responding to avoid showing blank charts
  const generateMockFallback = () => {
    const n = params.n_samples || 100;
    const mockData = [];
    const mockBoundary = [];
    if (id === "linear-regression") {
      const slope = params.slope ?? 2.5;
      const intercept = params.intercept ?? 5.0;
      for (let i = 0; i < n; i++) {
        const x = (Math.random() - 0.5) * 20;
        const y = slope * x + intercept + (Math.random() - 0.5) * 10;
        mockData.push({ x, y });
      }
      const linePts = [
        { x: -10, y: slope * -10 + intercept },
        { x: 10, y: slope * 10 + intercept }
      ];
      setSimResults({
        data: mockData,
        line: linePts,
        metrics: {
          "MSE (離線模擬)": 4.12,
          "R2 (離線模擬)": 0.89,
          "Slope": slope,
          "Intercept": intercept
        }
      });
    } else {
      // Classification mock
      for (let i = 0; i < n; i++) {
        const x1 = (Math.random() - 0.5) * 10;
        const x2 = (Math.random() - 0.5) * 10;
        const y = (x1 + x2 > 0) ? 1 : 0;
        mockData.push({ x1, x2, y });
      }
      // Create grid boundary
      for (let i = -5; i <= 5; i += 0.5) {
        for (let j = -5; j <= 5; j += 0.5) {
          mockBoundary.push({
            x1: i,
            x2: j,
            prob: (i + j > 0) ? 0.9 : 0.1
          });
        }
      }
      setSimResults({
        data: mockData,
        boundary: mockBoundary,
        metrics: { "Accuracy (離線模擬)": 0.94 }
      });
    }
  };

  // Auto-run simulation on tab load
  useEffect(() => {
    if (activeTab === "sandbox" && Object.keys(params).length > 0) {
      runSimulation();
    }
  }, [activeTab, id]);

  if (!algoConfig || !section) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">演算法未找到</h2>
        <Link href="/" className="text-blue-400 hover:underline">返回首頁</Link>
      </div>
    );
  }

  const codeSnippets = getCodeSnippets(id, algoConfig.name);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6 fade-in pb-16">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首頁</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>主題 {algoConfig.num} : {algoConfig.name}</span>
        </div>
      </div>

      {/* Main Algorithm Title & Intro */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight">
          {section.title}
        </h1>
        <p className="text-sm text-zinc-400">
          機器學習十大經典演算法系列研讀報告課程
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all ${
            activeTab === "curriculum" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>研讀教材</span>
        </button>
        <button
          onClick={() => setActiveTab("sandbox")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all ${
            activeTab === "sandbox" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>互動式沙盒 (Sandbox)</span>
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all ${
            activeTab === "code" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Code className="w-4 h-4" />
          <span>範例程式碼</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* TAB 1: CURRICULUM */}
        {activeTab === "curriculum" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Textbook Content */}
            <div className="lg:col-span-2 space-y-6 text-zinc-300 leading-relaxed text-base">
              {section.paragraphs.map((para, idx) => {
                // Formatting math formulas nicely
                if (para.includes("y=β0") || para.includes("sigmoid")) {
                  return (
                    <div key={idx} className="my-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center font-mono text-zinc-100 shadow-inner">
                      <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2 font-sans font-bold">數學模型公式</p>
                      <code className="text-lg text-blue-400">{para}</code>
                    </div>
                  );
                }
                return (
                  <p key={idx} className="indent-8 text-justify">
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Graphic and Overview Column */}
            <div className="space-y-6">
              {section.image && (
                <div className="p-4 rounded-xl glass-card border border-zinc-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>演算法示意圖</span>
                  </h3>
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950/40 flex items-center justify-center">
                    <img 
                      src={`/${section.image}`}
                      alt={section.title}
                      className="object-contain w-full h-full p-2"
                    />
                  </div>
                </div>
              )}
              
              <div className="p-6 rounded-xl glass-panel border border-zinc-800 space-y-4">
                <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>研讀目標</span>
                </h3>
                <ul className="text-xs text-zinc-400 space-y-2.5 list-disc list-inside">
                  <li>理解此演算法的數學假設與最佳化原理</li>
                  <li>熟悉其超參數調校與防止過擬合的手段</li>
                  <li>透過右側的「互動沙盒」調參查看決策面變化</li>
                  <li>能夠使用 Python 與深度學習框架進行簡單部署</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SANDBOX */}
        {activeTab === "sandbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Panel */}
            <div className="space-y-6 p-6 rounded-xl glass-panel border border-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>超參數控制面板</span>
                </h3>
                <button
                  onClick={() => runSimulation()}
                  disabled={loadingSim}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                  title="重新訓練模型"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSim ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Dynamic Parameter Sliders */}
              <div className="space-y-5">
                {Object.keys(params).map((key) => {
                  const val = params[key];
                  if (typeof val === "number") {
                    let min = 10, max = 500, step = 10;
                    let labelName = key;
                    if (key === "n_samples") {
                      labelName = "樣本數量 (n_samples)";
                      min = 20; max = 300; step = 10;
                    } else if (key === "noise") {
                      labelName = "數據雜訊 (noise)";
                      min = 0; max = id === "linear-regression" ? 25 : 0.5; step = id === "linear-regression" ? 1 : 0.05;
                    } else if (key === "slope") {
                      labelName = "斜率 (slope)";
                      min = -5; max = 5; step = 0.5;
                    } else if (key === "intercept") {
                      labelName = "截距 (intercept)";
                      min = -10; max = 10; step = 1;
                    } else if (key === "C") {
                      labelName = "正則化強度 C";
                      min = 0.01; max = 10; step = 0.1;
                    } else if (key === "max_depth") {
                      labelName = "最大深度 (max_depth)";
                      min = 1; max = 10; step = 1;
                    } else if (key === "min_samples_split") {
                      labelName = "分裂最小樣本數";
                      min = 2; max = 10; step = 1;
                    } else if (key === "n_estimators") {
                      labelName = "弱分類器個數 (n_estimators)";
                      min = 1; max = 50; step = 1;
                    } else if (key === "gamma") {
                      labelName = "核函數參數 gamma";
                      min = 0.1; max = 5; step = 0.1;
                    } else if (key === "n_neighbors") {
                      labelName = "鄰居個數 K (n_neighbors)";
                      min = 1; max = 15; step = 1;
                    } else if (key === "n_clusters") {
                      labelName = "群聚個數 K (n_clusters)";
                      min = 1; max = 6; step = 1;
                    } else if (key === "learning_rate_init") {
                      labelName = "初始學習率";
                      min = 0.001; max = 0.1; step = 0.001;
                    } else if (key === "max_iter") {
                      labelName = "最大迭代次數 (epochs)";
                      min = 10; max = 500; step = 10;
                    }

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-400 capitalize">{labelName}</span>
                          <span className="text-blue-400">{val}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={val}
                          onChange={(e) => {
                            const newParams = { ...params, [key]: parseFloat(e.target.value) };
                            setParams(newParams);
                            runSimulation(newParams);
                          }}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    );
                  } else if (key === "kernel" || key === "weights") {
                    const options = key === "kernel" 
                      ? ["rbf", "linear", "poly"] 
                      : ["uniform", "distance"];
                    return (
                      <div key={key} className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 block capitalize">
                          {key === "kernel" ? "SVM 核函數 (kernel)" : "距離權重方式 (weights)"}
                        </label>
                        <select
                          value={val}
                          onChange={(e) => {
                            const newParams = { ...params, [key]: e.target.value };
                            setParams(newParams);
                            runSimulation(newParams);
                          }}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium text-zinc-200 outline-none focus:border-blue-500 transition-colors"
                        >
                          {options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  } else if (key === "hidden_layer_sizes") {
                    return (
                      <div key={key} className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 block">
                          隱藏層結構 (逗號分隔，如 8,8)
                        </label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => setParams({ ...params, hidden_layer_sizes: e.target.value })}
                          onBlur={() => runSimulation()}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Extra: Naive Bayes Text Classification Form */}
              {id === "naive-bayes" && (
                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    垃圾郵件分類器實作 (貝氏定理)
                  </h4>
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={nbText}
                      onChange={(e) => setNbText(e.target.value)}
                      placeholder="輸入電子郵件內文進行預測..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={predictNaiveBayesText}
                      disabled={nbPredicting}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-all active:scale-[0.98]"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>進行分類預測</span>
                    </button>
                  </div>

                  {nbResult && (
                    <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs space-y-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-zinc-500">預測結果:</span>
                        <span className={nbResult.label === "spam" ? "text-rose-400" : "text-emerald-400"}>
                          {nbResult.label === "spam" ? "垃圾郵件 (SPAM)" : "正常郵件 (HAM)"}
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-zinc-400 font-medium">
                        <div className="flex justify-between">
                          <span>垃圾郵件機率:</span>
                          <span>{(nbResult.probability_spam * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>正常郵件機率:</span>
                          <span>{(nbResult.probability_ham * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Run button */}
              <button
                onClick={() => runSimulation()}
                disabled={loadingSim}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white rounded-xl transition-all shadow-md hover:shadow-blue-500/10 active:scale-[0.98] disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>重新訓練與模擬</span>
              </button>
            </div>

            {/* Chart Sandbox Display */}
            <div className="lg:col-span-2 space-y-6">
              {/* Scorecard Metrics */}
              {simResults.metrics && Object.keys(simResults.metrics).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(simResults.metrics).map((key) => (
                    <div key={key} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{key}</p>
                      <p className="text-xl font-extrabold text-blue-400 mt-1">
                        {simResults.metrics[key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Visualizer Canvas */}
              <SandboxVisualizer
                algorithmId={id}
                data={simResults.data}
                boundary={simResults.boundary}
                line={simResults.line}
                centroids={simResults.centroids}
                supportVectors={simResults.support_vectors}
                loading={loadingSim}
              />
            </div>
          </div>
        )}

        {/* TAB 3: CODE SNIPPETS */}
        {activeTab === "code" && (
          <div className="space-y-6">
            <div className="flex border-b border-zinc-800 gap-2">
              <button
                onClick={() => setCodeTab("sklearn")}
                className={`px-4 py-2 border-b-2 font-bold text-xs transition-all ${
                  codeTab === "sklearn" 
                    ? "border-blue-500 text-blue-400" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Python (Scikit-Learn)
              </button>
              <button
                onClick={() => setCodeTab("pytorch")}
                className={`px-4 py-2 border-b-2 font-bold text-xs transition-all ${
                  codeTab === "pytorch" 
                    ? "border-blue-500 text-blue-400" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                PyTorch
              </button>
              <button
                onClick={() => setCodeTab("tensorflow")}
                className={`px-4 py-2 border-b-2 font-bold text-xs transition-all ${
                  codeTab === "tensorflow" 
                    ? "border-blue-500 text-blue-400" 
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                TensorFlow
              </button>
            </div>

            {/* Code editor mock panel */}
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs">
              <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{codeTab === "sklearn" ? "sklearn_model.py" : codeTab === "pytorch" ? "pytorch_model.py" : "tensorflow_model.py"}</span>
                </span>
              </div>
              <pre className="p-5 overflow-x-auto text-zinc-300 leading-relaxed max-h-[500px]">
                <code>
                  {codeTab === "sklearn" ? codeSnippets.sklearn : codeTab === "pytorch" ? codeSnippets.pytorch : codeSnippets.tensorflow}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
