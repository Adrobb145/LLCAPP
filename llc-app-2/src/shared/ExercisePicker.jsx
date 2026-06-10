// shared/ExercisePicker.jsx — exercise search/pick modal with pattern, equipment & level filters
import { useState } from "react";
import { EX, PATS, EQUIP, LEVELS, LDOT } from "../constants/exercises";

export default function ExercisePicker({ onPick, onClose }) {
  const [s, setS] = useState("");
  const [p, setP] = useState("all");
  const [eq, setEq] = useState("all");
  const [lv, setLv] = useState("all");

  const f = EX.filter(e => {
    if (p !== "all" && e.p !== p) return false;
    if (eq !== "all" && e.e !== eq) return false;
    if (lv !== "all" && e.lv !== lv) return false;
    if (s) { const q = s.toLowerCase(); if (!e.n.toLowerCase().includes(q) && !e.m.some(m => m.includes(q))) return false; }
    return true;
  });

  const Row = ({ label, value, set, opts }) => (
    <div className="chips" style={{ padding: "0 16px 8px", flexWrap: "wrap" }}>
      <span style={{ fontSize: 9, color: "#807E76", letterSpacing: ".08em", textTransform: "uppercase", alignSelf: "center", marginRight: 4 }}>{label}</span>
      <button className="chip" data-on={value === "all"} onClick={() => set("all")}>All</button>
      {opts.map(x => <button key={x} className="chip" data-on={value === x} onClick={() => set(x)}>{x}</button>)}
    </div>
  );

  return (<div className="povl" onClick={onClose}><div className="pick" onClick={e => e.stopPropagation()}>
    <div className="pickh"><div className="pickt">Pick Exercise <span style={{ fontSize: 11, color: "#807E76", fontWeight: 400 }}>· {f.length} of {EX.length}</span></div><button className="actb" style={{ fontSize: 16 }} onClick={onClose}>✕</button></div>
    <div style={{ padding: "12px 16px 8px" }}><input className="field" autoFocus style={{ width: "100%" }} value={s} onChange={e => setS(e.target.value)} placeholder="Search name or muscle…" /></div>
    <Row label="Pattern" value={p} set={setP} opts={PATS} />
    <Row label="Equip" value={eq} set={setEq} opts={EQUIP} />
    <Row label="Level" value={lv} set={setLv} opts={LEVELS} />
    <div className="pickl">{f.map(e => (
      <div key={e.id} className="pitem" onClick={() => onPick(e)}>
        <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.n}</div><div style={{ fontSize: 10, color: "#807E76" }}>{e.p} · {e.m.join(" · ")}</div></div>
        <span className="mtag">{e.e}</span>
        <span className="mtag"><span className="ldot" style={{ background: LDOT[e.lv] }} />{e.lv}</span>
      </div>))}
      {f.length === 0 && <div style={{ padding: 30, color: "#807E76", textAlign: "center" }}>No matches — loosen a filter.</div>}
    </div>
  </div></div>);
}
