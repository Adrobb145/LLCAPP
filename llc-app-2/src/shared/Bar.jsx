// shared/Bar.jsx — goal progress bar (extracted from ClientApp)
import { D } from "../theme/tokens";

export default function Bar({v,t,c}){const pct=t?Math.min(100,Math.round(v/t*100)):0;return <div style={{height:7,background:D.line,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:v>t?"#FF4D4D":c,borderRadius:4,transition:"width .4s"}}/></div>;}
