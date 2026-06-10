// athlete/ClientAuth.jsx — athlete PIN login
import { useState } from "react";
import { D } from "../theme/tokens";
import { FONTS } from "../theme/styles";

export default function ClientAuth({clients,onLogin,onBack}){
  const [picked,setPicked]=useState(null);const [pin,setPin]=useState("");const [err,setErr]=useState("");
  const tap=(k)=>{if(!picked)return;const np=k==="⌫"?pin.slice(0,-1):(pin.length<4?pin+String(k):pin);if(np.length===4){if(np===(picked.pin||"0000")){onLogin(picked);return;}setErr("Wrong PIN");setPin("");setTimeout(()=>setErr(""),1100);return;}setErr("");setPin(np);};
  return(<div style={{minHeight:"100vh",background:D.bg,color:D.ink,fontFamily:"'Inter Tight',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <style>{FONTS}</style>
    <div style={{width:340,maxWidth:"100%"}}>
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:20}}>ATHLETE LOGIN</div><div style={{fontSize:10,color:D.sub,marginTop:4}}>{picked?picked.name:"Select your name"}</div></div>
      {!picked?(
        <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:"50vh",overflowY:"auto"}}>{clients.map(c=>(<div key={c.id} onClick={()=>{setPicked(c);setPin("");setErr("");}} style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:11}}><span style={{width:32,height:32,borderRadius:"50%",background:c.accent,color:"#0B0B0C",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11}}>{c.initials}</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{c.name}</div><div style={{fontSize:9.5,color:D.sub}}>{c.goal}</div></div></div>))}</div>
      ):(
        <div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:14}}>{[0,1,2,3].map(i=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:pin.length>i?D.acc:D.line}}/>)}</div>
          {err&&<div style={{color:"#FF4D4D",fontSize:11,textAlign:"center",marginBottom:8}}>{err}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,maxWidth:230,margin:"0 auto"}}>{[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=><div key={i} onClick={()=>k!==""&&tap(k)} style={{background:k===""?"transparent":D.card,border:`1px solid ${k===""?"transparent":D.line}`,borderRadius:8,padding:14,textAlign:"center",cursor:k===""?"default":"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:18,color:k===""?"transparent":D.ink,userSelect:"none"}}>{k}</div>)}</div>
          <div style={{textAlign:"center",marginTop:14}}><span onClick={()=>{setPicked(null);setPin("");}} style={{color:D.sub,fontSize:11,cursor:"pointer"}}>← Choose different</span></div>
          <div style={{textAlign:"center",marginTop:8,color:"#54534D",fontSize:9}}>Demo PINs 1111–6666</div>
        </div>
      )}
      <div style={{textAlign:"center",marginTop:16}}><span onClick={onBack} style={{color:D.sub,fontSize:10,cursor:"pointer"}}>← Back to role select</span></div>
    </div>
  </div>);
}
