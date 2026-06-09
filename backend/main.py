import os
import json
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# ML imports
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB, MultinomialNB
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.neural_network import MLPClassifier
from sklearn.datasets import make_moons, make_circles, make_blobs, make_classification
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_recall_fscore_support
from sklearn.feature_extraction.text import CountVectorizer

app = FastAPI(title="Top 10 ML Algorithms API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load curriculum data
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "extracted_data", "data.json")
curriculum_data = {}
if os.path.exists(DATA_PATH):
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            curriculum_data = json.load(f)
    except Exception as e:
        print(f"Error loading data.json: {e}")

# Simple Naive Bayes spam data
SPAM_CORPUS = [
    ("Win money cash prize free rewards online now", "spam"),
    ("Get cheap medication pharmacy discount buy online", "spam"),
    ("Claim your free gift card voucher click here", "spam"),
    ("Congratulations you won the lottery click to claim prize", "spam"),
    ("Urgent account security warning verify login info", "spam"),
    ("Hey are we still meeting for lunch today", "ham"),
    ("Let me know when you finish the report", "ham"),
    ("Can you pick up some groceries on the way home", "ham"),
    ("Looking forward to our presentation tomorrow", "ham"),
    ("Thanks for the help yesterday really appreciate it", "ham"),
]

# Train a simple text classifier for Naive Bayes sandbox
vectorizer = CountVectorizer()
X_text = vectorizer.fit_transform([text for text, label in SPAM_CORPUS])
y_text = np.array([1 if label == "spam" else 0 for text, label in SPAM_CORPUS])
spam_classifier = MultinomialNB()
spam_classifier.fit(X_text, y_text)

# Pydantic Schemas for inputs
class LinearRegressionParams(BaseModel):
    n_samples: int = Field(default=100, ge=10, le=500)
    noise: float = Field(default=5.0, ge=0.0, le=50.0)
    slope: float = Field(default=2.5, ge=-10.0, le=10.0)
    intercept: float = Field(default=5.0, ge=-20.0, le=20.0)

class LogisticRegressionParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    noise: float = Field(default=0.1, ge=0.0, le=1.0)
    C: float = Field(default=1.0, ge=0.01, le=100.0)

class DecisionTreeParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    max_depth: Optional[int] = Field(default=None, ge=1, le=20)
    min_samples_split: int = Field(default=2, ge=2, le=20)

class RandomForestParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    n_estimators: int = Field(default=10, ge=1, le=100)
    max_depth: Optional[int] = Field(default=None, ge=1, le=20)

class SVMParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    C: float = Field(default=1.0, ge=0.01, le=100.0)
    kernel: str = Field(default="rbf")  # linear, rbf, poly
    gamma: float = Field(default=0.5, ge=0.01, le=10.0)

class KNNParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    n_neighbors: int = Field(default=5, ge=1, le=50)
    weights: str = Field(default="uniform")  # uniform, distance

class NaiveBayesParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    noise: float = Field(default=0.2, ge=0.0, le=2.0)

class NaiveBayesPredictParams(BaseModel):
    text: str

class KMeansParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    n_clusters: int = Field(default=3, ge=1, le=10)

class PCAParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    noise: float = Field(default=0.1, ge=0.0, le=1.0)

class MLPParams(BaseModel):
    n_samples: int = Field(default=150, ge=10, le=500)
    hidden_layer_sizes: str = Field(default="8,8")  # comma-separated e.g. "8,8"
    learning_rate_init: float = Field(default=0.01, ge=0.0001, le=1.0)
    max_iter: int = Field(default=200, ge=10, le=2000)

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    text: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default=[])
    current_algorithm: Optional[str] = Field(default=None)
    api_key: Optional[str] = Field(default=None)

# Local Fallback QA Engine
def get_local_fallback_response(query: str, current_algo: Optional[str]) -> str:
    query_lower = query.lower()
    
    # Map query/context to section
    target_section = None
    section_mapping = {
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
    }
    
    matched_algo = None
    for algo_id, keywords in section_mapping.items():
        if any(kw in query_lower for kw in keywords):
            matched_algo = algo_id
            break
            
    if not matched_algo and current_algo in section_mapping:
        matched_algo = current_algo

    # Find the section in curriculum_data
    if matched_algo and "sections" in curriculum_data:
        algo_title_part = section_mapping[matched_algo][0]
        for sec in curriculum_data["sections"]:
            if algo_title_part in sec.get("title", ""):
                target_section = sec
                break
                
    if target_section:
        title = target_section.get("title", "")
        paragraphs = target_section.get("paragraphs", [])
        
        # Search for specific topic keywords in query
        topic_keywords = {
            "優缺點": ["優點", "缺點", "局限", "好處", "壞處", "限制", "限制性", "敏感"],
            "公式原理": ["公式", "數學", "原理", "假設", "定義", "方程式", "sigmoid", "幾何", "核函數", "特徵值"],
            "訓練步驟": ["訓練", "擬合", "收斂", "優化", "極大似然", "最小化", "損失函數"],
            "資料預處理": ["預處理", "標準化", "特徵選擇", "缺失值", "尺度"],
            "評估指標": ["評估", "指標", "mse", "r2", "準確率", "召回率", "auc", "f1", "accuracy"],
            "參數調整": ["參數", "調參", "正則化", "l1", "l2", "剪枝", "深度", "超參數", "層數", "學習率"],
            "應用場景": ["應用", "案例", "場景", "房價", "信用", "醫療", "流失", "推薦", "情感", "垃圾"],
            "實作與程式": ["程式", "實作", "程式碼", "code", "scikit-learn", "tensorflow", "pytorch", "套件"],
            "常見錯誤": ["常見錯誤", "錯誤", "注意", "尺度差異", "共線性", "不平衡", "過擬合"]
        }
        
        matched_paragraphs = []
        matched_topic = None
        for topic, kws in topic_keywords.items():
            if any(kw in query_lower for kw in kws):
                matched_topic = topic
                for p in paragraphs:
                    if any(kw in p for kw in kws):
                        if p not in matched_paragraphs:
                            matched_paragraphs.append(p)
                if matched_paragraphs:
                    break
        
        if matched_paragraphs:
            response = f"### 📚 課程庫檢索：{title} - {matched_topic}\n\n"
            response += "\n\n".join([f"- {p}" for p in matched_paragraphs])
        else:
            response = f"### 📚 課程庫檢索：{title} 概述\n\n"
            response += "\n\n".join([f"- {p}" for p in paragraphs[:3]])
            
        response += "\n\n---\n*💡 提示：系統目前處於「本機教材檢索模式」。若要解鎖通用問答、寫程式等完整 AI 功能，點擊右上方設定齒輪 ⚙️ 貼上您的免費 Gemini API Key 即可。*"
        return response
        
    return f"""### 🤖 歡迎使用機器學習 AI 助教（本機模式）

我是一台本機運作的助教。我可以根據本課程的教材庫為您回答關於十大演算法的問題。

**當前教材包含**：線性回歸、邏輯回歸、決策樹、隨機森林、支持向量機 (SVM)、K 最近鄰 (KNN)、朴素貝葉斯、K-Means 聚類、主成分分析 (PCA) 與神經網絡。

您可以試著問我：
- 「什麼是 SVM 的優缺點？」
- 「KNN 的公式與原理是什麼？」
- 「線性回歸的常見錯誤有哪些？」

---
*💡 提示：點擊右上方設定齒輪 ⚙️，輸入免費申請的 Gemini API Key，即可解鎖完整 Gemini AI 對答與寫程式功能！*
"""

# HELPER: Compute 2D Decision Boundary
def get_decision_boundary_grid(model, X, grid_size=30):
    x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
    y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
    
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, grid_size),
        np.linspace(y_min, y_max, grid_size)
    )
    grid_points = np.c_[xx.ravel(), yy.ravel()]
    
    # Check if model has predict_proba
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(grid_points)[:, 1]
    else:
        probs = model.predict(grid_points).astype(float)
        
    boundary_points = []
    for i, pt in enumerate(grid_points):
        boundary_points.append({
            "x1": float(pt[0]),
            "x2": float(pt[1]),
            "prob": float(probs[i])
        })
    return boundary_points

@app.get("/api/curriculum")
def get_curriculum():
    if not curriculum_data:
        raise HTTPException(status_code=404, detail="Curriculum data not found")
    return curriculum_data

# Linear Regression
@app.post("/api/simulate/linear-regression")
def simulate_linear_regression(params: LinearRegressionParams):
    np.random.seed(42)
    # Generate X
    X = np.random.uniform(-10, 10, (params.n_samples, 1))
    # Generate Y with noise
    noise = np.random.normal(0, params.noise, (params.n_samples, 1))
    Y = params.slope * X + params.intercept + noise
    
    # Fit model
    model = LinearRegression()
    model.fit(X, Y)
    
    Y_pred = model.predict(X)
    
    # Calculate metrics
    mse = float(mean_squared_error(Y, Y_pred))
    r2 = float(r2_score(Y, Y_pred))
    fitted_slope = float(model.coef_[0][0])
    fitted_intercept = float(model.intercept_[0])
    
    # Regression line points
    x_line = np.linspace(-10, 10, 100).reshape(-1, 1)
    y_line = model.predict(x_line)
    
    data_points = [{"x": float(X[i][0]), "y": float(Y[i][0])} for i in range(params.n_samples)]
    line_points = [{"x": float(x_line[i][0]), "y": float(y_line[i][0])} for i in range(100)]
    
    return {
        "data": data_points,
        "line": line_points,
        "metrics": {
            "MSE": round(mse, 4),
            "R2": round(r2, 4),
            "Slope": round(fitted_slope, 4),
            "Intercept": round(fitted_intercept, 4)
        }
    }

# Logistic Regression
@app.post("/api/simulate/logistic-regression")
def simulate_logistic_regression(params: LogisticRegressionParams):
    np.random.seed(42)
    X, y = make_moons(n_samples=params.n_samples, noise=params.noise, random_state=42)
    
    # Normalize X to -5, 5 range for better chart presentation
    X = (X - X.mean(axis=0)) / X.std(axis=0) * 3
    
    model = LogisticRegression(C=params.C)
    model.fit(X, y)
    
    y_pred = model.predict(X)
    
    # Metrics
    acc = float(accuracy_score(y, y_pred))
    p, r, f, _ = precision_recall_fscore_support(y, y_pred, average="binary")
    
    boundary = get_decision_boundary_grid(model, X)
    data_points = [{"x1": float(X[i, 0]), "x2": float(X[i, 1]), "y": int(y[i])} for i in range(params.n_samples)]
    
    return {
        "data": data_points,
        "boundary": boundary,
        "metrics": {
            "Accuracy": round(acc, 4),
            "Precision": round(float(p), 4),
            "Recall": round(float(r), 4),
            "F1 Score": round(float(f), 4)
        }
    }

# Decision Tree
@app.post("/api/simulate/decision-tree")
def simulate_decision_tree(params: DecisionTreeParams):
    np.random.seed(42)
    # Generate non-linear moons dataset
    X, y = make_moons(n_samples=params.n_samples, noise=0.2, random_state=42)
    X = (X - X.mean(axis=0)) / X.std(axis=0) * 3
    
    model = DecisionTreeClassifier(max_depth=params.max_depth, min_samples_split=params.min_samples_split, random_state=42)
    model.fit(X, y)
    
    y_pred = model.predict(X)
    acc = float(accuracy_score(y, y_pred))
    
    boundary = get_decision_boundary_grid(model, X)
    data_points = [{"x1": float(X[i, 0]), "x2": float(X[i, 1]), "y": int(y[i])} for i in range(params.n_samples)]
    
    return {
        "data": data_points,
        "boundary": boundary,
        "metrics": {
            "Accuracy": round(acc, 4)
        }
    }

# Random Forest
@app.post("/api/simulate/random-forest")
def simulate_random_forest(params: RandomForestParams):
    np.random.seed(42)
    X, y = make_moons(n_samples=params.n_samples, noise=0.25, random_state=42)
    X = (X - X.mean(axis=0)) / X.std(axis=0) * 3
    
    model = RandomForestClassifier(n_estimators=params.n_estimators, max_depth=params.max_depth, random_state=42)
    model.fit(X, y)
    
    y_pred = model.predict(X)
    acc = float(accuracy_score(y, y_pred))
    
    boundary = get_decision_boundary_grid(model, X)
    data_points = [{"x1": float(X[i, 0]), "x2": float(X[i, 1]), "y": int(y[i])} for i in range(params.n_samples)]
    
    return {
        "data": data_points,
        "boundary": boundary,
        "metrics": {
            "Accuracy": round(acc, 4)
        }
    }

# SVM
@app.post("/api/simulate/support-vector-machine")
def simulate_svm(params: SVMParams):
    np.random.seed(42)
    # Generate concentric circles
    X, y = make_circles(n_samples=params.n_samples, noise=0.1, factor=0.5, random_state=42)
    X = X * 4  # scale it up
    
    model = SVC(C=params.C, kernel=params.kernel, gamma=params.gamma, probability=True, random_state=42)
    model.fit(X, y)
    
    y_pred = model.predict(X)
    acc = float(accuracy_score(y, y_pred))
    
    boundary = get_decision_boundary_grid(model, X)
    data_points = [{"x1": float(X[i, 0]), "x2": float(X[i, 1]), "y": int(y[i])} for i in range(params.n_samples)]
    
    # Get support vectors
    sv = model.support_vectors_
    support_vectors = [{"x1": float(sv[i, 0]), "x2": float(sv[i, 1])} for i in range(len(sv))]
    
    return {
        "data": data_points,
        "boundary": boundary,
        "support_vectors": support_vectors,
        "metrics": {
            "Accuracy": round(acc, 4),
            "Support Vectors Count": len(sv)
        }
    }

# KNN
@app.post("/api/simulate/k-nearest-neighbors")
def simulate_knn(params: KNNParams):
    np.random.seed(42)
    # Generate 4-class classification or 2-class moon classification
    X, y = make_moons(n_samples=params.n_samples, noise=0.25, random_state=42)
    X = (X - X.mean(axis=0)) / X.std(axis=0) * 3
    
    model = KNeighborsClassifier(n_neighbors=params.n_neighbors, weights=params.weights)
    model.fit(X, y)
    
    y_pred = model.predict(X)
    acc = float(accuracy_score(y, y_pred))
    
    boundary = get_decision_boundary_grid(model, X)
    data_points = [{"x1": float(X[i, 0]), "x2": float(X[i, 1]), "y": int(y[i])} for i in range(params.n_samples)]
    
    return {
        "data": data_points,
        "boundary": boundary,
        "metrics": {
            "Accuracy": round(acc, 4)
        }
    }

# Naive Bayes (Curriculum dataset simulation)
@app.post("/api/simulate/naive-bayes")
def simulate_naive_bayes(params: NaiveBayesParams):
    np.random.seed(42)
    # 2D classification
    X, y = make_classification(n_samples=params.n_samples, n_features=2, n_redundant=0, n_informative=2,
                               random_state=42, n_clusters_per_class=1, class_sep=1.2)
    X = X * 2
    
    model = GaussianNB()
    model.fit(X, y)
    
    y_pred = model.predict(X)
    acc = float(accuracy_score(y, y_pred))
    
    boundary = get_decision_boundary_grid(model, X)
    data_points = [{"x1": float(X[i, 0]), "x2": float(X[i, 1]), "y": int(y[i])} for i in range(params.n_samples)]
    
    return {
        "data": data_points,
        "boundary": boundary,
        "metrics": {
            "Accuracy": round(acc, 4)
        }
    }

# Naive Bayes Text Prediction
@app.post("/api/simulate/naive-bayes/predict")
def predict_naive_bayes(params: NaiveBayesPredictParams):
    vec = vectorizer.transform([params.text])
    pred = int(spam_classifier.predict(vec)[0])
    probs = spam_classifier.predict_proba(vec)[0]
    
    return {
        "text": params.text,
        "label": "spam" if pred == 1 else "ham",
        "probability_spam": round(float(probs[1]), 4),
        "probability_ham": round(float(probs[0]), 4),
    }

# K-Means
@app.post("/api/simulate/k-means-clustering")
def simulate_kmeans(params: KMeansParams):
    np.random.seed(42)
    X, _ = make_blobs(n_samples=params.n_samples, centers=params.n_clusters, cluster_std=0.8, random_state=42)
    X = X * 1.5
    
    model = KMeans(n_clusters=params.n_clusters, random_state=42, n_init='auto')
    model.fit(X)
    
    y_pred = model.labels_
    centroids = model.cluster_centers_
    
    data_points = [{"x1": float(X[i, 0]), "x2": float(X[i, 1]), "cluster": int(y_pred[i])} for i in range(params.n_samples)]
    centroid_points = [{"x1": float(centroids[c, 0]), "x2": float(centroids[c, 1]), "cluster": int(c)} for c in range(params.n_clusters)]
    
    # Generate decision boundary grid mapping to clusters
    boundary = []
    x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
    y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 25), np.linspace(y_min, y_max, 25))
    grid_points = np.c_[xx.ravel(), yy.ravel()]
    cluster_preds = model.predict(grid_points)
    
    for i, pt in enumerate(grid_points):
        boundary.append({
            "x1": float(pt[0]),
            "x2": float(pt[1]),
            "cluster": int(cluster_preds[i])
        })
        
    return {
        "data": data_points,
        "centroids": centroid_points,
        "boundary": boundary,
        "metrics": {
            "Inertia (Sum of Sq. Dist.)": round(float(model.inertia_), 4),
        }
    }

# PCA
@app.post("/api/simulate/principal-component-analysis")
def simulate_pca(params: PCAParams):
    np.random.seed(42)
    # Generate synthetic 3D data: a noisy plane
    x = np.random.normal(0, 1.5, params.n_samples)
    y = np.random.normal(0, 1.5, params.n_samples)
    z = 0.8 * x + 0.5 * y + np.random.normal(0, params.noise, params.n_samples)
    
    X = np.column_stack((x, y, z))
    
    pca = PCA(n_components=2)
    X_projected = pca.fit_transform(X)
    
    explained_variance = pca.explained_variance_ratio_
    components = pca.components_
    
    original_points = [{"x": float(X[i, 0]), "y": float(X[i, 1]), "z": float(X[i, 2])} for i in range(params.n_samples)]
    projected_points = [{"pc1": float(X_projected[i, 0]), "pc2": float(X_projected[i, 1])} for i in range(params.n_samples)]
    
    return {
        "original_data": original_points,
        "projected_data": projected_points,
        "metrics": {
            "PC1 Explained Var.": f"{round(float(explained_variance[0]) * 100, 2)}%",
            "PC2 Explained Var.": f"{round(float(explained_variance[1]) * 100, 2)}%",
            "Total Explained Var.": f"{round(float(sum(explained_variance)) * 100, 2)}%"
        }
    }

# Neural Network (MLP)
@app.post("/api/simulate/neural-networks")
def simulate_mlp(params: MLPParams):
    np.random.seed(42)
    # Generate circular classification data
    X, y = make_circles(n_samples=params.n_samples, noise=0.15, factor=0.5, random_state=42)
    X = X * 4
    
    # Parse hidden layers
    try:
        layers = [int(h) for h in params.hidden_layer_sizes.split(",") if h.strip()]
        if not layers:
            layers = [8, 8]
    except:
        layers = [8, 8]
        
    model = MLPClassifier(
        hidden_layer_sizes=layers,
        learning_rate_init=params.learning_rate_init,
        max_iter=params.max_iter,
        random_state=42,
        early_stopping=True
    )
    
    model.fit(X, y)
    y_pred = model.predict(X)
    acc = float(accuracy_score(y, y_pred))
    
    # Get loss curve
    loss_curve = [float(l) for l in model.loss_curve_]
    
    boundary = get_decision_boundary_grid(model, X)
    data_points = [{"x1": float(X[i, 0]), "x2": float(X[i, 1]), "y": int(y[i])} for i in range(params.n_samples)]
    
    return {
        "data": data_points,
        "boundary": boundary,
        "loss_curve": loss_curve,
        "metrics": {
            "Accuracy": round(acc, 4),
            "Total Epochs": len(loss_curve),
            "Best Validation Loss": round(float(model.best_validation_score_) if hasattr(model, 'best_validation_score_') else 0.0, 4)
        }
    }

@app.post("/api/chat")
def chat_with_assistant(request: ChatRequest):
    import urllib.request
    
    # 1. Determine API Key (request priority, then fallback to backend env var)
    api_key = request.api_key or os.environ.get("GEMINI_API_KEY")
    
    # 2. Extract context paragraphs if current algorithm is set
    context_paragraphs = ""
    algo_name = ""
    if request.current_algorithm:
        section_mapping = {
            "linear-regression": ("線性回歸", "Linear Regression"),
            "logistic-regression": ("邏輯回歸", "Logistic Regression"),
            "decision-tree": ("決策樹", "Decision Tree"),
            "random-forest": ("隨機森林", "Random Forest"),
            "support-vector-machine": ("支持向量機", "Support Vector Machine"),
            "k-nearest-neighbors": ("K 最近鄰", "K-Nearest Neighbors"),
            "naive-bayes": ("朴素貝葉斯", "Naive Bayes"),
            "k-means-clustering": ("K 均值聚類", "K-Means Clustering"),
            "principal-component-analysis": ("主成分分析", "Principal Component Analysis"),
            "neural-networks": ("神經網絡", "Neural Networks")
        }
        if request.current_algorithm in section_mapping:
            algo_name = section_mapping[request.current_algorithm][0]
            if "sections" in curriculum_data:
                for sec in curriculum_data["sections"]:
                    if algo_name in sec.get("title", ""):
                        context_paragraphs = "\n".join(sec.get("paragraphs", []))
                        break

    # 3. If API Key is present, call Gemini API
    if api_key:
        # Prepare system instruction
        system_instruction = (
            "你是一個專業、親切的機器學習助教，正在為學生解答「機器學習十大演算法互動學習平台」上的學術問題。\n"
            "你的回答應該專業、條理清晰，儘量使用繁體中文（台灣習慣用語），並且給出具體的公式解釋、步驟或程式範例。\n"
            "這個平台涵蓋的十大演算法是：線性回歸、邏輯回歸、決策樹、隨機森林、支持向量機、K最近鄰、朴素貝葉斯、K-Means聚類、主成分分析、神經網絡。\n"
        )
        if context_paragraphs:
            system_instruction += (
                f"\n目前學生正在瀏覽「{algo_name}」單元的教材。如果學生的提問與該演算法有關，請結合以下教材內容進行精準回答，"
                f"保持概念名詞與公式的一致性：\n{context_paragraphs}\n"
            )
            
        # Format history in Gemini format
        contents = []
        for msg in request.history:
            role = "user" if msg.role == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.text}]
            })
        
        # Append current user prompt
        contents.append({
            "role": "user",
            "parts": [{"text": request.message}]
        })
        
        # Call Gemini API
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            }
        }
        
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                ai_text = res_body["candidates"][0]["content"]["parts"][0]["text"]
                return {"response": ai_text, "mode": "gemini"}
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            print(f"Gemini API HTTP Error {e.code}: {error_body}")
            fallback_response = get_local_fallback_response(request.message, request.current_algorithm)
            return {
                "response": f"*(⚠️ 已自動降級為本機模式：Gemini API 錯誤 - {e.code})*\n\n" + fallback_response,
                "mode": "fallback_error"
            }
        except Exception as e:
            print(f"Gemini API Generic Error: {e}")
            fallback_response = get_local_fallback_response(request.message, request.current_algorithm)
            return {
                "response": f"*(⚠️ 已自動降級為本機模式：Gemini 呼叫發生異常)*\n\n" + fallback_response,
                "mode": "fallback_error"
            }
            
    # 4. If no API key, use local fallback
    fallback_response = get_local_fallback_response(request.message, request.current_algorithm)
    return {"response": fallback_response, "mode": "local"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
