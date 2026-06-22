// shared/Spark.jsx — inline sparkline with optional hover tooltips on each point.
// Pass `labels` (same length as data) to show "<label> · <value> <unit>" on hover.
export default function Spark({ data, color = "#FF6B2C", h = 60, labels, unit = "lb" }) {
  if (!data || data.length < 2) return null;
  const w = 100, max = Math.max(...data) * 1.05, min = Math.min(...data) * .95, r = (max - min) || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / r) * (h - 8) - 4]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fmt = v => (Math.round(v * 10) / 10).toLocaleString();
  return (<svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
    <path d={path} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    {pts.map((p, i) => (<g key={i}>
      <circle cx={p[0]} cy={p[1]} r="1.4" fill={color} />
      <circle cx={p[0]} cy={p[1]} r="5" fill="transparent" style={{ cursor: "pointer" }}>
        <title>{(labels && labels[i] != null ? labels[i] + " · " : "") + fmt(data[i]) + " " + unit}</title>
      </circle>
    </g>))}
  </svg>);
}
