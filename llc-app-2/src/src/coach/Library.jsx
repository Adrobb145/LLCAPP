// coach/Library.jsx — exercise library browser
import { useState } from "react";
import { EX, PATS, EQUIP, LEVELS, PATL, LDOT } from "../constants/exercises";

export default function Library(){
  const [s,setS]=useState("");const [p,setP]=useState("all");const [eq,setEq]=useState("all");const [lv,setLv]=useState("all");
  const f=EX.filter(e=>{if(p!=="all"&&e.p!==p)return false;if(eq!=="all"&&e.e!==eq)return false;if(lv!=="all"&&e.lv!==lv)return false;if(s&&!e.n.toLowerCase().includes(s.toLowerCase())&&!e.m.some(m=>m.includes(s.toLowerCase())))return false;return true;});
  return(<div className="lib">
    <div className="rhead"><div><div className="kick" style={{marginBottom:8}}>Movement Database</div><div className="rtitle">Exercise Library</div><div className="rsub">{EX.length} exercises · pattern, equipment, level</div></div></div>
    <div className="libf">
      <div className="libsrch"><div className="libfl">Search</div><input className="field" value={s} onChange={e=>setS(e.target.value)} placeholder="Name or muscle…"/></div>
      <div className="libfg"><div className="libfl">Pattern</div><div className="chips"><button className="chip" data-on={p==="all"} onClick={()=>setP("all")}>All</button>{PATS.map(x=><button key={x} className="chip" data-on={p===x} onClick={()=>setP(x)}>{x}</button>)}</div></div>
      <div className="libfg"><div className="libfl">Equipment</div><div className="chips"><button className="chip" data-on={eq==="all"} onClick={()=>setEq("all")}>All</button>{EQUIP.map(x=><button key={x} className="chip" data-on={eq===x} onClick={()=>setEq(x)}>{x}</button>)}</div></div>
      <div className="libfg"><div className="libfl">Level</div><div className="chips"><button className="chip" data-on={lv==="all"} onClick={()=>setLv("all")}>All</button>{LEVELS.map(x=><button key={x} className="chip" data-on={lv===x} onClick={()=>setLv(x)}>{x}</button>)}</div></div>
    </div>
    <div style={{fontSize:11,color:"#807E76",marginBottom:12}}>{f.length} of {EX.length}</div>
    <div className="libgrid">{f.map(e=>(<div key={e.id} className="libc"><div className="libc-n">{e.n}</div><div className="libc-p">{PATL[e.p]}</div><div className="libc-m">{e.m.join(" · ")}</div><div style={{display:"flex",gap:4,marginTop:2}}><span className="mtag">{e.e}</span><span className="mtag"><span className="ldot" style={{background:LDOT[e.lv]}}/>{e.lv}</span></div></div>))}</div>
  </div>);
}
