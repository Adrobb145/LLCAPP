// athlete/Community.jsx — the premium-cohort community: live challenges
// (collective goal or habit leaderboard), a wins feed, and emoji reactions.
// Competition is on consistency/longevity markers, never weight lifted.
import { useState } from "react";
import { D } from "../theme/tokens";

const METRIC_LABEL = { sessions: "sessions", checkins: "check-ins", pillar_points: "pillar actions" };
const QUICK = ["🔥", "💪", "🙌", "👏", "🐐"];
const POST_ICONS = ["🔥", "💪", "🙌", "🏆", "🙏", "📈", "✅"];
const MEDAL = ["🥇", "🥈", "🥉"];

function relTime(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 604800) return Math.floor(s / 86400) + "d ago";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ChallengeCard({ ch, parts, me, nameOf }) {
  const mine = (parts.find(p => p.client_id === me) || {}).value || 0;
  const unit = ch.unit || METRIC_LABEL[ch.metric] || "";
  const ends = ch.ends_on ? new Date(ch.ends_on + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
  const head = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 16, lineHeight: 1.15 }}>{ch.title}</div>
        {ch.description ? <div style={{ fontSize: 11.5, color: D.sub, marginTop: 3, lineHeight: 1.45 }}>{ch.description}</div> : null}
      </div>
      <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: ch.mode === "leaderboard" ? "#FFB23A" : D.good, border: `1px solid ${ch.mode === "leaderboard" ? "#FFB23A" : D.good}55`, borderRadius: 5, padding: "3px 7px" }}>{ch.mode === "leaderboard" ? "Leaderboard" : "Together"}</span>
    </div>
  );

  if (ch.mode === "leaderboard") {
    const ranked = [...parts].sort((a, b) => (b.value || 0) - (a.value || 0)).filter(p => (p.value || 0) > 0);
    return (
      <div style={{ background: D.card, border: `1px solid ${D.acc}44`, borderRadius: 13, padding: 14 }}>
        {head}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ranked.length === 0 && <div style={{ fontSize: 12, color: D.sub, fontStyle: "italic" }}>No scores yet — log a {METRIC_LABEL[ch.metric] || "rep"} to get on the board.</div>}
          {ranked.map((p, i) => {
            const isMe = p.client_id === me;
            return (
              <div key={p.client_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: isMe ? D.acc + "1A" : D.lift, border: `1px solid ${isMe ? D.acc + "55" : "transparent"}` }}>
                <span style={{ width: 22, textAlign: "center", fontSize: 14 }}>{MEDAL[i] || <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: D.sub }}>{i + 1}</span>}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: isMe ? 800 : 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: isMe ? D.acc : D.ink }}>{isMe ? "You" : (nameOf[p.client_id] || "Athlete")}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14 }}>{Math.round(p.value || 0)}<span style={{ fontSize: 10.5, color: D.sub }}> {unit}</span></span>
              </div>
            );
          })}
        </div>
        {ends && <div style={{ fontSize: 10.5, color: D.sub, marginTop: 10, textAlign: "center" }}>Ends {ends}</div>}
      </div>
    );
  }

  // collective
  const total = parts.reduce((a, p) => a + (Number(p.value) || 0), 0);
  const goal = Number(ch.goal) || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;
  return (
    <div style={{ background: D.card, border: `1px solid ${D.good}44`, borderRadius: 13, padding: 14 }}>
      {head}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20 }}>{Math.round(total)}<span style={{ fontSize: 13, color: D.sub, fontFamily: "'JetBrains Mono',monospace" }}> / {goal} {unit}</span></span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: D.good }}>{pct}%</span>
      </div>
      <div style={{ height: 11, borderRadius: 6, background: D.lift, overflow: "hidden", border: `1px solid ${D.line}` }}>
        <div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg, ${D.good}, ${D.acc})`, transition: "width .5s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontSize: 11, color: D.sub }}>
        <span>{parts.length} pulling together</span>
        <span>You: <b style={{ color: D.ink }}>{Math.round(mine)} {unit}</b></span>
      </div>
      {ends && <div style={{ fontSize: 10.5, color: D.sub, marginTop: 8, textAlign: "center" }}>Ends {ends}</div>}
    </div>
  );
}

function WinCard({ w, me, myUid, nameOf, reactions, onReactWin, onDeleteWin }) {
  const author = w.client_id === me ? "You" : (nameOf[w.client_id] || "Athlete");
  const rx = reactions.filter(r => r.win_id === w.id);
  return (
    <div style={{ background: D.card, border: `1px solid ${D.line}`, borderRadius: 12, padding: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{w.icon || "🔥"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 }}>{w.title}</div>
          <div style={{ fontSize: 10.5, color: D.sub, marginTop: 1 }}>{author} · {relTime(w.created_at)}</div>
        </div>
        {w.client_id === me && onDeleteWin && (
          <button onClick={() => { if (window.confirm("Remove this from the feed?")) onDeleteWin(w.id); }} title="Delete" style={{ background: "transparent", border: 0, color: D.sub, fontSize: 13, cursor: "pointer", padding: 2, lineHeight: 1 }}>🗑</button>
        )}
      </div>
      {w.detail ? <div style={{ fontSize: 12.5, color: D.ink, marginTop: 8, lineHeight: 1.45 }}>{w.detail}</div> : null}
      <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
        {QUICK.map(emo => {
          const these = rx.filter(r => r.emoji === emo);
          const mineOn = these.some(r => r.actor === myUid);
          const n = these.length;
          return (
            <button key={emo} onClick={() => onReactWin(w.id, emo, !mineOn)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: mineOn ? D.acc + "22" : D.lift, border: `1px solid ${mineOn ? D.acc : D.line}`, borderRadius: 14, padding: "4px 9px", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>
              <span>{emo}</span>{n > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: mineOn ? D.acc : D.sub, fontFamily: "'JetBrains Mono',monospace" }}>{n}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Community({ data, me, myUid, nameOf = {}, coachName, onPostWin, onReactWin, onDeleteWin }) {
  const { challenges = [], progress = [], wins = [], reactions = [] } = data || {};
  const [text, setText] = useState("");
  const [icon, setIcon] = useState("🔥");
  const visibleWins = wins.filter(w => w.visible !== false || w.client_id === me);

  const post = () => {
    const t = text.trim();
    if (!t) return;
    onPostWin({ kind: "note", title: t, icon, detail: "", visible: true });
    setText("");
  };

  return (
    <div style={{ paddingTop: 6, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 19 }}>The Collective</div>
        <div style={{ fontSize: 11.5, color: D.sub, marginTop: 2 }}>Your crew. Win the day on the things that compound — show up, check in, stack pillars.</div>
      </div>

      {challenges.map(ch => (
        <ChallengeCard key={ch.id} ch={ch} parts={progress.filter(p => p.challenge_id === ch.id)} me={me} nameOf={nameOf} />
      ))}
      {challenges.length === 0 && (
        <div style={{ background: D.card, border: `1px dashed ${D.line}`, borderRadius: 12, padding: "16px 14px", fontSize: 12.5, color: D.sub, textAlign: "center", lineHeight: 1.5 }}>
          No active challenge right now.{coachName ? ` ${coachName} will kick one off soon.` : ""} Keep stacking wins below.
        </div>
      )}

      {/* share composer */}
      <div style={{ background: D.card, border: `1px solid ${D.line}`, borderRadius: 12, padding: 11 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") post(); }} placeholder="Share a win with the crew…" style={{ flex: 1, minWidth: 0, background: D.lift, border: `1px solid ${D.line}`, borderRadius: 8, padding: "10px 11px", color: D.ink, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          <button onClick={post} disabled={!text.trim()} style={{ background: D.acc, color: "#0B0B0C", border: 0, borderRadius: 8, padding: "0 15px", height: 38, fontWeight: 800, cursor: text.trim() ? "pointer" : "default", opacity: text.trim() ? 1 : .5 }}>Post</button>
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
          {POST_ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${icon === ic ? D.acc : D.line}`, background: icon === ic ? D.acc + "22" : "transparent", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>{ic}</button>
          ))}
        </div>
      </div>

      {/* feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {visibleWins.map(w => (
          <WinCard key={w.id} w={w} me={me} myUid={myUid} nameOf={nameOf} reactions={reactions} onReactWin={onReactWin} onDeleteWin={onDeleteWin} />
        ))}
        {visibleWins.length === 0 && (
          <div style={{ fontSize: 12, color: D.sub, fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>No wins yet. Be the first — post one above, or go log a session.</div>
        )}
      </div>
    </div>
  );
}
