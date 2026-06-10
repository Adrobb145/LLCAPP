// src/auth/AuthGate.jsx
// Invite-only access. No self-provisioning — owners and athletes are created by
// the invite Edge Function, so a valid account always already has a profile.
//   • Invited users arrive via the email link → set a password → enter.
//   • Returning users sign in with email + password.
//   • A signed-in account with no profile = not invited → "no access".
import { useState, useEffect } from "react";
import { D } from "../theme/tokens";
import { FONTS } from "../theme/styles";
import { inviteType } from "../lib/supabase";
import * as db from "../lib/db";

export default function AuthGate({ onReady }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [needPw, setNeedPw] = useState(false);   // arrived via invite link → set password
  const [noAccess, setNoAccess] = useState(false);

  useEffect(() => {
    db.getSession().then(setSession);
    const { data } = db.onAuthChange((s) => setSession(s));
    return () => data?.subscription?.unsubscribe?.();
  }, []);

  // When a session exists: invited link → set password first; otherwise resolve profile.
  useEffect(() => {
    if (!session) return;
    if (inviteType && !needPwDone) { setNeedPw(true); return; }
    (async () => {
      const p = await db.getProfile();
      if (p) onReady(session, p);
      else setNoAccess(true);
    })();
  }, [session, needPw]);

  // module-local flag so we only force the password step once per load
  // (declared via closure variable below)

  const finishPassword = async () => {
    if (pw.length < 8) { setMsg("Use at least 8 characters."); return; }
    if (pw !== pw2) { setMsg("Passwords don't match."); return; }
    setBusy(true); setMsg("");
    try {
      await db.setPassword(pw);
      needPwDone = true; setNeedPw(false);
      const p = await db.getProfile();
      if (p) onReady(session, p); else setNoAccess(true);
    } catch (e) { setMsg(e.message || String(e)); }
    setBusy(false);
  };

  const signIn = async () => {
    setBusy(true); setMsg("");
    try {
      const { error } = await db.signIn(email.trim(), pw);
      if (error) throw error;
    } catch (e) { setMsg(e.message || String(e)); }
    setBusy(false);
  };

  const wrap = { minHeight: "100vh", background: D.bg, color: D.ink, fontFamily: "'Inter Tight',system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
  const card = { width: 360, maxWidth: "100%" };
  const input = { width: "100%", background: D.card, border: `1px solid ${D.line}`, borderRadius: 8, padding: 11, color: D.ink, fontSize: 14, outline: "none", marginBottom: 9, fontFamily: "inherit" };
  const btn = { width: "100%", background: D.acc, color: "#0B0B0C", border: 0, borderRadius: 8, padding: 13, fontFamily: "'Archivo Black',sans-serif", fontSize: 13, cursor: "pointer" };
  const Brand = () => (
    <div style={{ textAlign: "center", marginBottom: 22 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, background: D.acc, color: "#0B0B0C", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Archivo Black',sans-serif", fontSize: 14, borderRadius: 6 }}>LL</div>
        <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 22 }}>LIVE LONG</div>
      </div>
      <div style={{ fontSize: 9, color: D.sub, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 8 }}>Collective</div>
    </div>
  );

  if (noAccess) {
    return (<div style={wrap}><style>{FONTS}</style><div style={card}><Brand />
      <div style={{ background: D.card, border: `1px solid ${D.line}`, borderRadius: 10, padding: 18, textAlign: "center" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>No access yet</div>
        <div style={{ fontSize: 12.5, color: D.sub, lineHeight: 1.5 }}>This account isn't set up. Access is by invitation — ask your coach (or the gym owner) to send you an invite.</div>
        <button style={{ ...btn, marginTop: 14, background: D.card, color: D.ink, border: `1px solid ${D.line}` }} onClick={() => db.signOut().then(() => location.reload())}>Sign out</button>
      </div>
    </div></div>);
  }

  if (session && needPw) {
    return (<div style={wrap}><style>{FONTS}</style><div style={card}><Brand />
      <div style={{ fontSize: 12.5, color: D.sub, textAlign: "center", marginBottom: 14 }}>Welcome — set a password to finish setup.</div>
      <input style={input} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="New password (8+ chars)" />
      <input style={input} type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Confirm password" onKeyDown={e => e.key === "Enter" && finishPassword()} />
      <button style={btn} disabled={busy} onClick={finishPassword}>{busy ? "…" : "Set password & enter"}</button>
      {msg && <div style={{ color: "#FFB23A", fontSize: 11.5, textAlign: "center", marginTop: 10 }}>{msg}</div>}
    </div></div>);
  }

  return (<div style={wrap}><style>{FONTS}</style><div style={card}><Brand />
    <div style={{ fontSize: 12.5, color: D.sub, textAlign: "center", marginBottom: 14 }}>Sign in</div>
    <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
    <input style={input} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" onKeyDown={e => e.key === "Enter" && signIn()} />
    <button style={btn} disabled={busy || !email || !pw} onClick={signIn}>{busy ? "…" : "Sign in"}</button>
    {msg && <div style={{ color: "#FFB23A", fontSize: 11.5, textAlign: "center", marginTop: 10, lineHeight: 1.4 }}>{msg}</div>}
    <div style={{ fontSize: 11, color: D.sub, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>New here? Access is by invitation. Check your email for an invite link from your coach or gym.</div>
  </div></div>);
}

// Module-local one-shot flag for the invite password step.
let needPwDone = false;
