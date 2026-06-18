// src/auth/AuthGate.jsx
// Invite-only access. No self-provisioning — owners and athletes are created by
// the invite Edge Function, so a valid account always already has a profile.
//   • Invited users arrive via the email link → set a password → enter.
//   • Returning users sign in with email + password.
//   • A signed-in account with no profile = not invited → "no access".
// Accessibility: real <form> submit, <label>s, visible focus ring, show-password
// toggle, 16px inputs (prevents iOS focus-zoom), full keyboard support.
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
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [needPw, setNeedPw] = useState(false);   // arrived via invite link → set password
  const [noAccess, setNoAccess] = useState(false);
  const [forgot, setForgot] = useState(false);   // forgot-password panel open
  const [sent, setSent] = useState(false);       // reset email dispatched

  useEffect(() => {
    db.getSession().then(setSession);
    const { data } = db.onAuthChange((s) => setSession(s));
    return () => data?.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (!session) return;
    if (inviteType && !needPwDone) { setNeedPw(true); return; }
    (async () => {
      const p = await db.getProfile();
      if (p) onReady(session, p);
      else setNoAccess(true);
    })();
  }, [session, needPw]);

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
    if (busy || !email || !pw) return;
    setBusy(true); setMsg("");
    try {
      const { error } = await db.signIn(email.trim(), pw);
      if (error) throw error;
    } catch (e) { setMsg(e.message || String(e)); }
    setBusy(false);
  };

  const sendReset = async () => {
    if (busy) return;
    if (!email) { setMsg("Enter your email above first, then tap Send reset link."); return; }
    setBusy(true); setMsg("");
    try {
      const { error } = await db.requestPasswordReset(email.trim());
      if (error) throw error;
      setSent(true);
    } catch (e) { setMsg(e.message || String(e)); }
    setBusy(false);
  };

  const wrap = { minHeight: "100vh", background: D.bg, color: D.ink, fontFamily: "'Inter Tight',system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
  const card = { width: 360, maxWidth: "100%" };
  const input = { width: "100%", background: D.card, border: `1px solid ${D.line}`, borderRadius: 8, padding: 12, color: D.ink, fontSize: 16, marginBottom: 4, fontFamily: "inherit", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 11, color: D.sub, letterSpacing: ".04em", textTransform: "uppercase", fontWeight: 700, margin: "10px 0 4px" };
  const btn = { width: "100%", background: D.acc, color: "#0B0B0C", border: 0, borderRadius: 8, padding: 14, fontFamily: "'Archivo Black',sans-serif", fontSize: 14, cursor: "pointer", marginTop: 12 };
  const focusCSS = `.lg-in{outline:none;}
.lg-in:focus,.lg-in:focus-visible{border-color:${D.acc};outline:2px solid ${D.acc};outline-offset:2px;}
.lg-link{color:${D.acc};text-decoration:underline;background:none;border:0;padding:0;cursor:pointer;font:inherit;}
.lg-link:focus-visible{outline:2px solid ${D.acc};outline-offset:2px;}`;

  const Brand = () => (
    <div style={{ textAlign: "center", marginBottom: 22 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, background: D.acc, color: "#0B0B0C", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Archivo Black',sans-serif", fontSize: 14, borderRadius: 6 }} aria-hidden="true">LL</div>
        <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 22 }}>LIVE LONG</div>
      </div>
      <div style={{ fontSize: 11, color: D.sub, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 8 }}>Collective</div>
    </div>
  );

  const ShowToggle = () => (
    <button type="button" className="lg-link" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
      onClick={() => setShow(s => !s)}
      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: D.sub, textDecoration: "none" }}>
      {show ? "Hide" : "Show"}
    </button>
  );

  if (noAccess) {
    return (<div style={wrap}><style>{FONTS}{focusCSS}</style><div style={card}><Brand />
      <div style={{ background: D.card, border: `1px solid ${D.line}`, borderRadius: 10, padding: 18, textAlign: "center" }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>No access yet</div>
        <div style={{ fontSize: 12.5, color: D.sub, lineHeight: 1.5 }}>This account isn't set up. Access is by invitation — ask your coach (or the gym owner) to send you an invite.</div>
        <button style={{ ...btn, background: D.card, color: D.ink, border: `1px solid ${D.line}` }} className="lg-in" onClick={() => db.signOut().then(() => location.reload())}>Sign out</button>
      </div>
    </div></div>);
  }

  if (session && needPw) {
    return (<div style={wrap}><style>{FONTS}{focusCSS}</style><div style={card}><Brand />
      <div style={{ fontSize: 12.5, color: D.sub, textAlign: "center", marginBottom: 6 }}>{inviteType === "recovery" ? "Reset your password — choose a new one below." : "Welcome — set a password to finish setup."}</div>
      <form onSubmit={(e) => { e.preventDefault(); finishPassword(); }}>
        <label style={lbl} htmlFor="np-pw">New password (8+ characters)</label>
        <div style={{ position: "relative" }}>
          <input id="np-pw" name="new-password" className="lg-in" style={{ ...input, paddingRight: 60 }} type={show ? "text" : "password"} autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={e => setPw(e.target.value)} />
          <ShowToggle />
        </div>
        <label style={lbl} htmlFor="np-pw2">Confirm password</label>
        <input id="np-pw2" name="confirm-password" className="lg-in" style={input} type={show ? "text" : "password"} autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw2} onChange={e => setPw2(e.target.value)} />
        <button type="submit" style={btn} className="lg-in" disabled={busy}>{busy ? "Saving…" : "Set password & enter"}</button>
      </form>
      {msg && <div role="alert" style={{ color: "#FFB23A", fontSize: 12, textAlign: "center", marginTop: 10 }}>{msg}</div>}
    </div></div>);
  }

  if (forgot) {
    return (<div style={wrap}><style>{FONTS}{focusCSS}</style><div style={card}><Brand />
      {sent ? (
        <div style={{ background: D.card, border: `1px solid ${D.line}`, borderRadius: 10, padding: 18, textAlign: "center" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Check your email</div>
          <div style={{ fontSize: 12.5, color: D.sub, lineHeight: 1.5 }}>If an account exists for <strong style={{ color: D.ink }}>{email.trim()}</strong>, a password-reset link is on its way. It can take a few minutes — check your spam folder too. Open the link on this device to set a new password.</div>
          <button style={{ ...btn, background: D.card, color: D.ink, border: `1px solid ${D.line}` }} className="lg-in" onClick={() => { setForgot(false); setSent(false); setMsg(""); }}>Back to sign in</button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12.5, color: D.sub, textAlign: "center", marginBottom: 6 }}>Reset your password</div>
          <form onSubmit={(e) => { e.preventDefault(); sendReset(); }}>
            <label style={lbl} htmlFor="fp-email">Email</label>
            <input id="fp-email" name="email" className="lg-in" style={input} type="email" inputMode="email" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
            <button type="submit" style={btn} className="lg-in" disabled={busy || !email}>{busy ? "Sending…" : "Send reset link"}</button>
          </form>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button type="button" className="lg-link" onClick={() => { setForgot(false); setMsg(""); }}>Back to sign in</button>
          </div>
        </>
      )}
      {msg && <div role="alert" style={{ color: "#FFB23A", fontSize: 12, textAlign: "center", marginTop: 10, lineHeight: 1.4 }}>{msg}</div>}
    </div></div>);
  }

  return (<div style={wrap}><style>{FONTS}{focusCSS}</style><div style={card}><Brand />
    <div style={{ fontSize: 12.5, color: D.sub, textAlign: "center", marginBottom: 6 }}>Sign in</div>
    <form onSubmit={(e) => { e.preventDefault(); signIn(); }}>
      <label style={lbl} htmlFor="lg-email">Email</label>
      <input id="lg-email" name="email" className="lg-in" style={input} type="email" inputMode="email" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
      <label style={lbl} htmlFor="lg-pw">Password</label>
      <div style={{ position: "relative" }}>
        <input id="lg-pw" name="password" className="lg-in" style={{ ...input, paddingRight: 60 }} type={show ? "text" : "password"} autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={e => setPw(e.target.value)} placeholder="Your password" />
        <ShowToggle />
      </div>
      <button type="submit" style={btn} className="lg-in" disabled={busy || !email || !pw}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <div style={{ textAlign: "center", marginTop: 12 }}>
      <button type="button" className="lg-link" onClick={() => { setForgot(true); setMsg(""); }}>Forgot password?</button>
    </div>
    {msg && <div role="alert" style={{ color: "#FFB23A", fontSize: 12, textAlign: "center", marginTop: 10, lineHeight: 1.4 }}>{msg}</div>}
    <div style={{ fontSize: 11, color: D.sub, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>New here? Access is by invitation. Check your email for an invite link from your coach or gym.</div>
  </div></div>);
}

// Module-local one-shot flag for the invite password step.
let needPwDone = false;
