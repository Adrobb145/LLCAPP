// coach/ClientPhotos.jsx — coach-side progress-photo gallery (read-only) with lightbox.
// Reads the same photos the athlete uploads; they already sync via client_state.
import { useState } from "react";

const navBtn = { background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", color: "#fff", borderRadius: 8, width: 42, height: 42, fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 };

export default function ClientPhotos({ photos = [] }) {
  const [open, setOpen] = useState(null);
  if (!photos.length) return null;
  return (<div className="rail">
    <div className="rail-t"><span>📸 Progress Photos</span><span className="mono" style={{ color: "#807E76" }}>{photos.length}</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }}>
      {photos.map((ph, i) => (
        <button key={ph.id} onClick={() => setOpen(i)} title={ph.date} style={{ position: "relative", aspectRatio: "3/4", borderRadius: 7, overflow: "hidden", border: "1px solid #2A2A2F", padding: 0, cursor: "pointer", background: "#000" }}>
          <img src={ph.url} alt={ph.date} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,.85))", color: "#fff", fontSize: 9.5, padding: "10px 4px 3px", fontWeight: 700, textAlign: "left" }}>{ph.date}</div>
        </button>
      ))}
    </div>
    {open != null && (
      <div onClick={() => setOpen(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={e => e.stopPropagation()} style={{ maxWidth: 520, width: "100%", maxHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src={photos[open].url} alt={photos[open].date} style={{ maxWidth: "100%", maxHeight: "78vh", objectFit: "contain", borderRadius: 10 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, color: "#F5F4F0" }}>
            <button onClick={() => setOpen(o => (o - 1 + photos.length) % photos.length)} style={navBtn}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 110, textAlign: "center" }}>{photos[open].date} · {open + 1}/{photos.length}</span>
            <button onClick={() => setOpen(o => (o + 1) % photos.length)} style={navBtn}>›</button>
            <button onClick={() => setOpen(null)} style={{ ...navBtn, marginLeft: 8 }}>✕</button>
          </div>
        </div>
      </div>
    )}
  </div>);
}
