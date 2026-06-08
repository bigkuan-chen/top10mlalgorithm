import { 
  TrendingUp, 
  Activity, 
  GitBranch, 
  Layers, 
  Cpu, 
  Users, 
  ShieldAlert, 
  Sliders, 
  PieChart, 
  BrainCircuit 
} from "lucide-react";

export const ALGORITHMS = [
  { id: "linear-regression", name: "線性回歸", eng: "Linear Regression", icon: TrendingUp, num: "01" },
  { id: "logistic-regression", name: "邏輯回歸", eng: "Logistic Regression", icon: Activity, num: "02" },
  { id: "decision-tree", name: "決策樹", eng: "Decision Tree", icon: GitBranch, num: "03" },
  { id: "random-forest", name: "隨機森林", eng: "Random Forest", icon: Layers, num: "04" },
  { id: "support-vector-machine", name: "支持向量機", eng: "SVM", icon: ShieldAlert, num: "05" },
  { id: "k-nearest-neighbors", name: "K 最近鄰", eng: "KNN", icon: Users, num: "06" },
  { id: "naive-bayes", name: "朴素貝葉斯", eng: "Naive Bayes", icon: Sliders, num: "07" },
  { id: "k-means-clustering", name: "K 均值聚類", eng: "K-Means", icon: PieChart, num: "08" },
  { id: "principal-component-analysis", name: "主成分分析", eng: "PCA", icon: BrainCircuit, num: "09" },
  { id: "neural-networks", name: "神經網絡", eng: "Neural Networks", icon: Cpu, num: "10" }
];
