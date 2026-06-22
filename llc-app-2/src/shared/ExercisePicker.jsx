// shared/ExercisePicker.jsx — exercise search/pick modal with pattern, equipment
// & level filters. Coaches (allowCustom) can create a custom movement filed under
// a chosen category. Self-contained styling (injected, namespaced xp-* classes) so
// it renders as a proper centered modal in BOTH the coach OS and the athlete app —
// the athlete app does not load the coach stylesheet.
import { useState } from "react";
import { EX, PATS, EQUIP, LEVELS, LDOT, PATL, addCustomToRegistry, removeCustomFromRegistry } from "../constants/exercises";
import * as db from "../lib/db";

const XPCSS = `
.xp-ovl{position:fixed;inset:0;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;box-sizing:border-box;}
.xp-modal{background:#131315;border:1px solid #36363C;border-radius:12px;width:680px;max-width:100%;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.55);}
.xp-h{padding:13px 16px;border-bottom:1px solid #2A2A2F;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.xp-t{font-family:'Archivo Black',sans-serif;font-size:15px;color:#F5F4F0;}
.xp-l{flex:1;overflow-y:auto;padding:8px;-webkit-overflow-scrolling:touch;}
.xp-item{display:grid;grid-template-columns:1fr auto auto;gap:10px;padding:9px 11px;border-radius:6px;cursor:pointer;align-items:center;}
.xp-item:hover{background:#1A1A1D;}
.xp-field{background:#1A1A1D;border:1px solid #2A2A2F;border-radius:6px;padding:9px 11px;color:#F5F4F0;font-family:inherit;font-size:16px;outline:none;width:100%;box-sizing:border-box;}
.xp-field:focus{border-color:#FF6B2C;}
.xp-chips{display:flex;gap:4px;flex-wrap:wrap;}
.xp-chip{border:1px solid #36363C;background:transparent;color:#B5B3AB;font-family:inherit;font-size:11px;font-weight:500;padding:5px 10px;border-radius:4px;cursor:pointer;text-transform:capitalize;}
.xp-chip[data-on="true"]{background:#FF6B2C;color:#0B0B0C;border-color:#FF6B2C;font-weight:700;}
.xp-mtag{font-size:11px;letter-spacing:.06em;padding:1px 5px;border-radius:3px;background:#232327;color:#807E76;text-transform:capitalize;display:inline-flex;align-items:center;gap:3px;flex-shrink:0;}
.xp-ldot{width:5px;height:5px;border-radius:50%;display:inline-block;}
.xp-actb{border:0;background:transparent;color:#807E76;padding:3px;font-size:14px;cursor:pointer;line-height:1;}
.xp-btn{border:0;background:#FF6B2C;color:#0B0B0C;font-family:inherit;font-weight:700;font-size:12px;letter-spacing:.02em;text-transform:uppercase;padding:11px 13px;border-radius:7px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;}
.xp-btn:disabled{opacity:.5;cursor:default;}
.xp-btn.sec{background:#1A1A1D;color:#F5F4F0;border:1px solid #2A2A2F;}
`;

export default function ExercisePicker({ onPick, onClose, allowCustom }) {
  const [s, setS] = useState("");
  const [p, setP] = useState("all");
  const [eq, setEq] = useState("all");
  const [lv, setLv] = useState("all");
  const [, force] = useState(0);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pat, setPat] = useState("squat");
  const [eqp, setEqp] = useState("barbell");
  const [lvl, setLvl] = useState("beginner");
  const [musc, setMusc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const f = EX.filter(e => {
    if (p !== "all" && e.p !== p) return false;
    if (eq !== "all" && e.e !== eq) return false;
    if (lv !== "all" && e.lv !== lv) return false;
    if (s) { const q = s.toLowerCase(); if (!e.n.toLowerCase().includes(q) && !e.m.some(m => m.includes(q))) return false; }
    return true;
  });

  const openAdd = () => {
    setName(s.trim());
    setPat(p !== "all" ? p : "squat");
    setEqp(eq !== "all" ? eq : "barbell");
    setLvl(lv !== "all" ? lv : "beginner");
    setMusc(""); setErr(""); setAdding(true);
  };

  const saveCustom = async () => {
    const nm = name.trim();
    if (!nm) { setErr("Give the exercise a name."); return; }
    setBusy(true); setErr("");
    try {
      const row = await db.addCustomExercise({ name: nm, pattern: pat, equip: eqp, level: lvl, muscles: musc.trim() });
      const ex = addCustomToRegistry(row);
      setBusy(false); setAdding(false);
      onPick(ex);
    } catch (e) { setBusy(false); setErr(e.message || String(e)); }
  };

  const delCustom = async (id, ev) => {
    ev.stopPropagation();
    if (!window.confirm("Delete this custom exercise from the library? Any program already using it will show a blank row until you swap it.")) return;
    try { await db.deleteCustomExercise(id); removeCustomFromRegistry(id); force(n => n + 1); }
    catch (e) { alert(e.message || String(e)); }
  };

  const Row = ({ label, value, set, opts }) => (
    <div className="xp-chips" style={{ padding: "0 16px 8px" }}>
      <span style={{ fontSize: 9, color: "#807E76", letterSpacing: ".08em", textTransform: "uppercase", alignSelf: "center", marginRight: 4 }}>{label}</span>
      <button className="xp-chip" data-on={value === "all"} onClick={() => set("all")}>All</button>
      {opts.map(x => <button key={x} className="xp-chip" data-on={value === x} onClick={() => set(x)}>{x}</button>)}
    </div>
  );

  const flbl = { fontSize: 9, color: "#807E76", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700, margin: "0 0 4px" };

  return (<div className="xp-ovl" onClick={onClose}><style>{XPCSS}</style><div className="xp-modal" onClick={e => e.stopPropagation()}>
    <div className="xp-h"><div className="xp-t">Pick Exercise <span style={{ fontSize: 11, color: "#807E76", fontWeight: 400 }}>· {f.length} of {EX.length}</span></div><button className="xp-actb" style={{ fontSize: 18 }} onClick={onClose}>✕</button></div>
    <div style={{ padding: "12px 16px 8px", flexShrink: 0 }}><input className="xp-field" autoFocus value={s} onChange={e => setS(e.target.value)} placeholder="Search name or muscle…" /></div>
    <div style={{ flexShrink: 0 }}>
      <Row label="Pattern" value={p} set={setP} opts={PATS} />
      <Row label="Equip" value={eq} set={setEq} opts={EQUIP} />
      <Row label="Level" value={lv} set={setLv} opts={LEVELS} />
    </div>

    {allowCustom && !adding && (
      <div style={{ padding: "0 16px 10px", flexShrink: 0 }}>
        <button className="xp-btn sec" style={{ width: "100%" }} onClick={openAdd}>＋ New custom exercise</button>
      </div>
    )}
    {allowCustom && adding && (
      <div style={{ margin: "0 16px 12px", background: "#0F0F11", border: "1px solid #2A2A2F", borderRadius: 9, padding: 12, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "#F5F4F0" }}>New custom exercise</div>
        <div style={{ marginBottom: 9 }}><div style={flbl}>Name</div><input className="xp-field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Belt Squat" /></div>
        <div style={{ marginBottom: 9 }}><div style={flbl}>Category (where it files in the picker)</div>
          <select className="xp-field" value={pat} onChange={e => setPat(e.target.value)}>{PATS.map(x => <option key={x} value={x}>{PATL[x]}</option>)}</select></div>
        <div style={{ display: "flex", gap: 8, marginBottom: 9 }}>
          <div style={{ flex: 1 }}><div style={flbl}>Equipment</div><select className="xp-field" value={eqp} onChange={e => setEqp(e.target.value)}>{EQUIP.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
          <div style={{ flex: 1 }}><div style={flbl}>Level</div><select className="xp-field" value={lvl} onChange={e => setLvl(e.target.value)}>{LEVELS.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
        </div>
        <div style={{ marginBottom: 10 }}><div style={flbl}>Muscles (comma separated)</div><input className="xp-field" value={musc} onChange={e => setMusc(e.target.value)} placeholder="e.g. quads, glutes" /></div>
        {err && <div style={{ color: "#FFB23A", fontSize: 11.5, marginBottom: 8 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="xp-btn" style={{ flex: 1 }} disabled={busy} onClick={saveCustom}>{busy ? "Saving…" : "Save & add"}</button>
          <button className="xp-btn sec" style={{ flex: 1 }} disabled={busy} onClick={() => setAdding(false)}>Cancel</button>
        </div>
      </div>
    )}

    <div className="xp-l">{f.map(e => (
      <div key={e.id} className="xp-item" onClick={() => onPick(e)}>
        <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>{e.n}{e.custom && <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#FF6B2C", background: "rgba(255,107,44,.14)", border: "1px solid rgba(255,107,44,.4)", borderRadius: 3, padding: "1px 5px" }}>Custom</span>}</div><div style={{ fontSize: 10, color: "#807E76" }}>{PATL[e.p] || e.p} · {e.m.join(" · ")}</div></div>
        <span className="xp-mtag">{e.e}</span>
        <span className="xp-mtag"><span className="xp-ldot" style={{ background: LDOT[e.lv] }} />{e.lv}</span>
        {allowCustom && e.custom && <button className="xp-actb" title="Delete custom exercise" style={{ fontSize: 13, gridColumn: "1 / -1", justifySelf: "end", marginTop: -2 }} onClick={ev => delCustom(e.id, ev)}>🗑 remove</button>}
      </div>))}
      {f.length === 0 && <div style={{ padding: 30, color: "#807E76", textAlign: "center" }}>No matches{allowCustom ? " — loosen a filter, or create a custom exercise above." : " — loosen a filter."}</div>}
    </div>
  </div></div>);
}
