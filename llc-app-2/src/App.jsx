// App.jsx — root: state, persistence (window.storage), role routing & view dispatch
import { useState, useEffect } from "react";
import { hasBackend } from "./lib/supabase";
import * as db from "./lib/db";
import AuthGate from "./auth/AuthGate";
import { COACHES0, CLIENTS0, makeProgram, seedLogs, seedPillarActs } from "./constants/seed";
import { PILLAR_ACTS } from "./constants/pillars";
import { EX } from "./constants/exercises";
import { analyze } from "./lib/analytics";
import { CSS } from "./theme/styles";
import Avatar from "./shared/Avatar";
import Profile from "./shared/Profile";
import RolePicker from "./athlete/RolePicker";
import ClientAuth from "./athlete/ClientAuth";
import ClientApp from "./athlete/ClientApp";
import CoachAuth from "./coach/CoachAuth";
import Roster from "./coach/Roster";
import AddClient from "./coach/AddClient";
import InviteCoach from "./coach/InviteCoach";
import EditClient from "./coach/EditClient";
import CoachInsights from "./coach/CoachInsights";
import SessionsTracker from "./coach/SessionsTracker";
import ProgramBuilder from "./coach/ProgramBuilder";
import Planner from "./coach/Planner";
import Sheet from "./coach/Sheet";
import Library from "./coach/Library";
import Team from "./coach/Team";

export default function App(){
  const [coaches,setCoaches]=useState(hasBackend?[]:COACHES0);
  const [clients,setClients]=useState(hasBackend?[]:CLIENTS0);
  const [programs,setPrograms]=useState(()=>hasBackend?{}:Object.fromEntries(CLIENTS0.map(c=>[c.id,makeProgram(c)])));
  const [logs,setLogs]=useState(()=>hasBackend?{}:Object.fromEntries(CLIENTS0.map(c=>[c.id,seedLogs(c,makeProgram(c))])));
  const [notes,setNotes]=useState(hasBackend?{}:{mar:[{date:"Apr 30",author:"Adam",from:"coach",text:"Bar speed on 355 squat looked strong — bumping base next week. Proud of you, Marcus."}]});
  const [meals,setMeals]=useState({});
  const [xp,setXp]=useState(hasBackend?{}:{mar:1240,sof:480,jam:260,pri:2100,aly:540,mei:90});
  const [goals,setGoals]=useState(hasBackend?{}:{mar:[{id:"g0",text:"Hit a 365 squat by meet day",metric:"squat",target:365,due:"",done:false},{id:"g1",text:"Bodyweight ≥ 195 lb",metric:"bodyweight",target:195,due:"",done:true}]});
  const [checkins,setCheckins]=useState(hasBackend?{}:{pri:[{date:"Apr 28",energy:8,sleep:8,stress:3,nutrition:8,mood:8,note:"Feeling strong."}]});
  const [bodylog,setBodylog]=useState(hasBackend?{}:{mar:[{date:"w1",w:201},{date:"w2",w:200},{date:"w3",w:199},{date:"w4",w:198}]});
  const [photos,setPhotos]=useState({});
  const [freezes,setFreezes]=useState(hasBackend?{}:{mar:2,pri:3,aly:1});
  const [ckday,setCkday]=useState(hasBackend?{}:{mar:"Sunday",pri:"Monday"});
  const [attendance,setAttendance]=useState(()=>{if(hasBackend)return{};const t=new Date();const iso=n=>{const x=new Date(t);x.setDate(t.getDate()-n);return x.toISOString().split("T")[0];};return{mar:[{id:"sa1",date:iso(1),type:"1-on-1",rate:100,attended:true},{id:"sa2",date:iso(4),type:"1-on-1",rate:100,attended:true},{id:"sa3",date:iso(8),type:"1-on-1",rate:100,attended:true},{id:"sa4",date:iso(11),type:"1-on-1",rate:100,attended:true}],sof:[{id:"sa5",date:iso(2),type:"Small Group",rate:150,attended:true},{id:"sa6",date:iso(9),type:"Small Group",rate:150,attended:true}],pri:[{id:"sa7",date:iso(3),type:"PT 45",rate:65,attended:true},{id:"sa8",date:iso(6),type:"PT 45",rate:65,attended:false}]};});
  const [role,setRole]=useState(null);
  const [authClient,setAuthClient]=useState(null);
  const [authCoach,setAuthCoach]=useState(null);
  const [view,setView]=useState("roster");
  const [clientId,setClientId]=useState("mar");
  const [week,setWeek]=useState(4);
  const [hydrated,setHydrated]=useState(false);
  const [misses,setMisses]=useState({});
  const [readiness,setReadiness]=useState({});
  const [pillaracts,setPillaracts]=useState(hasBackend?{}:seedPillarActs);
  const [formvids,setFormvids]=useState({});
  const [vidUrls,setVidUrls]=useState({});
  const [tracked,setTracked]=useState({});
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);

  // ---- Supabase snapshot + load (active only when a backend is configured) ----
  const buildSnapshot=()=>{
    const state={};
    clients.forEach(c=>{state[c.id]={program:programs[c.id],logs:logs[c.id]||{},notes:notes[c.id]||[],meals:meals[c.id]||[],goals:goals[c.id]||[],checkins:checkins[c.id]||[],bodylog:bodylog[c.id]||[],photos:photos[c.id]||[],misses:misses[c.id]||[],readiness:readiness[c.id]||[],pillaracts:pillaracts[c.id]||{},attendance:attendance[c.id]||[],formvids:formvids[c.id]||[],xp:xp[c.id]||0,freezes:freezes[c.id]||0,ckday:ckday[c.id]||"",tracked:tracked[c.id]||[]};});
    if(attendance["_uncli"])state["_uncli"]={program:null,logs:{},notes:[],meals:[],goals:[],checkins:[],bodylog:[],photos:[],misses:[],readiness:[],pillaracts:{},attendance:attendance["_uncli"],formvids:[],xp:0,freezes:0,ckday:null};
    return {coaches,clients,state};
  };
  const loadBackend=async()=>{
    try{
      const {coaches:co,clients:cl,stateById}=await db.loadAll();
      if(co.length)setCoaches(co);
      if(cl.length)setClients(cl);
      const m={programs:{},logs:{},notes:{},meals:{},xp:{},goals:{},checkins:{},bodylog:{},photos:{},freezes:{},ckday:{},attendance:{},misses:{},readiness:{},pillaracts:{},formvids:{},tracked:{}};
      Object.entries(stateById).forEach(([cid,s])=>{if(s.program)m.programs[cid]=s.program;m.logs[cid]=s.logs||{};m.notes[cid]=s.notes||[];m.meals[cid]=s.meals||[];m.xp[cid]=s.xp||0;m.goals[cid]=s.goals||[];m.checkins[cid]=s.checkins||[];m.bodylog[cid]=s.bodylog||[];m.photos[cid]=s.photos||[];m.freezes[cid]=s.freezes||0;if(s.ckday)m.ckday[cid]=s.ckday;m.attendance[cid]=s.attendance||[];m.misses[cid]=s.misses||[];m.readiness[cid]=s.readiness||[];m.pillaracts[cid]=s.pillaracts||{};m.formvids[cid]=s.formvids||[];m.tracked[cid]=s.tracked||[];});
      cl.forEach(c=>{if(!m.programs[c.id]){const prog=makeProgram(c);m.programs[c.id]=prog;if(!stateById[c.id])m.logs[c.id]=seedLogs(c,prog);}});
      db.primeCache({coaches:co,clients:cl,state:stateById});
      setPrograms(m.programs);setLogs(m.logs);setNotes(m.notes);setMeals(m.meals);setXp(m.xp);setGoals(m.goals);setCheckins(m.checkins);setBodylog(m.bodylog);setPhotos(m.photos);setFreezes(m.freezes);setCkday(m.ckday);setAttendance(m.attendance);setMisses(m.misses);setReadiness(m.readiness);if(Object.keys(m.pillaracts).length)setPillaracts(m.pillaracts);setFormvids(m.formvids);setTracked(m.tracked);
    }catch(e){console.error("LLC load error",e);}
    setHydrated(true);
  };
  const doLogout=async()=>{if(hasBackend){try{await db.signOut();}catch(e){}setSession(null);setProfile(null);}setAuthClient(null);setAuthCoach(null);setRole(null);};

  useEffect(()=>{if(hasBackend){if(profile)loadBackend();return;}(async()=>{try{const r=await window.storage.get("llc_store",false);if(r&&r.value){const d=JSON.parse(r.value);if(d.coaches)setCoaches(d.coaches.map(c=>{const df=COACHES0.find(x=>x.id===c.id);return df?{...df,...c}:c;}));if(d.clients)setClients(d.clients.map(c=>{const df=CLIENTS0.find(x=>x.id===c.id);return df?{...df,...c}:c;}));if(d.programs)setPrograms(d.programs);if(d.logs)setLogs(d.logs);if(d.notes)setNotes(d.notes);if(d.meals)setMeals(d.meals);if(d.xp)setXp(d.xp);if(d.goals)setGoals(d.goals);if(d.checkins)setCheckins(d.checkins);if(d.bodylog)setBodylog(d.bodylog);if(d.photos)setPhotos(d.photos);if(d.freezes)setFreezes(d.freezes);if(d.ckday)setCkday(d.ckday);if(d.attendance)setAttendance(d.attendance);if(d.misses)setMisses(d.misses);if(d.readiness)setReadiness(d.readiness);if(d.pillaracts)setPillaracts(d.pillaracts);if(d.formvids)setFormvids(d.formvids);if(d.tracked)setTracked(d.tracked);}}catch(e){}try{const rp=await window.storage.get("llc_photos",false);if(rp&&rp.value)setPhotos(JSON.parse(rp.value));}catch(e){}setHydrated(true);})();},[profile]);
  useEffect(()=>{if(!hydrated)return;if(hasBackend){const t=setTimeout(()=>{db.persist(buildSnapshot()).catch(e=>console.error("LLC save error",e));},700);return()=>clearTimeout(t);}const t=setTimeout(()=>{try{window.storage.set("llc_store",JSON.stringify({coaches,clients,programs,logs,notes,meals,xp,goals,checkins,bodylog,freezes,ckday,attendance,misses,readiness,pillaracts,formvids,tracked}),false);}catch(e){}try{window.storage.set("llc_photos",JSON.stringify(photos),false);}catch(e){}},600);return()=>clearTimeout(t);},[coaches,clients,programs,logs,notes,meals,xp,goals,checkins,bodylog,photos,freezes,ckday,attendance,misses,readiness,pillaracts,formvids,tracked,hydrated]);

  const setHabit=(cid,pid,on)=>{const c=clients.find(x=>x.id===cid);if(!c)return;const was=!!(c.hab&&c.hab[pid]);if(was===on)return;const ns=Math.max(0,((c.streak&&c.streak[pid])||0)+(on?1:-1));if(on&&ns>0&&ns%7===0)setFreezes(f=>({...f,[cid]:(f[cid]||0)+1}));setClients(p=>p.map(x=>x.id!==cid?x:{...x,hab:{...(x.hab||{}),[pid]:on},streak:{...(x.streak||{}),[pid]:ns}}));};
  const setPillarAct=(cid,pid,actId,on)=>{const dt=new Date().toISOString().split("T")[0];const c=pillaracts[cid]||{};const day=c[dt]||{};const pl={...(day[pid]||{})};if(on)pl[actId]=true;else delete pl[actId];setPillaracts({...pillaracts,[cid]:{...c,[dt]:{...day,[pid]:pl}}});const total=(PILLAR_ACTS[pid]||[]).length;setHabit(cid,pid,total>0&&Object.keys(pl).length>=total);};
  const toggleHabit=(cid,pid)=>{const c=clients.find(x=>x.id===cid);if(!c)return;const on=!(c.hab&&c.hab[pid]);const dt=new Date().toISOString().split("T")[0];const acts={};if(on)(PILLAR_ACTS[pid]||[]).forEach(a=>acts[a]=true);const cc=pillaracts[cid]||{};const day=cc[dt]||{};setPillaracts({...pillaracts,[cid]:{...cc,[dt]:{...day,[pid]:acts}}});setHabit(cid,pid,on);};
  const logMeal=(cid,m)=>setMeals(p=>({...p,[cid]:[...(p[cid]||[]),m]}));
  const saveClientSession=(cid,entries)=>setLogs(p=>({...p,[cid]:{...(p[cid]||{}),...entries}}));
  const addXP=(cid,amt)=>setXp(p=>({...p,[cid]:(p[cid]||0)+amt}));
  const addCheckin=(cid,ci)=>setCheckins(p=>({...p,[cid]:[...(p[cid]||[]),ci]}));
  const saveGoals=(cid,arr)=>setGoals(p=>({...p,[cid]:arr}));
  const setTrackedLifts=(cid,arr)=>setTracked(p=>({...p,[cid]:arr}));
  const logBody=(cid,e)=>setBodylog(p=>({...p,[cid]:[...(p[cid]||[]),e]}));
  const addPhoto=(cid,ph)=>setPhotos(p=>({...p,[cid]:[...(p[cid]||[]),ph]}));
  const useFreeze=(cid)=>setFreezes(f=>({...f,[cid]:Math.max(0,(f[cid]||0)-1)}));
  const setCheckinDay=(cid,day)=>setCkday(p=>({...p,[cid]:day}));
  const addSession=(cid,s)=>setAttendance(p=>({...p,[cid]:[...(p[cid]||[]),s]}));
  const toggleAttended=(cid,id)=>setAttendance(p=>({...p,[cid]:(p[cid]||[]).map(s=>s.id===id?{...s,attended:!s.attended}:s)}));
  const removeSession=(cid,id)=>setAttendance(p=>({...p,[cid]:(p[cid]||[]).filter(s=>s.id!==id)}));
  const logMiss=(cid,rec)=>setMisses(p=>({...p,[cid]:[...(p[cid]||[]),rec]}));
  const logReadiness=(cid,rec)=>setReadiness(p=>({...p,[cid]:[...(p[cid]||[]),rec]}));
  const setNutrition=(cid,nt)=>setClients(p=>p.map(c=>c.id!==cid?c:{...c,nt}));
  const [addOpen,setAddOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);
  const [inviteCoachOpen,setInviteCoachOpen]=useState(false);
  const isOwner=profile?.role==="owner";
  const inviteCoach=async(name,email)=>{
    try{await db.invite({role:"coach",name,email});setInviteCoachOpen(false);await loadBackend();alert("Invite sent to "+email+". They'll get an email to set a password.");}
    catch(e){alert("Couldn't invite coach: "+(e.message||e));}
  };
  const addClient=async(f)=>{
    const initials=(f.name.trim().split(" ").filter(Boolean).map(w=>w[0]).join("")||"CL").slice(0,2).toUpperCase();
    const accent=["#FF6B2C","#3AE0FF","#FF3A8E","#9EFF3A","#FFB23A"][clients.length%5];
    if(hasBackend){
      if(!f.email){alert("An email is required to invite an athlete.");return;}
      try{
        const res=await db.invite({role:"athlete",email:f.email,tempPassword:f.tempPassword,client:{name:f.name,initials,goal:f.goal,accent,bw:f.bw,block:f.block,totalWeeks:f.totalWeeks,lifts:{sq:f.sq,bn:f.bn,dl:f.dl}}});
        setAddOpen(false);
        await loadBackend();
        if(res&&res.clientId){setClientId(res.clientId);setWeek(1);setView("builder");}
        const pw=(res&&res.tempPassword)?res.tempPassword:(f.tempPassword||"");
        alert("Athlete account created ✅\n\nSend them these login details:\n\nEmail:  "+f.email+"\nPassword:  "+pw+"\n\nSave it somewhere — it's their login. No email is sent automatically.");
      }catch(e){alert("Couldn't invite athlete: "+(e.message||e));}
      return;
    }
    const id="cl_"+Date.now();
    const coachId=(authCoach&&authCoach.id)||"co_adam";
    const c={id,coachId,name:f.name,initials,goal:f.goal,accent,bw:f.bw,block:f.block,totalWeeks:f.totalWeeks,currentWeek:1,adherence:1,lifts:{sq:f.sq,bn:f.bn,dl:f.dl},pin:f.pin||"",nt:{p:0,c:0,f:0,kcal:0},hab:{},streak:{},pillarTargets:{},email:f.email||""};
    const prog=makeProgram(c);
    setClients(p=>[...p,c]);
    setPrograms(p=>({...p,[id]:prog}));
    setLogs(p=>({...p,[id]:{}}));
    setPillaracts(p=>({...p,[id]:{}}));
    setAddOpen(false);setClientId(id);setWeek(1);setView("builder");
  };
  const [editId,setEditId]=useState(null);
  const editClient=(id,patch)=>setClients(p=>p.map(c=>c.id===id?{...c,...patch}:c));
  const stripClientLocal=(id)=>{const drop=(m)=>{const n={...m};delete n[id];return n;};setClients(p=>p.filter(c=>c.id!==id));setPrograms(drop);setLogs(drop);setNotes(drop);setMeals(drop);setGoals(drop);setCheckins(drop);setBodylog(drop);setPhotos(drop);setMisses(drop);setReadiness(drop);setPillaracts(drop);setAttendance(drop);setFormvids(drop);setXp(drop);setFreezes(drop);setCkday(drop);setTracked(drop);};
  const removeClient=async(id)=>{
    if(hasBackend){try{await db.deleteClient(id);}catch(e){alert("Couldn't delete: "+(e.message||e));return;}}
    stripClientLocal(id);setEditId(null);setView("roster");
  };
  const addFormVid=(cid,entry,url)=>{setFormvids(p=>({...p,[cid]:[entry,...(p[cid]||[])]}));setVidUrls(u=>({...u,[entry.id]:url}));};
  const reviewFormVid=(cid,id,feedback)=>{const v=(formvids[cid]||[]).find(x=>x.id===id);setFormvids(p=>({...p,[cid]:(p[cid]||[]).map(x=>x.id===id?{...x,feedback,status:"reviewed"}:x)}));onAddNote(cid,"🎥 Form review — "+(v?v.label:"your clip")+": "+feedback,"coach");};

  const client=clients.find(c=>c.id===clientId)||clients[0];
  const program=client?programs[client.id]:null;
  const clientLogs=client?(logs[client.id]||{}):{};

  const openClient=id=>{const c=clients.find(x=>x.id===id);setClientId(id);setWeek(c?.currentWeek||1);setView("sheet");};
  const onLog=(key,data)=>setLogs(p=>({...p,[client.id]:{...(p[client.id]||{}),[key]:data}}));
  const onAddNote=(cid,text,from)=>setNotes(p=>({...p,[cid]:[{date:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),author:from==="client"?(clients.find(c=>c.id===cid)?.name.split(" ")[0]||"Athlete"):(from==="ai"?"Coach Adam":(authCoach?.name.split(" ")[0]||"Coach")),text,from:from||"coach"},...(p[cid]||[])]}));
  const editEx=(dayId,exId,patch)=>setPrograms(p=>({...p,[client.id]:{...p[client.id],days:p[client.id].days.map(d=>d.id!==dayId?d:{...d,ex:d.ex.map(x=>x.exId===exId?{...x,...patch}:x)})}}));
  const addEx=(dayId,exId)=>setPrograms(p=>({...p,[client.id]:{...p[client.id],days:p[client.id].days.map(d=>d.id!==dayId?d:{...d,ex:[...d.ex,{exId,sets:3,reps:10,base:100,step:.02,mod:"straight",tempo:"",grp:""}]})}}));
  const removeEx=(dayId,exId)=>setPrograms(p=>({...p,[client.id]:{...p[client.id],days:p[client.id].days.map(d=>d.id!==dayId?d:{...d,ex:d.ex.filter(x=>x.exId!==exId)})}}));
  const setWeeks=patch=>setClients(p=>p.map(c=>c.id!==client.id?c:{...c,...patch,currentWeek:Math.min(c.currentWeek,patch.totalWeeks||c.totalWeeks)}));
  const advanceWeek=delta=>setClients(p=>p.map(c=>c.id!==client.id?c:{...c,currentWeek:Math.max(1,Math.min(c.totalWeeks,c.currentWeek+delta))}));
  const moveClient=(cid,coachId)=>setClients(p=>p.map(c=>c.id===cid?{...c,coachId}:c));
  const removeCoach=(coachId,toId)=>{setClients(p=>p.map(c=>c.coachId===coachId?{...c,coachId:toId}:c));setCoaches(p=>p.filter(c=>c.id!==coachId));};
  const addCoach=name=>{const initials=name.trim().split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();const accent=["#FF6B2C","#3AE0FF","#FF3A8E","#9EFF3A","#FFB23A"][coaches.length%5];setCoaches(p=>[...p,{id:"co_"+Date.now(),name,initials,role:"Coach",accent}]);};
  const reorderEx=(dayId,exId,dir)=>setPrograms(p=>({...p,[client.id]:{...p[client.id],days:p[client.id].days.map(d=>{if(d.id!==dayId)return d;const i=d.ex.findIndex(x=>x.exId===exId);const j=i+dir;if(i<0||j<0||j>=d.ex.length)return d;const ex=[...d.ex];const t=ex[i];ex[i]=ex[j];ex[j]=t;return{...d,ex};})}}));
  const renameDay=(dayId,name)=>setPrograms(p=>({...p,[client.id]:{...p[client.id],days:p[client.id].days.map(d=>d.id===dayId?{...d,name}:d)}}));
  const setDow=(dayId,dow)=>setPrograms(p=>({...p,[client.id]:{...p[client.id],days:p[client.id].days.map(d=>d.id===dayId?{...d,dow}:d)}}));
  const addDay=()=>setPrograms(p=>({...p,[client.id]:{...p[client.id],days:[...p[client.id].days,{id:"d"+Date.now(),name:"New Day",dow:"Mon",ex:[]}]}}));
  const removeDay=(dayId)=>setPrograms(p=>({...p,[client.id]:{...p[client.id],days:p[client.id].days.filter(d=>d.id!==dayId)}}));
  const setPillarTarget=(cid,actId,text)=>setClients(p=>p.map(c=>c.id!==cid?c:{...c,pillarTargets:{...(c.pillarTargets||{}),[actId]:text}}));

  useEffect(()=>{if(!hasBackend||!profile)return;if(profile.role==="coach"||profile.role==="owner"){setRole("coach");const c=coaches.find(x=>x.id===profile.coach_id);if(c)setAuthCoach(c);}else if(profile.role==="athlete"){setRole("client");const c=clients.find(x=>x.id===profile.client_id);if(c)setAuthClient(c);}},[profile,coaches,clients]);

  if(hasBackend&&(!session||!profile))return(<AuthGate onReady={(s,p)=>{setSession(s);setProfile(p);}}/>);
  if(!hydrated)return(<div style={{minHeight:"100vh",background:"#0B0B0C",color:"#807E76",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",fontSize:13,letterSpacing:".08em",textTransform:"uppercase"}}>Loading…</div>);
  if(!role)return(hasBackend?(<div style={{minHeight:"100vh",background:"#0B0B0C",color:"#807E76",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",fontSize:13,letterSpacing:".08em",textTransform:"uppercase"}}>Loading…</div>):(<RolePicker onPick={setRole}/>));
  if(role==="client"){
    if(!authClient)return(<ClientAuth clients={clients} onLogin={setAuthClient} onBack={()=>setRole(null)}/>);
    const cc=clients.find(c=>c.id===authClient.id)||clients[0];
    const coachOf=coaches.find(c=>c.id===cc.coachId);
    return(<ClientApp client={cc} program={programs[cc.id]} clogs={logs[cc.id]||{}} meals={meals[cc.id]||[]} notes={notes[cc.id]||[]} goals={goals[cc.id]||[]} bodylog={bodylog[cc.id]||[]} checkins={checkins[cc.id]||[]} xp={xp[cc.id]||0} coachName={coachOf?coachOf.name.split(" ")[0]:""} photos={photos[cc.id]||[]} freezes={freezes[cc.id]||0} ckday={ckday[cc.id]||""} pillaracts={pillaracts[cc.id]||{}} formvids={formvids[cc.id]||[]} vidUrls={vidUrls} onAddFormVid={(entry,url)=>addFormVid(cc.id,entry,url)} onSetAct={(pid,actId,on)=>setPillarAct(cc.id,pid,actId,on)} onToggleHabit={pid=>toggleHabit(cc.id,pid)} onLogMeal={m=>logMeal(cc.id,m)} onSaveSession={entries=>{saveClientSession(cc.id,entries);addSession(cc.id,{id:"sa"+Date.now(),date:new Date().toISOString().split("T")[0],type:"Program",rate:0,attended:true});}} onXP={amt=>addXP(cc.id,amt)} onAddCheckin={ci=>addCheckin(cc.id,ci)} onSaveGoals={arr=>saveGoals(cc.id,arr)} trackedLifts={tracked[cc.id]||[]} onSetTracked={arr=>setTrackedLifts(cc.id,arr)} onLogBody={e=>logBody(cc.id,e)} onSendChat={text=>onAddNote(cc.id,text,"client")} onAIReply={text=>onAddNote(cc.id,text,"ai")} onAddPhoto={ph=>addPhoto(cc.id,ph)} onUseFreeze={()=>useFreeze(cc.id)} onSetCkday={day=>setCheckinDay(cc.id,day)} misses={misses[cc.id]||[]} onLogMiss={rec=>{logMiss(cc.id,rec);onAddNote(cc.id,"Missed "+rec.dayName+" ("+rec.date+") — "+rec.reason,"client");}} onLogReadiness={rec=>logReadiness(cc.id,rec)} onLogout={doLogout}/>);
  }
  if(!authCoach)return(<CoachAuth coaches={coaches} onLogin={setAuthCoach}/>);

  const crumbs=view==="roster"?["Workspace","Roster"]:view==="planner"?["Clients",client?.name,"Planner"]:view==="sheet"?["Clients",client?.name]:view==="builder"?["Clients",client?.name,"Build"]:view==="team"?["Manage","Team"]:view==="insights"?["AI","Insights"]:view==="sessions"?["Invoicing","Sessions"]:["Workspace","Library"];
  const flaggedCt=clients.map(c=>analyze(c,programs,logs,checkins)).filter(a=>a.score>=14).length;
  const pendingVids=Object.values(formvids).reduce((a,arr)=>a+arr.filter(v=>v.status!=="reviewed").length,0);
  const emptyClient=(<div className="pl"><div className="rhead"><div><div className="kick" style={{marginBottom:8}}>Workspace</div><div className="rtitle">No clients yet</div><div className="rsub">Add your first client to start programming — a starter block is generated automatically.</div></div><button className="btn" onClick={()=>setAddOpen(true)}>＋ Add Client</button></div></div>);

  return(<div className="app">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Archivo+Black&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}{CSS}</style>
    <div className="sidebar">
      <div className="brand"><div className="brand-mark">LL</div><div><div className="brand-name">LIVE LONG</div><div className="brand-sub">Collective · Coach OS</div></div></div>
      <div><div className="sb-lbl">Workspace</div><div className="sb-nav">
        <button className="sb-item" data-on={view==="roster"} onClick={()=>setView("roster")}>📋 Roster<span className="sb-item-ct">{clients.length}</span></button>
        <button className="sb-item" data-on={view==="insights"} onClick={()=>setView("insights")}>🤖 AI Insights{flaggedCt>0&&<span className="sb-item-ct" style={{color:"#FFB23A"}}>{flaggedCt}</span>}</button>
        <button className="sb-item" data-on={view==="builder"} onClick={()=>setView("builder")}>✏️ Build Day</button>
        <button className="sb-item" data-on={view==="planner"} onClick={()=>setView("planner")}>🗓 Planner</button>
        <button className="sb-item" data-on={view==="sheet"} onClick={()=>setView("sheet")}>📝 Program Sheet{pendingVids>0&&<span className="sb-item-ct" style={{color:"#FFB23A"}}>🎥{pendingVids}</span>}</button>
        <button className="sb-item" data-on={view==="sessions"} onClick={()=>setView("sessions")}>🧾 Sessions</button>
        <button className="sb-item" data-on={view==="library"} onClick={()=>setView("library")}>📚 Library<span className="sb-item-ct">{EX.length}</span></button>
        <button className="sb-item" data-on={view==="team"} onClick={()=>setView("team")}>🏢 Team<span className="sb-item-ct">{coaches.length}</span></button>
      </div></div>
      <div><div className="sb-lbl">Clients</div><div className="sb-cl">{clients.map(c=>{const fvp=(formvids[c.id]||[]).some(v=>v.status!=="reviewed");return(<button key={c.id} className="sb-clrow" data-on={(view==="sheet"||view==="planner"||view==="builder")&&clientId===c.id} onClick={()=>openClient(c.id)}><Avatar txt={c.initials} c={c.accent} size={22}/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name.split(" ")[0]}</span>{fvp&&<span title="Form review pending" style={{marginLeft:"auto",fontSize:10}}>🎥</span>}<span style={{marginLeft:fvp?6:"auto",width:6,height:6,borderRadius:"50%",background:c.adherence>.85?"#3AE07A":c.adherence>.7?"#FFB23A":"#54534D"}}/></button>);})}</div></div>
      <div className="coachftr"><Avatar txt={authCoach?.initials||"?"} c={authCoach?.accent||"#FF6B2C"} size={28} /><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{authCoach?.name||"—"}</div><div style={{fontSize:9.5,color:"#807E76"}}>{authCoach?.role}</div></div><button className="btn gho sm" onClick={()=>setProfileOpen(true)} title="Profile" style={{marginRight:6}}>Profile</button><button className="btn gho sm" onClick={doLogout} title="Log out">Log out</button></div>
    </div>
    <div className="main">
      <div className="topbar"><div className="crumbs">{crumbs.map((c,i)=>(<span key={i} style={{display:"contents"}}>{i>0&&<span className="sep">/</span>}{i===crumbs.length-1?<b>{c}</b>:<span>{c}</span>}</span>))}</div><div style={{flex:1}}/>
        {(view==="sheet"||view==="planner"||view==="builder")&&<><button className="btn sec" data-on={view==="builder"} onClick={()=>setView("builder")}>✏️ Build</button><button className="btn sec" onClick={()=>setView("planner")}>🗓 Planner</button><button className="btn sec" onClick={()=>setView("sheet")}>📝 Sheet</button></>}
        <button className="btn" onClick={()=>setView("library")}>＋ Exercise</button>
      </div>
      <div className="content">
        {view==="roster"&&<Roster clients={clients} coaches={coaches} onOpen={openClient} onAddClient={()=>setAddOpen(true)} onEdit={(c)=>setEditId(c.id)} onDelete={removeClient}/>}
        {view==="insights"&&<CoachInsights clients={clients} programs={programs} logs={logs} checkins={checkins} readiness={readiness} onOpen={openClient} onAddCheckin={(cid,ci)=>addCheckin(cid,ci)}/>}
        {view==="sessions"&&<SessionsTracker clients={clients} coaches={coaches} attendance={attendance} authCoach={authCoach} onAddSession={addSession} onToggleAttended={toggleAttended} onRemoveSession={removeSession}/>}
        {view==="builder"&&(client?<ProgramBuilder client={client} program={program} onEditEx={editEx} onAddEx={addEx} onRemoveEx={removeEx} onReorderEx={reorderEx} onRenameDay={renameDay} onSetDow={setDow} onAddDay={addDay} onRemoveDay={removeDay} onSetPillarTarget={setPillarTarget} onSetNutrition={setNutrition}/>:emptyClient)}
        {view==="planner"&&(client?<Planner client={client} program={program} logs={clientLogs} onEditEx={editEx} onSetWeeks={setWeeks} onAddEx={addEx} onRemoveEx={removeEx} onAdvanceWeek={advanceWeek}/>:emptyClient)}
        {view==="sheet"&&(client?<Sheet client={client} program={program} week={week} setWeek={setWeek} logs={clientLogs} onLog={onLog} onAddEx={addEx} onRemoveEx={removeEx} notes={notes} onAddNote={onAddNote} coaches={coaches} formvids={formvids[client.id]||[]} vidUrls={vidUrls} onReviewVid={(id,fb)=>reviewFormVid(client.id,id,fb)}/>:emptyClient)}
        {view==="library"&&<Library/>}
        {view==="team"&&<Team coaches={coaches} clients={clients} onMoveClient={moveClient} onRemoveCoach={removeCoach} onAddCoach={addCoach} isOwner={isOwner} onInviteCoach={hasBackend&&isOwner?()=>setInviteCoachOpen(true):null}/>}
      </div>
    </div>
    {addOpen&&<AddClient onAdd={addClient} onClose={()=>setAddOpen(false)} backend={hasBackend}/>}
    {inviteCoachOpen&&<InviteCoach onInvite={inviteCoach} onClose={()=>setInviteCoachOpen(false)}/>}
    {editId&&(()=>{const ec=clients.find(c=>c.id===editId);return ec?<EditClient client={ec} onSave={editClient} onDelete={removeClient} onClose={()=>setEditId(null)}/>:null;})()}
    {profileOpen&&<Profile name={authCoach?.name||""} email={session?.user?.email||profile?.email||""} onClose={()=>setProfileOpen(false)}/>}
  </div>);
}
