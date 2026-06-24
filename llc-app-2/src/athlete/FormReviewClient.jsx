// athlete/FormReviewClient.jsx — athlete films & uploads a movement clip to the coach
import { useState } from "react";
import { MAINLIFTS } from "../constants/gamification";
import { D } from "../theme/tokens";
import * as db from "../lib/db";
import ClipVideo from "../shared/ClipVideo";

export default function FormReviewClient({formvids,vidUrls,onSubmit,onDelete,clientId}){
  const [lift,setLift]=useState(MAINLIFTS[0]);
  const [pending,setPending]=useState(null);
  const [busy,setBusy]=useState(false);
  const pick=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;setPending({url:URL.createObjectURL(f),name:f.name,file:f});};
  const send=async()=>{
    if(!pending||busy)return;
    setBusy(true);
    const id="fv"+Date.now();
    try{
      const path=await db.uploadFormVideo(clientId,id,pending.file);
      onSubmit({id,label:lift,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),status:"pending",feedback:"",path},pending.url);
      setPending(null);
    }catch(e){alert("Upload failed — "+(e.message||e)+".\nTry a shorter clip (keep it under ~50MB).");}
    setBusy(false);
  };
  return(<div style={{marginTop:18}}>
    <div style={{fontSize:10,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>🎥 Movement Review</div>
    <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13,marginBottom:10}}>
      <div style={{fontSize:12,color:D.sub,lineHeight:1.5,marginBottom:11}}>Film a working set and send it to your coach for a form check. Side-on, full body in frame, one clean set.</div>
      <div style={{display:"flex",gap:7,marginBottom:pending?9:0}}>
        <select value={lift} onChange={e=>setLift(e.target.value)} style={{flex:1,minWidth:0,background:D.lift,border:`1px solid ${D.line}`,color:D.ink,borderRadius:7,padding:"9px 8px",fontSize:12.5,fontFamily:"inherit",outline:"none"}}>{MAINLIFTS.map(l=><option key={l} value={l}>{l}</option>)}<option value="Other lift">Other lift</option></select>
        <label style={{background:pending?D.lift:D.acc,color:pending?D.ink:"#0B0B0C",border:pending?`1px solid ${D.line}`:0,borderRadius:7,padding:"9px 14px",fontWeight:800,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",whiteSpace:"nowrap"}}>{pending?"Re-pick":"📹 Choose clip"}<input type="file" accept="video/*" style={{display:"none"}} onChange={pick}/></label>
      </div>
      {pending&&<div><video src={pending.url} controls playsInline style={{width:"100%",borderRadius:8,maxHeight:260,background:"#000"}}/><button onClick={send} disabled={busy} style={{width:"100%",marginTop:8,background:D.acc,color:"#0B0B0C",border:0,borderRadius:7,padding:11,fontWeight:800,fontFamily:"'Archivo Black',sans-serif",fontSize:12,cursor:busy?"default":"pointer",opacity:busy?.6:1}}>{busy?"UPLOADING…":"SEND TO COACH · +15 XP"}</button></div>}
    </div>
    {formvids.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8}}>{formvids.map(v=>{const reviewed=v.status==="reviewed";return(<div key={v.id} style={{background:D.card,border:`1px solid ${reviewed?D.good+"55":D.line}`,borderLeft:`3px solid ${reviewed?D.good:"#FFB23A"}`,borderRadius:10,padding:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><div><div style={{fontWeight:600,fontSize:13}}>{v.label}</div><div style={{fontSize:10,color:D.sub}}>Sent {v.date}</div></div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:9.5,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",color:reviewed?D.good:"#FFB23A"}}>{reviewed?"✓ Reviewed":"⏳ Pending"}</span>{onDelete&&<button onClick={()=>{if(window.confirm("Delete this clip submission?"+(reviewed?" The coach\u2019s feedback will be removed too.":"")))onDelete(v.id);}} title="Delete" style={{background:"transparent",border:0,color:D.sub,fontSize:14,cursor:"pointer",padding:0,lineHeight:1}}>🗑</button>}</div></div>
      <ClipVideo path={v.path} localUrl={vidUrls[v.id]}/>
      {reviewed&&v.feedback&&<div style={{background:D.good+"12",border:`1px solid ${D.good}33`,borderRadius:8,padding:"9px 11px",marginTop:9}}><div style={{fontSize:9.5,color:D.good,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase"}}>Coach feedback</div><div style={{marginTop:3,fontSize:12.5,lineHeight:1.5}}>{v.feedback}</div></div>}
    </div>);})}</div>}
  </div>);
}
