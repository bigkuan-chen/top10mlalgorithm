"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface DataPoint {
  x?: number;
  y?: number;
  x1?: number;
  x2?: number;
  y_pred?: number;
  cluster?: number;
}

interface BoundaryPoint {
  x1: number;
  x2: number;
  prob?: number;
  cluster?: number;
}

interface SupportVector {
  x1: number;
  x2: number;
}

interface SandboxVisualizerProps {
  algorithmId: string;
  data: DataPoint[];
  boundary?: BoundaryPoint[];
  line?: { x: number; y: number }[];
  centroids?: { x1: number; x2: number; cluster: number }[];
  supportVectors?: SupportVector[];
  loading: boolean;
}

export default function SandboxVisualizer({
  algorithmId,
  data,
  boundary = [],
  line = [],
  centroids = [],
  supportVectors = [],
  loading,
}: SandboxVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (loading || !canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 40;
    const width = canvas.width;
    const height = canvas.height;

    // Determine scale based on data points
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;

    if (algorithmId === "linear-regression") {
      data.forEach((p) => {
        if (p.x !== undefined) {
          xMin = Math.min(xMin, p.x);
          xMax = Math.max(xMax, p.x);
        }
        if (p.y !== undefined) {
          yMin = Math.min(yMin, p.y);
          yMax = Math.max(yMax, p.y);
        }
      });
      // Include line in scale
      line.forEach((p) => {
        xMin = Math.min(xMin, p.x);
        xMax = Math.max(xMax, p.x);
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      });
    } else {
      // 2D Classification / Clustering
      data.forEach((p) => {
        if (p.x1 !== undefined) {
          xMin = Math.min(xMin, p.x1);
          xMax = Math.max(xMax, p.x1);
        }
        if (p.x2 !== undefined) {
          yMin = Math.min(yMin, p.x2);
          yMax = Math.max(yMax, p.x2);
        }
      });
    }

    // Add small margin to range
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    xMin -= xRange * 0.1;
    xMax += xRange * 0.1;
    yMin -= yRange * 0.1;
    yMax += yRange * 0.1;

    const scaleX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
    const scaleY = (y: number) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);

    // 1. Draw Decision Boundary (Background Grid)
    if (boundary && boundary.length > 0) {
      // Group boundary grid by columns to determine cell size
      const xs = Array.from(new Set(boundary.map((b) => b.x1))).sort((a, b) => a - b);
      const ys = Array.from(new Set(boundary.map((b) => b.x2))).sort((a, b) => a - b);
      
      const cellW = xs.length > 1 ? (scaleX(xs[1]) - scaleX(xs[0])) : 15;
      const cellH = ys.length > 1 ? (scaleY(ys[0]) - scaleY(ys[1])) : 15;

      boundary.forEach((b) => {
        const cx = scaleX(b.x1);
        const cy = scaleY(b.x2);

        // Fill background color according to predictions/probabilities
        if (b.cluster !== undefined) {
          // Clustering colors
          const colors = [
            "rgba(59, 130, 246, 0.15)",   // Blue
            "rgba(168, 85, 247, 0.15)",  // Purple
            "rgba(244, 63, 94, 0.15)",   // Rose
            "rgba(34, 197, 94, 0.15)",   // Green
            "rgba(234, 179, 8, 0.15)",   // Yellow
            "rgba(249, 115, 22, 0.15)",  // Orange
          ];
          ctx.fillStyle = colors[b.cluster % colors.length];
        } else if (b.prob !== undefined) {
          // Classification probabilities (gradient between blue/class 0 and purple/class 1)
          const p = b.prob; // 0 to 1
          ctx.fillStyle = `rgba(${Math.floor(168 * p + 59 * (1 - p))}, ${Math.floor(85 * p + 130 * (1 - p))}, ${Math.floor(247 * p + 246 * (1 - p))}, 0.12)`;
        } else {
          // Simple hard classification
          ctx.fillStyle = b.prob !== undefined && b.prob > 0.5 
            ? "rgba(168, 85, 247, 0.12)" 
            : "rgba(59, 130, 246, 0.12)";
        }
        
        ctx.fillRect(cx - cellW / 2, cy - cellH / 2, cellW + 0.5, cellH + 0.5);
      });
    }

    // 2. Draw Grid Lines & Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    
    // Y-Grid and labels
    for (let i = 0; i <= 5; i++) {
      const yVal = yMin + (i / 5) * (yMax - yMin);
      const py = scaleY(yVal);
      ctx.beginPath();
      ctx.moveTo(pad, py);
      ctx.lineTo(width - pad, py);
      ctx.stroke();

      ctx.fillStyle = "#71717a";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(yVal.toFixed(1), pad - 8, py + 3);
    }

    // X-Grid and labels
    for (let i = 0; i <= 5; i++) {
      const xVal = xMin + (i / 5) * (xMax - xMin);
      const px = scaleX(xVal);
      ctx.beginPath();
      ctx.moveTo(px, pad);
      ctx.lineTo(px, height - pad);
      ctx.stroke();

      ctx.fillStyle = "#71717a";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(xVal.toFixed(1), px, height - pad + 15);
    }

    // 3. Draw Support Vectors Indicator (for SVM)
    if (algorithmId === "support-vector-machine" && supportVectors.length > 0) {
      supportVectors.forEach((sv) => {
        const cx = scaleX(sv.x1);
        const cy = scaleY(sv.x2);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, 2 * Math.PI);
        ctx.stroke();
      });
    }

    // 4. Draw Data Points (Scatter Plot)
    data.forEach((p) => {
      let cx = 0, cy = 0;
      let fillColor = "#3b82f6";
      let strokeColor = "#1d4ed8";

      if (algorithmId === "linear-regression") {
        if (p.x !== undefined && p.y !== undefined) {
          cx = scaleX(p.x);
          cy = scaleY(p.y);
        }
        fillColor = "rgba(59, 130, 246, 0.85)"; // Blue points
        strokeColor = "#2563eb";
      } else {
        // Classification/Clustering points
        if (p.x1 !== undefined && p.x2 !== undefined) {
          cx = scaleX(p.x1);
          cy = scaleY(p.x2);
        }
        
        if (p.cluster !== undefined) {
          const colors = [
            { fill: "#3b82f6", stroke: "#1d4ed8" }, // Cluster 0
            { fill: "#a855f7", stroke: "#7e22ce" }, // Cluster 1
            { fill: "#f43f5e", stroke: "#be123c" }, // Cluster 2
            { fill: "#22c55e", stroke: "#15803d" }, // Cluster 3
            { fill: "#eab308", stroke: "#a16207" }, // Cluster 4
          ];
          const color = colors[p.cluster % colors.length];
          fillColor = color.fill;
          strokeColor = color.stroke;
        } else if (p.y_pred !== undefined || ("y" in p)) {
          const classVal = p.y_pred !== undefined ? p.y_pred : (p as any).y;
          if (classVal === 1) {
            fillColor = "#a855f7"; // Purple for class 1
            strokeColor = "#7e22ce";
          } else {
            fillColor = "#3b82f6"; // Blue for class 0
            strokeColor = "#1d4ed8";
          }
        }
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });

    // 5. Draw Fitted Regression Line (for Linear Regression)
    if (algorithmId === "linear-regression" && line && line.length > 0) {
      ctx.strokeStyle = "#a855f7"; // purple regression line
      ctx.lineWidth = 3;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(168, 85, 247, 0.5)";
      ctx.beginPath();
      ctx.moveTo(scaleX(line[0].x), scaleY(line[0].y));
      for (let i = 1; i < line.length; i++) {
        ctx.lineTo(scaleX(line[i].x), scaleY(line[i].y));
      }
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }

    // 6. Draw Centroids (for K-Means)
    if (algorithmId === "k-means-clustering" && centroids && centroids.length > 0) {
      centroids.forEach((c) => {
        const cx = scaleX(c.x1);
        const cy = scaleY(c.x2);

        // Draw large star or diamond
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Diamond path
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + 10, cy);
        ctx.lineTo(cx, cy + 10);
        ctx.lineTo(cx - 10, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner dot matching cluster color
        const colors = ["#3b82f6", "#a855f7", "#f43f5e", "#22c55e", "#eab308"];
        ctx.fillStyle = colors[c.cluster % colors.length];
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

  }, [algorithmId, data, boundary, line, centroids, supportVectors, loading]);

  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-zinc-500 text-sm font-medium">模型計算中...</span>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={600}
          height={450}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
}
