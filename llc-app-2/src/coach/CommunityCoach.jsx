// coach/CommunityCoach.jsx — coaches launch & manage habit/longevity challenges
// for the premium cohort. Metrics are consistency markers (sessions, check-ins,
// pillar actions), never weight — and the app auto-scores from logged data.
import { useState } from "react";

const C = { card: "#131315", line: "#2A2A2F", lift: "#1A1A1D", ink: "#F5F4F0", sub: "#807E76", acc: "#FF6B2C", good: "#3AE07A" };
const METRICS = [
  { v: "sessions", l: "Sessions completed", unit: "sessions" },
  { v: "checkins", l: "Check-ins logged", unit: "check-ins" },
  { v: "pillar_points", l: "Pillar actions", unit: "actions" },
];
const inp = { background: C.lift, border: `1px solid ${C.line}`, borderRadius: 7, padding: "9px 11px", color: C.ink, fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };
const lbl = { fontSize: 11, color: C.sub, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 5, display: "block" };

export default function CommunityCoach({ data, clients = [], onCreate, onEnd }) {
  const { challenges = [], progress = [] } = data || {};
  const today = new Date().toISOString().split("T")[0];
  const in30 = new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0];
  const [f, setF] = useState({ title: "", description: "", metric: "sessions", mode: "collective", goal: "", ends_on: in30 });
  const [busy, setBusy] = useState(false);
  const nameOf = Object.fromEntries(clients.map(c => [c.id, (c.name || "Athlete").split(" ")[0]]));
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const metricMeta = METRICS.find(m => m.v === f.metric) || METRICS[0];

  const create = async () => {
    if (!f.title.trim() || busy) return;
    if (f.mode === "collective" && !(Number(f.goal) > 0)) { alert("Set a goal number for a collective challenge."); return; }
    setBusy(true);
    try {
      await onCreate({
        title: f.title.trim(),
        description: f.description.trim(),
        metric: f.metric,
        mode: f.mode,
        goal: f.mode === "collective" ? Number(f.goal) : null,
        unit: metricMeta.unit,
        starts_on: today,
        ends_on: f.ends_on,
      });
      setF({ title: "", description: "", metric: "sessions", mode: "collective", goal: "", ends_on: in30 });
    } catch (e) { alert("Couldn't create: " + (e.message || e)); }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 760, fontFamily: "'Inter Tight',system-ui,sans-serif", color: C.ink }}>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 22 }}>Community</div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>Launch a challenge for your premium cohort. Scoring is automatic from logged data — consistency, not weight.</div>
      </div>

      {/* create */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 13, padding: 16, marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: C.acc, marginBottom: 12 }}>New challenge</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={lbl}>Title</label>
            <input style={inp} value={f.title} onChange={e => set("title", e.target.value)} placeholder="e.g. 30-Day Consistency Streak" />
          </div>
          <div>
            <label style={lbl}>Description (optional)</label>
            <input style={inp} value={f.description} onChange={e => set("description", e.target.value)} placeholder="One line of context or a rallying cry" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Measured by</label>
              <select style={inp} value={f.metric} onChange={e => set("metric", e.target.value)}>
                {METRICS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Format</label>
              <select style={inp} value={f.mode} onChange={e => set("mode", e.target.value)}>
                <option value="collective">Together — vs. a shared goal</option>
                <option value="leaderboard">Leaderboard — ranked</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {f.mode === "collective" && (
              <div>
                <label style={lbl}>Shared goal ({metricMeta.unit})</label>
                <input style={inp} type="number" value={f.goal} onChange={e => set("goal", e.target.value)} placeholder="e.g. 300" />
              </div>
            )}
            <div>
              <label style={lbl}>Ends on</label>
              <input style={inp} type="date" value={f.ends_on} min={today} onChange={e => set("ends_on", e.target.value)} />
            </div>
          </div>
          {f.mode === "leaderboard" && (
            <div style={{ fontSize: 11.5, color: C.sub, background: C.lift, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 11px", lineHeight: 1.5 }}>
              Heads-up: leaderboards show every member's score to the whole cohort. For a small group, "Together" mode is usually warmer and keeps no one feeling exposed.
            </div>
          )}
          <button onClick={create} disabled={busy || !f.title.trim()} style={{ background: C.acc, color: "#0B0B0C", border: 0, borderRadius: 8, padding: "12px 16px", fontFamily: "'Archivo Black',sans-serif", fontSize: 13, cursor: busy || !f.title.trim() ? "default" : "pointer", opacity: busy || !f.title.trim() ? .5 : 1, alignSelf: "flex-start" }}>{busy ? "Launching…" : "Launch challenge"}</button>
        </div>
      </div>

      {/* active */}
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: C.sub, margin: "20px 0 10px" }}>Active challenges</div>
      {challenges.length === 0 && <div style={{ fontSize: 13, color: C.sub, fontStyle: "italic" }}>None running yet. Launch one above.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {challenges.map(ch => {
          const parts = progress.filter(p => p.challenge_id === ch.id);
          const total = parts.reduce((a, p) => a + (Number(p.value) || 0), 0);
          const top = [...parts].sort((a, b) => (b.value || 0) - (a.value || 0))[0];
          return (
            <div key={ch.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 11, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{ch.title}</div>
                  <div style={{ fontSize: 11.5, color: C.sub, marginTop: 3 }}>
                    {ch.mode === "collective" ? `Together · ${Math.round(total)} / ${ch.goal} ${ch.unit}` : `Leaderboard · ${parts.length} on board`}
                    {top && top.value > 0 ? ` · leader ${nameOf[top.client_id] || "—"} (${Math.round(top.value)})` : ""}
                    {ch.ends_on ? ` · ends ${new Date(ch.ends_on + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
                  </div>
                </div>
                <button onClick={() => { if (window.confirm("End this challenge? It disappears from the athlete feed.")) onEnd(ch.id); }} style={{ flexShrink: 0, background: "transparent", border: `1px solid ${C.line}`, color: C.sub, borderRadius: 7, padding: "6px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>End</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
