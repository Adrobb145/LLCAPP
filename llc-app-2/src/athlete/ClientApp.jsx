// athlete/ClientApp.jsx — the full athlete app (Home/Pillars/Train/Progress/Fuel/Coach tabs)
import { useState, useMemo } from "react";
import { isDeload, e1rm } from "../lib/training";
import { athStats } from "../lib/analytics";
import { compressImg } from "../lib/media";
import { EXBYID } from "../constants/exercises";
import { PILL, PILLARS } from "../constants/pillars";
import { modOf, MODBYID } from "../constants/modalities";
import { lvlOf, lvlPct, toNext, rankOf, verseToday, MAINLIFTS, BADGES } from "../constants/gamification";
import { D } from "../theme/tokens";
import { FONTS } from "../theme/styles";
import Ring from "../shared/Ring";
import Spark from "../shared/Spark";
import PillarRadar from "../shared/PillarRadar";
import Bar from "../shared/Bar";
import SessionRunner from "./SessionRunner";
import FormReviewClient from "./FormReviewClient";
import AthCheckin from "./AthCheckin";
import WeeklyRecap from "./WeeklyRecap";
import { askClaude } from "../lib/ai";
import Profile from "../shared/Profile";

export default function ClientApp({client,program,clogs,meals,notes,goals,bodylog,checkins,xp,coachName,onToggleHabit,onLogMeal,onSaveSession,onXP,onAddCheckin,onSaveGoals,onLogBody,onSendChat,onAIReply,photos,freezes,ckday,onAddPhoto,onUseFreeze,onSetCkday,misses,onLogMiss,onLogReadiness,onLogout,pillaracts={},onSetAct,formvids=[],vidUrls={},onAddFormVid}){
  const [tab,setTab]=useState("home");
  const [profileOpen,setProfileOpen]=useState(false);
  const [run,setRun]=useState(null);
  const [mealOpen,setMealOpen]=useState(false);
  const [mf,setMf]=useState({name:"",p:"",c:"",f:""});
  const [fx,setFx]=useState(null);
  const [ciOpen,setCiOpen]=useState(false);
  const [bw,setBw]=useState("");
  const [gt,setGt]=useState("");
  const [gm,setGm]=useState("none");const [gtar,setGtar]=useState("");const [gdue,setGdue]=useState("");const [recapOpen,setRecapOpen]=useState(false);
  const [chat,setChat]=useState("");const [aiBusy,setAiBusy]=useState(false);
  const [openP,setOpenP]=useState(null);
  const cw=client.currentWeek;
  const dlWeek=isDeload(cw,client.totalWeeks);
  const today=new Date().toISOString().split("T")[0];
  const tActs=pillaracts[today]||{};
  const tMeals=meals.filter(m=>m.date===today);
  const nt=client.nt||{p:0,c:0,f:0,kcal:0};
  const tot=tMeals.reduce((a,m)=>({p:a.p+m.p,c:a.c+m.c,f:a.f+m.f,kcal:a.kcal+m.kcal}),{p:0,c:0,f:0,kcal:0});
  const pillDone=PILL.filter(p=>client.hab&&client.hab[p[0]]).length;
  const stats=useMemo(()=>athStats(client,program,clogs,meals,checkins,xp),[client,program,clogs,meals,checkins,xp]);

  const pop=(msg,big)=>{setFx({msg,big});setTimeout(()=>setFx(null),2200);};
  const handleAct=(pid,actId)=>{const p=PILLARS.find(x=>x.id===pid);const total=p.actions.length;const cur=tActs[pid]||{};const on=!cur[actId];const before=Object.keys(cur).length;const after=on?before+1:before-1;onSetAct(pid,actId,on);if(on)onXP(4);if(after>=total&&before<total){const others=PILLARS.filter(q=>q.id!==pid&&client.hab&&client.hab[q.id]).length;if(others+1>=7){onXP(35);pop("🎯 Perfect Day! All 7 pillars · +50 XP",true);}else{onXP(15);pop(p.icon+" "+p.name+" complete · +15 XP");}}};
  const last7=(()=>{const out=[];const t=new Date();t.setHours(0,0,0,0);for(let i=0;i<7;i++){const d=new Date(t);d.setDate(t.getDate()-i);out.push(d.toISOString().split("T")[0]);}return out;})();
  const radar=PILLARS.map(p=>{const total=p.actions.length||1;let sum=0;last7.forEach(dt=>{const a=(pillaracts[dt]||{})[p.id]||{};let frac=Object.keys(a).length/total;if(dt===today&&client.hab&&client.hab[p.id])frac=Math.max(frac,1);sum+=Math.min(1,frac);});return{label:p.icon,color:p.color,val:sum/7};});

  if(run){const day=program&&program.days.find(d=>d.id===run);if(!day)return null;
    return(<div style={{minHeight:"100vh",background:D.bg,color:D.ink,fontFamily:"'Inter Tight',system-ui,sans-serif",maxWidth:480,margin:"0 auto"}}><style>{FONTS}</style>
      <SessionRunner day={day} week={cw} total={client.totalWeeks} clogs={clogs} onReady={r=>{onLogReadiness({date:today,...r});if(r.sleep<=4||r.soreness>=8||r.energy<=3)onSendChat("⚠️ Readiness flag before "+day.name+" — sleep "+r.sleep+", energy "+r.energy+", soreness "+r.soreness+"/10");}} onCancel={()=>setRun(null)} onDone={entries=>{
        const before=stats.prs;let pr=false;
        Object.entries(entries).forEach(([k,v])=>{const exId=k.split("|")[2];const ex=EXBYID[exId];if(!ex||!MAINLIFTS.includes(ex.n))return;v.sets.forEach(s=>{if(s.done){const est=e1rm(Number(s.w)||0,Number(s.r)||0);const prev=before[ex.n];if(est>0&&(!prev||est>prev.e))pr=true;}});});
        onSaveSession(entries);
        let g=100;if(pr)g+=150;onXP(g);
        setRun(null);setTab("home");pop(pr?`🔥 NEW PR! +${g} XP`:`💪 Session done · +${g} XP`,true);
      }}/>
    </div>);
  }

  const verse=verseToday();
  const lastBw=bodylog.length?bodylog[bodylog.length-1].w:client.bw;
  const coachMsgs=(notes||[]);

  const askAI=async()=>{
    setAiBusy(true);
    try{
      const recent=coachMsgs.slice(0,6).map(n=>`${n.from==="client"?client.name.split(" ")[0]:"Coach"}: ${n.text}`).reverse().join("\n");
      const prompt=`You are Coach Adam at Live Long Collective — an elite, faith-informed strength coach. Voice: kind but direct "real talk", encouraging, never preachy. Reply to your athlete in 2-3 short sentences max. Be specific and warm.\n\nAthlete: ${client.name}. Goal: ${client.goal}. Block: ${client.block}, week ${cw}. Pillars today: ${pillDone}/7. Best streak: ${stats.maxStreak}. Sessions logged: ${stats.sessions}.\nRecent thread:\n${recent||"(no prior messages)"}\n\nReturn ONLY your reply text.`;
      const txt=await askClaude(prompt);
      onAIReply(txt||"Keep showing up — I'm proud of the work.");
    }catch(e){onAIReply("Couldn't reach me right now — but keep moving. We'll talk soon.");}
    setAiBusy(false);
  };

  return(<div style={{minHeight:"100vh",background:D.bg,color:D.ink,fontFamily:"'Inter Tight',system-ui,sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:74,position:"relative"}}>
    <style>{FONTS}</style>
    {fx&&<div style={{position:"fixed",top:fx.big?"40%":14,left:"50%",transform:"translateX(-50%)",zIndex:90,background:fx.big?"linear-gradient(135deg,#FF6B2C,#FF3A8E)":D.card,color:fx.big?"#0B0B0C":D.ink,border:fx.big?"0":`1px solid ${D.acc}`,borderRadius:fx.big?14:8,padding:fx.big?"18px 26px":"9px 16px",fontFamily:"'Archivo Black',sans-serif",fontSize:fx.big?17:12,boxShadow:"0 10px 40px rgba(0,0,0,.6)",textAlign:"center",maxWidth:"90vw"}}>{fx.msg}</div>}

    <div style={{padding:"16px 16px 8px",display:"flex",alignItems:"center",gap:11}}>
      <span style={{width:44,height:44,borderRadius:"50%",background:client.accent,color:"#0B0B0C",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15}}>{client.initials}</span>
      <div style={{flex:1}}><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:18,lineHeight:1}}>{client.name.split(" ")[0]}</div><div style={{fontSize:11,color:D.sub,marginTop:3}}>Lvl {lvlOf(xp)} · {rankOf(xp)} · {client.block}</div></div>
      <button onClick={()=>setProfileOpen(true)} style={{background:D.card,border:`1px solid ${D.line}`,color:D.sub,borderRadius:6,padding:"6px 9px",cursor:"pointer",fontSize:11,fontWeight:700,marginRight:6}}>Profile</button>
      <button onClick={onLogout} style={{background:D.card,border:`1px solid ${D.line}`,color:D.sub,borderRadius:6,padding:"6px 9px",cursor:"pointer",fontSize:11,fontWeight:700}}>Exit</button>
    </div>

    <div style={{padding:"0 16px"}}>
      {tab==="home"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        {(()=>{if(!program)return null;const DOWI={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};const t0=new Date();t0.setHours(0,0,0,0);const monday=new Date(t0);monday.setDate(t0.getDate()-((t0.getDay()+6)%7));const dateFor=dow=>{const d=new Date(monday);d.setDate(monday.getDate()+((DOWI[dow]+6)%7));return d;};const logged=dId=>{const dd=program.days.find(x=>x.id===dId);return dd.ex.every(x=>{const e=clogs[`w${cw}|${dId}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});};const handled=dId=>misses.some(m=>m.week===cw&&m.dayId===dId);const items=program.days.map(d=>{const dt=dateFor(d.dow);const done=logged(d.id);const st=done?"done":dt.getTime()===t0.getTime()?"today":dt.getTime()<t0.getTime()?"missed":"up";return{d,dt,st,done};});const todayItem=items.find(i=>i.st==="today");const pend=items.find(i=>i.st==="missed"&&!handled(i.d.id));const REASONS=[["Sick","🤒"],["Life / busy","⏰"],["Sore / tired","💢"],["Low drive","😞"],["Traveling","✈️"]];const fmtD=d=>d.toLocaleDateString("en-US",{weekday:"short"});return(<div style={{background:`linear-gradient(135deg,${D.acc}18,${D.card})`,border:`1px solid ${D.line}`,borderRadius:14,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:11,color:D.acc,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase"}}>Today · {t0.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}{dlWeek?" · Deload wk":""}</div><div style={{display:"flex",gap:5}}>{items.map(i=>(<div key={i.d.id} title={`${i.d.name} · ${fmtD(i.dt)}`} style={{width:9,height:9,borderRadius:"50%",background:i.st==="done"?D.good:i.st==="today"?D.acc:i.st==="missed"?"#FF4D4D":D.line}}/>))}</div></div>
          {todayItem?(todayItem.done?<div style={{fontSize:13.5,fontWeight:600,color:D.good}}>✓ {todayItem.d.name} done — that's the standard.</div>:<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1}}><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:17}}>{todayItem.d.name}</div><div style={{fontSize:11,color:D.sub}}>On the schedule today · {todayItem.d.ex.length} exercises{dlWeek?" · lighter deload loads":""}</div></div><button onClick={()=>setRun(todayItem.d.id)} style={{background:D.acc,color:"#0B0B0C",border:0,borderRadius:8,padding:"9px 16px",fontFamily:"'Archivo Black',sans-serif",fontSize:12,cursor:"pointer"}}>START</button></div>):<div style={{fontSize:12.5,color:D.sub}}>🌿 No session scheduled today. Recover with intent — sleep, a walk, mobility, protein.</div>}
          {pend&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${D.line}`}}><div style={{fontSize:12,fontWeight:600,marginBottom:7}}>You missed <span style={{color:"#FF4D4D"}}>{pend.d.name}</span> ({fmtD(pend.dt)}). What got in the way?</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{REASONS.map(([r,ic])=>(<button key={r} onClick={()=>{onLogMiss({week:cw,dayId:pend.d.id,dayName:pend.d.name,date:fmtD(pend.dt),reason:r,ts:Date.now()});pop("Logged — your coach sees it. No shame, just data.");}} style={{background:D.lift,border:`1px solid ${D.line}`,color:D.ink,borderRadius:7,padding:"7px 11px",fontSize:11.5,cursor:"pointer",fontFamily:"inherit"}}>{ic} {r}</button>))}</div></div>}
        </div>);})()}
        <div style={{background:`linear-gradient(135deg,${D.acc}22,${D.card})`,border:`1px solid ${D.acc}44`,borderRadius:14,padding:15,display:"flex",alignItems:"center",gap:15}}>
          <Ring pct={lvlPct(xp)} size={84} color={D.acc}><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:24}}>{lvlOf(xp)}</div><div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase"}}>Level</div></Ring>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:D.acc,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>{rankOf(xp)}</div>
            <div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:22}}>{xp.toLocaleString()} <span style={{fontSize:12,color:D.sub}}>XP</span></div>
            <div style={{fontSize:11,color:D.sub,marginTop:2}}>{toNext(xp)} XP to Level {lvlOf(xp)+1}</div>
          </div>
        </div>

        <div onClick={()=>setRecapOpen(true)} style={{background:`linear-gradient(135deg,#3AE0FF22,${D.card})`,border:"1px solid #3AE0FF44",borderRadius:12,padding:13,cursor:"pointer",display:"flex",alignItems:"center",gap:11}}><span style={{fontSize:22}}>📈</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>Your Week — Recap</div><div style={{fontSize:11,color:D.sub}}>Sessions, effort, readiness & wins · send it to your coach</div></div><span style={{color:"#3AE0FF"}}>→</span></div>

        <div style={{background:D.card,border:`1px solid ${D.line}`,borderLeft:`3px solid #34D399`,borderRadius:11,padding:13}}>
          <div style={{fontSize:11,color:"#34D399",fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",marginBottom:4}}>✝︎ Daily Anchor · {verse[0]}</div>
          <div style={{fontSize:13.5,lineHeight:1.5,color:D.ink}}>{verse[1]}</div>
        </div>

        <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <span style={{fontSize:11,color:D.sub,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase"}}>Today · 7 Pillars</span>
            <span style={{fontFamily:"'Archivo Black',sans-serif",fontSize:18}}>{pillDone}<span style={{fontSize:11,color:D.sub}}> / 7</span></span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{PILL.map(p=>{const on=client.hab&&client.hab[p[0]];return(<button key={p[0]} onClick={()=>{const wasOn=client.hab&&client.hab[p[0]];const cnt=PILL.filter(q=>client.hab&&client.hab[q[0]]).length;onToggleHabit(p[0]);if(!wasOn){onXP(10);if(cnt+1===7){onXP(40);pop("🎯 Perfect Day! +50 XP");}}}} style={{flex:"1 1 18%",minWidth:42,aspectRatio:"1",borderRadius:9,border:`1px solid ${on?p[2]:D.line}`,background:on?p[2]+"22":D.lift,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}><span style={{fontSize:18,opacity:on?1:.55,filter:on?"none":"grayscale(.7)"}}>{p[1]}</span><span style={{fontSize:11,color:on?p[2]:D.sub,textTransform:"capitalize",fontWeight:700}}>{p[0]}</span></button>);})}</div>
          <div style={{marginTop:10}}><Bar v={pillDone} t={7} c={D.acc}/></div>
          <div onClick={()=>setTab("pillars")} style={{textAlign:"center",fontSize:11,color:D.acc,marginTop:10,cursor:"pointer",fontWeight:700}}>Open the 7 Pillars — check actions & see your balance →</div>
        </div>

        <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13,display:"flex",alignItems:"center",gap:14}}>
          <Ring pct={nt.kcal?tot.kcal/nt.kcal*100:0} size={66} stroke={7} color="#EC4899"><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:14}}>{Math.round(tot.kcal)}</div><div style={{fontSize:11,color:D.sub}}>/{nt.kcal}</div></Ring>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:D.sub,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Fuel Today</div>
            {[["p","Protein","#FF6B2C"],["c","Carbs","#3AE0FF"],["f","Fat","#FFB23A"]].map(([k,l,col])=>(<div key={k} style={{marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}><span style={{color:col}}>{l}</span><span className="mono" style={{color:D.sub}}>{Math.round(tot[k])}/{nt[k]}g</span></div><Bar v={tot[k]} t={nt[k]} c={col}/></div>))}
          </div>
        </div>

        {(()=>{const todayLbl=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});const dow=new Date().toLocaleDateString("en-US",{weekday:"long"});const pref=ckday||"Sunday";const checkedToday=checkins.some(c=>c.date===todayLbl);const due=dow===pref&&!checkedToday;const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];return(<>
          {due&&<div style={{background:"linear-gradient(135deg,#FFB23A33,#FFB23A11)",border:"1px solid #FFB23A66",borderRadius:11,padding:"11px 13px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>⏰</span><div style={{flex:1,fontSize:12.5,fontWeight:600,color:"#FFB23A"}}>It's {pref} — your weekly check-in is due.</div><button onClick={()=>setCiOpen(true)} style={{background:"#FFB23A",color:"#0B0B0C",border:0,borderRadius:7,padding:"7px 12px",fontWeight:800,fontSize:11,cursor:"pointer"}}>Do it</button></div>}
          <div style={{background:`linear-gradient(135deg,#A78BFA22,${D.card})`,border:"1px solid #A78BFA44",borderRadius:11,padding:13}}>
            <div onClick={()=>setCiOpen(true)} style={{display:"flex",alignItems:"center",gap:11,cursor:"pointer"}}><span style={{fontSize:22}}>📋</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>Weekly Check-In</div><div style={{fontSize:11,color:D.sub}}>{checkedToday?"✓ Done today":(checkins.length?`Last: ${checkins[checkins.length-1].date}`:"Not submitted yet")} · +75 XP</div></div><span style={{color:"#A78BFA"}}>→</span></div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginTop:10,paddingTop:10,borderTop:`1px solid ${D.line}`}}><span style={{fontSize:11,color:D.sub,letterSpacing:".06em",textTransform:"uppercase",fontWeight:700}}>Reminder day</span><select value={pref} onChange={e=>onSetCkday(e.target.value)} style={{background:D.lift,border:`1px solid ${D.line}`,color:D.ink,borderRadius:6,padding:"4px 7px",fontSize:11,fontFamily:"inherit",outline:"none"}}>{DAYS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
          </div>
          <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>🧊</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>Streak Freezes · {freezes}</div><div style={{fontSize:11,color:D.sub}}>Earned at every 7-day streak. Spend one to keep a streak alive on a missed day.</div></div><button disabled={freezes<=0} onClick={()=>{if(freezes>0){onUseFreeze();pop("🧊 Freeze used — streak protected");}}} style={{background:freezes>0?"#3AE0FF":D.lift,color:freezes>0?"#0B0B0C":D.sub,border:freezes>0?0:`1px solid ${D.line}`,borderRadius:7,padding:"8px 12px",fontWeight:800,fontSize:11,cursor:freezes>0?"pointer":"default"}}>Use</button></div>
        </>);})()}

        {(()=>{const cm=coachMsgs.find(n=>n.from!=="client");return cm?(<div style={{background:D.card,border:`1px solid ${D.line}`,borderLeft:`3px solid ${client.accent}`,borderRadius:11,padding:13}}><div style={{fontSize:11,color:client.accent,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>💬 From {cm.author}</div><div style={{fontSize:13,lineHeight:1.5}}>{cm.text}</div><div onClick={()=>setTab("coach")} style={{fontSize:11,color:D.sub,marginTop:7,cursor:"pointer"}}>Open chat →</div></div>):null;})()}
      </div>}

      {tab==="pillars"&&<div style={{paddingTop:6,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:18}}>7 PILLARS</div><div style={{fontSize:11,color:D.sub}}>Live long. Live well. — one day at a time.</div></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:24,color:pillDone===7?D.good:D.ink,lineHeight:1}}>{pillDone}<span style={{fontSize:12,color:D.sub}}>/7</span></div><div style={{fontSize:11,color:D.sub,textTransform:"uppercase",letterSpacing:".08em"}}>today</div></div>
        </div>
        <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:12,padding:13,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:11,color:D.sub,letterSpacing:".12em",textTransform:"uppercase",fontWeight:700,alignSelf:"flex-start"}}>7-Day Balance</div>
          <PillarRadar values={radar} size={230}/>
          <div style={{fontSize:11,color:D.sub,textAlign:"center",marginTop:2,lineHeight:1.5}}>A strong life is a balanced one. Fill every axis — don't max one pillar and starve the rest.</div>
        </div>
        {PILLARS.map(p=>{const total=p.actions.length;const fullByHab=client.hab&&client.hab[p.id]&&Object.keys(tActs[p.id]||{}).length===0;const acts=tActs[p.id]||{};const done=fullByHab?total:Object.keys(acts).length;const complete=done>=total;const open=openP===p.id;const st=(client.streak&&client.streak[p.id])||0;return(
          <div key={p.id} style={{background:D.card,border:`1px solid ${complete?p.color+"66":D.line}`,borderLeft:`3px solid ${p.color}`,borderRadius:11,overflow:"hidden"}}>
            <div onClick={()=>setOpenP(open?null:p.id)} style={{padding:"12px 13px",display:"flex",alignItems:"center",gap:11,cursor:"pointer"}}>
              <span style={{fontSize:22,filter:complete?"none":"grayscale(.4)"}}>{p.icon}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:14}}>{p.name}{complete?" ✓":""}</div><div style={{fontSize:11,color:p.color}}>{p.tag}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:complete?D.good:D.ink}}>{done}/{total}</div>{st>0&&<div style={{fontSize:11,color:D.sub}}>🔥 {st}d</div>}</div>
              <span style={{color:D.sub,fontSize:15,transform:open?"rotate(90deg)":"none",transition:"transform .2s",display:"inline-block"}}>›</span>
            </div>
            {open&&<div style={{padding:"0 13px 13px"}}>
              <div style={{fontSize:12.5,color:D.ink,lineHeight:1.5,marginBottom:10}}>{p.why}</div>
              {p.actions.map(a=>{const on=fullByHab||acts[a.id];return(<div key={a.id} onClick={()=>handleAct(p.id,a.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 11px",background:on?p.color+"18":D.lift,border:`1px solid ${on?p.color+"55":D.line}`,borderRadius:8,marginBottom:6,cursor:"pointer"}}>
                <span style={{width:20,height:20,borderRadius:5,border:`1px solid ${on?p.color:D.line}`,background:on?p.color:"transparent",color:"#0B0B0C",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{on?"✓":""}</span>
                <span style={{fontSize:12.5,color:on?D.ink:D.sub}}>{(client.pillarTargets&&client.pillarTargets[a.id])||a.label}</span>
              </div>);})}
              <div style={{display:"flex",gap:8,marginTop:9,padding:"9px 11px",background:p.color+"12",borderRadius:8,borderLeft:`2px solid ${p.color}`}}>
                <span style={{fontSize:13}}>✝︎</span>
                <div><div style={{fontSize:11,color:p.color,fontWeight:700,letterSpacing:".06em"}}>{p.verse[0]}</div><div style={{fontSize:11.5,color:D.ink,lineHeight:1.45,marginTop:2}}>{p.verse[1]}</div></div>
              </div>
            </div>}
          </div>);})}
        <div style={{textAlign:"center",fontSize:11,color:D.sub,padding:"2px 0 8px"}}>Each action +4 XP · full pillar +15 XP · all 7 = Perfect Day +50</div>
      </div>}

      {tab==="train"&&<div style={{paddingTop:6}}>
        <div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>Your Program · Week {cw}{dlWeek?" · Deload":""}</div>
        {dlWeek&&<div style={{background:"rgba(255,107,44,.1)",border:`1px solid ${D.acc}55`,borderRadius:9,padding:"9px 12px",marginBottom:10,fontSize:11.5,color:"#FFB23A",lineHeight:1.4}}>🪶 Deload week — loads are lighter and reps trimmed on purpose. Move clean, don't grind.</div>}
        {program?program.days.map(d=>{const logged=d.ex.every(x=>{const e=clogs[`w${cw}|${d.id}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});const mods=[...new Set(d.ex.map(x=>modOf(x).id).filter(id=>id!=="straight"))];return(<div key={d.id} style={{background:D.card,border:`1px solid ${logged?D.good:D.line}`,borderLeft:`3px solid ${logged?D.good:D.acc}`,borderRadius:9,padding:"11px 13px",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{d.name}{logged?" ✓":""}</div><div style={{fontSize:11,color:D.sub}}>{d.dow} · {d.ex.length} exercises</div></div><button onClick={()=>setRun(d.id)} style={{background:logged?D.lift:D.acc,color:logged?D.sub:"#0B0B0C",border:logged?`1px solid ${D.line}`:0,borderRadius:7,padding:"8px 14px",fontFamily:"'Archivo Black',sans-serif",fontSize:11,cursor:"pointer"}}>{logged?"REDO":"START"}</button></div>{mods.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:9}}>{mods.map(id=><span key={id} style={{fontSize:11,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase",color:MODBYID[id].color,background:MODBYID[id].color+"1F",border:`1px solid ${MODBYID[id].color}44`,borderRadius:3,padding:"1px 6px"}}>{MODBYID[id].short}</span>)}</div>}</div>);}):<div style={{fontSize:11,color:D.sub}}>No program assigned yet.</div>}
        <FormReviewClient formvids={formvids} vidUrls={vidUrls} onSubmit={(entry,url)=>{onAddFormVid(entry,url);onXP(15);pop("🎥 Sent to coach for review · +15 XP");}}/>
      </div>}

      {tab==="progress"&&<div style={{paddingTop:6,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}><div><div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700}}>Body Weight</div><div style={{fontFamily:"'Archivo Black',sans-serif",fontSize:24}}>{lastBw}<span style={{fontSize:12,color:D.sub}}> lb</span></div></div><div style={{display:"flex",gap:6,alignItems:"center"}}><input type="number" value={bw} onChange={e=>setBw(e.target.value)} placeholder={String(lastBw)} style={{width:62,background:D.lift,border:`1px solid ${D.line}`,borderRadius:6,padding:7,color:D.ink,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",fontSize:13,outline:"none"}}/><button onClick={()=>{const v=Number(bw);if(v>0){onLogBody({date:today,w:v});onXP(5);setBw("");pop("⚖️ Logged · +5 XP");}}} style={{background:D.acc,color:"#0B0B0C",border:0,borderRadius:6,padding:"7px 11px",fontWeight:800,cursor:"pointer",fontSize:11}}>Log</button></div></div>
          {bodylog.length>1&&<Spark data={bodylog.map(b=>b.w)} color={client.accent} h={50}/>}
        </div>

        <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700}}>📸 Progress Photos</span><label style={{background:D.acc,color:"#0B0B0C",borderRadius:6,padding:"6px 11px",fontWeight:800,fontSize:11,cursor:"pointer"}}>+ Add<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const fl=e.target.files&&e.target.files[0];if(!fl)return;const url=await compressImg(fl);if(!url)return;onAddPhoto({id:"ph"+Date.now(),date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),url});onXP(20);pop("📸 Photo added · +20 XP");}}/></label></div>
          {photos.length>0?<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>{photos.map(ph=>(<div key={ph.id} style={{position:"relative",aspectRatio:"3/4",borderRadius:8,overflow:"hidden",border:`1px solid ${D.line}`}}><img src={ph.url} alt={ph.date} style={{width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,.85))",color:"#fff",fontSize:11,padding:"12px 5px 4px",fontWeight:700}}>{ph.date}</div></div>))}</div>:<div style={{fontSize:11,color:D.sub,fontStyle:"italic"}}>No photos yet. Snap a front / side / back set today and watch the change stack up.</div>}
        </div>

        {Object.keys(stats.prs).length>0&&<div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13}}>
          <div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,marginBottom:9}}>🏆 Personal Records · est. 1RM</div>
          {Object.entries(stats.prs).map(([nm,p])=>(<div key={nm} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${D.line}`}}><span style={{fontSize:12.5,fontWeight:600}}>{nm}</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:client.accent,fontWeight:700}}>{p.e}<span style={{fontSize:11,color:D.sub}}> lb · {p.w}×{p.r}</span></span></div>))}
        </div>}

        {stats.series.length>0&&<div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13}}>
          <div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,marginBottom:9}}>📈 Strength Trend</div>
          {stats.series.map(s=>{const last=s.arr[s.arr.length-1],first=s.arr[0],d=last-first;return(<div key={s.nm} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,marginBottom:2}}><span style={{fontWeight:600}}>{s.nm}</span><span className="mono">{last} lb{d>0&&<span style={{color:D.good,marginLeft:5}}>+{d}</span>}</span></div><Spark data={s.arr} color={client.accent} h={30}/></div>);})}
        </div>}

        {stats.vol.length>1&&<div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700}}>Weekly Volume</span><span className="mono" style={{color:D.good,fontSize:11}}>{stats.vol[stats.vol.length-1]}k lb</span></div>
          <Spark data={stats.vol} color="#3AE07A" h={50}/>
        </div>}

        <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13}}>
          <div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,marginBottom:11}}>🎖 Badges · {stats.earned.size}/{BADGES.length}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>{BADGES.map(b=>{const got=stats.earned.has(b.id);return(<div key={b.id} title={b.d} style={{textAlign:"center",opacity:got?1:.32}}><div style={{fontSize:25,filter:got?"none":"grayscale(1)"}}>{b.ic}</div><div style={{fontSize:11,color:got?D.ink:D.sub,fontWeight:700,marginTop:3}}>{b.l}</div></div>);})}</div>
        </div>

        <div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:11,padding:13}}>
          <div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>🎯 Goals</div>
          {goals.map((g,i)=>{const cur=g.metric==="squat"?(stats.prs["Back Squat"]?.e||0):g.metric==="bench"?(stats.prs["Barbell Bench Press"]?.e||0):g.metric==="deadlift"?(stats.prs["Conventional Deadlift"]?.e||0):g.metric==="bodyweight"?(bodylog.length?bodylog[bodylog.length-1].w:client.bw):g.metric==="sessions"?stats.sessions:null;const tgt=Number(g.target)||0;const pctG=tgt&&cur!=null?Math.min(100,Math.round(cur/tgt*100)):null;const hit=pctG!=null&&cur>=tgt;return(<div key={g.id} style={{marginBottom:11,paddingBottom:11,borderBottom:i<goals.length-1?`1px solid ${D.line}`:"0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:12.5,fontWeight:600,textDecoration:g.done?"line-through":"none",color:g.done||hit?D.good:D.ink}}>{g.text}{hit&&!g.done?" 🎉":""}</div>{g.due&&<div style={{fontSize:11,color:D.sub}}>by {g.due}</div>}</div><div style={{display:"flex",gap:6,alignItems:"center"}}><button onClick={()=>onSaveGoals(goals.map((x,j)=>j===i?{...x,done:!x.done}:x))} style={{background:g.done?D.good:"transparent",border:`1px solid ${g.done?D.good:D.line}`,color:g.done?"#0B0B0C":D.sub,borderRadius:5,width:22,height:22,cursor:"pointer",fontSize:11}}>{g.done?"✓":"○"}</button><button onClick={()=>onSaveGoals(goals.filter((_,j)=>j!==i))} style={{background:"transparent",border:0,color:D.sub,cursor:"pointer",fontSize:13}}>✕</button></div></div>
            {cur!=null&&tgt>0&&<div style={{marginTop:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:D.sub,marginBottom:3}}><span className="mono">{cur}{g.metric==="sessions"?" sessions":" lb"}</span><span className="mono">target {tgt}</span></div><div style={{height:6,background:D.line,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pctG+"%",background:hit?D.good:D.acc,borderRadius:3,transition:"width .4s"}}/></div></div>}
          </div>);})}
          {goals.length===0&&<div style={{fontSize:11,color:D.sub,fontStyle:"italic",marginBottom:8}}>No goals yet — set one your coach can hold you to.</div>}
          <input value={gt} onChange={e=>setGt(e.target.value)} placeholder="Goal (e.g. Hit a 365 squat)" style={{width:"100%",background:D.lift,border:`1px solid ${D.line}`,borderRadius:6,padding:8,color:D.ink,fontSize:12.5,outline:"none",fontFamily:"inherit",marginBottom:6}}/>
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            <select value={gm} onChange={e=>setGm(e.target.value)} style={{flex:1,minWidth:0,background:D.lift,border:`1px solid ${D.line}`,color:D.ink,borderRadius:6,padding:"7px 6px",fontSize:11,fontFamily:"inherit",outline:"none"}}><option value="none">No metric</option><option value="squat">Squat e1RM</option><option value="bench">Bench e1RM</option><option value="deadlift">Deadlift e1RM</option><option value="bodyweight">Bodyweight</option><option value="sessions">Total sessions</option></select>
            {gm!=="none"&&<input type="number" value={gtar} onChange={e=>setGtar(e.target.value)} placeholder="target" style={{width:72,background:D.lift,border:`1px solid ${D.line}`,color:D.ink,borderRadius:6,padding:"7px 6px",fontSize:12,fontFamily:"'JetBrains Mono',monospace",textAlign:"center",outline:"none"}}/>}
            <input type="date" value={gdue} onChange={e=>setGdue(e.target.value)} style={{background:D.lift,border:`1px solid ${D.line}`,color:D.ink,borderRadius:6,padding:"7px 6px",fontSize:11,fontFamily:"inherit",outline:"none"}}/>
          </div>
          <button onClick={()=>{if(gt.trim()){onSaveGoals([...goals,{id:"g"+Date.now(),text:gt.trim(),metric:gm,target:gm!=="none"?(Number(gtar)||0):0,due:gdue?new Date(gdue+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"",done:false}]);setGt("");setGm("none");setGtar("");setGdue("");onXP(15);pop("🎯 Goal set · +15 XP");}}} style={{width:"100%",background:D.acc,color:"#0B0B0C",border:0,borderRadius:6,padding:9,fontWeight:800,cursor:"pointer",fontSize:11}}>Add Goal</button>
        </div>
      </div>}

      {tab==="fuel"&&<div style={{paddingTop:6}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700}}>Today's Macros</div><button onClick={()=>setMealOpen(!mealOpen)} style={{background:D.good,color:"#0B0B0C",border:0,borderRadius:7,padding:"6px 11px",fontWeight:700,fontSize:11,cursor:"pointer"}}>{mealOpen?"Close":"+ Log Meal"}</button></div>
        {mealOpen&&<div style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:9,padding:11,marginBottom:10}}><input value={mf.name} onChange={e=>setMf({...mf,name:e.target.value})} placeholder="Meal name" style={{width:"100%",background:D.lift,border:`1px solid ${D.line}`,borderRadius:6,padding:8,color:D.ink,fontSize:13,outline:"none",marginBottom:7,fontFamily:"inherit"}}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>{[["p","Protein","#FF6B2C"],["c","Carbs","#3AE0FF"],["f","Fat","#FFB23A"]].map(([k,l,col])=>(<div key={k}><div style={{fontSize:11,color:col,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>{l}</div><input type="number" value={mf[k]} onChange={e=>setMf({...mf,[k]:e.target.value})} placeholder="0" style={{width:"100%",background:D.lift,border:`1px solid ${D.line}`,borderRadius:6,padding:7,color:D.ink,textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:14,outline:"none"}}/></div>))}</div><button onClick={()=>{const p=Number(mf.p)||0,c=Number(mf.c)||0,f=Number(mf.f)||0;if(!p&&!c&&!f)return;onLogMeal({id:"m"+Date.now(),date:today,name:mf.name.trim()||"Meal",p,c,f,kcal:p*4+c*4+f*9});onXP(10);setMf({name:"",p:"",c:"",f:""});setMealOpen(false);pop("🥗 Logged · +10 XP");}} style={{width:"100%",background:D.good,color:"#0B0B0C",border:0,borderRadius:7,padding:10,fontWeight:700,cursor:"pointer"}}>Add Meal</button></div>}
        {[["p","Protein","#FF6B2C","g"],["c","Carbs","#3AE0FF","g"],["f","Fat","#FFB23A","g"],["kcal","Calories","#EC4899",""]].map(([k,l,col,u])=>(<div key={k} style={{background:D.card,border:`1px solid ${D.line}`,borderRadius:8,padding:"8px 11px",marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:col,fontWeight:700}}>{l}</span><span className="mono" style={{fontSize:11}}>{Math.round(tot[k])}{u} / {nt[k]}{u}</span></div><Bar v={tot[k]} t={nt[k]} c={col}/></div>))}
        {tMeals.length>0&&<div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,margin:"13px 0 6px"}}>Logged Today</div>}
        {tMeals.map(m=>(<div key={m.id} style={{display:"flex",justifyContent:"space-between",background:D.lift,borderRadius:6,padding:"8px 11px",marginBottom:5}}><span style={{fontSize:12}}>{m.name}</span><span className="mono" style={{fontSize:11,color:D.sub}}>{m.p}p · {m.c}c · {m.f}f · {m.kcal}kcal</span></div>))}
      </div>}

      {tab==="coach"&&<div style={{paddingTop:6,display:"flex",flexDirection:"column",height:"calc(100vh - 210px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:11,color:D.sub,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700}}>Coach{coachName?` · ${coachName}`:""}</div><button onClick={askAI} disabled={aiBusy} style={{background:"#A78BFA",color:"#0B0B0C",border:0,borderRadius:7,padding:"6px 11px",fontWeight:800,fontSize:11,cursor:"pointer",opacity:aiBusy?.6:1}}>{aiBusy?"⏳ Thinking…":"🤖 Ask Coach Adam"}</button></div>
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column-reverse",gap:8,marginBottom:10}}>
          {coachMsgs.map((n,i)=>{const mine=n.from==="client";return(<div key={i} style={{alignSelf:mine?"flex-end":"flex-start",maxWidth:"82%",background:mine?client.accent:(n.from==="ai"?"#A78BFA22":D.card),color:mine?"#0B0B0C":D.ink,border:mine?"0":`1px solid ${n.from==="ai"?"#A78BFA55":D.line}`,borderRadius:mine?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"9px 12px"}}><div style={{fontSize:11,opacity:.7,marginBottom:2,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase"}}>{n.author}{n.from==="ai"?" 🤖":""} · {n.date}</div><div style={{fontSize:13,lineHeight:1.45}}>{n.text}</div></div>);})}
          {coachMsgs.length===0&&<div style={{textAlign:"center",color:D.sub,fontSize:12,marginTop:30}}>No messages yet. Say hi to your coach 👋</div>}
        </div>
        <div style={{display:"flex",gap:6}}><input value={chat} onChange={e=>setChat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&chat.trim()){onSendChat(chat.trim());setChat("");}}} placeholder="Message your coach…" style={{flex:1,background:D.card,border:`1px solid ${D.line}`,borderRadius:8,padding:11,color:D.ink,fontSize:13,outline:"none",fontFamily:"inherit"}}/><button onClick={()=>{if(chat.trim()){onSendChat(chat.trim());setChat("");}}} style={{background:D.acc,color:"#0B0B0C",border:0,borderRadius:8,padding:"0 16px",fontWeight:800,cursor:"pointer"}}>Send</button></div>
      </div>}
    </div>

    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:D.card,borderTop:`1px solid ${D.line}`,display:"flex",justifyContent:"space-around",padding:"8px 0",zIndex:40}}>{[["home","🏠","Home"],["pillars","🏛","Pillars"],["train","🏋️","Train"],["progress","📈","Progress"],["fuel","🥗","Fuel"],["coach","💬","Coach"]].map(([k,ic,l])=>(<button key={k} onClick={()=>setTab(k)} style={{background:"transparent",border:0,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,opacity:tab===k?1:.85}}><span style={{fontSize:18,filter:tab===k?"none":"grayscale(.35)"}}>{ic}</span><span style={{fontSize:11,fontWeight:700,color:tab===k?D.acc:"#B5B3AB",letterSpacing:".02em",textTransform:"uppercase"}}>{l}</span></button>))}</div>

    {ciOpen&&<AthCheckin onClose={()=>setCiOpen(false)} onSave={v=>{onAddCheckin({date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),...v});onXP(75);setCiOpen(false);pop("📋 Check-in sent to coach · +75 XP");}}/>}
    {recapOpen&&<WeeklyRecap client={client} program={program} clogs={clogs} bodylog={bodylog} misses={misses} stats={stats} cw={cw} onSend={t=>{onSendChat(t);pop("📈 Recap sent to your coach");}} onClose={()=>setRecapOpen(false)}/>}
    {profileOpen&&<Profile name={client.name} email={client.email||""} onClose={()=>setProfileOpen(false)}/>}
  </div>);
}
