// coach/InviteCoach.jsx — owner-only: invite a coach by email (sends Supabase invite).
import { useState } from "react";
import { D } from "../theme/tokens";

export default function InviteCoach({ onInvite, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email);
  const go = async () => { setBusy(true); await onInvite(name.trim(), email.trim()); setBusy(false); };
  const ov = { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 };
  const card = { width: 400, maxWidth: "100%", background: D.card, border: `1px solid ${D.line}`, borderRadius: 12, padding: 22 };
  const lbl = { fontSize: 8.5, color: D.sub, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3, display: "block" };
  const inp = { width: "100%", background: D.bg, border: `1px solid ${D.line}`, borderRadius: 7, padding: 9, color: D.ink, fontSize: 13.5, outline: "none", fontFamily: "inherit", marginBottom: 12 };
  return (<div style={ov} onClick={onClose}><div style={card} onClick={e => e.stopPropagation()}>
    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
      <div><div style={{ fontSize: 9, color: "#3AE0FF", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700 }}>Owner</div><div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 19 }}>Invite a Coach</div></div>
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: 0, color: D.sub, fontSize: 20, cursor: "pointer" }}>✕</button>
    </div>
    <label style={lbl}>Coach name</label><input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Jay Pesi" />
    <label style={lbl}>Email</label><input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jay@email.com" />
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <button className="btn sec" onClick={onClose}>Cancel</button>
      <button className="btn" disabled={!ok || busy} style={{ opacity: ok && !busy ? 1 : .5 }} onClick={go}>{busy ? "Sending…" : "Send Invite"}</button>
    </div>
    <div style={{ fontSize: 11, color: D.sub, marginTop: 12, lineHeight: 1.5 }}>They'll get an email to set a password, then sign in with full coach access.</div>
  </div></div>);
}
