// athlete/AthCheckin.jsx — athlete weekly check-in sheet
import { useState } from "react";
import { D } from "../theme/tokens";

export default function AthCheckin({onSave,onClose}){
  const [v,setV]=useState({energy:6,sleep:6,stress:5,nutrition:6,mood:6,note:""});
  const F=[["energy","Energy"],["sleep","Sleep quality"],["stress","Stress (high = worse)"],["nutrition","Nutrition"],["mood","Mood"]];
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:60,padding:20}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:D.card,border:`1px solid ${D.line}`,borderTop:`3px solid ${D.acc}`,borderRadius:16,padding:18,width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:17,marginBottom:3}}>WEEKLY CHECK-IN</div>
      <div style={{fontSize:11,color:D.sub,marginBottom:14}}>Honest beats impressive. Your coach sees this.</div>
      {F.map(([k,l])=>(<div key={k} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{color:D.sub}}>{l}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:D.acc,fontWeight:700}}>{v[k]}/10</span></div><input type="range" min="1" max="10" value={v[k]} onChange={e=>setV({...v,[k]:Number(e.target.value)})} style={{width:"100%",accentColor:D.acc}}/></div>))}
      <input value={v.note} onChange={e=>setV({...v,note:e.target.value})} placeholder="Anything your coach should know?" style={{width:"100%",background:D.lift,border:`1px solid ${D.line}`,borderRadius:7,padding:10,color:D.ink,fontSize:13,outline:"none",marginBottom:12,fontFamily:"inherit"}}/>
      <div style={{display:"flex",gap:8}}><button onClick={onClose} style={{flex:1,background:D.lift,border:`1px solid ${D.line}`,color:D.sub,borderRadius:8,padding:12,cursor:"pointer",fontWeight:700}}>Cancel</button><button onClick={()=>onSave(v)} style={{flex:2,background:D.acc,color:"#0B0B0C",border:0,borderRadius:8,padding:12,cursor:"pointer",fontWeight:800,fontFamily:"'Archivo Black',sans-serif"}}>SUBMIT · +75 XP</button></div>
    </div>
  </div>);
}
