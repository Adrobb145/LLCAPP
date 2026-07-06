// coach/Planner.jsx
// Mesocycle Planner — two modes so a multi-week, multi-day block never becomes
// a wall of inputs:
//   WEEK  (default, edit): one week at a time. Days stacked; each movement a
//         single row (sets/reps/load editable, add/remove per day). A quiet
//         read-only strip under each lift shows its load across every week.
//   MONTH (read-only scan): the whole block as static numbers. Click a week to
//         jump into Week view for it. No inputs — for seeing progression.
// Engine/handlers unchanged; this file is purely presentational.
import { useState } from "react";
import { daysForWeek, weekCount } from "../lib/program";
import { isDeload } from "../lib/training";
import { EXBYID } from "../constants/exercises";
import { modOf } from "../constants/modalities";
import ExercisePicker from "../shared/ExercisePicker";
import { D } from "../theme/tokens";

export default function Planner({client,program,logs,week,setWeek,onEditWeekEx,onAddExW,onRemoveExW,onCloneNext,onAddWeek,onRemoveWeek,onAdvanceWeek}){
  const [mode,setMode]=useState("week");
  const [picker,setPicker]=useState(null);
  const tw=weekCount(program);
  const weeks=Array.from({length:tw},(_,i)=>i+1);
  const wdata=weeks.map(w=>daysForWeek(program,w,client));
  const sw=Math.max(1,Math.min(tw,week||client.currentWeek||1));
  const dayAt=(w,dayId)=>(wdata[w-1]||[]).find(d=>d.id===dayId);
  const exAt=(w,dayId,exId)=>{const dd=dayAt(w,dayId);return dd?dd.ex.find(x=>x.exId===exId)||null:null;};
  const struct=wdata[0]||[];
  const unionEx=(dayId)=>{const seen=[];weeks.forEach(w=>{const dd=dayAt(w,dayId);if(dd)dd.ex.forEach(x=>{if(!seen.includes(x.exId))seen.push(x.exId);});});return seen;};
  const swDays=wdata[sw-1]||[];
  const go=w=>{setWeek&&setWeek(Math.max(1,Math.min(tw,w)));};

  const seg=(id,label)=>(<button onClick={()=>setMode(id)} className="mono" style={{padding:"5px 12px",fontSize:11,fontWeight:700,letterSpacing:".04em",border:`1px solid ${mode===id?D.acc:D.line}`,background:mode===id?D.acc:"transparent",color:mode===id?"#111":D.sub,borderRadius:6,cursor:"pointer"}}>{label}</button>);

  const numIn=(val,on)=>({width:on?46:44,textAlign:"center",background:D.lift,border:`1px solid ${D.line}`,color:D.ink,borderRadius:6,padding:"5px 2px",fontSize:12,fontFamily:"'Roboto Mono',monospace"});

  return(<div className="pl">
    <div className="rhead" style={{alignItems:"flex-start"}}>
      <div><div className="kick" style={{marginBottom:8}}>Mesocycle Planner</div><div className="rtitle">{client.name.split(" ")[0]}'s Block</div><div className="rsub">{client.block} · {tw} weeks · {mode==="week"?"editing one week at a time — the strip under each lift shows the whole block.":"read-only overview — tap a week to edit it."}</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"flex-end"}}>
        <div style={{display:"flex",gap:6}}>{seg("week","✎ Week")}{seg("month","▦ Month")}</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          <span style={{fontSize:10,color:D.sub}}>Athlete on <b style={{color:D.ink}}>W{client.currentWeek}</b></span>
          <button className="btn sec sm" disabled={client.currentWeek<=1} style={{opacity:client.currentWeek<=1?.4:1}} onClick={()=>onAdvanceWeek(-1)}>◀</button>
          <button className="btn sec sm" disabled={client.currentWeek>=tw} style={{opacity:client.currentWeek>=tw?.4:1}} onClick={()=>onAdvanceWeek(1)}>▶</button>
          <span style={{width:1,height:20,background:D.line}}/>
          <button className="btn sec sm" disabled={sw>=tw} style={{opacity:sw>=tw?.4:1}} onClick={()=>onCloneNext(sw)} title={`Copy Week ${sw} onto Week ${Math.min(tw,sw+1)}`}>Clone → W{Math.min(tw,sw+1)}</button>
          <button className="btn sec sm" disabled={tw<=1} style={{opacity:tw<=1?.4:1}} onClick={()=>onRemoveWeek(sw)}>− Wk</button>
          <button className="btn sm" onClick={()=>onAddWeek()}>+ Wk</button>
        </div>
      </div>
    </div>

    {mode==="week"?(<>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>{weeks.map(w=>{const on=w===sw,dl=isDeload(w,tw);return(<button key={w} onClick={()=>go(w)} className="mono" style={{padding:"6px 12px",fontSize:12,fontWeight:700,borderRadius:8,cursor:"pointer",border:`1px solid ${on?D.acc:D.line}`,background:on?D.acc:D.card,color:on?"#111":dl?D.acc:D.ink}}>W{w}{dl?" · DL":""}</button>);})}</div>

      {swDays.length===0&&<div style={{color:D.sub,fontSize:13,padding:14}}>No training days yet — add them in Build Day.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {swDays.map(d=>(<div key={d.id} style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:`1px solid ${D.line}`,background:D.lift}}>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase",color:D.acc}}>{d.dow} · {d.name}</div>
            <button className="addexb" style={{padding:"3px 10px",fontSize:10}} onClick={()=>setPicker({dayId:d.id,week:sw})}>+ Movement</button>
          </div>
          {d.ex.length===0&&<div style={{padding:"12px 14px",fontSize:11,color:D.sub}}>No movements this week. Add one, or clone another week onto this one.</div>}
          {d.ex.map(x=>{const m=EXBYID[x.exId];if(!m)return null;const md=modOf(x);return(<div key={x.exId} style={{padding:"10px 14px",borderBottom:`1px solid ${D.line}22`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:"1 1 150px",minWidth:120}}><div style={{fontSize:13,fontWeight:600}}>{m.n}</div>{md.id!=="straight"&&<div style={{fontSize:9.5,color:md.color,fontWeight:600,marginTop:1}}>{md.short}</div>}</div>
              <label style={{fontSize:9,color:D.sub,textTransform:"uppercase",letterSpacing:".06em",fontWeight:700}}>Sets<input type="number" style={{...numIn(x.sets),display:"block",marginTop:3}} value={x.sets} onFocus={e=>e.target.select()} onChange={e=>onEditWeekEx(sw,d.id,x.exId,{sets:Number(e.target.value)})}/></label>
              <label style={{fontSize:9,color:D.sub,textTransform:"uppercase",letterSpacing:".06em",fontWeight:700}}>Reps<input type="number" style={{...numIn(x.reps),display:"block",marginTop:3}} value={x.reps} onFocus={e=>e.target.select()} onChange={e=>onEditWeekEx(sw,d.id,x.exId,{reps:Number(e.target.value)})}/></label>
              <label style={{fontSize:9,color:D.sub,textTransform:"uppercase",letterSpacing:".06em",fontWeight:700}}>Load<input type="number" step={5} style={{...numIn(x.load,true),display:"block",marginTop:3,fontWeight:700}} value={x.load} onFocus={e=>e.target.select()} onChange={e=>onEditWeekEx(sw,d.id,x.exId,{load:Number(e.target.value)})}/></label>
              <button className="actb" style={{fontSize:13}} title="Remove from this week" onClick={()=>onRemoveExW(sw,d.id,x.exId)}>✕</button>
            </div>
            <div style={{display:"flex",gap:3,alignItems:"center",marginTop:7,flexWrap:"wrap"}}><span style={{fontSize:8.5,color:D.sub,textTransform:"uppercase",letterSpacing:".06em",marginRight:2}}>block</span>{weeks.map(w=>{const e=exAt(w,d.id,x.exId);const on=w===sw,dl=isDeload(w,tw);return(<span key={w} onClick={()=>go(w)} title={`Week ${w}`} style={{cursor:"pointer",fontSize:9.5,fontFamily:"'Roboto Mono',monospace",padding:"1px 5px",borderRadius:4,border:`1px solid ${on?D.acc:"transparent"}`,background:on?D.acc+"22":"transparent",color:on?D.acc:e?(dl?D.acc:D.sub):"#3A3A3F",fontWeight:on?700:400}}>{e?e.load:"·"}</span>);})}</div>
          </div>);})}
        </div>))}
      </div>
    </>):(
      <div className="plgrid" style={{overflowX:"auto"}}>
        <div className="plr head" style={{gridTemplateColumns:`210px repeat(${tw},58px)`}}><div>Day · Movement</div>{weeks.map(w=><div key={w} className="plcell" data-cur={w===sw} onClick={()=>{go(w);setMode("week");}} style={{cursor:"pointer"}}>W{w}{isDeload(w,tw)?" DL":""}</div>)}</div>
        {struct.map(d=>{const union=unionEx(d.id);return(<div key={d.id}>
          <div className="plr" style={{gridTemplateColumns:`210px repeat(${tw},58px)`,background:"#101012"}}><div style={{fontWeight:600,fontSize:10.5,letterSpacing:".05em",textTransform:"uppercase",color:D.acc,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.dow} · {d.name}</div>{weeks.map(w=><div key={w} className="plcell"/>)}</div>
          {union.map((exId,xi)=>{const m=EXBYID[exId];if(!m)return null;return(<div key={exId+xi} className="plr" style={{gridTemplateColumns:`210px repeat(${tw},58px)`}}>
            <div style={{fontSize:11.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.n}</div>
            {weeks.map(w=>{const e=exAt(w,d.id,exId);const dl=isDeload(w,tw);return(<div key={w} className="plcell" data-cur={w===sw} onClick={()=>{go(w);setMode("week");}} style={{cursor:"pointer"}}>{e?<><div className="plw" style={dl?{color:D.acc}:{}}>{e.load}</div><div className="plsub">{e.sets}×{e.reps}</div></>:<div style={{color:"#3A3A3F"}}>·</div>}</div>);})}
          </div>);})}
        </div>);})}
      </div>
    )}
    {picker&&<ExercisePicker allowCustom onPick={e=>{onAddExW(picker.week,picker.dayId,e.id);setPicker(null);}} onClose={()=>setPicker(null)}/>}
  </div>);
}
