// shared/ExercisePicker.jsx — exercise search/pick modal
import { useState } from "react";
import { EX, PATS, LDOT } from "../constants/exercises";

export default function ExercisePicker({onPick,onClose}){
  const [s,setS]=useState("");const [p,setP]=useState("all");
  const f=EX.filter(e=>{if(p!=="all"&&e.p!==p)return false;if(s&&!e.n.toLowerCase().includes(s.toLowerCase())&&!e.m.some(m=>m.includes(s.toLowerCase())))return false;return true;});
  return(<div className="povl" onClick={onClose}><div className="pick" onClick={e=>e.stopPropagation()}>
    <div className="pickh"><div className="pickt">Pick Exercise</div><button className="actb" style={{fontSize:16}} onClick={onClose}>✕</button></div>
    <div style={{padding:"12px 16px"}}><input className="field" autoFocus style={{width:"100%"}} value={s} onChange={e=>setS(e.target.value)} placeholder="Search exercises…"/></div>
    <div className="chips" style={{padding:"0 16px 10px"}}><button className="chip" data-on={p==="all"} onClick={()=>setP("all")}>All</button>{PATS.map(x=><button key={x} className="chip" data-on={p===x} onClick={()=>setP(x)}>{x}</button>)}</div>
    <div className="pickl">{f.map(e=>(<div key={e.id} className="pitem" onClick={()=>onPick(e)}><div><div style={{fontSize:12.5,fontWeight:500}}>{e.n}</div><div style={{fontSize:10,color:"#807E76"}}>{e.m.join(" · ")}</div></div><span className="mtag">{e.e}</span><span className="mtag"><span className="ldot" style={{background:LDOT[e.lv]}}/>{e.lv}</span></div>))}{f.length===0&&<div style={{padding:30,color:"#807E76",textAlign:"center"}}>No matches.</div>}</div>
  </div></div>);
}
