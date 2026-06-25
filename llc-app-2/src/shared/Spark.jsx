// shared/Spark.jsx — inline sparkline. Tap (mobile) or hover (desktop) any point
// to see its value — with a date label when `labels` is supplied. Tap the point
// again or empty space to dismiss.
import { useState } from "react";

export default function Spark({ data, color = "#FF6B2C", h = 60, labels, unit = "lb" }) {
  const [sel, setSel] = useState(null);
  if (!data || data.length < 2) return null;
  const w = 100, max = Math.max(...data) * 1.05, min = Math.min(...data) * .95, r = (max - min) || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / r) * (h - 8) - 4]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fmt = v => (Math.round(v * 10) / 10).toLocaleString();
  const tip = sel != null ? ((labels && labels[sel] != null ? labels[sel] + " · " : "") + fmt(data[sel]) + " " + unit) : null;
  const leftPct = sel != null ? Math.max(16, Math.min(84, (sel / (data.length - 1)) * 100)) : 0;

  return (
    <div style={{ position: "relative", width: "100%" }} onMouseLeave={() => setSel(null)}>
      <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block", width: "100%", height: h }}>
        <rect x="0" y="0" width={w} height={h} fill="transparent" onClick={() => setSel(null)} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {sel != null && <line x1={pts[sel][0]} y1="0" x2={pts[sel][0]} y2={h} stroke={color} strokeWidth="0.75" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" opacity="0.45" />}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={sel === i ? "2.6" : "1.4"} fill={color} />
            <circle cx={p[0]} cy={p[1]} r="6" fill="transparent" style={{ cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); setSel(s => s === i ? null : i); }}
              onMouseEnter={() => setSel(i)} />
          </g>
        ))}
      </svg>
      {tip != null && (
        <div style={{ position: "absolute", left: leftPct + "%", top: 1, transform: "translateX(-50%)", background: "#1A1A1D", border: "1px solid #34343A", color: "#F5F4F0", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", padding: "3px 8px", borderRadius: 6, pointerEvents: "none", boxShadow: "0 4px 14px rgba(0,0,0,.55)", zIndex: 5, fontFamily: "system-ui,sans-serif" }}>
          {tip}
        </div>
      )}
    </div>
  );
}
