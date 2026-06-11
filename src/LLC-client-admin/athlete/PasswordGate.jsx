// athlete/PasswordGate.jsx
// Wrap your athlete app in this. If the user still has the temp password
// (user_metadata.must_change === true), it forces them to set a real one
// before they reach the app, then clears the flag.
// Usage:  <PasswordGate><ClientApp ... /></PasswordGate>
// NOTE: adjust the "../lib/supabase" import path if your client lives elsewhere.

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { overlay, card, input, btnPrimary } from "../shared/adminStyles";

export function PasswordGate({ children }) {
  const [must, setMust] = useState(null); // null = loading
  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setMust(!!data?.user?.user_metadata?.must_change);
    });
    return () => { alive = false; };
  }, []);
  if (must === null) return null;
  if (!must) return children;
  return <SetPassword onDone={() => setMust(false)} />;
}

function SetPassword({ onDone }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (pw.length < 8) return setErr("Use at least 8 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    setBusy(true); setErr("");
    const { error } = await supabase.auth.updateUser({
      password: pw,
      data: { must_change: false },
    });
    if (error) { setErr(error.message); setBusy(false); return; }
    onDone();
  };

  return (
    <div style={{ ...overlay, position: "fixed" }}>
      <div style={card}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#FF6B2C", marginBottom: 4 }}>Set your password</div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
          You're logged in with a temporary password. Choose your own to finish setup.
        </div>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          placeholder="New password" style={input} autoFocus />
        <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)}
          placeholder="Confirm password" style={{ ...input, marginTop: 10 }} />
        {err && <div style={{ color: "#C01800", fontSize: 13, marginTop: 8 }}>{err}</div>}
        <button onClick={submit} disabled={busy}
          style={{ ...btnPrimary, width: "100%", marginTop: 14, opacity: busy ? 0.6 : 1 }}>
          {busy ? "Saving..." : "Save and continue"}
        </button>
      </div>
    </div>
  );
}
