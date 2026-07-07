// App.jsx — root: state, persistence (window.storage), role routing & view dispatch
import { useState, useEffect, useRef } from "react";
import SaveErrorBar from "./shared/SaveErrorBar";
import CommunityCoach from "./coach/CommunityCoach";
import { hasBackend } from "./lib/supabase";
import * as db from "./lib/db";
import AuthGate from "./auth/AuthGate";
import { COACHES0, CLIENTS0, makeProgram, seedLogs, seedPillarActs } from "./constants/seed";
import { migrateProgram, editWeekEx as pEditWeekEx, editAllWeeks, cloneWeek as pCloneWeek, addWeek as pAddWeek, removeWeek as pRemoveWeek, addExWeek as pAddExWeek, removeExWeek as pRemoveExWeek } from "./lib/program";
import { setCustomExercises } from "./constants/exercises";
import { PILLAR_ACTS } from "./constants/pillars";
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
import Team from "./coach/Team";

export default function App(){
  const [coaches,setCoaches]=useState(hasBackend?[]:COACHES0);
  const [clients,setClients]=useState(hasBackend?[]:CLIENTS0);
  const [programs,setPrograms]=useState(()=>hasBackend?{}:Object.fromEntries(CLIENTS0.map(c=>[c.id,migrateProgram(makeProgram(c),c.totalWeeks)])));
  const [logs,setLogs]=useState(()=>hasBackend?{}:Object.fromEntries(CLIENTS0.map(c=>[c.id,seedLogs(c,makeProgram(c))])));
  const [notes,setNotes]=useState(hasBackend?{}:{mar:[{date:"Apr 30",author:"Adam",from:"coach",text:"Bar speed on 355 squat looked strong — bumping base next week. Proud of you, Marcus."}]});
  const [meals,setMeals]=useState({});
  const [customfoods,setCustomfoods]=useState({});
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
  const [,setCustTick]=useState(0);   // bump to re-render after custom exercises register
  const [clientId,setClientId]=useState("mar");
  const [week,setWeek]=useState(4);
  const [hydrated,setHydrated]=useState(false);
  const [misses,setMisses]=useState({});
  const [readiness,setReadiness]=useState({});
  const [pillaracts,setPillaracts]=useState(hasBackend?{}:seedPillarActs);
  const [community,setCommunity]=useState({challenges:[],progress:[],wins:[],reactions:[],comments:[]});
  const [myUid,setMyUid]=useState(null);
  const [cmLoaded,setCmLoaded]=useState(false);
  const [seencoach,setSeencoach]=useState(hasBackend?{}:{});
  const [seenreview,setSeenreview]=useState(hasBackend?{}:{});
  const [formvids,setFormvids]=useState({});
  const [vidUrls,setVidUrls]=useState({});
  const [tracked,setTracked]=useState({});
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);

  // ---- Supabase snapshot + load (active only when a backend is configured) ----
  const buildSnapshot=()=>{
    const state={};
    clients.forEach(c=>{state[c.id]={program:programs[c.id],logs:logs[c.id]||{},notes:notes[c.id]||[],meals:meals[c.id]||[],customfoods:customfoods[c.id]||[],goals:goals[c.id]||[],checkins:checkins[c.id]||[],bodylog:bodylog[c.id]||[],photos:photos[c.id]||[],misses:misses[c.id]||[],readiness:readiness[c.id]||[],pillaracts:pillaracts[c.id]||{},attendance:attendance[c.id]||[],formvids:formvids[c.id]||[],xp:xp[c.id]||0,freezes:freezes[c.id]||0,ckday:ckday[c.id]||"",tracked:tracked[c.id]||[],seencoach:seencoach[c.id]||0,seenreview:seenreview[c.id]||0};});
    if(attendance["_uncli"])state["_uncli"]={program:null,logs:{},notes:[],meals:[],goals:[],checkins:[],bodylog:[],photos:[],misses:[],readiness:[],pillaracts:{},attendance:attendance["_uncli"],formvids:[],xp:0,freezes:0,ckday:null};
    return {coaches,clients,state};
  };
  const loadBackend=async()=>{
    try{
      const {coaches:co,clients:cl,stateById}=await db.loadAll();
      if(co.length)setCoaches(co);
      if(cl.length)setClients(cl);
      const m={programs:{},logs:{},notes:{},meals:{},customfoods:{},xp:{},goals:{},checkins:{},bodylog:{},photos:{},freezes:{},ckday:{},attendance:{},misses:{},readiness:{},pillaracts:{},formvids:{},tracked:{},seencoach:{},seenreview:{}};
      Object.entries(stateById).forEach(([cid,s])=>{if(s.program)m.programs[cid]=s.program;m.logs[cid]=s.logs||{};m.notes[cid]=s.notes||[];m.meals[cid]=s.meals||[];m.customfoods[cid]=s.customfoods||[];m.xp[cid]=s.xp||0;m.goals[cid]=s.goals||[];m.checkins[cid]=s.checkins||[];m.bodylog[cid]=s.bodylog||[];m.photos[cid]=s.photos||[];m.freezes[cid]=s.freezes||0;if(s.ckday)m.ckday[cid]=s.ckday;m.attendance[cid]=s.attendance||[];m.misses[cid]=s.misses||[];m.readiness[cid]=s.readiness||[];m.pillaracts[cid]=s.pillaracts||{};m.formvids[cid]=s.formvids||[];m.tracked[cid]=s.tracked||[];m.seencoach[cid]=s.seencoach||0;m.seenreview[cid]=s.seenreview||0;});
      cl.forEach(c=>{if(!m.programs[c.id]){const prog=makeProgram(c);m.programs[c.id]=prog;if(!stateById[c.id])m.logs[c.id]=seedLogs(c,prog);}});
      cl.forEach(c=>{if(m.programs[c.id])m.programs[c.id]=migrateProgram(m.programs[c.id],c.totalWeeks);});
      db.primeCache({coaches:co,clients:cl,state:stateById});
      setPrograms(m.programs);setLogs(m.logs);setNotes(m.notes);setMeals(m.meals);setCustomfoods(m.customfoods);setXp(m.xp);setGoals(m.goals);setCheckins(m.checkins);setBodylog(m.bodylog);setPhotos(m.photos);setFreezes(m.freezes);setCkday(m.ckday);setAttendance(m.attendance);setMisses(m.misses);setReadiness(m.readiness);if(Object.keys(m.pillaracts).length)setPillaracts(m.pillaracts);setFormvids(m.formvids);setTracked(m.tracked);setSeencoach(m.seencoach);setSeenreview(m.seenreview);
      try{const cx=await db.loadCustomExercises();setCustomExercises(cx);setCustTick(t=>t+1);}catch(e){console.error("LLC custom-ex load",e);}
      try{const cm=await db.loadCommunity();setCommunity(cm);}catch(e){console.error("LLC community load",e);}finally{setCmLoaded(true);}
      db.myAuthId().then(setMyUid).catch(()=>{});
    }catch(e){console.error("LLC load error",e);}
    setHydrated(true);
  };
  const doLogout=async()=>{if(hasBackend){try{await db.signOut();}catch(e){}setSession(null);setProfile(null);}setAuthClient(null);setAuthCoach(null);setRole(null);};

  useEffect(()=>{if(hasBackend){if(profile)loadBackend();return;}(async()=>{try{const r=await window.storage.get("llc_store",false);if(r&&r.value){const d=JSON.parse(r.value);if(d.coaches)setCoaches(d.coaches.map(c=>{const df=COACHES0.find(x=>x.id===c.id);return df?{...df,...c}:c;}));if(d.clients)setClients(d.clients.map(c=>{const df=CLIENTS0.find(x=>x.id===c.id);return df?{...df,...c}:c;}));if(d.programs)setPrograms(Object.fromEntries(Object.entries(d.programs).map(([pid,pr])=>{const cc=(d.clients||CLIENTS0).find(x=>x.id===pid);return [pid,migrateProgram(pr,cc?cc.totalWeeks:1)];})));if(d.logs)setLogs(d.logs);if(d.notes)setNotes(d.notes);if(d.meals)setMeals(d.meals);if(d.customfoods)setCustomfoods(d.customfoods);if(d.xp)setXp(d.xp);if(d.goals)setGoals(d.goals);if(d.checkins)setCheckins(d.checkins);if(d.bodylog)setBodylog(d.bodylog);if(d.photos)setPhotos(d.photos);if(d.freezes)setFreezes(d.freezes);if(d.ckday)setCkday(d.ckday);if(d.attendance)setAttendance(d.attendance);if(d.misses)setMisses(d.misses);if(d.readiness)setReadiness(d.readiness);if(d.pillaracts)setPillaracts(d.pillaracts);if(d.formvids)setFormvids(d.formvids);if(d.tracked)setTracked(d.tracked);if(d.seencoach)setSeencoach(d.seencoach);if(d.seenreview)setSeenreview(d.seenreview);}}catch(e){}try{const rp=await window.storage.get("llc_photos",false);if(rp&&rp.value)setPhotos(JSON.parse(rp.value));}catch(e){}setHydrated(true);})();},[profile]);
  const [saveErr,setSaveErr]=useState(false);
  const retrySave=()=>{if(hasBackend)db.persist(buildSnapshot()).then(()=>setSaveErr(false)).catch(e=>{console.error("LLC save retry",e);setSaveErr(true);});};
  useEffect(()=>{if(!hydrated)return;if(hasBackend){const t=setTimeout(()=>{db.persist(buildSnapshot()).then(()=>setSaveErr(false)).catch(e=>{console.error("LLC save error",e);setSaveErr(true);});},700);return()=>clearTimeout(t);}const t=setTimeout(()=>{try{window.storage.set("llc_store",JSON.stringify({coaches,clients,programs,logs,notes,meals,customfoods,xp,goals,checkins,bodylog,freezes,ckday,attendance,misses,readiness,pillaracts,formvids,tracked,seencoach,seenreview}),false);}catch(e){}try{window.storage.set("llc_photos",JSON.stringify(photos),false);}catch(e){}},600);return()=>clearTimeout(t);},[coaches,clients,programs,logs,notes,meals,customfoods,xp,goals,checkins,bodylog,photos,freezes,ckday,attendance,misses,readiness,pillaracts,formvids,tracked,seencoach,seenreview,hydrated]);

  const setHabit=(cid,pid,on)=>{const c=clients.find(x=>x.id===cid);if(!c)return;const was=!!(c.hab&&c.hab[pid]);if(was===on)return;const ns=Math.max(0,((c.streak&&c.streak[pid])||0)+(on?1:-1));if(on&&ns>0&&ns%7===0)setFreezes(f=>({...f,[cid]:(f[cid]||0)+1}));setClients(p=>p.map(x=>x.id!==cid?x:{...x,hab:{...(x.hab||{}),[pid]:on},streak:{...(x.streak||{}),[pid]:ns}}));};
  const setPillarAct=(cid,pid,actId,on)=>{const dt=new Date().toISOString().split("T")[0];const c=pillaracts[cid]||{};const day=c[dt]||{};const pl={...(day[pid]||{})};if(on)pl[actId]=true;else delete pl[actId];setPillaracts({...pillaracts,[cid]:{...c,[dt]:{...day,[pid]:pl}}});const total=(PILLAR_ACTS[pid]||[]).length;setHabit(cid,pid,total>0&&Object.keys(pl).length>=total);};
  const toggleHabit=(cid,pid)=>{const c=clients.find(x=>x.id===cid);if(!c)return;const on=!(c.hab&&c.hab[pid]);const dt=new Date().toISOString().split("T")[0];const acts={};if(on)(PILLAR_ACTS[pid]||[]).forEach(a=>acts[a]=true);const cc=pillaracts[cid]||{};const day=cc[dt]||{};setPillaracts({...pillaracts,[cid]:{...cc,[dt]:{...day,[pid]:acts}}});setHabit(cid,pid,on);};
  const logMeal=(cid,m)=>setMeals(p=>({...p,[cid]:[...(p[cid]||[]),m]}));
  const delMeal=(cid,mid)=>setMeals(p=>({...p,[cid]:(p[cid]||[]).filter(m=>m.id!==mid)}));
  const addCustomFood=(cid,food)=>setCustomfoods(p=>({...p,[cid]:[...(p[cid]||[]),food]}));
  const deleteCustomFood=(cid,fid)=>setCustomfoods(p=>({...p,[cid]:(p[cid]||[]).filter(x=>x.id!==fid)}));
  const saveClientSession=(cid,entries)=>setLogs(p=>({...p,[cid]:{...(p[cid]||{}),...entries}}));
  const addXP=(cid,amt)=>setXp(p=>({...p,[cid]:(p[cid]||0)+amt}));
  const addCheckin=(cid,ci)=>setCheckins(p=>({...p,[cid]:[...(p[cid]||[]),ci]}));
  const saveGoals=(cid,arr)=>setGoals(p=>({...p,[cid]:arr}));
  const setTrackedLifts=(cid,arr)=>setTracked(p=>({...p,[cid]:arr}));
  const logBody=(cid,e)=>setBodylog(p=>({...p,[cid]:[...(p[cid]||[]),e]}));
  const addPhoto=(cid,ph)=>setPhotos(p=>({...p,[cid]:[...(p[cid]||[]),ph]}));
  const delPhoto=(cid,id)=>setPhotos(p=>({...p,[cid]:(p[cid]||[]).filter(x=>x.id!==id)}));
  const useFreeze=(cid)=>setFreezes(f=>({...f,[cid]:Math.max(0,(f[cid]||0)-1)}));
  const setCheckinDay=(cid,day)=>setCkday(p=>({...p,[cid]:day}));
  const addSession=(cid,s)=>setAttendance(p=>({...p,[cid]:[...(p[cid]||[]),s]}));
  const toggleAttended=(cid,id)=>setAttendance(p=>({...p,[cid]:(p[cid]||[]).map(s=>s.id===id?{...s,attended:!s.attended}:s)}));
  const removeSession=(cid,id)=>setAttendance(p=>({...p,[cid]:(p[cid]||[]).filter(s=>s.id!==id)}));
  const markSeenCoach=(cid)=>setSeencoach(p=>({...p,[cid]:(notes[cid]||[]).filter(n=>n.from==="coach").length}));
  const markSeenReview=(cid)=>setSeenreview(p=>({...p,[cid]:(formvids[cid]||[]).filter(v=>v.status==="reviewed").length}));

  // ---- community: derived scoring + auto-wins -------------------------------
  const nameOf=Object.fromEntries([...clients.map(c=>[c.id,c.name||"Athlete"]),...(community.roster||[]).map(r=>[r.id,r.name||"Athlete"])]);
  const accentOf=Object.fromEntries([...clients.map(c=>[c.id,c.accent||"#FF6B2C"]),...(community.roster||[]).map(r=>[r.id,r.accent||"#FF6B2C"])]);
  const countLeaves=(o)=>{let n=0;const walk=v=>{if(v===true)n++;else if(v&&typeof v==="object")Object.values(v).forEach(walk);};walk(o);return n;};
  const computeMetric=(cid,ch)=>{
    const since=ch&&ch.starts_on?ch.starts_on:null;const m=ch?ch.metric:null;
    if(m==="sessions")return (attendance[cid]||[]).filter(a=>a.attended!==false&&(!since||(a.date||"")>=since)).length;
    if(m==="checkins")return (checkins[cid]||[]).length; // display-string dates; cumulative until ISO-dated
    if(m==="pillar_points"){const o=pillaracts[cid]||{};let n=0;Object.entries(o).forEach(([dt,pl])=>{if(since&&dt<since)return;const walk=v=>{if(v===true)n++;else if(v&&typeof v==="object")Object.values(v).forEach(walk);};walk(pl);});return n;}
    return null;
  };
  const upsertProgLocal=(arr,chId,cid,val)=>{const i=arr.findIndex(p=>p.challenge_id===chId&&p.client_id===cid);if(i<0)return [...arr,{challenge_id:chId,client_id:cid,value:val}];const c=arr.slice();c[i]={...c[i],value:val};return c;};
  const postWinFor=(cid,w)=>{const win={client_id:cid,kind:w.kind||"note",title:w.title,detail:w.detail||"",icon:w.icon||"🔥",visible:w.visible!==false};db.postWin(win).then(sv=>{if(sv)setCommunity(c=>({...c,wins:[sv,...c.wins]}));}).catch(e=>console.error("LLC win",e));};
  const deleteWinFor=(id)=>{setCommunity(c=>({...c,wins:c.wins.filter(w=>w.id!==id),reactions:c.reactions.filter(r=>r.win_id!==id)}));db.deleteWin(id).catch(()=>{});};
  const reactWin=(winId,emoji,on)=>{
    if(on){setCommunity(c=>({...c,reactions:[...c.reactions,{win_id:winId,emoji,actor:myUid,_opt:true}]}));db.addReaction(winId,emoji).then(r=>{if(r)setCommunity(c=>({...c,reactions:c.reactions.map(x=>(x._opt&&x.win_id===winId&&x.emoji===emoji)?r:x)}));}).catch(()=>{});}
    else{setCommunity(c=>({...c,reactions:c.reactions.filter(r=>!(r.win_id===winId&&r.emoji===emoji&&r.actor===myUid))}));db.removeReaction(winId,emoji).catch(()=>{});}
  };
  const createChallengeFor=async(c)=>{const sv=await db.createChallenge(c);if(sv)setCommunity(s2=>({...s2,challenges:[sv,...s2.challenges]}));return sv;};
  const endChallengeFor=(id)=>{setCommunity(s2=>({...s2,challenges:s2.challenges.filter(c=>c.id!==id)}));db.endChallenge(id).catch(()=>{});};
  const addCommentFor=(winId,body,kind,name)=>{const t=(body||"").trim();if(!t)return;const oid="c"+Date.now()+Math.random().toString(36).slice(2,6);const opt={id:oid,win_id:winId,author:myUid,author_kind:kind,author_name:name,body:t,created_at:new Date().toISOString(),_opt:true};setCommunity(c=>({...c,comments:[...(c.comments||[]),opt]}));db.addComment(winId,t,kind,name).then(sv=>{if(sv)setCommunity(c=>({...c,comments:(c.comments||[]).map(x=>x.id===oid?sv:x)}));}).catch(e=>{console.error("LLC comment",e);setCommunity(c=>({...c,comments:(c.comments||[]).filter(x=>x.id!==oid)}));});};
  const deleteCommentFor=(id)=>{setCommunity(c=>({...c,comments:(c.comments||[]).filter(x=>x.id!==id)}));db.deleteComment(id).catch(()=>{});};
  const progRef=useRef({});
  const wonRef=useRef(new Set());
  useEffect(()=>{
    if(!hasBackend||role!=="client"||!authClient)return;
    const cid=authClient.id;
    community.challenges.forEach(ch=>{
      const val=computeMetric(cid,ch);
      if(val==null)return;
      if(progRef.current[ch.id]===val)return;
      progRef.current[ch.id]=val;
      db.upsertProgress(ch.id,cid,val).catch(()=>{});
      setCommunity(c=>({...c,progress:upsertProgLocal(c.progress,ch.id,cid,val)}));
    });
  },[attendance,checkins,pillaracts,community.challenges,role,authClient]);
  useEffect(()=>{
    if(!hasBackend||role!=="client"||!authClient||!cmLoaded)return;
    const cid=authClient.id;
    const defs=[
      {n:(attendance[cid]||[]).filter(a=>a.attended!==false).length,ms:[10,25,50,100,150,200,300],kind:"session",icon:"🏋️",label:v=>v+" sessions logged"},
      {n:(checkins[cid]||[]).length,ms:[5,10,25,50,100,150],kind:"checkin",icon:"✅",label:v=>v+" check-ins — consistency on lock"},
    ];
    defs.forEach(({n,ms,kind,icon,label})=>{
      const hit=ms.filter(m=>n>=m).pop();
      if(!hit)return;
      const title=label(hit);
      const tag=cid+"|"+title;
      if(wonRef.current.has(tag))return;
      if(community.wins.some(w=>w.client_id===cid&&w.title===title)){wonRef.current.add(tag);return;}
      wonRef.current.add(tag);
      postWinFor(cid,{kind,title,icon});
    });
  },[attendance,checkins,role,authClient,community.wins,cmLoaded]);
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
    setPrograms(p=>({...p,[id]:migrateProgram(prog,c.totalWeeks)}));
    setLogs(p=>({...p,[id]:{}}));
    setPillaracts(p=>({...p,[id]:{}}));
    setAddOpen(false);setClientId(id);setWeek(1);setView("builder");
  };
  const [editId,setEditId]=useState(null);
  const editClient=(id,patch)=>setClients(p=>p.map(c=>c.id===id?{...c,...patch}:c));
  const stripClientLocal=(id)=>{const drop=(m)=>{const n={...m};delete n[id];return n;};setClients(p=>p.filter(c=>c.id!==id));setPrograms(drop);setLogs(drop);setNotes(drop);setMeals(drop);setCustomfoods(drop);setGoals(drop);setCheckins(drop);setBodylog(drop);setPhotos(drop);setMisses(drop);setReadiness(drop);setPillaracts(drop);setAttendance(drop);setFormvids(drop);setXp(drop);setFreezes(drop);setCkday(drop);setTracked(drop);};
  const removeClient=async(id)=>{
    if(hasBackend){try{await db.deleteClient(id);}catch(e){alert("Couldn't delete: "+(e.message||e));return;}}
    stripClientLocal(id);setEditId(null);setView("roster");
  };
  const addFormVid=(cid,entry,url)=>{setFormvids(p=>({...p,[cid]:[entry,...(p[cid]||[])]}));setVidUrls(u=>({...u,[entry.id]:url}));};
  const delFormVid=(cid,id)=>{const v=(formvids[cid]||[]).find(x=>x.id===id);if(v&&v.path)db.deleteFormVideo(v.path);setFormvids(p=>({...p,[cid]:(p[cid]||[]).filter(x=>x.id!==id)}));};
  const reviewFormVid=(cid,id,feedback)=>{const v=(formvids[cid]||[]).find(x=>x.id===id);setFormvids(p=>({...p,[cid]:(p[cid]||[]).map(x=>x.id===id?{...x,feedback,status:"reviewed"}:x)}));onAddNote(cid,"🎥 Form review — "+(v?v.label:"your clip")+": "+feedback,"coach");};

  const client=clients.find(c=>c.id===clientId)||clients[0];
  const program=client?programs[client.id]:null;
  const clientLogs=client?(logs[client.id]||{}):{};

  const openClient=id=>{const c=clients.find(x=>x.id===id);setClientId(id);setWeek(c?.currentWeek||1);setView("sheet");};
  const onLog=(key,data)=>setLogs(p=>({...p,[client.id]:{...(p[client.id]||{}),[key]:data}}));
  const onAddNote=(cid,text,from)=>setNotes(p=>({...p,[cid]:[{date:new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}),author:from==="client"?(clients.find(c=>c.id===cid)?.name.split(" ")[0]||"Athlete"):(from==="ai"?"Coach Adam":(authCoach?.name.split(" ")[0]||"Coach")),text,from:from||"coach"},...(p[cid]||[])]}));
  const editEx=(dayId,exId,patch)=>setPrograms(p=>({...p,[client.id]:editAllWeeks(p[client.id],days=>days.map(d=>d.id!==dayId?d:{...d,ex:d.ex.map(x=>x.exId===exId?{...x,...patch}:x)}))}));
  const editWeekEx=(w,dayId,exId,patch)=>setPrograms(p=>({...p,[client.id]:pEditWeekEx(p[client.id],w,dayId,exId,patch)}));
  const addExW=(w,dayId,exId)=>setPrograms(p=>({...p,[client.id]:pAddExWeek(p[client.id],w,dayId,exId)}));
  const removeExW=(w,dayId,exId)=>setPrograms(p=>({...p,[client.id]:pRemoveExWeek(p[client.id],w,dayId,exId)}));
  const cloneToNext=(w)=>setPrograms(p=>({...p,[client.id]:pCloneWeek(p[client.id],w,w+1)}));
  const addWeek=()=>{setPrograms(p=>({...p,[client.id]:pAddWeek(p[client.id])}));setClients(cs=>cs.map(c=>c.id!==client.id?c:{...c,totalWeeks:(c.totalWeeks||1)+1}));};
  const removeWeek=(w)=>{setPrograms(p=>({...p,[client.id]:pRemoveWeek(p[client.id],w)}));setClients(cs=>cs.map(c=>c.id!==client.id?c:{...c,totalWeeks:Math.max(1,(c.totalWeeks||1)-1),currentWeek:Math.min(c.currentWeek,Math.max(1,(c.totalWeeks||1)-1))}));};
  const addEx=(dayId,exId)=>setPrograms(p=>({...p,[client.id]:editAllWeeks(p[client.id],days=>days.map(d=>d.id!==dayId?d:{...d,ex:[...d.ex,{exId,role:"accessory",sets:3,reps:10,load:100,loadMode:"fixed",mod:"straight",tempo:"",grp:"",note:""}]}))}));
  const removeEx=(dayId,exId)=>setPrograms(p=>({...p,[client.id]:editAllWeeks(p[client.id],days=>days.map(d=>d.id!==dayId?d:{...d,ex:d.ex.filter(x=>x.exId!==exId)}))}));
  const setWeeks=patch=>setClients(p=>p.map(c=>c.id!==client.id?c:{...c,...patch,currentWeek:Math.min(c.currentWeek,patch.totalWeeks||c.totalWeeks)}));
  const advanceWeek=delta=>setClients(p=>p.map(c=>c.id!==client.id?c:{...c,currentWeek:Math.max(1,Math.min(c.totalWeeks,c.currentWeek+delta))}));
  const moveClient=(cid,coachId)=>setClients(p=>p.map(c=>c.id===cid?{...c,coachId}:c));
  const removeCoach=(coachId,toId)=>{setClients(p=>p.map(c=>c.coachId===coachId?{...c,coachId:toId}:c));setCoaches(p=>p.filter(c=>c.id!==coachId));};
  const addCoach=name=>{const initials=name.trim().split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();const accent=["#FF6B2C","#3AE0FF","#FF3A8E","#9EFF3A","#FFB23A"][coaches.length%5];setCoaches(p=>[...p,{id:"co_"+Date.now(),name,initials,role:"Coach",accent}]);};
  const reorderEx=(dayId,exId,dir)=>setPrograms(p=>({...p,[client.id]:editAllWeeks(p[client.id],days=>days.map(d=>{if(d.id!==dayId)return d;const i=d.ex.findIndex(x=>x.exId===exId);const j=i+dir;if(i<0||j<0||j>=d.ex.length)return d;const ex=[...d.ex];const t=ex[i];ex[i]=ex[j];ex[j]=t;return{...d,ex};}))}));
  const renameDay=(dayId,name)=>setPrograms(p=>({...p,[client.id]:editAllWeeks(p[client.id],days=>days.map(d=>d.id===dayId?{...d,name}:d))}));
  const setDow=(dayId,dow)=>setPrograms(p=>({...p,[client.id]:editAllWeeks(p[client.id],days=>days.map(d=>d.id===dayId?{...d,dow}:d))}));
  const addDay=()=>{const nid="d"+Date.now();setPrograms(p=>({...p,[client.id]:editAllWeeks(p[client.id],days=>[...days,{id:nid,name:"New Day",dow:"Mon",ex:[]}])}));};
  const removeDay=(dayId)=>setPrograms(p=>({...p,[client.id]:editAllWeeks(p[client.id],days=>days.filter(d=>d.id!==dayId))}));
  const setPillarTarget=(cid,actId,text)=>setClients(p=>p.map(c=>c.id!==cid?c:{...c,pillarTargets:{...(c.pillarTargets||{}),[actId]:text}}));

  useEffect(()=>{if(!hasBackend||!profile)return;if(profile.role==="coach"||profile.role==="owner"){setRole("coach");const c=coaches.find(x=>x.id===profile.coach_id);if(c)setAuthCoach(c);}else if(profile.role==="athlete"){setRole("client");const c=clients.find(x=>x.id===profile.client_id);if(c)setAuthClient(c);}},[profile,coaches,clients]);

  if(hasBackend&&(!session||!profile))return(<AuthGate onReady={(s,p)=>{setSession(s);setProfile(p);}}/>);
  if(!hydrated)return(<div style={{minHeight:"100vh",background:"#0B0B0C",color:"#807E76",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",fontSize:13,letterSpacing:".08em",textTransform:"uppercase"}}>Loading…</div>);
  if(!role)return(hasBackend?(<div style={{minHeight:"100vh",background:"#0B0B0C",color:"#807E76",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",fontSize:13,letterSpacing:".08em",textTransform:"uppercase"}}>Loading…</div>):(<RolePicker onPick={setRole}/>));
  if(role==="client"){
    if(!authClient)return(<ClientAuth clients={clients} onLogin={setAuthClient} onBack={()=>setRole(null)}/>);
    const cc=clients.find(c=>c.id===authClient.id)||clients[0];
    const coachOf=coaches.find(c=>c.id===cc.coachId);
    return(<>{saveErr&&<SaveErrorBar onRetry={retrySave}/>}<ClientApp client={cc} program={programs[cc.id]} clogs={logs[cc.id]||{}} meals={meals[cc.id]||[]} notes={notes[cc.id]||[]} goals={goals[cc.id]||[]} bodylog={bodylog[cc.id]||[]} checkins={checkins[cc.id]||[]} xp={xp[cc.id]||0} coachName={coachOf?coachOf.name.split(" ")[0]:""} photos={photos[cc.id]||[]} freezes={freezes[cc.id]||0} ckday={ckday[cc.id]||""} pillaracts={pillaracts[cc.id]||{}} formvids={formvids[cc.id]||[]} vidUrls={vidUrls} onAddFormVid={(entry,url)=>addFormVid(cc.id,entry,url)} onSetAct={(pid,actId,on)=>setPillarAct(cc.id,pid,actId,on)} onToggleHabit={pid=>toggleHabit(cc.id,pid)} onLogMeal={m=>logMeal(cc.id,m)} onSaveSession={entries=>{saveClientSession(cc.id,entries);addSession(cc.id,{id:"sa"+Date.now(),date:new Date().toISOString().split("T")[0],type:"Program",rate:0,attended:true});}} onXP={amt=>addXP(cc.id,amt)} onAddCheckin={ci=>addCheckin(cc.id,ci)} onSaveGoals={arr=>saveGoals(cc.id,arr)} trackedLifts={tracked[cc.id]||[]} onSetTracked={arr=>setTrackedLifts(cc.id,arr)} onLogBody={e=>logBody(cc.id,e)} onSendChat={text=>onAddNote(cc.id,text,"client")} onAIReply={text=>onAddNote(cc.id,text,"ai")} onAddPhoto={ph=>addPhoto(cc.id,ph)} onDeletePhoto={id=>delPhoto(cc.id,id)} onDeleteFormVid={id=>delFormVid(cc.id,id)} onUseFreeze={()=>useFreeze(cc.id)} onSetCkday={day=>setCheckinDay(cc.id,day)} misses={misses[cc.id]||[]} onLogMiss={rec=>{logMiss(cc.id,rec);onAddNote(cc.id,"Missed "+rec.dayName+" ("+rec.date+") — "+rec.reason,"client");}} onLogReadiness={rec=>logReadiness(cc.id,rec)} unreadCoach={Math.max(0,(notes[cc.id]||[]).filter(n=>n.from==="coach").length-(seencoach[cc.id]||0))} unreadReview={Math.max(0,(formvids[cc.id]||[]).filter(v=>v.status==="reviewed").length-(seenreview[cc.id]||0))} onSeenCoach={()=>markSeenCoach(cc.id)} onSeenReview={()=>markSeenReview(cc.id)} communityData={community} cmUid={myUid} cmNames={nameOf} cmAccents={accentOf} onPostWin={w=>postWinFor(cc.id,w)} onReactWin={reactWin} onDeleteWin={deleteWinFor} onAddComment={(winId,body)=>addCommentFor(winId,body,"client",(cc.name||"Athlete").split(" ")[0])} onDeleteComment={deleteCommentFor} customFoods={customfoods[cc.id]||[]} onAddCustomFood={food=>addCustomFood(cc.id,food)} onDeleteCustomFood={fid=>deleteCustomFood(cc.id,fid)} onSetNutrition={nt=>setNutrition(cc.id,nt)} onDeleteMeal={mid=>delMeal(cc.id,mid)} onLogout={doLogout}/></>);
  }
  if(!authCoach)return(<CoachAuth coaches={coaches} onLogin={setAuthCoach}/>);

  const crumbs=view==="roster"?["Workspace","Roster"]:view==="planner"?["Clients",client?.name,"Planner"]:view==="sheet"?["Clients",client?.name]:view==="builder"?["Clients",client?.name,"Build"]:view==="team"?["Manage","Team"]:view==="insights"?["AI","Insights"]:view==="sessions"?["Invoicing","Sessions"]:["Workspace","Roster"];
  const flaggedCt=clients.map(c=>analyze(c,programs,logs,checkins)).filter(a=>a.score>=14).length;
  const pendingVids=Object.values(formvids).reduce((a,arr)=>a+arr.filter(v=>v.status!=="reviewed").length,0);
  const emptyClient=(<div className="pl"><div className="rhead"><div><div className="kick" style={{marginBottom:8}}>Workspace</div><div className="rtitle">No clients yet</div><div className="rsub">Add your first client to start programming — a starter block is generated automatically.</div></div><button className="btn" onClick={()=>setAddOpen(true)}>＋ Add Client</button></div></div>);

  return(<div className="app">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Archivo+Black&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}{CSS}</style>
    <div className="sidebar">
      <div className="brand"><img src="/logo.png" alt="" style={{width:28,height:28,objectFit:"contain"}} /><div><div className="brand-name">LIVE LONG</div><div className="brand-sub">Collective · Coach OS</div></div></div>
      <div><div className="sb-lbl">Workspace</div><div className="sb-nav">
        <button className="sb-item" data-on={view==="roster"} onClick={()=>setView("roster")}>📋 Roster<span className="sb-item-ct">{clients.length}</span></button>
        <button className="sb-item" data-on={view==="insights"} onClick={()=>setView("insights")}>🤖 AI Insights{flaggedCt>0&&<span className="sb-item-ct" style={{color:"#FFB23A"}}>{flaggedCt}</span>}</button>
        <button className="sb-item" data-on={view==="builder"} onClick={()=>setView("builder")}>✏️ Build Day</button>
        <button className="sb-item" data-on={view==="planner"} onClick={()=>setView("planner")}>🗓 Planner</button>
        <button className="sb-item" data-on={view==="sheet"} onClick={()=>setView("sheet")}>📝 Program Sheet{pendingVids>0&&<span className="sb-item-ct" style={{color:"#FFB23A"}}>🎥{pendingVids}</span>}</button>
        <button className="sb-item" data-on={view==="sessions"} onClick={()=>setView("sessions")}>🧾 Sessions</button>
        <button className="sb-item" data-on={view==="community"} onClick={()=>setView("community")}>🏆 Community</button>
        <button className="sb-item" data-on={view==="team"} onClick={()=>setView("team")}>🏢 Team<span className="sb-item-ct">{coaches.length}</span></button>
      </div></div>
      <div><div className="sb-lbl">Clients</div><div className="sb-cl">{clients.map(c=>{const fvp=(formvids[c.id]||[]).some(v=>v.status!=="reviewed");return(<button key={c.id} className="sb-clrow" data-on={(view==="sheet"||view==="planner"||view==="builder")&&clientId===c.id} onClick={()=>openClient(c.id)}><Avatar txt={c.initials} c={c.accent} size={22}/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name.split(" ")[0]}</span>{fvp&&<span title="Form review pending" style={{marginLeft:"auto",fontSize:10}}>🎥</span>}<span style={{marginLeft:fvp?6:"auto",width:6,height:6,borderRadius:"50%",background:c.adherence>.85?"#3AE07A":c.adherence>.7?"#FFB23A":"#54534D"}}/></button>);})}</div></div>
      <div className="coachftr"><div className="cf-id"><Avatar txt={authCoach?.initials||"?"} c={authCoach?.accent||"#FF6B2C"} size={28} /><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{authCoach?.name||"—"}</div><div style={{fontSize:11,color:"#807E76"}}>{authCoach?.role}</div></div></div><div className="cf-btns"><button className="btn gho sm" onClick={()=>setProfileOpen(true)} title="Profile">Profile</button><button className="btn gho sm" onClick={doLogout} title="Log out">Log out</button></div></div>
    </div>
    <div className="main">
      <div className="topbar"><div className="crumbs">{crumbs.map((c,i)=>(<span key={i} style={{display:"contents"}}>{i>0&&<span className="sep">/</span>}{i===crumbs.length-1?<b>{c}</b>:<span>{c}</span>}</span>))}</div><div style={{flex:1}}/>
        {(view==="sheet"||view==="planner"||view==="builder")&&<><button className="btn sec" data-on={view==="builder"} onClick={()=>setView("builder")}>✏️ Build</button><button className="btn sec" onClick={()=>setView("planner")}>🗓 Planner</button><button className="btn sec" onClick={()=>setView("sheet")}>📝 Sheet</button></>}
      </div>
      <div className="content">
        {view==="roster"&&<Roster clients={clients} coaches={coaches} onOpen={openClient} onAddClient={()=>setAddOpen(true)} onEdit={(c)=>setEditId(c.id)} onDelete={removeClient}/>}
        {view==="insights"&&<CoachInsights clients={clients} programs={programs} logs={logs} checkins={checkins} readiness={readiness} onOpen={openClient} onAddCheckin={(cid,ci)=>addCheckin(cid,ci)}/>}
        {view==="sessions"&&<SessionsTracker clients={clients} coaches={coaches} attendance={attendance} authCoach={authCoach} onAddSession={addSession} onToggleAttended={toggleAttended} onRemoveSession={removeSession}/>}
        {view==="community"&&<CommunityCoach data={community} clients={clients} onCreate={createChallengeFor} onEnd={endChallengeFor} myUid={myUid} onComment={(winId,body)=>addCommentFor(winId,body,"coach",(authCoach?.name||"Coach").split(" ")[0])} onDeleteComment={deleteCommentFor} accents={accentOf}/>}
        {view==="builder"&&(client?<ProgramBuilder client={client} program={program} onEditEx={editEx} onAddEx={addEx} onRemoveEx={removeEx} onReorderEx={reorderEx} onRenameDay={renameDay} onSetDow={setDow} onAddDay={addDay} onRemoveDay={removeDay} onSetPillarTarget={setPillarTarget} onSetNutrition={setNutrition}/>:emptyClient)}
        {view==="planner"&&(client?<Planner client={client} program={program} logs={clientLogs} week={week} setWeek={setWeek} onEditWeekEx={editWeekEx} onAddExW={addExW} onRemoveExW={removeExW} onCloneNext={cloneToNext} onAddWeek={addWeek} onRemoveWeek={removeWeek} onAdvanceWeek={advanceWeek}/>:emptyClient)}
        {view==="sheet"&&(client?<Sheet client={client} program={program} week={week} setWeek={setWeek} logs={clientLogs} onLog={onLog} onAddEx={(dayId,exId)=>addExW(week,dayId,exId)} onRemoveEx={(dayId,exId)=>removeExW(week,dayId,exId)} notes={notes} onAddNote={onAddNote} coaches={coaches} formvids={formvids[client.id]||[]} vidUrls={vidUrls} onReviewVid={(id,fb)=>reviewFormVid(client.id,id,fb)} photos={photos[client.id]||[]}/>:emptyClient)}
        {view==="team"&&<Team coaches={coaches} clients={clients} onMoveClient={moveClient} onRemoveCoach={removeCoach} onAddCoach={addCoach} isOwner={isOwner} onInviteCoach={hasBackend&&isOwner?()=>setInviteCoachOpen(true):null}/>}
      </div>
    </div>
    {addOpen&&<AddClient onAdd={addClient} onClose={()=>setAddOpen(false)} backend={hasBackend}/>}
    {inviteCoachOpen&&<InviteCoach onInvite={inviteCoach} onClose={()=>setInviteCoachOpen(false)}/>}
    {editId&&(()=>{const ec=clients.find(c=>c.id===editId);return ec?<EditClient client={ec} onSave={editClient} onDelete={removeClient} onClose={()=>setEditId(null)}/>:null;})()}
    {profileOpen&&<Profile name={authCoach?.name||""} email={session?.user?.email||profile?.email||""} onClose={()=>setProfileOpen(false)}/>}
    {saveErr&&<SaveErrorBar onRetry={retrySave}/>}
  </div>);
}
