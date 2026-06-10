// coach/Sheet.jsx
// ──────────────────────────────────────────────────────────────────
// Program Sheet — the coach's per-day logging grid. Carries the set-by-set
// log table, the form-video review rail, the 7-Pillars/volume/e1RM side rail,
// the mesocycle week selector, and the coach↔athlete note thread.
//
// IMPORT PATHS assume the Pass 1 / Pass 2A tree:
//   ../lib/training         → targetW, dReps, e1rm, round5, isDeload
//   ../constants/exercises  → EXBYID, ID, PATL
//   ../constants/progression→ DELOAD          (if you kept DELOAD in lib/training, change this one line)
//   ../constants/modalities → modOf
//   ../constants/pillars    → PILLARS
//   ../shared/*             → Avatar, Spark, ExercisePicker, ModTag (default exports)
//   ./FormReviewCoach       → the Pass 2A coach component (default export)
// SetCell is Sheet-only, so it lives here as a module-level component.
// ──────────────────────────────────────────────────────────────────
import { useState } from "react";
import { targetW, dReps, e1rm, round5, isDeload } from "../lib/training";
import { EXBYID, ID, PATL } from "../constants/exercises";
import { DELOAD } from "../constants/progression";
import { modOf } from "../constants/modalities";
import { PILLARS } from "../constants/pillars";
import Avatar from "../shared/Avatar";
import Spark from "../shared/Spark";
import ExercisePicker from "../shared/ExercisePicker";
import ModTag from "../shared/ModTag";
import FormReviewCoach from "./FormReviewCoach";

function SetCell({set,onChange,onToggle}){
  return(<div className="setc" data-d={set.done}><div className="setin">
    <div className="scheck" onClick={e=>{e.stopPropagation();onToggle();}}>{set.done?"✓":""}</div>
    <input className="sinp" type="number" value={set.w} onChange={e=>onChange({w:e.target.value})} onFocus={e=>e.target.select()}/>
    <div className="smeta"><span>{set.r}r</span>{set.rpe!=null&&<span style={{color:"#B5B3AB"}}>@{set.rpe}</span>}</div>
  </div></div>);
}

export default function Sheet({client,program,week,setWeek,logs,onLog,onAddEx,onRemoveEx,notes,onAddNote,coaches,formvids=[],vidUrls={},onReviewVid}){
  const [dayIdx,setDayIdx]=useState(0);
  const [picker,setPicker]=useState(false);
  const [noteText,setNoteText]=useState("");
  const day=program.days[dayIdx]||program.days[0];
  const maxSets=Math.max(4,...day.ex.map(x=>x.sets));
  const tw=client.totalWeeks;
  const dl=isDeload(week,tw);
  const dayStatus=d=>{const allDone=d.ex.every(x=>{const e=logs[`w${week}|${d.id}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});if(allDone)return"logged";const some=d.ex.some(x=>{const e=logs[`w${week}|${d.id}|${x.exId}`];return e&&e.sets.some(s=>s.done);});return some?"in":"";};
  const getEntry=(x)=>{const k=`w${week}|${day.id}|${x.exId}`;const e=logs[k];if(e)return e;return{note:"",sets:Array.from({length:x.sets},()=>({w:targetW(x,week,tw),r:dReps(x,week,tw),rpe:null,done:false}))};};
  const writeSet=(x,i,patch)=>{const k=`w${week}|${day.id}|${x.exId}`;const cur=getEntry(x);const sets=cur.sets.map((s,j)=>j===i?{...s,...patch}:s);onLog(k,{...cur,sets});};
  const lastTop=(x)=>{if(week<2)return null;const e=logs[`w${week-1}|${day.id}|${x.exId}`];if(!e)return{w:targetW(x,week-1,tw),r:dReps(x,week-1,tw)};const top=e.sets.reduce((m,s)=>(Number(s.w)||0)>(Number(m?.w)||0)?s:m,null);return top;};
  let doneSets=0,totSets=0,vol=0;
  day.ex.forEach(x=>{const e=getEntry(x);totSets+=e.sets.length;e.sets.forEach(s=>{if(s.done){doneSets++;vol+=(Number(s.w)||0)*(Number(s.r)||0);}});});
  const weekVol=[];for(let w=1;w<=client.currentWeek;w++){let v=0;program.days.forEach(d=>d.ex.forEach(x=>{const e=logs[`w${w}|${d.id}|${x.exId}`];if(e)e.sets.forEach(s=>{if(s.done)v+=(Number(s.w)||0)*(Number(s.r)||0);});}));weekVol.push(Math.round(v/1000*10)/10);}
  const mainLifts=["Back Squat","Barbell Bench Press","Conventional Deadlift"];
  const e1series=mainLifts.map(nm=>{const id=ID(nm);const arr=[];for(let w=1;w<=client.currentWeek;w++){let best=0;program.days.forEach(d=>d.ex.forEach(x=>{if(x.exId!==id)return;const e=logs[`w${w}|${d.id}|${x.exId}`];const sets=e?e.sets:[];sets.forEach(s=>{if(s.done){const v=e1rm(Number(s.w)||0,Number(s.r)||0);if(v>best)best=v;}});}));if(best)arr.push(best);}return{nm,arr};}).filter(x=>x.arr.length>=2);
  const volByMuscle={};day.ex.forEach(x=>{const m=EXBYID[x.exId];if(m)m.m.forEach(g=>{volByMuscle[g]=(volByMuscle[g]||0)+x.sets;});});
  const vbm=Object.entries(volByMuscle).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const maxVbm=Math.max(1,...vbm.map(v=>v[1]));
  const cNotes=notes[client.id]||[];
  const pillarsDoneToday=PILLARS.filter(p=>client.hab&&client.hab[p.id]).length;

  return(<div className="sheetwrap">
    <div className="sheetmain">
      <div className="chead">
        <div className="chid"><Avatar txt={client.initials} c={client.accent} size={50}/><div><div className="ch-name">{client.name}</div><div className="ch-goal">{client.goal}</div></div></div>
        <div className="chmeta">
          <div className="chm"><div className="chm-l">Block</div><div className="chm-v" style={{fontSize:12}}>{client.block}</div></div>
          <div className="chm"><div className="chm-l">Body Wt</div><div className="chm-v">{client.bw}<small>lb</small></div></div>
          <div className="chm"><div className="chm-l">Adherence</div><div className="chm-v" style={{color:client.adherence>.85?"#3AE07A":"#FFB23A"}}>{Math.round(client.adherence*100)}<small>%</small></div></div>
        </div>
      </div>
      <div className="meso"><div className="meso-l">Mesocycle</div><div className="meso-c">{Array.from({length:client.totalWeeks},(_,i)=>{const w=i+1;const dlw=isDeload(w,tw);const st=w===week?"cur":dlw?"dl":w<client.currentWeek?"done":"up";return(<div key={w} className="mcell" data-s={st} onClick={()=>setWeek(w)}>W{w}{dlw?"·DL":""}</div>);})}</div></div>
      {dl&&<div style={{background:"rgba(255,107,44,.08)",border:"1px solid #FF6B2C55",borderRadius:6,padding:"8px 12px",marginBottom:14,fontSize:11.5,color:"#FFB23A",fontWeight:600}}>🪶 Deload week — loads auto-dropped to ~{Math.round(DELOAD*100)}% and reps trimmed. Keep it crisp; this is where the gains land.</div>}
      <div className="dtabs">{program.days.map((d,i)=>(<button key={d.id} className="dtab" data-on={i===dayIdx} onClick={()=>setDayIdx(i)}><div className="dtab-d">{d.dow}</div><div>{d.name}<span className="dstat" data-s={dayStatus(d)}/></div></button>))}<div style={{marginLeft:"auto",display:"flex",alignItems:"center",padding:"0 12px"}}><span style={{fontSize:10,color:"#807E76",letterSpacing:".06em",textTransform:"uppercase",fontWeight:600}}>W{week}{dl?" · DL":""} · {doneSets}/{totSets} sets · {(vol/1000).toFixed(1)}k lb</span></div></div>
      <div className="sheet" style={{"--sc":maxSets}}>
        <div className="shrow"><div>Exercise</div><div className="ctr">Target</div><div>Last</div><div className="ctr">Auto</div>{Array.from({length:maxSets}).map((_,i)=><div key={i} className="ctr">Set {i+1}</div>)}<div className="ctr">·</div></div>
        {day.ex.map((x,xi)=>{const m=EXBYID[x.exId];if(!m)return null;const entry=getEntry(x);const pad=Array.from({length:Math.max(0,maxSets-entry.sets.length)});const last=lastTop(x);const sug=round5(targetW(x,week,tw)*(dl?1:1.025));return(<div key={x.exId+xi}>
          <div className="exrow">
            <div><div className="ex-name">{m.n}</div><div className="ex-pat">{PATL[m.p]} · {m.e}</div>{(modOf(x).id!=="straight"||x.tempo||x.grp)?<div style={{marginTop:4}}><ModTag x={x}/></div>:null}</div>
            <div className="tcell"><div className="t-reps">{x.sets}×{dReps(x,week,tw)}</div><div className="t-lbl" style={dl?{color:"#FF6B2C"}:{}}>{dl?"deload":"target"}</div></div>
            <div className="lcell"><div className="l-w">{last?`${last.w}×${last.r}`:"—"}</div><div className="l-m">last wk</div></div>
            <div className="scell sgst"><div className="s-w">{sug}</div><div className="s-l">auto</div></div>
            {entry.sets.map((s,i)=><SetCell key={i} set={s} onChange={patch=>writeSet(x,i,patch)} onToggle={()=>writeSet(x,i,{done:!s.done})}/>)}
            {pad.map((_,i)=><div key={"p"+i} style={{background:"#1A1A1D",opacity:.35}}/>)}
            <div className="actc"><button className="actb" title="Remove" onClick={()=>onRemoveEx(day.id,x.exId)}>✕</button></div>
          </div>
          {entry.note&&<div className="rnote"><span className="rnote-l">Note</span><span>{entry.note}</span></div>}
        </div>);})}
        <div className="addex"><button className="addexb" onClick={()=>setPicker(true)}>+ Add Exercise</button><span style={{marginLeft:"auto",fontSize:10,color:"#807E76",letterSpacing:".06em",textTransform:"uppercase"}}>{dl?"Deload — hold loads light":"Auto = last top set + 2.5%"}</span></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"flex-end"}}><button className="btn sec" onClick={()=>{day.ex.forEach(x=>{const e=getEntry(x);onLog(`w${week}|${day.id}|${x.exId}`,{...e,sets:e.sets.map(s=>({...s,done:true}))});});}}>✓ Complete All Sets</button></div>
    </div>
    <div className="sheetside">
      {formvids.length>0&&<div className="rail"><div className="rail-t"><span>🎥 Form Reviews</span><span className="mono" style={{color:formvids.some(v=>v.status!=="reviewed")?"#FFB23A":"#3AE07A"}}>{formvids.filter(v=>v.status!=="reviewed").length} pending</span></div>{formvids.map(v=><FormReviewCoach key={v.id} v={v} url={vidUrls[v.id]} onReview={fb=>onReviewVid(v.id,fb)}/>)}</div>}
      <div className="rail"><div className="rail-t"><span>7 Pillars · Today</span><span className="mono" style={{color:pillarsDoneToday===7?"#3AE07A":"#807E76"}}>{pillarsDoneToday}/7</span></div><div className="rcard" style={{padding:"9px 11px"}}>{PILLARS.map(p=>{const on=client.hab&&client.hab[p.id];const st=(client.streak&&client.streak[p.id])||0;return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",fontSize:11.5}}><span style={{width:8,height:8,borderRadius:"50%",background:on?p.color:"#2A2A2F",flexShrink:0}}/><span style={{flex:1,color:on?"#F5F4F0":"#807E76"}}>{p.icon} {p.name}</span>{st>0&&<span style={{fontSize:10,color:"#807E76"}}>🔥{st}d</span>}</div>);})}</div></div>
      <div className="rail"><div className="rail-t"><span>Weekly Volume</span><span className="mono" style={{color:"#3AE07A"}}>{weekVol.length?weekVol[weekVol.length-1]:0}k</span></div><div className="rcard"><Spark data={weekVol.length>1?weekVol:[0,0]} h={64}/></div></div>
      {e1series.length>0&&<div className="rail"><div className="rail-t"><span>e1RM Trend</span><span>est.</span></div><div className="rcard">{e1series.map(s=>{const last=s.arr[s.arr.length-1],first=s.arr[0],d=last-first;return(<div key={s.nm} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{fontWeight:600}}>{s.nm}</span><span className="mono">{last}lb{d>0&&<span style={{color:"#3AE07A",marginLeft:4}}>+{d}</span>}</span></div><Spark data={s.arr} color={client.accent} h={26}/></div>);})}</div></div>}
      <div className="rail"><div className="rail-t"><span>Volume by Muscle</span><span>sets · wk</span></div><div className="rcard">{vbm.map(([g,n])=>(<div className="vrow" key={g}><div className="vrow-l">{g}</div><div className="vtr"><div className="vfl" style={{width:(n/maxVbm*100)+"%"}}/></div><div className="vval">{n}</div></div>))}</div></div>
      <div className="rail"><div className="rail-t"><span>Coach ↔ Athlete</span><span style={{color:"#807E76"}}>{cNotes.length}</span></div>
        <textarea className="ninp" rows={2} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Message / note to athlete…"/>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:6,marginBottom:8}}><button className="btn sm" onClick={()=>{if(noteText.trim()){onAddNote(client.id,noteText.trim());setNoteText("");}}}>Send</button></div>
        {cNotes.map((n,i)=>(<div key={i} className="note" style={n.from==="client"?{borderLeftColor:client.accent,background:client.accent+"12"}:{}}><div className="note-m"><span>{n.author}{n.from==="client"?" · athlete":""}</span><span>{n.date}</span></div>{n.text}</div>))}
      </div>
    </div>
    {picker&&<ExercisePicker onPick={e=>{onAddEx(day.id,e.id);setPicker(false);}} onClose={()=>setPicker(false)}/>}
  </div>);
}
