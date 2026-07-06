// coach/ProgramBuilder.jsx
// ──────────────────────────────────────────────────────────────────
// Build Day — the daily programming composer. Day tabs (add/rename/delete,
// set day-of-week), per-exercise sets/reps/load/weekly-step editing,
// reorder up/down, modality + tempo + superset-pair assignment, the
// Nutrition Targets macro editor (auto kcal), and the per-client
// Pillar Targets editor. The athlete trains exactly what's set here.
//
// IMPORT PATHS (Pass 1 / 2A tree):
//   ../lib/training         → targetW, peakW
//   ../constants/exercises  → EXBYID, PATL
//   ../constants/modalities → MODALITIES, modOf
//   ../constants/pillars    → PILLARS
//   ../shared/ExercisePicker→ default export
// ──────────────────────────────────────────────────────────────────
import { useState } from "react";
import { targetW, peakW } from "../lib/training";
import { EXBYID, PATL } from "../constants/exercises";
import { MODALITIES, modOf } from "../constants/modalities";
import { PILLARS } from "../constants/pillars";
import ExercisePicker from "../shared/ExercisePicker";

export default function ProgramBuilder({client,program,onEditEx,onAddEx,onRemoveEx,onReorderEx,onRenameDay,onSetDow,onAddDay,onRemoveDay,onSetPillarTarget,onSetNutrition}){
  const [dayIdx,setDayIdx]=useState(0);
  const [picker,setPicker]=useState(false);
  const [openP,setOpenP]=useState(null);
  const DOWS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const days=program?program.days:[];
  const idx=Math.min(dayIdx,Math.max(0,days.length-1));
  const day=days[idx];
  const fn=client.name.split(" ")[0];
  const numIn={width:"100%",background:"#1A1A1D",border:"1px solid #2A2A2F",borderRadius:5,padding:7,color:"#F5F4F0",fontFamily:"'JetBrains Mono',monospace",textAlign:"center",fontSize:13,outline:"none"};
  return(<div className="pl">
    <div className="rhead"><div><div className="kick" style={{marginBottom:8}}>Daily Programming</div><div className="rtitle">Build · {fn}</div><div className="rsub">Compose each training day — exercises, sets, reps, load, modality & weekly progression. The athlete trains exactly what you set here.</div></div></div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
      {days.map((d,i)=>(<button key={d.id} onClick={()=>setDayIdx(i)} style={{background:i===idx?"#FF6B2C":"#131315",color:i===idx?"#0B0B0C":"#B5B3AB",border:`1px solid ${i===idx?"#FF6B2C":"#2A2A2F"}`,borderRadius:6,padding:"8px 12px",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,display:"flex",flexDirection:"column",alignItems:"flex-start",gap:1}}><span style={{fontSize:8.5,letterSpacing:".1em",textTransform:"uppercase",opacity:.8}}>{d.dow} · {d.ex.length} ex</span><span>{d.name}</span></button>))}
      <button onClick={()=>{onAddDay();setDayIdx(days.length);}} className="addexb" style={{alignSelf:"stretch"}}>+ Training Day</button>
    </div>
    {day?(<>
      <div style={{display:"flex",gap:8,alignItems:"center",background:"#131315",border:"1px solid #2A2A2F",borderRadius:7,padding:"10px 12px",marginBottom:12,flexWrap:"wrap"}}>
        <span className="libfl">Day</span>
        <select className="sel" value={day.dow} onChange={e=>onSetDow(day.id,e.target.value)}>{DOWS.map(d=><option key={d} value={d}>{d}</option>)}</select>
        <input className="field" style={{flex:1,minWidth:170}} value={day.name} onChange={e=>onRenameDay(day.id,e.target.value)} placeholder="Day name (e.g. Lower A · Squat)"/>
        <button className="btn dgr sm" onClick={()=>{if(days.length>1){onRemoveDay(day.id);setDayIdx(0);}}} disabled={days.length<=1} style={{opacity:days.length<=1?.4:1}}>Delete Day</button>
      </div>
      {day.ex.length===0&&<div style={{color:"#54534D",fontSize:12,fontStyle:"italic",padding:"4px 2px 12px"}}>No exercises yet. Add the first movement below.</div>}
      {day.ex.map((x,xi)=>{const m=EXBYID[x.exId];if(!m)return null;return(<div key={x.exId+xi} style={{background:"#131315",border:"1px solid #2A2A2F",borderRadius:7,padding:"10px 12px",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
          <div style={{display:"flex",flexDirection:"column",gap:1}}><button className="actb" disabled={xi===0} style={{opacity:xi===0?.25:1,fontSize:9,lineHeight:1,padding:1}} onClick={()=>onReorderEx(day.id,x.exId,-1)}>▲</button><button className="actb" disabled={xi===day.ex.length-1} style={{opacity:xi===day.ex.length-1?.25:1,fontSize:9,lineHeight:1,padding:1}} onClick={()=>onReorderEx(day.id,x.exId,1)}>▼</button></div>
          <div style={{width:20,textAlign:"center",fontFamily:"'JetBrains Mono',monospace",color:"#807E76",fontSize:12}}>{xi+1}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13.5}}>{m.n}</div><div style={{fontSize:9.5,color:"#807E76",letterSpacing:".06em",textTransform:"uppercase"}}>{PATL[m.p]} · {m.e}</div></div>
          <button className="actb" title="Remove" onClick={()=>onRemoveEx(day.id,x.exId)} style={{fontSize:14}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[["Sets","sets",x.sets,1],["Reps","reps",x.reps,1],["Load (lb)","load",x.load,5]].map(([l,k,v,st])=>(<div key={k}><div style={{fontSize:8.5,color:"#807E76",letterSpacing:".06em",textTransform:"uppercase",fontWeight:700,marginBottom:3}}>{l}</div><input type="number" step={st} value={v} onChange={e=>onEditEx(day.id,x.exId,{[k]:Number(e.target.value)})} onFocus={e=>e.target.select()} style={numIn}/></div>))}
          
        </div>
        <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:"1 1 160px",minWidth:150}}><div style={{fontSize:8.5,color:"#807E76",letterSpacing:".06em",textTransform:"uppercase",fontWeight:700,marginBottom:3}}>Modality / Method</div><select className="sel" style={{width:"100%"}} value={x.mod||"straight"} onChange={e=>onEditEx(day.id,x.exId,{mod:e.target.value})}>{MODALITIES.map(mo=><option key={mo.id} value={mo.id}>{mo.label}</option>)}</select></div>
          {(x.mod==="superset"||x.mod==="triset")&&<div style={{width:74}}><div style={{fontSize:8.5,color:"#807E76",letterSpacing:".06em",textTransform:"uppercase",fontWeight:700,marginBottom:3}}>Pair</div><input className="field" style={{width:"100%",textAlign:"center"}} value={x.grp||""} placeholder="A1" onChange={e=>onEditEx(day.id,x.exId,{grp:e.target.value})}/></div>}
          <div style={{width:120}}><div style={{fontSize:8.5,color:"#807E76",letterSpacing:".06em",textTransform:"uppercase",fontWeight:700,marginBottom:3}}>Tempo</div><input className="field" style={{width:"100%",textAlign:"center"}} value={x.tempo||""} placeholder="opt · 3-1-1-0" onChange={e=>onEditEx(day.id,x.exId,{tempo:e.target.value})}/></div>
        </div>
        <div style={{fontSize:10,color:modOf(x).color,marginTop:6}}>{modOf(x).desc}</div>
        <div style={{fontSize:9.5,color:"#54534D",marginTop:4}}>{modOf(x).short}{x.tempo?` · tempo ${x.tempo}`:""} · Wk1 {x.base} → peak {peakW(x,client.totalWeeks)}{client.totalWeeks>1?` → DL ${targetW(x,client.totalWeeks,client.totalWeeks)}`:""} lb · {x.sets}×{x.reps}</div>
      </div>);})}
      <button className="addexb" onClick={()=>setPicker(true)} style={{marginTop:2}}>+ Add Exercise</button>
    </>):<div style={{color:"#807E76",fontSize:13,padding:14}}>No training days yet. Add one to start programming.</div>}

    <div style={{marginTop:30,paddingTop:22,borderTop:"1px solid #2A2A2F"}}>
      <div className="kick" style={{marginBottom:6}}>Nutrition Targets</div>
      <div style={{fontSize:12,color:"#807E76",marginBottom:14,maxWidth:640,lineHeight:1.5}}>Set {fn}'s daily macro targets. Calories auto-calculate (4·4·9). These drive the athlete's Fuel tab and the Nutrition pillar.</div>
      {(()=>{const nt=client.nt||{p:0,c:0,f:0,kcal:0};const kcal=(Number(nt.p)||0)*4+(Number(nt.c)||0)*4+(Number(nt.f)||0)*9;const upd=patch=>{const next={...nt,...patch};next.kcal=(Number(next.p)||0)*4+(Number(next.c)||0)*4+(Number(next.f)||0)*9;onSetNutrition(client.id,next);};return(<div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end",background:"#131315",border:"1px solid #2A2A2F",borderRadius:7,padding:"14px 16px",maxWidth:560}}>
        {[["p","Protein","#FF6B2C"],["c","Carbs","#3AE0FF"],["f","Fat","#FFB23A"]].map(([k,l,col])=>(<div key={k} style={{flex:"1 1 90px"}}><div style={{fontSize:8.5,color:col,letterSpacing:".06em",textTransform:"uppercase",fontWeight:700,marginBottom:4}}>{l} (g)</div><input type="number" value={nt[k]||0} onChange={e=>upd({[k]:Number(e.target.value)})} style={numIn}/></div>))}
        <div style={{flex:"1 1 90px"}}><div style={{fontSize:8.5,color:"#EC4899",letterSpacing:".06em",textTransform:"uppercase",fontWeight:700,marginBottom:4}}>Calories</div><div style={{...numIn,background:"#0F0F11",color:"#EC4899",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{kcal}</div></div>
      </div>);})()}
    </div>

    <div style={{marginTop:30,paddingTop:22,borderTop:"1px solid #2A2A2F"}}>
      <div className="kick" style={{marginBottom:6}}>Client Pillar Targets</div>
      <div style={{fontSize:12,color:"#807E76",marginBottom:14,maxWidth:640,lineHeight:1.5}}>Set {fn}'s specific daily targets per pillar — protein grams, step counts, sleep hours, whatever fits this client. These show up verbatim in the athlete's 7 Pillars tab.</div>
      {PILLARS.map(p=>{const open=openP===p.id;const customCt=p.actions.filter(a=>{const ov=client.pillarTargets&&client.pillarTargets[a.id];return ov&&ov!==a.label;}).length;return(<div key={p.id} style={{background:"#131315",border:"1px solid #2A2A2F",borderLeft:`3px solid ${p.color}`,borderRadius:7,marginBottom:8,overflow:"hidden"}}>
        <div onClick={()=>setOpenP(open?null:p.id)} style={{padding:"11px 13px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
          <span style={{fontSize:18}}>{p.icon}</span>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13.5}}>{p.name}</div><div style={{fontSize:10,color:p.color}}>{p.tag}</div></div>
          {customCt>0&&<span className="pill" style={{background:p.color+"22",color:p.color}}>{customCt} custom</span>}
          <span style={{color:"#807E76",fontSize:14,transform:open?"rotate(90deg)":"none",display:"inline-block"}}>›</span>
        </div>
        {open&&<div style={{padding:"0 13px 13px"}}>
          {p.actions.map((a,ai)=>{const ov=client.pillarTargets&&client.pillarTargets[a.id];return(<div key={a.id} style={{marginBottom:8}}><div style={{fontSize:8.5,color:"#54534D",letterSpacing:".06em",textTransform:"uppercase",fontWeight:700,marginBottom:3}}>Action {ai+1} · default: {a.label}</div><input className="field" style={{width:"100%"}} value={ov!==undefined?ov:a.label} placeholder={a.label} onChange={e=>onSetPillarTarget(client.id,a.id,e.target.value)}/></div>);})}
          <button className="btn sec sm" onClick={()=>p.actions.forEach(a=>onSetPillarTarget(client.id,a.id,""))}>Reset to defaults</button>
        </div>}
      </div>);})}
    </div>
    {picker&&day&&<ExercisePicker allowCustom onPick={e=>{onAddEx(day.id,e.id);setPicker(false);}} onClose={()=>setPicker(false)}/>}
  </div>);
}
