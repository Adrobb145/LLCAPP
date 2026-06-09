// src/auth/AuthGate.jsx
// Shown only when a Supabase backend is configured. Handles email/password
// sign-in & sign-up, then resolves the user's profile (coach or athlete).
// Calls onReady(session, profile) once the user is fully provisioned.
import { useState, useEffect } from "react";
import { D } from "../theme/tokens";
import { FONTS } from "../theme/styles";
import * as db from "../lib/db";

export default function AuthGate({ onReady }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState("signin");      // signin | signup
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [needsRole, setNeedsRole] = useState(false);

  useEffect(() => {
    db.getSession().then(setSession);
    const { data } = db.onAuthChange((s) => setSession(s));
    return () => data?.subscription?.unsubscribe?.();
  }, []);

  // When a session exists, resolve the profile.
  useEffect(() => {
    if (!session) return;
    (async () => {
      const p = await db.getProfile();
      if (p) { setProfile(p); onReady(session, p); }
      else setNeedsRole(true);   // brand-new account → choose how to provision
    })();
  }, [session]);

  const submit = async () => {
    setBusy(true); setMsg("");
    try {
      const fn = mode === "signin" ? db.signIn : db.signUp;
      const { data, error } = await fn(email.trim(), pw);
      if (error) throw error;
      if (mode === "signup" && !data.session) setMsg("Check your email to confirm, then sign in.");
    } catch (e) { setMsg(e.message || String(e)); }
    setBusy(false);
  };

  const provisionCoach = async () => {
    setBusy(true); setMsg("");
    try {
      const initials = (name.trim().split(" ").map(w => w[0]).join("") || "CO").slice(0, 2).toUpperCase();
      await db.setupCoach(name.trim() || "Coach", initials);
      const p = await db.getProfile(); setProfile(p); onReady(session, p);
    } catch (e) { setMsg(e.message || String(e)); }
    setBusy(false);
  };
  const provisionAthlete = async () => {
    setBusy(true); setMsg("");
    try {
      await db.linkAthlete();
      const p = await db.getProfile(); setProfile(p); onReady(session, p);
    } catch (e) { setMsg("No client invite found for this email — ask your coach to add you first."); }
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

  // New account, no profile yet → pick how to provision.
  if (session && needsRole && !profile) {
    return (<div style={wrap}><style>{FONTS}</style><div style={card}><Brand />
      <div style={{ fontSize: 12.5, color: D.sub, textAlign: "center", marginBottom: 14, lineHeight: 1.5 }}>One-time setup for this account.</div>
      <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="Your name (coaches only)" />
      <button style={{ ...btn, marginBottom: 8 }} disabled={busy} onClick={provisionCoach}>I'm a coach — set me up</button>
      <button style={{ ...btn, background: D.card, color: D.ink, border: `1px solid ${D.line}` }} disabled={busy} onClick={provisionAthlete}>I'm an athlete — link my account</button>
      {msg && <div style={{ color: "#FF4D4D", fontSize: 11.5, textAlign: "center", marginTop: 10 }}>{msg}</div>}
      <div style={{ textAlign: "center", marginTop: 14 }}><span onClick={() => db.signOut()} style={{ color: D.sub, fontSize: 11, cursor: "pointer" }}>← Sign out</span></div>
    </div></div>);
  }

  // Sign in / sign up.
  return (<div style={wrap}><style>{FONTS}</style><div style={card}><Brand />
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      {["signin", "signup"].map(m => (
        <button key={m} onClick={() => { setMode(m); setMsg(""); }} style={{ flex: 1, background: mode === m ? D.acc : D.card, color: mode === m ? "#0B0B0C" : D.sub, border: `1px solid ${mode === m ? D.acc : D.line}`, borderRadius: 7, padding: 9, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{m === "signin" ? "Sign in" : "Sign up"}</button>
      ))}
    </div>
    <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
    <input style={input} type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" onKeyDown={e => e.key === "Enter" && submit()} />
    <button style={btn} disabled={busy || !email || !pw} onClick={submit}>{busy ? "…" : (mode === "signin" ? "Sign in" : "Create account")}</button>
    {msg && <div style={{ color: "#FFB23A", fontSize: 11.5, textAlign: "center", marginTop: 10, lineHeight: 1.4 }}>{msg}</div>}
  </div></div>);
}
