// coach/CoachAuth.jsx — coach PIN login
import { useState } from "react";

export default function CoachAuth({coaches,onLogin}){
  const [picked,setPicked]=useState(null);const [pin,setPin]=useState("");const [err,setErr]=useState("");
  const tap=(k)=>{if(!picked)return;const np=k==="⌫"?pin.slice(0,-1):(pin.length<4?pin+String(k):pin);if(np.length===4){if(np===(picked.pin||"0000")){onLogin(picked);return;}setErr("Wrong PIN");setPin("");setTimeout(()=>setErr(""),1100);return;}setErr("");setPin(np);};
  return(<div style={{minHeight:"100vh",background:"#0B0B0C",color:"#F5F4F0",fontFamily:"'Inter Tight',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Archivo+Black&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}</style>
    <div style={{width:340,maxWidth:"100%"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,background:"#FF6B2C",color:"#0B0B0C",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Archivo Black',sans-serif",fontSize:14,borderRadius:6}}>LL</div><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:22,letterSpacing:".02em"}}>LIVE LONG</div></div>
        <div style={{fontSize:9,color:"#807E76",letterSpacing:".16em",textTransform:"uppercase",marginTop:8}}>Collective · Coach Login</div>
      </div>
      {!picked?(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{coaches.map(c=>(<div key={c.id} onClick={()=>{setPicked(c);setPin("");setErr("");}} style={{background:"#131315",border:"1px solid #2A2A2F",borderLeft:`4px solid ${c.accent}`,borderRadius:9,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}><span style={{width:40,height:40,borderRadius:6,background:c.accent+"22",color:c.accent,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Archivo Black',sans-serif",fontSize:15}}>{c.initials}</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{c.name}</div><div style={{fontSize:10,color:c.accent}}>{c.role}</div></div><span style={{color:c.accent}}>→</span></div>))}</div>
      ):(
        <div>
          <div style={{textAlign:"center",marginBottom:14,fontSize:13,color:"#B5B3AB"}}>{picked.name}</div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:14}}>{[0,1,2,3].map(i=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:pin.length>i?"#FF6B2C":"#2A2A2F"}}/>)}</div>
          {err&&<div style={{color:"#FF4D4D",fontSize:11,textAlign:"center",marginBottom:8}}>{err}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,maxWidth:230,margin:"0 auto"}}>{[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=><div key={i} onClick={()=>k!==""&&tap(k)} style={{background:k===""?"transparent":"#131315",border:`1px solid ${k===""?"transparent":"#2A2A2F"}`,borderRadius:8,padding:14,textAlign:"center",cursor:k===""?"default":"pointer",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:18,color:k===""?"transparent":"#F5F4F0",userSelect:"none"}}>{k}</div>)}</div>
          <div style={{textAlign:"center",marginTop:14}}><span onClick={()=>{setPicked(null);setPin("");setErr("");}} style={{color:"#807E76",fontSize:11,cursor:"pointer"}}>← Choose different</span></div>
          <div style={{textAlign:"center",marginTop:8,color:"#54534D",fontSize:9}}>Demo · Adam 1234 · Jay 2345 · Dani 3456</div>
        </div>
      )}
    </div>
  </div>);
}
