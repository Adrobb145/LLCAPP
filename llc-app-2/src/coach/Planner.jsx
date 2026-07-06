// coach/Planner.jsx
// Mesocycle Planner — per-week load editor. Columns are weeks, rows are
// exercises grouped by day. Every cell is the editable load for that lift THAT
// week, so week 3 can differ from week 1. Clone / add / remove weeks manage
// block length. Add or remove exercises in Build Day (structure is shared).
import { daysForWeek, weekCount } from "../lib/program";
import { isDeload } from "../lib/training";
import { EXBYID } from "../constants/exercises";
import { modOf } from "../constants/modalities";

export default function Planner({client,program,logs,week,setWeek,onEditWeekEx,onCloneNext,onAddWeek,onRemoveWeek,onAdvanceWeek}){
  const tw=weekCount(program);
  const weeks=Array.from({length:tw},(_,i)=>i+1);
  const colTmpl=`260px repeat(${tw},92px)`;
  const wdata=weeks.map(w=>daysForWeek(program,w,client));
  const struct=wdata[0]||[];
  const exAt=(w,dayId,exId)=>{const dd=(wdata[w-1]||[]).find(d=>d.id===dayId);if(!dd)return null;return dd.ex.find(x=>x.exId===exId)||null;};
  const dayDone=(w,dId)=>{const dd=(wdata[w-1]||[]).find(d=>d.id===dId);return dd&&dd.ex.length&&dd.ex.every(x=>{const e=logs[`w${w}|${dId}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});};
  const cur=week||client.currentWeek||1;

  return(<div className="pl">
    <div className="rhead">
      <div><div className="kick" style={{marginBottom:8}}>Mesocycle Planner</div><div className="rtitle">{client.name.split(" ")[0]}'s Block</div><div className="rsub">{client.block} · {tw} weeks · edit any week's loads directly. Clone a week forward to repeat it.</div></div>
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
      <div className="plr head" style={{gridTemplateColumns:colTmpl}}><div>Exercise · sets×reps</div>{weeks.map(w=><div key={w} className="plcell" data-cur={w===cur} onClick={()=>setWeek&&setWeek(w)} style={{cursor:"pointer"}}>W{w}{isDeload(w,tw)?" · DL":""}</div>)}</div>
      {struct.map(d=>(<div key={d.id}>
        <div className="plr" style={{gridTemplateColumns:colTmpl,background:"#101012"}}><div style={{fontWeight:600,fontSize:11,letterSpacing:".06em",textTransform:"uppercase",color:"#FF6B2C"}}>{d.dow} · {d.name}</div>{weeks.map(w=><div key={w} className="plcell" data-done={dayDone(w,d.id)} style={{fontSize:10}}>{dayDone(w,d.id)?"✓ logged":""}</div>)}</div>
        {d.ex.map((x0,xi)=>{const m=EXBYID[x0.exId];if(!m)return null;return(<div key={x0.exId+xi} className="plr" style={{gridTemplateColumns:colTmpl}}>
          <div style={{flexDirection:"row",alignItems:"center",gap:6}}>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:11.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.n}</div><div style={{fontSize:9,color:"#807E76",display:"flex",alignItems:"center",gap:5}}>{x0.sets}×{x0.reps}{modOf(x0).id!=="straight"&&<span style={{color:modOf(x0).color}}>· {modOf(x0).short}</span>}</div></div>
          </div>
          {weeks.map(w=>{const ex=exAt(w,d.id,x0.exId);const dlw=isDeload(w,tw);const done=(()=>{const e=logs[`w${w}|${d.id}|${x0.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);})();return(<div key={w} className="plcell" data-cur={w===cur} data-done={done}>
            <input className="pbase" style={{width:56,textAlign:"center",...(dlw?{color:"#FF6B2C"}:{})}} type="number" value={ex?ex.load:0} onChange={e=>onEditWeekEx(w,d.id,x0.exId,{load:Number(e.target.value)})} onFocus={e=>e.target.select()} title={`Week ${w} load`}/>
            <div className="plsub">{x0.sets}×{ex?ex.reps:x0.reps}{dlw?" DL":""}</div>
          </div>);})}
        </div>);})}
      </div>))}
    </div>
    <div className="rsub" style={{marginTop:10,fontSize:10.5}}>Add or remove exercises in <b>Build Day</b>. Loads here are per-week — change one week without touching the others.</div>
  </div>);
}
