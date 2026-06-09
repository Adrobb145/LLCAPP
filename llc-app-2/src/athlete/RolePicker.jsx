// athlete/RolePicker.jsx — coach vs athlete entry screen
import { D } from "../theme/tokens";
import { FONTS } from "../theme/styles";

export default function RolePicker({onPick}){
  return(<div style={{minHeight:"100vh",background:D.bg,color:D.ink,fontFamily:"'Inter Tight',system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <style>{FONTS}</style>
    <div style={{width:360,maxWidth:"100%"}}>
      <div style={{textAlign:"center",marginBottom:26}}><div style={{display:"inline-flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,background:D.acc,color:"#0B0B0C",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Archivo Black',sans-serif",fontSize:14,borderRadius:6}}>LL</div><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:22}}>LIVE LONG</div></div><div style={{fontSize:9,color:D.sub,letterSpacing:".16em",textTransform:"uppercase",marginTop:8}}>Collective</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>{[["coach","🎯","Coach","Program clients · sheet & planner · AI insights"],["client","💪","Athlete","Your training · 7 pillars · progress · coach chat"]].map(([r,ic,t,s])=>(<div key={r} onClick={()=>onPick(r)} style={{background:D.card,border:`2px solid ${D.line}`,borderRadius:11,padding:16,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}><div style={{fontSize:28}}>{ic}</div><div><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:16}}>{t}</div><div style={{fontSize:11,color:D.sub}}>{s}</div></div></div>))}</div>
    </div>
  </div>);
}
