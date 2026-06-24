// shared/SaveErrorBar.jsx — shown when a Supabase write fails so a logged set or
// edit can't silently vanish. Non-blocking pill, bottom-right, above the athlete
// nav. Auto-clears when the next save succeeds; Retry forces an immediate re-save.
export default function SaveErrorBar({ onRetry }) {
  return (
    <div style={{ position: "fixed", right: 14, bottom: "calc(env(safe-area-inset-bottom,0px) + 78px)", zIndex: 99998, background: "#3A1212", border: "1px solid #FF5A5A", color: "#FFD9D9", borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 6px 20px rgba(0,0,0,.5)", fontFamily: "system-ui,sans-serif", fontSize: 12.5, fontWeight: 600, maxWidth: "calc(100vw - 28px)" }}>
      <span>⚠️ Changes not saved</span>
      <button onClick={onRetry} style={{ background: "#FF5A5A", color: "#0B0B0C", border: 0, borderRadius: 7, padding: "6px 12px", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
    </div>
  );
}
