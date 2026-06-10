// shared/Ring.jsx — progress ring
import { D } from "../theme/tokens";

export default function Ring({pct,size=78,stroke=8,color=D.acc,track=D.line,children}){
  const r=(size-stroke)/2,c=2*Math.PI*r,off=c-(Math.min(100,Math.max(0,pct))/100)*c;
  return(<div style={{position:"relative",width:size,height:size}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset .5s"}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",lineHeight:1.1}}>{children}</div>
  </div>);
}
