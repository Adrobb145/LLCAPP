// shared/UpdateBanner.jsx — detects when a newer build has been deployed while
// the app is open (or while a tab sat backgrounded) and offers a one-tap reload.
// No service worker, no build tooling: it snapshots the entry-chunk hash from the
// served index.html on first load, then re-checks on focus/visibility + every 5 min.
// It only fires when the deployed entry actually CHANGES from what was seen at boot,
// so it never false-prompts on a fresh load. Kills the stale-cached-bundle class of bug.
import { useState, useEffect, useRef } from "react";

async function deployedEntry() {
  const r = await fetch("/?_v=" + Date.now(), { cache: "no-store" });
  const html = await r.text();
  const m = html.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i);
  return m ? (m[1].split("/").pop() || null) : null; // e.g. "index-AbC123.js" (prod) / "main.jsx" (dev)
}

export default function UpdateBanner() {
  const [stale, setStale] = useState(false);
  const boot = useRef(null);
  useEffect(() => {
    let on = true;
    const check = async () => {
      try {
        const e = await deployedEntry();
        if (!on || !e) return;
        if (boot.current == null) boot.current = e;     // snapshot what we loaded with
        else if (e !== boot.current) setStale(true);     // a new build is live
      } catch (err) { /* offline / ignore */ }
    };
    check();
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    const iv = setInterval(check, 5 * 60 * 1000);
    return () => { on = false; document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", onVis); clearInterval(iv); };
  }, []);
  if (!stale) return null;
  return (
    <div onClick={() => location.reload()} role="button" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999, background: "#FF6B2C", color: "#0B0B0C", padding: "calc(env(safe-area-inset-top,0px) + 11px) 16px 11px", textAlign: "center", fontWeight: 800, fontFamily: "'Archivo Black',system-ui,sans-serif", fontSize: 13, cursor: "pointer", boxShadow: "0 2px 14px rgba(0,0,0,.45)" }}>
      🔄 New version available — tap to update
    </div>
  );
}
