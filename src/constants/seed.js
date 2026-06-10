// constants/seed.js — demo/dev seed data (retires when Supabase becomes the source)
import { ID } from "./exercises";
import { PILLARS, PILLAR_ACTS } from "./pillars";
import { round5, targetW, dReps } from "../lib/training";

export const COACHES0=[
  {id:"co_adam",name:"Adam Robbins",initials:"AR",role:"Lead Coach",accent:"#FF6B2C",pin:"1234"},
  {id:"co_jay",name:"Jay Pesi",initials:"JP",role:"Strength Coach",accent:"#3AE0FF",pin:"2345"},
  {id:"co_dani",name:"Dani Robbins",initials:"DR",role:"Coach",accent:"#FF3A8E",pin:"3456"}
];
export const CLIENTS0=[
  {id:"mar",coachId:"co_adam",name:"Marcus Reyes",initials:"MR",goal:"Powerlifting meet prep",accent:"#FF6B2C",bw:198,block:"Hypertrophy → Strength",totalWeeks:6,currentWeek:4,adherence:.92,lifts:{sq:355,bn:235,dl:425},pin:"1111",nt:{p:190,c:280,f:75,kcal:2560},hab:{fitness:true,nutrition:true,sleep:false,stress:true,mindset:true,habits:true,spirit:false},streak:{fitness:5,nutrition:4,sleep:2,stress:3,mindset:6,habits:5,spirit:1}},
  {id:"sof",coachId:"co_adam",name:"Sofia Andersen",initials:"SA",goal:"Build muscle, recomp",accent:"#FF7A3A",bw:142,block:"Hypertrophy",totalWeeks:6,currentWeek:2,adherence:.86,lifts:{sq:185,bn:115,dl:225},pin:"2222",nt:{p:130,c:160,f:55,kcal:1655},hab:{fitness:true,nutrition:true,sleep:true,stress:false,mindset:true,habits:false,spirit:false},streak:{fitness:3,nutrition:3,sleep:4,stress:1,mindset:3,habits:2,spirit:2}},
  {id:"jam",coachId:"co_jay",name:"Jamal Carter",initials:"JC",goal:"Athletic performance",accent:"#3AE0FF",bw:215,block:"Power Development",totalWeeks:6,currentWeek:5,adherence:.78,lifts:{sq:335,bn:225,dl:405},pin:"3333",nt:{p:200,c:300,f:80,kcal:2720},hab:{fitness:true,nutrition:false,sleep:true,stress:false,mindset:false,habits:false,spirit:false},streak:{fitness:2,nutrition:0,sleep:3,stress:1,mindset:1,habits:0,spirit:0}},
  {id:"pri",coachId:"co_jay",name:"Priya Iyer",initials:"PI",goal:"First meet (intermediate)",accent:"#FF6B2C",bw:132,block:"Strength",totalWeeks:8,currentWeek:3,adherence:.95,lifts:{sq:225,bn:135,dl:295},pin:"4444",nt:{p:135,c:180,f:50,kcal:1710},hab:{fitness:true,nutrition:true,sleep:true,stress:true,mindset:true,habits:true,spirit:true},streak:{fitness:7,nutrition:6,sleep:7,stress:5,mindset:6,habits:7,spirit:4}},
  {id:"aly",coachId:"co_dani",name:"Alyssa Thompson",initials:"AT",goal:"Return to lifting",accent:"#9EFF3A",bw:155,block:"Rebuild",totalWeeks:4,currentWeek:2,adherence:1,lifts:{sq:135,bn:85,dl:185},pin:"5555",nt:{p:120,c:150,f:50,kcal:1530},hab:{fitness:true,nutrition:true,sleep:true,stress:true,mindset:true,habits:false,spirit:true},streak:{fitness:4,nutrition:3,sleep:4,stress:4,mindset:3,habits:2,spirit:5}},
  {id:"mei",coachId:"co_dani",name:"Mei-Lin Park",initials:"MP",goal:"General strength + mobility",accent:"#3AE0FF",bw:128,block:"Foundation",totalWeeks:8,currentWeek:1,adherence:.83,lifts:{sq:115,bn:75,dl:155},pin:"6666",nt:{p:110,c:150,f:50,kcal:1490},hab:{fitness:true,nutrition:false,sleep:false,stress:false,mindset:false,habits:true,spirit:false},streak:{fitness:1,nutrition:0,sleep:0,stress:0,mindset:0,habits:1,spirit:0}}
];

export function makeProgram(c){
  const L=c.lifts;
  return {days:[
    {id:"d1",name:"Lower A · Squat",dow:"Mon",ex:[
      {exId:ID("Back Squat"),sets:4,reps:5,base:L.sq,step:.025,mod:"straight",tempo:"",grp:""},
      {exId:ID("Romanian Deadlift"),sets:3,reps:8,base:round5(L.dl*.55),step:.02,mod:"tempo",tempo:"3-1-1-0",grp:""},
      {exId:ID("Bulgarian Split Squat"),sets:3,reps:10,base:Math.max(20,round5(L.sq*.18)),step:.02,mod:"superset",tempo:"",grp:"B1"},
      {exId:ID("Pallof Press"),sets:3,reps:12,base:35,step:0,mod:"superset",tempo:"",grp:"B2"}
    ]},
    {id:"d2",name:"Upper A · Bench",dow:"Wed",ex:[
      {exId:ID("Barbell Bench Press"),sets:4,reps:5,base:L.bn,step:.02,mod:"straight",tempo:"",grp:""},
      {exId:ID("Barbell Row"),sets:3,reps:8,base:round5(L.bn*.85),step:.02,mod:"straight",tempo:"",grp:""},
      {exId:ID("DB Incline Press"),sets:3,reps:10,base:Math.max(20,round5(L.bn*.32)),step:.02,mod:"dropset",tempo:"",grp:""},
      {exId:ID("Face Pull"),sets:3,reps:15,base:40,step:0,mod:"straight",tempo:"",grp:""}
    ]},
    {id:"d3",name:"Lower B · Pull",dow:"Fri",ex:[
      {exId:ID("Conventional Deadlift"),sets:3,reps:3,base:L.dl,step:.025,mod:"straight",tempo:"",grp:""},
      {exId:ID("Front Squat"),sets:3,reps:6,base:round5(L.sq*.65),step:.02,mod:"straight",tempo:"",grp:""},
      {exId:ID("Lying Leg Curl"),sets:3,reps:12,base:90,step:.02,mod:"restpause",tempo:"",grp:""}
    ]}
  ]};
}
export function seedLogs(c,prog){
  const L={};
  for(let w=1;w<c.currentWeek;w++){
    prog.days.forEach(d=>d.ex.forEach(x=>{
      const tw=targetW(x,w,c.totalWeeks);
      L[`w${w}|${d.id}|${x.exId}`]={note:"",sets:Array.from({length:x.sets},(_,i)=>({w:tw,r:dReps(x,w,c.totalWeeks),rpe:i===x.sets-1?8:7,done:true}))};
    }));
  }
  return L;
}

export function seedPillarActs(){
  const fmt=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d.toISOString().split("T")[0];};
  const PROF={mar:{fitness:1,nutrition:.83,sleep:.5,stress:.66,mindset:.83,habits:.83,spirit:.33},sof:{fitness:.83,nutrition:.66,sleep:.66,stress:.33,mindset:.66,habits:.33,spirit:.33},jam:{fitness:.66,nutrition:.33,sleep:.5,stress:.16,mindset:.33,habits:.16,spirit:0},pri:{fitness:1,nutrition:1,sleep:1,stress:.83,mindset:.83,habits:1,spirit:.83},aly:{fitness:.83,nutrition:.83,sleep:.83,stress:.83,mindset:.66,habits:.5,spirit:1},mei:{fitness:.5,nutrition:.16,sleep:.16,stress:.16,mindset:.16,habits:.33,spirit:0}};
  const out={};
  Object.entries(PROF).forEach(([cid,prof])=>{out[cid]={};for(let n=1;n<=6;n++){const dt=fmt(n);out[cid][dt]={};PILLARS.forEach(p=>{const intensity=prof[p.id]||0;const doneDays=Math.round(intensity*6);const acts=PILLAR_ACTS[p.id]||[];if(n<=doneDays){const m={};acts.forEach(a=>m[a]=true);out[cid][dt][p.id]=m;}else if(intensity>0&&n===doneDays+1&&acts[0]){out[cid][dt][p.id]={[acts[0]]:true};}});}});
  return out;
}
