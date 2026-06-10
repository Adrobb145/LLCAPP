// coach/CheckinForm.jsx — quick wellbeing check-in form (coach-entered)
import { useState } from "react";
import { D } from "../theme/tokens";

export default function CheckinForm({onSave,onClose}){
  const [v,setV]=useState({energy:6,sleep:6,stress:5,nutrition:6,mood:6,note:""});
  const F=[["energy","Energy"],["sleep","Sleep"],["stress","Stress (high=bad)"],["nutrition","Nutrition"],["mood","Mood"]];
  return(<div style={{background:D.lift,border:`1px solid ${D.line}`,borderRadius:8,padding:12,marginBottom:10}}>
    {F.map(([k,l])=>(<div key={k} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,marginBottom:3}}><span style={{color:D.sub}}>{l}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:D.acc}}>{v[k]}/10</span></div><input type="range" min="1" max="10" value={v[k]} onChange={e=>setV({...v,[k]:Number(e.target.value)})} style={{width:"100%",accentColor:D.acc}}/></div>))}
    <input value={v.note} onChange={e=>setV({...v,note:e.target.value})} placeholder="Note (optional)" style={{width:"100%",background:D.card,border:`1px solid ${D.line}`,borderRadius:6,padding:8,color:D.ink,fontSize:12,outline:"none",marginBottom:9}}/>
    <div style={{display:"flex",gap:6}}><button onClick={onClose} style={{flex:1,background:D.card,border:`1px solid ${D.line}`,color:D.sub,borderRadius:6,padding:8,cursor:"pointer",fontSize:11,fontWeight:700}}>Cancel</button><button onClick={()=>onSave(v)} style={{flex:2,background:D.acc,color:"#0B0B0C",border:0,borderRadius:6,padding:8,cursor:"pointer",fontSize:11,fontWeight:800}}>Save Check-in</button></div>
  </div>);
}
