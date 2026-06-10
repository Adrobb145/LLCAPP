// coach/Team.jsx — coaching team management (add / remove / reassign)
import { useState } from "react";
import Avatar from "../shared/Avatar";

export default function Team({coaches,clients,onMoveClient,onRemoveCoach,onAddCoach,isOwner,onInviteCoach}){
  const [reassign,setReassign]=useState(null);
  const [reassignTo,setReassignTo]=useState("");
  const [newName,setNewName]=useState("");
  const others=id=>coaches.filter(c=>c.id!==id);
  return(<div className="team">
    <div className="rhead"><div><div className="kick" style={{marginBottom:8}}>Manage</div><div className="rtitle">Coaching Team</div><div className="rsub">{coaches.length} coaches · move clients or remove a coach</div></div></div>
    {onInviteCoach?(<div style={{display:"flex",gap:8,marginBottom:16}}><button className="btn" onClick={onInviteCoach}>＋ Invite Coach</button><span style={{alignSelf:"center",fontSize:11,color:"#807E76"}}>Owner only · sends an email invite</span></div>):(<div style={{display:"flex",gap:8,marginBottom:16}}><input className="field" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="New coach name…" style={{flex:1,maxWidth:280}}/><button className="btn" onClick={()=>{if(newName.trim()){onAddCoach(newName.trim());setNewName("");}}}>+ Add Coach</button></div>)}
    {coaches.map(co=>{const cc=clients.filter(c=>c.coachId===co.id);const removing=reassign===co.id;return(<div key={co.id} className="tcoach">
      <div className="tc-head"><Avatar txt={co.initials} c={co.accent} size={38}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{co.name}</div><div style={{fontSize:10,color:co.accent}}>{co.role} · {cc.length} client{cc.length!==1?"s":""}</div></div>
        {coaches.length>1&&(removing?
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {cc.length>0&&<><span style={{fontSize:10,color:"#807E76"}}>Reassign to</span><select className="sel" value={reassignTo} onChange={e=>setReassignTo(e.target.value)}><option value="">—</option>{others(co.id).map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></>}
            <button className="btn dgr sm" disabled={cc.length>0&&!reassignTo} style={{opacity:(cc.length>0&&!reassignTo)?.5:1}} onClick={()=>{onRemoveCoach(co.id,reassignTo||others(co.id)[0]?.id);setReassign(null);setReassignTo("");}}>Confirm</button>
            <button className="btn gho sm" onClick={()=>{setReassign(null);setReassignTo("");}}>Cancel</button>
          </div>
          :<button className="btn sec sm" onClick={()=>{setReassign(co.id);setReassignTo("");}}>Remove</button>)}
      </div>
      {cc.length>0?cc.map(c=>(<div key={c.id} className="tc-clrow"><Avatar txt={c.initials} c={c.accent} size={26}/><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{c.name}</div><div style={{fontSize:9.5,color:"#807E76"}}>{c.goal}</div></div><span style={{fontSize:9.5,color:"#807E76"}}>Move to</span><select className="sel" value={c.coachId} onChange={e=>onMoveClient(c.id,e.target.value)}>{coaches.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div>)):<div style={{fontSize:11,color:"#54534D",fontStyle:"italic",padding:"4px 2px"}}>No clients assigned.</div>}
    </div>);})}
  </div>);
}
