// coach/Planner.jsx
// Mesocycle Planner — the month layout. Columns are weeks, rows are exercises
// grouped by day (the union of movements used across the block). Every week is
// independent: add a movement to just Week 2, remove it from Week 4, set each
// week's load — nothing bleeds into the other weeks. Days themselves (which
// training days exist) are still shared; add/remove DAYS in Build Day.
import { useState } from "react";
import { daysForWeek, weekCount } from "../lib/program";
import { isDeload } from "../lib/training";
import { EXBYID } from "../constants/exercises";
import { modOf } from "../constants/modalities";
import ExercisePicker from "../shared/ExercisePicker";

export default function Planner({client,program,logs,week,setWeek,onEditWeekEx,onAddExW,onRemoveExW,onCloneNext,onAddWeek,onRemoveWeek,onAdvanceWeek}){
  const [picker,setPicker]=useState(null); // {dayId, week}
  const tw=weekCount(program);
  const weeks=Array.from({length:tw},(_,i)=>i+1);
  const colTmpl=`240px repeat(${tw},96px)`;
  const wdata=weeks.map(w=>daysForWeek(program,w,client));
  const struct=wdata[0]||[];
  const dayAt=(w,dayId)=>(wdata[w-1]||[]).find(d=>d.id===dayId);
  const exAt=(w,dayId,exId)=>{const dd=dayAt(w,dayId);return dd?dd.ex.find(x=>x.exId===exId)||null:null;};
  const unionEx=(dayId)=>{const seen=[];weeks.forEach(w=>{const dd=dayAt(w,dayId);if(dd)dd.ex.forEach(x=>{if(!seen.includes(x.exId))seen.push(x.exId);});});return seen;};
  const firstEx=(dayId,exId)=>{for(const w of weeks){const e=exAt(w,dayId,exId);if(e)return e;}return null;};
  const dayDone=(w,dId)=>{const dd=dayAt(w,dId);return dd&&dd.ex.length&&dd.ex.every(x=>{const e=logs[`w${w}|${dId}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});};
  const cur=week||client.currentWeek||1;

  return(<div className="pl">
    <div className="rhead">
      <div><div className="kick" style={{marginBottom:8}}>Mesocycle Planner</div><div className="rtitle">{client.name.split(" ")[0]}'s Block</div><div className="rsub">{client.block} · {tw} weeks · lay out each week independently — movements and loads per week. Clone a week forward to repeat it.</div></div>
      <div style={{display:"flex",gap:16,alignItems:"flex-end",flexWrap:"wrap"}}>
        <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Current Week</span><div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button className="btn sec sm" disabled={cur<=1} style={{opacity:cur<=1?.4:1}} onClick={()=>{onAdvanceWeek(-1);setWeek&&setWeek(Math.max(1,cur-1));}}>◀</button>
          <span className="mono" style={{minWidth:64,textAlign:"center",fontFamily:"'Archivo Black',sans-serif",fontSize:15,color:isDeload(cur,tw)?"#FF6B2C":"#F5F4F0"}}>W{cur}{isDeload(cur,tw)?" · DL":""}</span>
          <button className="btn sm" disabled={cur>=tw} style={{opacity:cur>=tw?.4:1}} onClick={()=>{onAdvanceWeek(1);setWeek&&setWeek(Math.min(tw,cur+1));}}>▶</button>
        </div></div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Repeat</span><div style={{display:"flex",gap:6}}>
          <button className="btn sec sm" disabled={cur>=tw} style={{opacity:cur>=tw?.4:1}} onClick={()=>onCloneNext(cur)} title={`Copy Week ${cur} onto Week ${Math.min(tw,cur+1)}`}>Clone → W{Math.min(tw,cur+1)}</button>
        </div></div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Block Length</span><div style={{display:"flex",gap:6}}>
          <button className="btn sec sm" disabled={tw<=1} style={{opacity:tw<=1?.4:1}} onClick={()=>onRemoveWeek(cur)}>− Week</button>
          <button className="btn sm" onClick={()=>onAddWeek()}>+ Week</button>
        </div></div>
      </div>
    </div>

    <div className="plgrid">
      <div className="plr head" style={{gridTemplateColumns:colTmpl}}><div>Day · Exercise</div>{weeks.map(w=><div key={w} className="plcell" data-cur={w===cur} onClick={()=>setWeek&&setWeek(w)} style={{cursor:"pointer"}}>W{w}{isDeload(w,tw)?" · DL":""}</div>)}</div>
      {struct.map(d=>{const union=unionEx(d.id);return(<div key={d.id}>
        <div className="plr" style={{gridTemplateColumns:colTmpl,background:"#101012"}}>
          <div style={{fontWeight:600,fontSize:11,letterSpacing:".06em",textTransform:"uppercase",color:"#FF6B2C"}}>{d.dow} · {d.name}</div>
          {weeks.map(w=><div key={w} className="plcell" data-done={dayDone(w,d.id)} style={{fontSize:9,display:"flex",flexDirection:"column",gap:2,alignItems:"center"}}>{dayDone(w,d.id)?<span style={{color:"#3AE07A"}}>✓ logged</span>:null}<button className="addexb" style={{padding:"1px 6px",fontSize:9}} title={`Add a movement to Week ${w}`} onClick={()=>setPicker({dayId:d.id,week:w})}>+ ex</button></div>)}
        </div>
        {union.map((exId,xi)=>{const m=EXBYID[exId];if(!m)return null;const fe=firstEx(d.id,exId);return(<div key={exId+xi} className="plr" style={{gridTemplateColumns:colTmpl}}>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:11.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.n}</div><div style={{fontSize:9,color:"#807E76",display:"flex",alignItems:"center",gap:5}}>{fe?`${fe.sets}×${fe.reps}`:""}{fe&&modOf(fe).id!=="straight"&&<span style={{color:modOf(fe).color}}>· {modOf(fe).short}</span>}</div></div>
          {weeks.map(w=>{const ex=exAt(w,d.id,exId);const dlw=isDeload(w,tw);const done=(()=>{const e=logs[`w${w}|${d.id}|${exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);})();
            if(!ex)return(<div key={w} className="plcell" style={{opacity:.55}}><button className="addexb" style={{padding:"2px 7px",fontSize:11}} title={`Add ${m.n} to Week ${w}`} onClick={()=>onAddExW(w,d.id,exId)}>+</button></div>);
            return(<div key={w} className="plcell" data-cur={w===cur} data-done={done}>
              <div style={{display:"flex",alignItems:"center",gap:2,justifyContent:"center"}}>
                <input className="pbase" style={{width:48,textAlign:"center",...(dlw?{color:"#FF6B2C"}:{})}} type="number" value={ex.load} onChange={e=>onEditWeekEx(w,d.id,exId,{load:Number(e.target.value)})} onFocus={e=>e.target.select()} title={`Week ${w} load`}/>
                <button className="actb" style={{fontSize:9,lineHeight:1,padding:"0 2px"}} title={`Remove from Week ${w}`} onClick={()=>onRemoveExW(w,d.id,exId)}>✕</button>
              </div>
              <div className="plsub">{ex.sets}×{ex.reps}{dlw?" DL":""}</div>
            </div>);})}
        </div>);})}
      </div>);})}
    </div>
    <div className="rsub" style={{marginTop:10,fontSize:10.5}}>Each week is independent — <b>+</b> adds a movement to that week only, <b>✕</b> removes it from that week only. To add or remove a whole training DAY, use <b>Build Day</b>.</div>
    {picker&&<ExercisePicker allowCustom onPick={e=>{onAddExW(picker.week,picker.dayId,e.id);setPicker(null);}} onClose={()=>setPicker(null)}/>}
  </div>);
}
