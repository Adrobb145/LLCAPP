// athlete/WeeklyRecap.jsx — end-of-week recap modal + AI coach's-take
import { useState } from "react";
import { D } from "../theme/tokens";
import { askClaude } from "../lib/ai";

export default function WeeklyRecap({client,program,clogs,bodylog,misses,stats,cw,onSend,onClose}){
  const [ai,setAi]=useState("");const [busy,setBusy]=useState(false);
  const sched=program?program.days.length:0;
  let loggedN=0,setsDone=0,rpeSum=0,rpeN=0,vol=0;
  if(program)program.days.forEach(d=>{const done=d.ex.every(x=>{const e=clogs[`w${cw}|${d.id}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});if(done)loggedN++;d.ex.forEach(x=>{const e=clogs[`w${cw}|${d.id}|${x.exId}`];if(e)e.sets.forEach(s=>{if(s.done){setsDone++;vol+=(Number(s.w)||0)*(Number(s.r)||0);if(s.rpe){rpeSum+=s.rpe;rpeN++;}}});});});
  const avgRpe=rpeN?(rpeSum/rpeN).toFixed(1):null;
  const bwDelta=bodylog.length>1?Math.round((bodylog[bodylog.length-1].w-bodylog[bodylog.length-2].w)*10)/10:0;
  const missW=misses.filter(m=>m.week===cw);
  const prCount=Object.keys(stats.prs).length;
  const adh=sched?Math.round(loggedN/sched*100):0;
  const grade=adh>=100&&stats.pillarToday>=5?"Dialed in 🔥":adh>=66?"Solid week":adh>=33?"Patchy — tighten up":"Rough week — reset";
  const summary=`📈 ${client.name.split(" ")[0]}'s week — Sessions ${loggedN}/${sched}, ${setsDone} sets, avg RPE ${avgRpe||"—"}, ${(vol/1000).toFixed(1)}k lb. Pillars ${stats.pillarToday}/7, best streak ${stats.maxStreak}d. ${prCount?prCount+" standing PR"+(prCount>1?"s":"")+". ":""}${bwDelta?"BW "+(bwDelta>0?"+":"")+bwDelta+"lb. ":""}${missW.length?missW.length+" missed.":"No missed sessions."}`;
  const askAI=async()=>{setBusy(true);try{const prompt=`You are Coach Adam at Live Long Collective — a faith-informed strength coach, kind but direct "real talk", never preachy. Write a 2-3 sentence weekly recap message to your athlete ${client.name.split(" ")[0]} (goal: ${client.goal}). Data: sessions ${loggedN}/${sched}, avg RPE ${avgRpe||"n/a"}, pillars ${stats.pillarToday}/7, best streak ${stats.maxStreak} days, ${prCount} standing PRs, missed ${missW.length}. Name one specific win and one specific ask for next week. Return ONLY the message.`;const txt=await askClaude(prompt);setAi(txt||"Keep stacking the work.");}catch(e){setAi("Couldn't reach the AI right now — try again.");}setBusy(false);};
  const St=({l,v,c})=>(<div style={{background:D.lift,border:`1px solid ${D.line}`,borderRadius:9,padding:"10px 12px",flex:1,minWidth:0}}><div style={{fontSize:8.5,color:D.sub,letterSpacing:".08em",textTransform:"uppercase",fontWeight:700}}>{l}</div><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:19,color:c||D.ink,lineHeight:1.1,marginTop:2}}>{v}</div></div>);
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:60}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:D.card,borderTop:"3px solid #3AE0FF",borderRadius:"16px 16px 0 0",padding:18,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:18}}>YOUR WEEK</div><span onClick={onClose} style={{color:D.sub,fontSize:18,cursor:"pointer"}}>✕</span></div>
      <div style={{fontSize:11,color:"#3AE0FF",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginBottom:13}}>{grade}</div>
      <div style={{display:"flex",gap:7,marginBottom:7}}><St l="Sessions" v={`${loggedN}/${sched}`} c={loggedN>=sched&&sched>0?D.good:D.ink}/><St l="Avg RPE" v={avgRpe||"—"}/><St l="Volume" v={`${(vol/1000).toFixed(1)}k`}/></div>
      <div style={{display:"flex",gap:7,marginBottom:13}}><St l="Pillars" v={`${stats.pillarToday}/7`}/><St l="Best Streak" v={`${stats.maxStreak}d`} c={D.acc}/><St l="BW Δ" v={`${bwDelta>0?"+":""}${bwDelta}`} c={bwDelta<0?"#3AE0FF":D.ink}/></div>
      {prCount>0&&<div style={{background:D.lift,border:`1px solid ${D.line}`,borderRadius:9,padding:11,marginBottom:9}}><div style={{fontSize:9,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>🏆 Standing PRs</div>{Object.entries(stats.prs).map(([nm,p])=>(<div key={nm} style={{display:"flex",justifyContent:"space-between",fontSize:11.5,padding:"2px 0"}}><span>{nm}</span><span className="mono" style={{color:D.acc}}>{p.e} lb</span></div>))}</div>}
      {missW.length>0&&<div style={{background:"#FF4D4D11",border:"1px solid #FF4D4D33",borderRadius:9,padding:11,marginBottom:9,fontSize:11.5,color:D.ink}}>Missed {missW.length}: {missW.map(m=>`${m.dayName} (${m.reason})`).join(", ")}. Next week we close the gap.</div>}
      {ai&&<div style={{background:"#A78BFA15",border:"1px solid #A78BFA44",borderRadius:9,padding:11,marginBottom:9,fontSize:12.5,lineHeight:1.5}}>🤖 {ai}</div>}
      <div style={{display:"flex",gap:7,marginTop:4}}>
        <button onClick={askAI} disabled={busy} style={{flex:1,background:D.lift,border:`1px solid ${D.line}`,color:D.ink,borderRadius:8,padding:11,fontWeight:700,fontSize:11.5,cursor:"pointer",opacity:busy?.6:1}}>{busy?"⏳ Thinking…":"🤖 Coach's take"}</button>
        <button onClick={()=>{onSend(summary);onClose();}} style={{flex:1.4,background:"#3AE0FF",color:"#0B0B0C",border:0,borderRadius:8,padding:11,fontWeight:800,fontSize:11.5,cursor:"pointer"}}>Send to coach →</button>
      </div>
    </div>
  </div>);
}
