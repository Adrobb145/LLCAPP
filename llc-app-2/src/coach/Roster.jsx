// coach/Roster.jsx — client roster with search / filter / sort + delete
import { useState } from "react";
import Avatar from "../shared/Avatar";

export default function Roster({clients,coaches,onOpen,onAddClient,onEdit,onDelete}){
  const [q,setQ]=useState("");const [status,setStatus]=useState("all");const [sort,setSort]=useState("attention");
  const [toDelete,setToDelete]=useState(null);
  const flagged=clients.filter(c=>c.adherence<.8).length;
  const avg=clients.length?Math.round(clients.reduce((a,c)=>a+c.adherence,0)/clients.length*100):0;
  let list=clients.filter(c=>{if(status==="attention"&&c.adherence>=.8)return false;if(status==="ontrack"&&c.adherence<.8)return false;if(q){const s=q.toLowerCase();if(!c.name.toLowerCase().includes(s)&&!c.goal.toLowerCase().includes(s))return false;}return true;});
  list=[...list].sort((a,b)=>{if(sort==="name")return a.name.localeCompare(b.name);if(sort==="adherence")return b.adherence-a.adherence;if(sort==="week")return (b.currentWeek/b.totalWeeks)-(a.currentWeek/a.totalWeeks);return a.adherence-b.adherence;});
  return(<div className="roster">
    <div className="rhead"><div><div className="kick" style={{marginBottom:8}}>Workspace</div><div className="rtitle">Roster</div><div className="rsub">{clients.length} active clients · {coaches.length} coaches</div></div><button className="btn" onClick={onAddClient}>＋ Add Client</button></div>
    <div className="rstats">
      <div className="stat"><div className="stat-l">Active Clients</div><div className="stat-v">{clients.length}</div></div>
      <div className="stat"><div className="stat-l">Avg Adherence</div><div className="stat-v">{avg}<span style={{fontSize:16,color:"#807E76"}}>%</span></div></div>
      <div className="stat"><div className="stat-l">Coaches</div><div className="stat-v">{coaches.length}</div></div>
      <div className="stat"><div className="stat-l">Need Attention</div><div className="stat-v" style={{color:flagged?"#FFB23A":"#F5F4F0"}}>{flagged}</div></div>
    </div>
    <div className="libf">
      <div className="libsrch"><div className="libfl">Search</div><input className="field" value={q} onChange={e=>setQ(e.target.value)} placeholder="Name or goal…"/></div>
      <div className="libfg"><div className="libfl">Status</div><div className="chips"><button className="chip" data-on={status==="all"} onClick={()=>setStatus("all")}>All</button><button className="chip" data-on={status==="attention"} onClick={()=>setStatus("attention")}>Needs attention</button><button className="chip" data-on={status==="ontrack"} onClick={()=>setStatus("ontrack")}>On track</button></div></div>
      <div className="libfg"><div className="libfl">Sort</div><div className="chips"><button className="chip" data-on={sort==="attention"} onClick={()=>setSort("attention")}>Attention</button><button className="chip" data-on={sort==="name"} onClick={()=>setSort("name")}>Name</button><button className="chip" data-on={sort==="adherence"} onClick={()=>setSort("adherence")}>Adherence</button><button className="chip" data-on={sort==="week"} onClick={()=>setSort("week")}>Progress</button></div></div>
    </div>
    <div style={{fontSize:11,color:"#807E76",marginBottom:12}}>{list.length} of {clients.length}</div>
    <div className="cgrid">{list.map(c=>{const co=coaches.find(x=>x.id===c.coachId);return(<div key={c.id} className="ccard" onClick={()=>onOpen(c.id)}><div className="ccard-ac" style={{background:c.accent}}/>
      <div className="cc-head"><Avatar txt={c.initials} c={c.accent} size={36}/><div style={{flex:1,minWidth:0}}><div className="cc-name">{c.name}</div><div className="cc-goal">{c.goal}</div></div>{onEdit&&<button title="Edit info" onClick={e=>{e.stopPropagation();onEdit(c);}} style={{background:"none",border:"1px solid #2A2A2E",borderRadius:6,color:"#807E76",cursor:"pointer",fontSize:12,padding:"3px 7px",lineHeight:1}}>✎</button>}{onDelete&&<button title="Delete athlete" onClick={e=>{e.stopPropagation();setToDelete(c);}} style={{background:"none",border:"1px solid #3A2626",borderRadius:6,color:"#C0584A",cursor:"pointer",fontSize:12,padding:"3px 7px",lineHeight:1,marginLeft:4}}>🗑</button>}</div>
      <div className="cc-block"><span>{c.block}</span><span className="mono" style={{color:"#807E76"}}>W{c.currentWeek}/{c.totalWeeks}</span></div>
      <div className="cc-stats"><div><div className="ccs-l">Adherence</div><div className="ccs-v">{Math.round(c.adherence*100)}<span className="ccs-u">%</span></div><div className="abar"><div className="afill" style={{width:c.adherence*100+"%"}}/></div></div><div><div className="ccs-l">Body Wt</div><div className="ccs-v">{c.bw}<span className="ccs-u">lb</span></div></div><div><div className="ccs-l">Coach</div><div className="ccs-v" style={{fontSize:13,color:co?.accent}}>{co?.initials||"—"}</div></div></div>
    </div>);})}</div>
    {list.length===0&&<div style={{padding:"40px 10px",color:"#807E76",textAlign:"center"}}>No clients yet. Use ＋ Add Client to invite your first athlete.</div>}
    {toDelete&&<RosterDeleteModal client={toDelete} onClose={()=>setToDelete(null)} onConfirm={()=>{onDelete&&onDelete(toDelete.id);setToDelete(null);}}/>}
  </div>);
}

function RosterDeleteModal({client,onClose,onConfirm}){
  const [text,setText]=useState("");
  const target=(client?.name||"").trim();
  const ok=text.trim().toLowerCase()===target.toLowerCase()&&target.length>0;
  return(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,zIndex:1000}}>
    <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:380,background:"#fff",borderRadius:16,padding:22,boxShadow:"0 20px 60px rgba(0,0,0,.35)"}}>
      <div style={{fontSize:22,fontWeight:800,color:"#C01800",marginBottom:6}}>Delete athlete</div>
      <div style={{fontSize:13,color:"#555",marginBottom:14,lineHeight:1.5}}>This permanently removes <b>{target}</b>'s data and login from the server. This cannot be undone.</div>
      <div style={{fontSize:12,color:"#888",marginBottom:6}}>Type <b style={{color:"#111"}}>{target}</b> to confirm.</div>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder={target} autoFocus style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #ddd",fontSize:15,boxSizing:"border-box",outline:"none"}}/>
      <button onClick={()=>{if(ok)onConfirm();}} disabled={!ok} style={{width:"100%",marginTop:12,padding:"12px 16px",borderRadius:10,border:"none",background:"#C01800",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",opacity:ok?1:.5}}>Permanently delete</button>
      <button onClick={onClose} style={{width:"100%",marginTop:8,padding:"10px 16px",borderRadius:10,border:"1px solid #ddd",background:"#fff",color:"#333",fontWeight:600,fontSize:14,cursor:"pointer"}}>Cancel</button>
    </div>
  </div>);
}
