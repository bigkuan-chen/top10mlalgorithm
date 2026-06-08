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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
