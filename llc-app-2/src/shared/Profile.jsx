// shared/Profile.jsx — view identity (read-only) + change password.
// Password change is two-step: the CURRENT password must be verified (re-auth)
// before the new password fields unlock. Name/email are read-only; changing them
// is done by emailing the owner.
import { useState } from "react";
import { D } from "../theme/tokens";
import * as db from "../lib/db";

const ADMIN_EMAIL = "info@dnafitnessnation.com";

export default function Profile({ name = "", email = "", onClose }) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0] || "—";
  const last = parts.slice(1).join(" ") || "—";

  const [cur, setCur] = useState("");
  const [np, setNp] = useState("");
  const [np2, setNp2] = useState("");
  const [show, setShow] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const verify = async () => {
    if (busy || !cur) return;
    setBusy(true); setErr(""); setOk("");
    try {
      const { error } = await db.signIn(email, cur);
      if (error) throw error;
      setVerified(true); setOk("Current password confirmed. Set your new one below.");
    } catch (e) { setErr("That current password isn't right. Try again."); }
    setBusy(false);
  };

  const update = async () => {
    if (busy) return;
    if (np.length < 8) { setErr("New password must be at least 8 characters."); return; }
    if (np !== np2) { setErr("New passwords don't match."); return; }
    setBusy(true); setErr(""); setOk("");
    try {
      await db.setPassword(np);
      setOk("Password updated. Use the new one next time you sign in.");
      setCur(""); setNp(""); setNp2(""); setVerified(false);
    } catch (e) { setErr(e.message || String(e)); }
    setBusy(false);
  };

  const ov = { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, fontFamily: "'Inter Tight',system-ui,sans-serif" };
  const card = { width: 420, maxWidth: "100%", background: D.card, border: `1px solid ${D.line}`, borderRadius: 12, padding: 22, maxHeight: "90vh", overflowY: "auto", color: D.ink };
  const lbl = { display: "block", fontSize: 11, color: D.sub, letterSpacing: ".04em", textTransform: "uppercase", fontWeight: 700, margin: "0 0 4px" };
  const ro = { width: "100%", background: D.bg, border: `1px solid ${D.line}`, borderRadius: 7, padding: 10, color: D.sub, fontSize: 14, marginBottom: 11, boxSizing: "border-box", cursor: "not-allowed" };
  const inp = { width: "100%", background: D.bg, border: `1px solid ${D.line}`, borderRadius: 7, padding: 11, color: D.ink, fontSize: 16, marginBottom: 4, fontFamily: "inherit", boxSizing: "border-box" };
  const btn = { background: D.acc, color: "#0B0B0C", border: 0, borderRadius: 8, padding: "11px 16px", fontWeight: 800, fontSize: 13, cursor: "pointer" };
  const ghost = { background: "transparent", color: D.ink, border: `1px solid ${D.line}`, borderRadius: 8, padding: "11px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
  const focusCSS = `.pf-in{outline:none;}.pf-in:focus,.pf-in:focus-visible{border-color:${D.acc};outline:2px solid ${D.acc};outline-offset:2px;}.pf-link{color:${D.acc};text-decoration:underline;background:none;border:0;padding:0;cursor:pointer;font:inherit;}.pf-link:focus-visible{outline:2px solid ${D.acc};outline-offset:2px;}`;

  const mailto = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Update my profile info")}&body=${encodeURIComponent(`Hi Adam,\n\nPlease update my account details.\n\nName on file: ${name}\nEmail on file: ${email}\n\nWhat needs to change:\n`)}`;

  const ShowToggle = () => (
    <button type="button" className="pf-link" aria-label={show ? "Hide passwords" : "Show passwords"} aria-pressed={show} onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: D.sub, textDecoration: "none" }}>{show ? "Hide" : "Show"}</button>
  );

  return (<div style={ov} onClick={busy ? undefined : onClose}>
    <style>{focusCSS}</style>
    <div style={card} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Profile">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <div><div style={{ fontSize: 11, color: D.acc, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700 }}>Account</div><div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20 }}>Profile</div></div>
        <button onClick={onClose} className="pf-link" aria-label="Close" style={{ marginLeft: "auto", color: D.sub, fontSize: 20, textDecoration: "none" }}>✕</button>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><label style={lbl}>First name</label><input style={ro} value={first} readOnly tabIndex={-1} /></div>
        <div style={{ flex: 1 }}><label style={lbl}>Last name</label><input style={ro} value={last} readOnly tabIndex={-1} /></div>
      </div>
      <label style={lbl}>Email</label><input style={ro} value={email || "—"} readOnly tabIndex={-1} />
      <div style={{ fontSize: 12, color: D.sub, lineHeight: 1.5, marginBottom: 6 }}>
        Need to change your name or email? <a href={mailto} className="pf-link">Email Adam to update these.</a>
      </div>

      <div style={{ borderTop: `1px solid ${D.line}`, margin: "16px 0 14px" }} />
      <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 15, marginBottom: 4 }}>Change password</div>

      <label style={lbl} htmlFor="pf-cur">Current password</label>
      <div style={{ position: "relative" }}>
        <input id="pf-cur" className="pf-in" style={{ ...inp, paddingRight: 60 }} type={show ? "text" : "password"} autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={cur} onChange={e => { setCur(e.target.value); setVerified(false); }} disabled={busy} />
        <ShowToggle />
      </div>

      {!verified ? (
        <button style={{ ...btn, width: "100%", marginTop: 12, opacity: cur ? 1 : .5 }} className="pf-in" disabled={busy || !cur} onClick={verify}>{busy ? "Checking…" : "Verify current password"}</button>
      ) : (<>
        <label style={lbl} htmlFor="pf-np">New password (8+ characters)</label>
        <input id="pf-np" className="pf-in" style={inp} type={show ? "text" : "password"} autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={np} onChange={e => setNp(e.target.value)} disabled={busy} />
        <label style={lbl} htmlFor="pf-np2">Confirm new password</label>
        <input id="pf-np2" className="pf-in" style={inp} type={show ? "text" : "password"} autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={np2} onChange={e => setNp2(e.target.value)} disabled={busy} />
        <button style={{ ...btn, width: "100%", marginTop: 12 }} className="pf-in" disabled={busy} onClick={update}>{busy ? "Updating…" : "Update password"}</button>
      </>)}

      {err && <div role="alert" style={{ color: "#FF8A8A", fontSize: 12, marginTop: 10, lineHeight: 1.4 }}>{err}</div>}
      {ok && <div role="status" style={{ color: D.good, fontSize: 12, marginTop: 10, lineHeight: 1.4 }}>{ok}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button style={ghost} className="pf-in" onClick={onClose}>Done</button>
      </div>
    </div>
  </div>);
}
