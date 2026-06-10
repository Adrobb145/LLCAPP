// coach/CoachInsights.jsx — AI risk-ranked coach intelligence (TrendStrip kept inline)
import { useState, useMemo } from "react";
import { D } from "../theme/tokens";
import { analyze } from "../lib/analytics";
import Spark from "../shared/Spark";
import CheckinForm from "./CheckinForm";
import { askClaude } from "../lib/ai";

export default function CoachInsights({clients,programs,logs,checkins,readiness={},onOpen,onAddCheckin}){
  const [briefs,setBriefs]=useState({});
  const [loading,setLoading]=useState({});
  const [addr,setAddr]=useState({});
  const [ciOpen,setCiOpen]=useState(null);
  const analyzed=useMemo(()=>clients.map(c=>({c,a:analyze(c,programs,logs,checkins)})).sort((x,y)=>y.a.score-x.a.score),[clients,programs,logs,checkins]);
  const flagged=analyzed.filter(x=>x.a.score>=14&&!addr[x.c.id]);
  const ok=analyzed.filter(x=>x.a.score<14||addr[x.c.id]);
  const ct=t=>analyzed.filter(x=>x.a.tier===t).length;
  const today=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const gen=async(c,a)=>{
    setLoading(p=>({...p,[c.id]:true}));
    try{
      const prompt=`You are an elite, faith-informed strength coach assistant at Live Long Collective. In 2-3 tight, specific sentences, brief the coach before they reach out to this athlete. Warm, direct, action-oriented — name the likely cause and a concrete next move.\n\nAthlete: ${c.name}. Goal: ${c.goal}. Block: ${c.block}, week ${c.currentWeek}. Adherence ${Math.round((c.adherence||0)*100)}%.\nRisk: ${a.label} (${a.score}). Signals: ${a.signals.map(s=>s[1]).join("; ")}. Sessions this week: ${a.loggedN}/${a.dayN}. Pillars today: ${a.pillars}/7. Best streak: ${a.maxStreak}.\n\nReturn ONLY the brief text, no preamble.`;
      const txt=await askClaude(prompt);
      setBriefs(p=>({...p,[c.id]:txt||"No brief returned."}));
    }catch(e){setBriefs(p=>({...p,[c.id]:"Couldn't reach the AI — try again."}));}
    setLoading(p=>({...p,[c.id]:false}));
  };
  const TrendStrip=({c})=>{const ci=checkins[c.id]||[];const wb=ci.map(e=>Math.round(((e.energy+e.sleep+(11-e.stress)+e.nutrition+e.mood)/5)*10)/10);const rd=readiness[c.id]||[];const lr=rd[rd.length-1];if(wb.length<2&&!lr)return null;return(<div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
    {wb.length>=2&&<div style={{flex:"1 1 150px",background:D.lift,border:`1px solid ${D.line}`,borderRadius:7,padding:"7px 10px"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:8.5,color:D.sub,letterSpacing:".08em",textTransform:"uppercase",fontWeight:700,marginBottom:3}}><span>Wellbeing trend</span><span className="mono" style={{color:wb[wb.length-1]>=6.5?D.good:"#FFB23A"}}>{wb[wb.length-1]}/10</span></div><Spark data={wb} color={wb[wb.length-1]>=6.5?"#3AE07A":"#FFB23A"} h={26}/></div>}
    {lr&&<div style={{flex:"1 1 150px",background:D.lift,border:`1px solid ${D.line}`,borderRadius:7,padding:"7px 10px"}}><div style={{fontSize:8.5,color:D.sub,letterSpacing:".08em",textTransform:"uppercase",fontWeight:700,marginBottom:5}}>Last readiness</div><div style={{display:"flex",gap:11,fontSize:11.5,fontFamily:"'JetBrains Mono',monospace"}}><span style={{color:lr.sleep<=4?"#FF4D4D":D.ink}}>😴 {lr.sleep}</span><span style={{color:lr.energy<=3?"#FF4D4D":D.ink}}>⚡ {lr.energy}</span><span style={{color:lr.soreness>=8?"#FF4D4D":D.ink}}>💢 {lr.soreness}</span></div></div>}
  </div>);};
  return(<div className="roster">
    <div className="rhead"><div><div className="kick" style={{marginBottom:8}}>AI · Coach Intelligence</div><div className="rtitle">Insights</div><div className="rsub">Risk-ranked from training, pillars, adherence, check-ins & readiness · {flagged.length} need attention</div></div></div>
    <div className="rstats">{[["HIGH","#FF4D4D",ct("high")],["MEDIUM","#FFB23A",ct("med")],["WATCH","#3AE0FF",ct("watch")],["ON TRACK","#3AE07A",ct("ok")]].map(([l,col,n])=>(<div key={l} className="stat" style={{borderColor:col+"33"}}><div className="stat-l">{l}</div><div className="stat-v" style={{color:col}}>{n}</div></div>))}</div>
    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
      {flagged.length===0&&<div style={{color:D.good,fontSize:13,padding:14}}>✓ Everyone's on track right now.</div>}
      {flagged.map(({c,a})=>(<div key={c.id} style={{background:D.card,border:`1px solid ${a.color}44`,borderLeft:`4px solid ${a.color}`,borderRadius:9,padding:14}}>
        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:9}}>
          <span onClick={()=>onOpen(c.id)} style={{width:38,height:38,borderRadius:6,background:c.accent+"22",color:c.accent,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Archivo Black',sans-serif",fontSize:13,cursor:"pointer"}}>{c.initials}</span>
          <div style={{flex:1,cursor:"pointer"}} onClick={()=>onOpen(c.id)}><div style={{fontWeight:600,fontSize:14}}>{c.name}</div><div style={{fontSize:10.5,color:D.sub}}>{c.goal} · {c.block} W{c.currentWeek}</div></div>
          <span className="pill" style={{background:a.color+"22",color:a.color}}>{a.label} · {a.score}</span>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{a.signals.map((s,i)=>(<span key={i} style={{fontSize:10.5,color:D.ink,background:D.lift,border:`1px solid ${D.line}`,borderRadius:4,padding:"3px 8px"}}>{s[0]} {s[1]}</span>))}</div>
        <TrendStrip c={c}/>
        {briefs[c.id]&&<div style={{background:"#A78BFA15",border:"1px solid #A78BFA44",borderRadius:7,padding:"9px 11px",marginBottom:10,fontSize:12,lineHeight:1.5,color:D.ink}}>🤖 {briefs[c.id]}</div>}
        {ciOpen===c.id&&<CheckinForm onSave={v=>{onAddCheckin(c.id,{date:today,...v});setCiOpen(null);}} onClose={()=>setCiOpen(null)}/>}
        <div style={{display:"flex",gap:7}}>
          <button className="btn sec sm" disabled={loading[c.id]} onClick={()=>gen(c,a)} style={{flex:1,opacity:loading[c.id]?.6:1}}>{loading[c.id]?"⏳ Thinking…":"🤖 AI Brief"}</button>
          <button className="btn sec sm" onClick={()=>setCiOpen(ciOpen===c.id?null:c.id)} style={{flex:1}}>📋 Check-in</button>
          <button className="btn sm" onClick={()=>setAddr(p=>({...p,[c.id]:true}))} style={{flex:1,background:D.good,color:"#0B0B0C"}}>✓ Addressed</button>
        </div>
      </div>))}
    </div>
    {ok.length>0&&<div><div className="rail-t" style={{marginBottom:10}}><span>On Track ({ok.length})</span></div><div style={{display:"flex",flexWrap:"wrap",gap:7}}>{ok.map(({c})=>(<div key={c.id} onClick={()=>onOpen(c.id)} style={{display:"flex",alignItems:"center",gap:7,background:D.card,border:`1px solid ${D.line}`,borderRadius:18,padding:"4px 12px 4px 4px",cursor:"pointer"}}><span style={{width:24,height:24,borderRadius:"50%",background:c.accent+"22",color:c.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800}}>{c.initials}</span><span style={{fontSize:11.5}}>{c.name.split(" ")[0]}</span>{addr[c.id]&&<span style={{fontSize:9,color:D.good}}>✓</span>}</div>))}</div></div>}
  </div>);
}
