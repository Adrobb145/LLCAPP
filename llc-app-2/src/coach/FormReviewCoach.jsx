// coach/FormReviewCoach.jsx — coach reviews an athlete movement clip
import { useState } from "react";

export default function FormReviewCoach({v,url,onReview}){
  const [fb,setFb]=useState(v.feedback||"");
  const reviewed=v.status==="reviewed";
  return(<div className="rcard" style={{borderColor:reviewed?"#3AE07A55":"#FFB23A66"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:600,fontSize:12}}>{v.label}</span><span style={{fontSize:9,color:reviewed?"#3AE07A":"#FFB23A",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em"}}>{reviewed?"✓ Reviewed":"· "+v.date}</span></div>
    {url?<video src={url} controls playsInline style={{width:"100%",borderRadius:6,maxHeight:200,background:"#000",marginBottom:8}}/>:<div style={{fontSize:10,color:"#54534D",fontStyle:"italic",marginBottom:8}}>Clip uploaded earlier this session is no longer cached — notes kept.</div>}
    {reviewed?<div style={{fontSize:11.5,color:"#B5B3AB",lineHeight:1.5,background:"#1A1A1D",borderRadius:6,padding:"7px 9px"}}>{v.feedback}</div>:(<><textarea className="ninp" rows={2} value={fb} onChange={e=>setFb(e.target.value)} placeholder={"Cue "+v.label+" — what to fix…"}/><button className="btn sm" style={{marginTop:6,width:"100%"}} onClick={()=>{if(fb.trim())onReview(fb.trim());}}>Send Review → athlete chat</button></>)}
  </div>);
}
