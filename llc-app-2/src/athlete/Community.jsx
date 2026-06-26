// athlete/Community.jsx — the premium-cohort community: a social feed
// (challenges + a Facebook/Heroic-style wins thread with avatars, names,
// reactions and comments). Competition is on consistency, never weight.
import { useState } from "react";
import { D } from "../theme/tokens";

const METRIC_LABEL = { sessions: "sessions", checkins: "check-ins", pillar_points: "pillar actions" };
const QUICK = ["🔥", "💪", "🙌", "👏", "🐐"];
const POST_ICONS = ["🔥", "💪", "🙌", "🏆", "🙏", "📈", "✅"];
const MEDAL = ["🥇", "🥈", "🥉"];
const PALETTE = ["#FF6B2C", "#FF3A8E", "#9EFF3A", "#3AE0FF", "#A78BFA", "#FFB23A", "#3AE07A"];
function colorFor(s) { let h = 0; const str = s || ""; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return PALETTE[h % PALETTE.length]; }

function relTime(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 604800) return Math.floor(s / 86400) + "d ago";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Avatar({ name, accent, size = 40 }) {
  const initial = (name || "A").trim().slice(0, 1).toUpperCase();
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: accent || D.acc, color: "#0B0B0C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: Math.round(size * 0.42), fontFamily: "'Archivo Black',sans-serif" }}>{initial}</span>
  );
}

function ChallengeCard({ ch, parts, me, nameOf, accents }) {
  const mine = (parts.find(p => p.client_id === me) || {}).value || 0;
  const unit = ch.unit || METRIC_LABEL[ch.metric] || "";
  const ends = ch.ends_on ? new Date(ch.ends_on + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
  const first = id => (nameOf[id] || "Athlete").split(" ")[0];
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
              <div key={p.client_id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 8, background: isMe ? D.acc + "1A" : D.lift, border: `1px solid ${isMe ? D.acc + "55" : "transparent"}` }}>
                <span style={{ width: 20, textAlign: "center", fontSize: 14 }}>{MEDAL[i] || <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: D.sub }}>{i + 1}</span>}</span>
                <Avatar name={nameOf[p.client_id]} accent={accents[p.client_id]} size={24} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: isMe ? 800 : 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: isMe ? D.acc : D.ink }}>{isMe ? "You" : first(p.client_id)}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14 }}>{Math.round(p.value || 0)}<span style={{ fontSize: 10.5, color: D.sub }}> {unit}</span></span>
              </div>
            );
          })}
        </div>
        {ends && <div style={{ fontSize: 10.5, color: D.sub, marginTop: 10, textAlign: "center" }}>Ends {ends}</div>}
      </div>
    );
  }

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

function Comment({ c, myUid, onDeleteComment }) {
  const coach = c.author_kind === "coach";
  const nm = c.author_name || (coach ? "Coach" : "Athlete");
  const canDel = c.author === myUid;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <Avatar name={nm} accent={coach ? D.acc : colorFor(nm)} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ background: D.lift, borderRadius: 12, padding: "7px 11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: coach ? D.acc : D.ink }}>{nm}</span>
            {coach && <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: D.acc, border: `1px solid ${D.acc}66`, borderRadius: 4, padding: "1px 4px" }}>Coach</span>}
            {canDel && onDeleteComment && <button onClick={() => onDeleteComment(c.id)} title="Delete" style={{ marginLeft: "auto", background: "transparent", border: 0, color: D.sub, fontSize: 11, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>}
          </div>
          <div style={{ fontSize: 13, color: D.ink, lineHeight: 1.4, marginTop: 2, wordBreak: "break-word" }}>{c.body}</div>
        </div>
        <div style={{ fontSize: 9.5, color: D.sub, margin: "3px 0 0 11px" }}>{relTime(c.created_at)}</div>
      </div>
    </div>
  );
}

function WinCard({ w, me, myUid, nameOf, accents, myName, myAccent, reactions, comments = [], onReactWin, onDeleteWin, onAddComment, onDeleteComment }) {
  const [ct, setCt] = useState("");
  const [open, setOpen] = useState(false);
  const name = nameOf[w.client_id] || "Athlete";
  const accent = accents[w.client_id] || colorFor(name);
  const isMine = w.client_id === me;
  const milestone = w.kind === "session" || w.kind === "checkin";
  const rx = reactions.filter(r => r.win_id === w.id);
  const byEmoji = {}; rx.forEach(r => { byEmoji[r.emoji] = (byEmoji[r.emoji] || 0) + 1; });
  const total = rx.length;
  const cs = comments;
  const shown = open ? cs : cs.slice(-2);
  const submit = () => { const t = ct.trim(); if (!t) return; onAddComment && onAddComment(w.id, t); setCt(""); setOpen(true); };

  return (
    <div style={{ background: D.card, border: `1px solid ${D.line}`, borderRadius: 14, overflow: "hidden" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 13px 0" }}>
        <Avatar name={name} accent={accent} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}{isMine && <span style={{ fontSize: 11, color: D.sub, fontWeight: 600 }}> · You</span>}</div>
          <div style={{ fontSize: 11, color: D.sub, marginTop: 1 }}>{relTime(w.created_at)}{milestone ? " · milestone" : ""}</div>
        </div>
        {isMine && onDeleteWin && (
          <button onClick={() => { if (window.confirm("Remove this from the feed?")) onDeleteWin(w.id); }} title="Delete" style={{ background: "transparent", border: 0, color: D.sub, fontSize: 14, cursor: "pointer", padding: 2, lineHeight: 1, alignSelf: "flex-start" }}>🗑</button>
        )}
      </div>

      {/* body */}
      <div style={{ padding: "10px 13px 0" }}>
        {milestone ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: D.acc + "14", border: `1px solid ${D.acc}33`, borderRadius: 10, padding: "10px 12px" }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{w.icon || "🏆"}</span>
            <span style={{ fontSize: 14, fontWeight: 800 }}>{w.title}</span>
          </div>
        ) : (
          <div style={{ fontSize: 15, lineHeight: 1.45, color: D.ink, display: "flex", gap: 8, alignItems: "flex-start" }}>
            {w.icon && w.icon !== "💬" ? <span style={{ fontSize: 19, lineHeight: 1.3, flexShrink: 0 }}>{w.icon}</span> : null}
            <span style={{ minWidth: 0, wordBreak: "break-word" }}>{w.title}</span>
          </div>
        )}
        {w.detail ? <div style={{ fontSize: 13.5, color: D.ink, marginTop: 8, lineHeight: 1.5, wordBreak: "break-word" }}>{w.detail}</div> : null}
      </div>

      {/* counts row */}
      {(total > 0 || cs.length > 0) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px 0", fontSize: 11.5, color: D.sub }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {total > 0 && <>{Object.keys(byEmoji).slice(0, 3).map(e => <span key={e} style={{ fontSize: 13 }}>{e}</span>)}<span style={{ marginLeft: 3 }}>{total}</span></>}
          </div>
          {cs.length > 0 && <button onClick={() => setOpen(true)} style={{ background: "transparent", border: 0, color: D.sub, fontSize: 11.5, cursor: "pointer", padding: 0 }}>{cs.length} comment{cs.length > 1 ? "s" : ""}</button>}
        </div>
      )}

      {/* action bar */}
      <div style={{ display: "flex", gap: 6, padding: "9px 12px", marginTop: 9, borderTop: `1px solid ${D.line}`, flexWrap: "wrap" }}>
        {QUICK.map(emo => {
          const these = rx.filter(r => r.emoji === emo);
          const mineOn = these.some(r => r.actor === myUid);
          const n = these.length;
          return (
            <button key={emo} onClick={() => onReactWin(w.id, emo, !mineOn)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: mineOn ? D.acc + "22" : D.lift, border: `1px solid ${mineOn ? D.acc : D.line}`, borderRadius: 14, padding: "5px 10px", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>
              <span>{emo}</span>{n > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: mineOn ? D.acc : D.sub, fontFamily: "'JetBrains Mono',monospace" }}>{n}</span>}
            </button>
          );
        })}
      </div>

      {/* comments */}
      <div style={{ padding: "11px 13px 13px", borderTop: `1px solid ${D.line}`, background: "#0E0E10" }}>
        {cs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 11 }}>
            {!open && cs.length > 2 && (
              <button onClick={() => setOpen(true)} style={{ alignSelf: "flex-start", background: "transparent", border: 0, color: D.sub, fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: 0 }}>View all {cs.length} comments</button>
            )}
            {shown.map(c => <Comment key={c.id} c={c} myUid={myUid} onDeleteComment={onDeleteComment} />)}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Avatar name={myName} accent={myAccent} size={28} />
          <input value={ct} onChange={e => setCt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); }} placeholder="Write a comment…" style={{ flex: 1, minWidth: 0, background: D.lift, border: `1px solid ${D.line}`, borderRadius: 18, padding: "9px 13px", color: D.ink, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          {ct.trim() && <button onClick={submit} style={{ background: D.acc, color: "#0B0B0C", border: 0, borderRadius: 16, padding: "0 14px", height: 34, fontWeight: 800, fontSize: 12.5, cursor: "pointer", flexShrink: 0 }}>Send</button>}
        </div>
      </div>
    </div>
  );
}

export default function Community({ data, me, myUid, nameOf = {}, accents = {}, coachName, onPostWin, onReactWin, onDeleteWin, onAddComment, onDeleteComment }) {
  const { challenges = [], progress = [], wins = [], reactions = [], comments = [] } = data || {};
  const [text, setText] = useState("");
  const [icon, setIcon] = useState("🔥");
  const visibleWins = wins.filter(w => w.visible !== false || w.client_id === me);
  const myName = nameOf[me] || "You";
  const myAccent = accents[me] || D.acc;

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
        <ChallengeCard key={ch.id} ch={ch} parts={progress.filter(p => p.challenge_id === ch.id)} me={me} nameOf={nameOf} accents={accents} />
      ))}
      {challenges.length === 0 && (
        <div style={{ background: D.card, border: `1px dashed ${D.line}`, borderRadius: 12, padding: "16px 14px", fontSize: 12.5, color: D.sub, textAlign: "center", lineHeight: 1.5 }}>
          No active challenge right now.{coachName ? ` ${coachName} will kick one off soon.` : ""} Keep stacking wins below.
        </div>
      )}

      {/* status composer — FB-style */}
      <div style={{ background: D.card, border: `1px solid ${D.line}`, borderRadius: 14, padding: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Avatar name={myName} accent={myAccent} size={38} />
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") post(); }} placeholder="Share a win with the crew…" style={{ flex: 1, minWidth: 0, background: D.lift, border: `1px solid ${D.line}`, borderRadius: 20, padding: "11px 14px", color: D.ink, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {POST_ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${icon === ic ? D.acc : D.line}`, background: icon === ic ? D.acc + "22" : "transparent", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>{ic}</button>
            ))}
          </div>
          <button onClick={post} disabled={!text.trim()} style={{ background: D.acc, color: "#0B0B0C", border: 0, borderRadius: 9, padding: "0 18px", height: 36, fontWeight: 800, cursor: text.trim() ? "pointer" : "default", opacity: text.trim() ? 1 : .5 }}>Post</button>
        </div>
      </div>

      {/* feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {visibleWins.map(w => (
          <WinCard key={w.id} w={w} me={me} myUid={myUid} nameOf={nameOf} accents={accents} myName={myName} myAccent={myAccent} reactions={reactions} comments={comments.filter(c => c.win_id === w.id)} onReactWin={onReactWin} onDeleteWin={onDeleteWin} onAddComment={onAddComment} onDeleteComment={onDeleteComment} />
        ))}
        {visibleWins.length === 0 && (
          <div style={{ fontSize: 12, color: D.sub, fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>No wins yet. Be the first — post one above, or go log a session.</div>
        )}
      </div>
    </div>
  );
}
