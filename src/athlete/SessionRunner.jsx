// athlete/SessionRunner.jsx — live in-session logger + readiness gate
import { useState } from "react";
import { isDeload, targetW, dReps } from "../lib/training";
import { EXBYID } from "../constants/exercises";
import { modOf } from "../constants/modalities";
import { D } from "../theme/tokens";
import ModTag from "../shared/ModTag";

export default function SessionRunner({day,week,total,clogs,onDone,onCancel,onReady}){
  const [phase,setPhase]=useState(onReady?"ready":"log");
  const [rd,setRd]=useState({sleep:7,energy:7,soreness:5});
  const dl=isDeload(week,total);
  const [data,setData]=useState(()=>day.ex.map(x=>{const last=clogs[`w${week-1}|${day.id}|${x.exId}`];const ls=last?last.sets:null;return{exId:x.exId,name:EXBYID[x.exId]?EXBYID[x.exId].n:"?",mod:x.mod,tempo:x.tempo,grp:x.grp,rpe:null,sets:Array.from({length:x.sets},(_,i)=>({w:dl?targetW(x,week,total):(ls&&ls[i]?ls[i].w:targetW(x,week,total)),r:dReps(x,week,total),done:false}))};}));
  const upd=(ei,si,patch)=>setData(p=>p.map((e,i)=>i!==ei?e:{...e,sets:e.sets.map((s,j)=>j!==si?s:{...s,...patch})}));
  const setRpe=(ei,v)=>setData(p=>p.map((e,i)=>i!==ei?e:{...e,rpe:v}));
  const tot=data.reduce((a,e)=>a+e.sets.length,0),done=data.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const finish=()=>{const entries={};data.forEach(e=>{entries[`w${week}|${day.id}|${e.exId}`]={note:"",sets:e.sets.map(s=>({w:Number(s.w)||0,r:Number(s.r)||0,rpe:e.rpe,done:s.done}))};});onDone(entries);};
  if(phase==="ready"){
    const R=[["sleep","Sleep","😴"],["energy","Energy","⚡"],["soreness","Soreness","💢"]];
    return(<div style={{padding:"14px 14px 40px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><button onClick={onCancel} style={{background:D.card,border:`1px solid ${D.line}`,color:D.acc,borderRadius:6,padding:"6px 10px",cursor:"pointer",fontWeight:700}}>←</button><div><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:16}}>{day.name}</div><div style={{fontSize:10,color:D.sub}}>20-second readiness check</div></div></div>
      <div style={{fontSize:12.5,color:D.sub,margin:"6px 2px 16px"}}>Be honest — this tells your coach how to adjust today's load.</div>
      {R.map(([k,l,ic])=>{const hot=k==="soreness"&&rd[k]>=7;const low=k!=="soreness"&&rd[k]<=4;return(<div key={k} style={{background:D.card,border:`1px solid ${hot||low?"#FF4D4D55":D.line}`,borderRadius:10,padding:"12px 14px",marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:13,fontWeight:600}}>{ic} {l}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:hot||low?"#FF4D4D":D.acc,fontWeight:700}}>{rd[k]}/10</span></div><input type="range" min="1" max="10" value={rd[k]} onChange={e=>setRd({...rd,[k]:Number(e.target.value)})} style={{width:"100%",accentColor:hot||low?"#FF4D4D":D.acc}}/></div>);})}
      <button onClick={()=>{onReady&&onReady(rd);setPhase("log");}} style={{width:"100%",background:D.acc,color:"#0B0B0C",border:0,borderRadius:9,padding:14,fontFamily:"'Archivo Black',sans-serif",fontSize:13,cursor:"pointer",marginTop:4}}>START TRAINING →</button>
      <div style={{textAlign:"center",marginTop:12}}><span onClick={()=>setPhase("log")} style={{color:D.sub,fontSize:11,cursor:"pointer"}}>Skip check</span></div>
    </div>);
  }
  const RPE=[6,7,8,9,10];
  return(<div style={{padding:"14px 14px 90px"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><button onClick={onCancel} style={{background:D.card,border:`1px solid ${D.line}`,color:D.acc,borderRadius:6,padding:"6px 10px",cursor:"pointer",fontWeight:700}}>←</button><div><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:16}}>{day.name}</div><div style={{fontSize:10,color:D.sub}}>Week {week}{dl?" · Deload":""} · {done}/{tot} sets</div></div></div>
    {dl&&<div style={{background:"rgba(255,107,44,.1)",border:`1px solid ${D.acc}55`,borderRadius:9,padding:"10px 12px",marginBottom:10,fontSize:12,color:"#FFB23A",lineHeight:1.45}}>🪶 <b>Deload week.</b> Loads are intentionally light and reps trimmed. Move fast and clean — don't chase grinders. This is how you show up fresh next block.</div>}
    {data.map((e,ei)=>(<div key={ei} style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:9,padding:11,marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7,flexWrap:"wrap"}}><span style={{fontWeight:600,fontSize:13}}>{e.name}</span><ModTag x={e}/></div>
      {modOf(e).id!=="straight"&&<div style={{fontSize:10.5,color:modOf(e).color,marginBottom:7,marginTop:-3,lineHeight:1.4}}>{modOf(e).desc}</div>}
      <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 34px",gap:6,marginBottom:4,fontSize:8.5,color:"#54534D",letterSpacing:".06em",textTransform:"uppercase",textAlign:"center"}}><div></div><div>Weight</div><div>Reps</div><div></div></div>
      {e.sets.map((s,si)=>(<div key={si} style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 34px",gap:6,alignItems:"center",marginBottom:5}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:s.done?D.good:D.acc,textAlign:"center"}}>{si+1}</div>
        <input type="number" value={s.w} onChange={ev=>upd(ei,si,{w:ev.target.value})} style={{background:D.lift,border:`1px solid ${D.line}`,borderRadius:5,padding:7,color:s.done?D.good:D.ink,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",fontSize:13,outline:"none"}}/>
        <input type="number" value={s.r} onChange={ev=>upd(ei,si,{r:ev.target.value})} style={{background:D.lift,border:`1px solid ${D.line}`,borderRadius:5,padding:7,color:s.done?D.good:D.ink,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",fontSize:13,outline:"none"}}/>
        <button onClick={()=>upd(ei,si,{done:!s.done})} style={{height:32,borderRadius:5,background:s.done?D.good:"transparent",border:`1px solid ${s.done?D.good:D.acc}`,color:s.done?"#0B0B0C":D.acc,cursor:"pointer",fontSize:13}}>{s.done?"✓":"○"}</button>
      </div>))}
      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:8,paddingTop:8,borderTop:`1px solid ${D.line}`}}><span style={{fontSize:9,color:D.sub,letterSpacing:".08em",textTransform:"uppercase",fontWeight:700,marginRight:2}}>RPE</span>{RPE.map(v=>(<button key={v} onClick={()=>setRpe(ei,v===e.rpe?null:v)} style={{flex:1,padding:"6px 0",borderRadius:6,border:`1px solid ${e.rpe===v?D.acc:D.line}`,background:e.rpe===v?D.acc:"transparent",color:e.rpe===v?"#0B0B0C":D.sub,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:12,cursor:"pointer"}}>{v}</button>))}</div>
    </div>))}
    <button onClick={finish} style={{position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 28px)",maxWidth:452,background:D.acc,color:"#0B0B0C",border:0,borderRadius:8,padding:14,fontFamily:"'Archivo Black',sans-serif",fontSize:13,cursor:"pointer"}}>FINISH & SAVE — {done}/{tot}</button>
  </div>);
}
