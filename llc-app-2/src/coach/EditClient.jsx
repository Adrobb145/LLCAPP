// coach/EditClient.jsx — edit an existing athlete's personal info.
// Email is shown read-only because it's tied to their login/invite.
import { useState } from "react";
import { D } from "../theme/tokens";

const ACCENTS = ["#FF6B2C", "#3AE0FF", "#FF3A8E", "#9EFF3A", "#FFB23A", "#B98AFF"];

export default function EditClient({ client, onSave, onDelete, onClose }) {
  const [f, setF] = useState({
    name: client.name || "", goal: client.goal || "", bw: client.bw ?? "",
    block: client.block || "", totalWeeks: client.totalWeeks ?? 6, currentWeek: client.currentWeek ?? 1,
    sq: client.lifts?.sq ?? "", bn: client.lifts?.bn ?? "", dl: client.lifts?.dl ?? "",
    accent: client.accent || ACCENTS[0],
  });
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const canSave = f.name.trim().length > 1;

  const save = () => {
    if (!canSave) return;
    onSave(client.id, {
      name: f.name.trim(), goal: f.goal.trim(), bw: Number(f.bw) || 0,
      block: f.block.trim() || "Foundation", totalWeeks: Number(f.totalWeeks) || 6,
      currentWeek: Math.min(Number(f.currentWeek) || 1, Number(f.totalWeeks) || 6),
      lifts: { sq: Number(f.sq) || 0, bn: Number(f.bn) || 0, dl: Number(f.dl) || 0 },
      accent: f.accent,
    });
    onClose();
  };

  const ov = { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 };
  const card = { width: 460, maxWidth: "100%", background: D.card, border: `1px solid ${D.line}`, borderRadius: 12, padding: 22, maxHeight: "90vh", overflowY: "auto" };
  const lbl = { fontSize: 8.5, color: D.sub, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3, display: "block" };
  const inp = { width: "100%", background: D.bg, border: `1px solid ${D.line}`, borderRadius: 7, padding: 9, color: D.ink, fontSize: 13.5, outline: "none", fontFamily: "inherit", marginBottom: 11 };
  const num = { ...inp, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" };

  return (<div style={ov} onClick={onClose}>
    <div style={card} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div><div style={{ fontSize: 9, color: f.accent, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700 }}>Edit Athlete</div><div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 19 }}>{client.name}</div></div>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: 0, color: D.sub, fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>

      {client.email && (<><label style={lbl}>Email (login — not editable here)</label>
        <input style={{ ...inp, opacity: .55, cursor: "not-allowed" }} value={client.email} readOnly /></>)}

      <label style={lbl}>Full name</label><input style={inp} value={f.name} onChange={set("name")} />
      <label style={lbl}>Goal</label><input style={inp} value={f.goal} onChange={set("goal")} placeholder="Build strength…" />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Body weight (lb)</label><input style={num} type="number" value={f.bw} onChange={set("bw")} /></div>
        <div style={{ flex: 2 }}><label style={lbl}>Block</label><input style={inp} value={f.block} onChange={set("block")} /></div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Current week</label><input style={num} type="number" value={f.currentWeek} onChange={set("currentWeek")} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Total weeks</label><input style={num} type="number" value={f.totalWeeks} onChange={set("totalWeeks")} /></div>
      </div>

      <div style={{ fontSize: 8.5, color: D.sub, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 700, margin: "4px 0 6px" }}>Current 1RM (lb)</div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Squat</label><input style={num} type="number" value={f.sq} onChange={set("sq")} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Bench</label><input style={num} type="number" value={f.bn} onChange={set("bn")} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Deadlift</label><input style={num} type="number" value={f.dl} onChange={set("dl")} /></div>
      </div>

      <label style={lbl}>Accent color</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {ACCENTS.map(a => (<button key={a} onClick={() => setF(p => ({ ...p, accent: a }))} style={{ width: 26, height: 26, borderRadius: 6, background: a, border: f.accent === a ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }} />))}
      </div>

      {onDelete && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${D.line}` }}>
          {!confirmDel ? (
            <button onClick={() => setConfirmDel(true)} style={{ background: "transparent", border: "1px solid #FF4D4D55", color: "#FF6B6B", borderRadius: 7, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Delete athlete…</button>
          ) : (
            <div style={{ background: "#FF4D4D14", border: "1px solid #FF4D4D55", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 12.5, color: "#FF8A8A", fontWeight: 700, marginBottom: 4 }}>Permanently delete {client.name}?</div>
              <div style={{ fontSize: 11.5, color: D.sub, lineHeight: 1.5, marginBottom: 10 }}>This erases all of their saved data from the server and removes their login. This cannot be undone.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmDel(false)} className="btn sec" style={{ flex: 1 }}>Keep</button>
                <button onClick={() => onDelete(client.id)} style={{ flex: 1, background: "#FF4D4D", color: "#fff", border: 0, borderRadius: 7, padding: "9px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Delete everything</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
        <button className="btn sec" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!canSave} style={{ opacity: canSave ? 1 : .5 }} onClick={save}>Save changes</button>
      </div>
      <div style={{ fontSize: 11, color: D.sub, marginTop: 12, lineHeight: 1.5 }}>Editing 1RMs here updates their profile — it won't rewrite an existing program. Use Planner to roll a new block from updated numbers.</div>
    </div>
  </div>);
}

