// coach/AddClient.jsx — coach creates a real client.
// Writes name/goal/baseline lifts + the email the athlete will use to sign up
// and link their account (link_athlete matches on this email).
import { useState } from "react";
import { D } from "../theme/tokens";

export default function AddClient({ onAdd, onClose, backend }) {
  const genTemp = () => "DNA-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  const [f, setF] = useState(() => ({ name: "", email: "", goal: "", bw: "", block: "Foundation", totalWeeks: 6, sq: "", bn: "", dl: "", pin: "", temppw: genTemp() }));
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const canSave = f.name.trim().length > 1 && (!backend || (/\S+@\S+\.\S+/.test(f.email) && f.temppw.trim().length >= 6));

  const save = async () => {
    if (!canSave || busy) return;   // guard: ignore double-clicks while an invite is in flight
    setBusy(true);
    try {
      await onAdd({
        name: f.name.trim(), email: f.email.trim(), goal: f.goal.trim() || "General strength",
        bw: Number(f.bw) || 0, block: f.block.trim() || "Foundation", totalWeeks: Number(f.totalWeeks) || 6,
        sq: Number(f.sq) || 135, bn: Number(f.bn) || 95, dl: Number(f.dl) || 185, pin: f.pin.trim(),
        tempPassword: f.temppw.trim(),
      });
    } finally {
      // On success the modal unmounts; on failure it stays open and the button re-enables for a retry.
      setBusy(false);
    }
  };

  const ov = { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 };
  const card = { width: 460, maxWidth: "100%", background: D.card, border: `1px solid ${D.line}`, borderRadius: 12, padding: 22, maxHeight: "90vh", overflowY: "auto" };
  const lbl = { fontSize: 8.5, color: D.sub, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3, display: "block" };
  const inp = { width: "100%", background: D.bg, border: `1px solid ${D.line}`, borderRadius: 7, padding: 9, color: D.ink, fontSize: 13.5, outline: "none", fontFamily: "inherit", marginBottom: 11 };
  const num = { ...inp, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" };
  const Field = ({ k, label, type = "text", ph = "" }) => (<div style={{ flex: 1 }}><label style={lbl}>{label}</label><input style={inp} type={type} value={f[k]} onChange={set(k)} placeholder={ph} /></div>);

  return (<div style={ov} onClick={busy ? undefined : onClose}>
    <div style={card} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div><div style={{ fontSize: 9, color: D.acc, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700 }}>New Client</div><div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 19 }}>Add to Roster</div></div>
        <button onClick={onClose} disabled={busy} style={{ marginLeft: "auto", background: "none", border: 0, color: D.sub, fontSize: 20, cursor: busy ? "default" : "pointer", opacity: busy ? .4 : 1 }}>✕</button>
      </div>

      <label style={lbl}>Full name *</label><input style={inp} value={f.name} onChange={set("name")} placeholder="Jane Doe" />
      <label style={lbl}>Email — how the athlete signs up & links their account</label><input style={inp} type="email" value={f.email} onChange={set("email")} placeholder="jane@email.com" />
      {backend && (<><label style={lbl}>Temp password — you share this with the athlete for first login</label><input style={inp} value={f.temppw} onChange={set("temppw")} placeholder="6+ characters" /></>)}
      <label style={lbl}>Goal</label><input style={inp} value={f.goal} onChange={set("goal")} placeholder="Build strength, first meet…" />

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Body weight (lb)</label><input style={num} type="number" value={f.bw} onChange={set("bw")} placeholder="0" /></div>
        <div style={{ flex: 2 }}><label style={lbl}>Block</label><input style={inp} value={f.block} onChange={set("block")} placeholder="Foundation" /></div>
        <div style={{ width: 90 }}><label style={lbl}>Weeks</label><input style={num} type="number" value={f.totalWeeks} onChange={set("totalWeeks")} /></div>
      </div>

      <div style={{ fontSize: 8.5, color: D.sub, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 700, margin: "4px 0 6px" }}>Starting lifts (1RM, lb) — seed the auto-program</div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>Squat</label><input style={num} type="number" value={f.sq} onChange={set("sq")} placeholder="135" /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Bench</label><input style={num} type="number" value={f.bn} onChange={set("bn")} placeholder="95" /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Deadlift</label><input style={num} type="number" value={f.dl} onChange={set("dl")} placeholder="185" /></div>
      </div>

      <label style={lbl}>Demo PIN (optional — only used in offline demo mode)</label><input style={inp} value={f.pin} onChange={set("pin")} placeholder="e.g. 7777" maxLength={4} />

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
        <button className="btn sec" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn" disabled={!canSave || busy} style={{ opacity: (canSave && !busy) ? 1 : .5 }} onClick={save}>{busy ? "Sending…" : (backend ? "Send Invite" : "Add Client")}</button>
      </div>
      <div style={{ fontSize: 11, color: D.sub, marginTop: 12, lineHeight: 1.5 }}>{backend ? "The athlete signs in with the email + temp password above — no email is sent automatically, you share the password with them. A starter program is generated from the lifts above — edit it in Build Day." : "A 3-day starter program is generated from the lifts above — edit it in Build Day."}</div>
    </div>
  </div>);
}

