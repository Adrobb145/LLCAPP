// shared/ClipVideo.jsx — renders a form-review clip. Uses a local blob URL when
// available (same session, right after upload), otherwise fetches a short-lived
// signed URL from Supabase Storage by path. Shows a graceful placeholder for
// clips uploaded before video sync existed (no path) or on error.
import { useState, useEffect } from "react";
import * as db from "../lib/db";
import { D } from "../theme/tokens";

export default function ClipVideo({ path, localUrl, maxHeight = 240, radius = 8 }) {
  const [url, setUrl] = useState(localUrl || null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let alive = true;
    if (localUrl) { setUrl(localUrl); return; }
    setUrl(null); setErr(false);
    if (!path) return;
    db.signedVideoUrl(path)
      .then(u => { if (alive) { if (u) setUrl(u); else setErr(true); } })
      .catch(() => { if (alive) setErr(true); });
    return () => { alive = false; };
  }, [path, localUrl]);

  if (url) return <video src={url} controls playsInline preload="metadata" style={{ width: "100%", borderRadius: radius, maxHeight, background: "#000" }} />;
  if (!path) return <div style={{ fontSize: 10.5, color: D.sub, fontStyle: "italic" }}>No video on file — this clip was sent before video upload was added.</div>;
  if (err) return <div style={{ fontSize: 10.5, color: D.sub, fontStyle: "italic" }}>Couldn’t load this clip. Refresh to retry.</div>;
  return <div style={{ fontSize: 10.5, color: D.sub, fontStyle: "italic" }}>Loading clip…</div>;
}
