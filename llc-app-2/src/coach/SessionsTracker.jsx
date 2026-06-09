// coach/SessionsTracker.jsx — biweekly session log + coach pay (Row kept inline)
import { useState } from "react";
import Avatar from "../shared/Avatar";

export default function SessionsTracker({clients,coaches,attendance,authCoach,onAddSession,onToggleAttended,onRemoveSession}){
  const STYPES=[["1-on-1",100],["PT 45",65],["Small Group",150],["Class",30],["Program",0]];
  const UNCLI="_uncli";
  const ANCHOR="2026-05-22";
  const [pStart,setPStart]=useState(()=>{const a=new Date(ANCHOR+"T00:00:00");const t=new Date();t.setHours(0,0,0,0);const diff=Math.floor((t-a)/(14*864e5));const s=new Date(a);s.setDate(a.getDate()+diff*14);return s.toISOString().split("T")[0];});
  const [allC,setAllC]=useState(false);
  const [f,setF]=useState({cid:"",type:"1-on-1",rate:100,date:new Date().toISOString().split("T")[0]});
  const ps=new Date(pStart+"T00:00:00");const pe=new Date(ps);pe.setDate(ps.getDate()+13);
  const fmt=d=>d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const shift=n=>{const d=new Date(ps);d.setDate(ps.getDate()+n*14);setPStart(d.toISOString().split("T")[0]);};
  const inP=ds=>{const d=new Date(ds+"T00:00:00");return d>=ps&&d<=pe;};
  const coachOf=id=>coaches.find(c=>c.id===id);
  const shown=allC?clients:clients.filter(c=>c.coachId===authCoach.id);
  const rows=shown.map(c=>{const ss=(attendance[c.id]||[]).filter(s=>inP(s.date)&&s.type!=="Program").sort((a,b)=>a.date<b.date?1:-1);const att=ss.filter(s=>s.attended);const pay=att.reduce((a,s)=>a+(Number(s.rate)||0),0);return{c,ss,att,pay};});
  const uncli=(attendance[UNCLI]||[]).filter(s=>inP(s.date)&&s.type!=="Program"&&(allC||s.coachId===authCoach.id)).sort((a,b)=>a.date<b.date?1:-1);
  const uncliAtt=uncli.filter(s=>s.attended);
  const uncliPay=uncliAtt.reduce((a,s)=>a+(Number(s.rate)||0),0);
  const totAtt=rows.reduce((a,r)=>a+r.att.length,0)+uncliAtt.length;
  const totPay=rows.reduce((a,r)=>a+r.pay,0)+uncliPay;
  const byType={};[...rows.flatMap(r=>r.att),...uncliAtt].forEach(s=>{if(!byType[s.type])byType[s.type]={count:0,pay:0};byType[s.type].count++;byType[s.type].pay+=Number(s.rate)||0;});
  const typeRows=Object.entries(byType).sort((a,b)=>b[1].pay-a[1].pay);
  const logSession=()=>{const s={id:"sa"+Date.now(),date:f.date,type:f.type,rate:Number(f.rate)||0,attended:true};if(f.cid){onAddSession(f.cid,s);}else{onAddSession(UNCLI,{...s,coachId:authCoach.id});}setF({...f,cid:""});};
  const Row=({s,cid})=>(<div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",background:"#1A1A1D",borderRadius:5,marginBottom:4,opacity:s.attended?1:.5}}>
    <button onClick={()=>onToggleAttended(cid,s.id)} title="Toggle attended" style={{width:18,height:18,borderRadius:4,border:`1px solid ${s.attended?"#3AE07A":"#36363C"}`,background:s.attended?"#3AE07A":"transparent",color:"#0B0B0C",cursor:"pointer",fontSize:11,lineHeight:1,flexShrink:0}}>{s.attended?"✓":""}</button>
    <span style={{fontSize:11.5,flex:1}}>{s.type}{s.type==="Program"?" · self-logged":""}{cid===UNCLI&&allC&&s.coachId?` · ${coachOf(s.coachId)?.initials||"?"}`:""}</span>
    <span style={{fontSize:10.5,color:"#807E76",fontFamily:"'JetBrains Mono',monospace"}}>{new Date(s.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",width:46,textAlign:"right"}}>${s.rate}</span>
    <button className="actb" onClick={()=>onRemoveSession(cid,s.id)}>✕</button>
  </div>);
  return(<div className="roster">
    <div className="rhead"><div><div className="kick" style={{marginBottom:8}}>Coach Pay</div><div className="rtitle">Sessions · Biweekly</div><div className="rsub">{fmt(ps)} – {fmt(pe)} · pay = sum of attended session rates</div></div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}><button className="btn sec sm" onClick={()=>shift(-1)}>← Prev</button><button className="btn sec sm" onClick={()=>shift(1)}>Next →</button></div>
    </div>
    <div className="rstats" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
      <div className="stat"><div className="stat-l">Sessions Attended</div><div className="stat-v">{totAtt}</div></div>
      <div className="stat"><div className="stat-l">Coach Pay</div><div className="stat-v" style={{color:"#3AE07A"}}>${Math.round(totPay).toLocaleString()}</div></div>
      <div className="stat"><div className="stat-l">Active Clients</div><div className="stat-v">{rows.filter(r=>r.att.length).length}</div></div>
    </div>
    {typeRows.length>0&&<div style={{marginBottom:16}}>
      <div className="libfl" style={{marginBottom:8}}>Pay by Session Type</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{typeRows.map(([t,v])=>(<div key={t} style={{background:"#131315",border:"1px solid #2A2A2F",borderRadius:6,padding:"9px 13px",display:"flex",flexDirection:"column",gap:3,minWidth:120}}><div style={{fontSize:11.5,color:"#B5B3AB"}}><span style={{fontFamily:"'Archivo Black',sans-serif",fontSize:16,color:"#F5F4F0",marginRight:6}}>{v.count}</span>{t}</div><div style={{fontSize:13,color:"#3AE07A",fontFamily:"'JetBrains Mono',monospace"}}>${Math.round(v.pay).toLocaleString()}</div></div>))}</div>
    </div>}
    <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap",background:"#131315",border:"1px solid #2A2A2F",borderRadius:6,padding:"12px 14px",marginBottom:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Client</span><select className="sel" value={f.cid} onChange={e=>setF({...f,cid:e.target.value})}><option value="">— None / Class —</option>{shown.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Type</span><select className="sel" value={f.type} onChange={e=>{const r=STYPES.find(t=>t[0]===e.target.value);setF({...f,type:e.target.value,rate:r?r[1]:0});}}>{STYPES.map(t=><option key={t[0]} value={t[0]}>{t[0]} · ${t[1]}</option>)}</select></div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Pay $</span><input className="field" style={{width:78}} type="number" value={f.rate} onChange={e=>setF({...f,rate:Number(e.target.value)})}/></div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}><span className="libfl">Date</span><input className="field" type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
      <button className="btn" onClick={logSession}>＋ Log Session</button>
      <label style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto",fontSize:11,color:"#B5B3AB",cursor:"pointer"}}><input type="checkbox" checked={allC} onChange={e=>setAllC(e.target.checked)} style={{accentColor:"#FF6B2C"}}/>All coaches</label>
    </div>
    {uncli.length>0&&<div style={{background:"#131315",border:"1px solid #2A2A2F",borderRadius:7,padding:"12px 14px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:9}}>
        <span style={{width:32,height:32,borderRadius:6,background:"#FF6B2C22",color:"#FF6B2C",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>👥</span>
        <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13.5}}>Classes & Unassigned</div><div style={{fontSize:10,color:"#807E76"}}>Group sessions not tied to one client</div></div>
        <div style={{textAlign:"right"}}><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:18,lineHeight:1}}>{uncliAtt.length}<span style={{fontSize:10,color:"#807E76",fontWeight:400}}> sessions</span></div><div style={{fontSize:11,color:"#3AE07A",fontFamily:"'JetBrains Mono',monospace"}}>${Math.round(uncliPay).toLocaleString()} pay</div></div>
      </div>
      {uncli.map(s=><Row key={s.id} s={s} cid={UNCLI}/>)}
    </div>}
    {rows.length===0&&uncli.length===0&&<div style={{color:"#807E76",fontSize:12,padding:14}}>No sessions logged this period. Use the form above — leave Client on "None / Class" to log a class.</div>}
    {rows.map(({c,ss,att,pay})=>(<div key={c.id} style={{background:"#131315",border:"1px solid #2A2A2F",borderRadius:7,padding:"12px 14px",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:ss.length?9:0}}>
        <Avatar txt={c.initials} c={c.accent} size={32}/>
        <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13.5}}>{c.name}</div><div style={{fontSize:10,color:"#807E76"}}>{c.goal}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:18,lineHeight:1}}>{att.length}<span style={{fontSize:10,color:"#807E76",fontWeight:400}}> sessions</span></div><div style={{fontSize:11,color:"#3AE07A",fontFamily:"'JetBrains Mono',monospace"}}>${Math.round(pay).toLocaleString()} pay</div></div>
      </div>
      {ss.map(s=><Row key={s.id} s={s} cid={c.id}/>)}
      {ss.length===0&&<div style={{fontSize:10.5,color:"#54534D",fontStyle:"italic"}}>No sessions this period.</div>}
    </div>))}
  </div>);
}
