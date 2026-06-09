// coach/Planner.jsx
// ──────────────────────────────────────────────────────────────────
// Mesocycle Planner — the block-management grid. Shows every exercise's
// projected load across all weeks, the manual Current-Week stepper
// (coach-controlled progression, clamped to the block), and the
// Block-Length ± control. Final week renders as the auto-deload.
//
// IMPORT PATHS (Pass 1 / 2A tree):
//   ../lib/training         → targetW, dReps, isDeload
//   ../constants/exercises  → EXBYID
//   ../constants/modalities → modOf
//   ../shared/ExercisePicker→ default export
// ──────────────────────────────────────────────────────────────────
import { useState } from "react";
import { targetW, dReps, isDeload } from "../lib/training";
import { EXBYID } from "../constants/exercises";
import { modOf } from "../constants/modalities";
import ExercisePicker from "../shared/ExercisePicker";

export default function Planner({client,program,logs,onEditEx,onSetWeeks,onAddEx,onRemoveEx,onAdvanceWeek}){
  const [picker,setPicker]=useState(null);
  const tw=client.totalWeeks;
  const weeks=Array.from({length:tw},(_,i)=>i+1);
  const colTmpl=`260px repeat(${tw},92px)`;
  const dayDone=(w,d)=>d.ex.every(x=>{const e=logs[`w${w}|${d.id}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});
  return(<div className="pl">
    <div className="rhead"><div><div className="kick" style={{marginBottom:8}}>Mesocycle Planner</div><div className="rtitle">{client.name.split(" ")[0]}'s Block</div><div className="rsub">{client.block} · {tw} weeks · auto-progression, final week auto-deloads.</div></div>
      <div style={{display:"flex",gap:16,alignItems:"flex-end"}}>
        <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Current Week</span><div style={{display:"flex",gap:6,alignItems:"center"}}><button className="btn sec sm" disabled={client.currentWeek<=1} style={{opacity:client.currentWeek<=1?.4:1}} onClick={()=>onAdvanceWeek(-1)}>◀</button><span className="mono" style={{minWidth:58,textAlign:"center",fontFamily:"'Archivo Black',sans-serif",fontSize:15,color:isDeload(client.currentWeek,tw)?"#FF6B2C":"#F5F4F0"}}>W{client.currentWeek}{isDeload(client.currentWeek,tw)?" · DL":""}</span><button className="btn sm" disabled={client.currentWeek>=tw} style={{opacity:client.currentWeek>=tw?.4:1}} onClick={()=>onAdvanceWeek(1)}>▶</button></div></div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Block Length</span><div style={{display:"flex",gap:6}}><button className="btn sec sm" onClick={()=>onSetWeeks({totalWeeks:Math.max(1,tw-1)})}>− Week</button><button className="btn sm" onClick={()=>onSetWeeks({totalWeeks:tw+1})}>+ Week</button></div></div>
      </div>
    </div>
    <div className="plgrid">
      <div className="plr head" style={{gridTemplateColumns:colTmpl}}><div>Exercise · base · step</div>{weeks.map(w=><div key={w} className="plcell" data-cur={w===client.currentWeek}>W{w}{isDeload(w,tw)?" · DL":""}</div>)}</div>
      {program.days.map(d=>(<div key={d.id}>
        <div className="plr" style={{gridTemplateColumns:colTmpl,background:"#101012"}}><div style={{fontWeight:600,fontSize:11,letterSpacing:".06em",textTransform:"uppercase",color:"#FF6B2C"}}>{d.dow} · {d.name}</div>{weeks.map(w=><div key={w} className="plcell" data-done={dayDone(w,d)} style={{fontSize:10}}>{dayDone(w,d)?"✓ logged":""}</div>)}</div>
        {d.ex.map((x,xi)=>{const m=EXBYID[x.exId];if(!m)return null;return(<div key={x.exId+xi} className="plr" style={{gridTemplateColumns:colTmpl}}>
          <div style={{flexDirection:"row",alignItems:"center",gap:6}}>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:11.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.n}</div><div style={{fontSize:9,color:"#807E76",display:"flex",alignItems:"center",gap:5}}>{x.sets}×{x.reps}{modOf(x).id!=="straight"&&<span style={{color:modOf(x).color}}>· {modOf(x).short}</span>}</div></div>
            <input className="pbase" type="number" value={x.base} onChange={e=>onEditEx(d.id,x.exId,{base:Number(e.target.value)})} onFocus={e=>e.target.select()} title="Base load"/>
            <input className="pbase" style={{width:42}} type="number" step="0.005" value={x.step} onChange={e=>onEditEx(d.id,x.exId,{step:Number(e.target.value)})} onFocus={e=>e.target.select()} title="Weekly step"/>
            <button className="actb" title="Remove" onClick={()=>onRemoveEx(d.id,x.exId)}>✕</button>
          </div>
          {weeks.map(w=>{const done=(()=>{const e=logs[`w${w}|${d.id}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);})();const dlw=isDeload(w,tw);return(<div key={w} className="plcell" data-cur={w===client.currentWeek} data-done={done}><div className="plw" style={dlw?{color:"#FF6B2C"}:{}}>{targetW(x,w,tw)}</div><div className="plsub">{x.sets}×{dReps(x,w,tw)}{dlw?" DL":""}</div></div>);})}
        </div>);})}
        <div className="plr" style={{gridTemplateColumns:colTmpl}}><div style={{flexDirection:"row"}}><button className="addexb" style={{padding:"4px 9px",fontSize:9}} onClick={()=>setPicker(d.id)}>+ Add to {d.name.split(" · ")[0]}</button></div>{weeks.map(w=><div key={w} className="plcell"/>)}</div>
      </div>))}
    </div>
    {picker&&<ExercisePicker onPick={e=>{onAddEx(picker,e.id);setPicker(null);}} onClose={()=>setPicker(null)}/>}
  </div>);
}
