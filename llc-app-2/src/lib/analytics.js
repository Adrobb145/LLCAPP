// lib/analytics.js — athlete stats + coach risk analysis
import { ID } from "../constants/exercises";
import { PILL } from "../constants/pillars";
import { MAINLIFTS, lvlOf } from "../constants/gamification";
import { e1rm } from "./training";
import { daysForWeek } from "./program";

export function athStats(client,program,clogs,meals,checkins,xp){
  let sessions=0;const weeks=client.totalWeeks;
  if(program)for(let w=1;w<=weeks;w++)daysForWeek(program,w,client).forEach(d=>{const done=d.ex.every(x=>{const e=clogs[`w${w}|${d.id}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});if(done)sessions++;});
  const vol=[];if(program)for(let w=1;w<=client.currentWeek;w++){let v=0;daysForWeek(program,w,client).forEach(d=>d.ex.forEach(x=>{const e=clogs[`w${w}|${d.id}|${x.exId}`];if(e)e.sets.forEach(s=>{if(s.done)v+=(Number(s.w)||0)*(Number(s.r)||0);});}));vol.push(Math.round(v/100)/10);}
  const prs={};if(program)MAINLIFTS.forEach(nm=>{const id=ID(nm);if(!id)return;let best=null;for(let w=1;w<=weeks;w++)daysForWeek(program,w,client).forEach(d=>d.ex.forEach(x=>{if(x.exId!==id)return;const e=clogs[`w${w}|${d.id}|${x.exId}`];if(e)e.sets.forEach(s=>{if(s.done){const v=e1rm(Number(s.w)||0,Number(s.r)||0);if(!best||v>best.e)best={e:v,w:Number(s.w)||0,r:Number(s.r)||0};}});}));if(best)prs[nm]=best;});
  const series=MAINLIFTS.map(nm=>{const id=ID(nm);if(!id)return null;const arr=[];for(let w=1;w<=client.currentWeek;w++){let b=0;program&&daysForWeek(program,w,client).forEach(d=>d.ex.forEach(x=>{if(x.exId!==id)return;const e=clogs[`w${w}|${d.id}|${x.exId}`];if(e)e.sets.forEach(s=>{if(s.done){const v=e1rm(Number(s.w)||0,Number(s.r)||0);if(v>b)b=v;}});}));if(b)arr.push(b);}return arr.length>=2?{nm,arr}:null;}).filter(Boolean);
  const pillarToday=PILL.filter(p=>client.hab&&client.hab[p[0]]).length;
  const maxStreak=Math.max(0,...Object.values(client.streak||{}));
  const earned=new Set();
  if(sessions>=1)earned.add("first_lift");
  if(sessions>=10)earned.add("ten_lifts");
  if(pillarToday>=7)earned.add("perfect_day");
  if(maxStreak>=7)earned.add("on_fire");
  if(Object.keys(prs).length>0)earned.add("first_pr");
  if(checkins.length>=1)earned.add("reflective");
  if(meals.length>=10)earned.add("fueled");
  if(lvlOf(xp)>=5)earned.add("lvl5");
  return{sessions,vol,prs,series,pillarToday,maxStreak,mealCount:meals.length,earned};
}

export function analyze(client,programs,logs,checkins){
  const sig=[];let sc=0;
  const prog=programs[client.id];const cw=client.currentWeek;const cl=logs[client.id]||{};
  let dayN=prog?daysForWeek(prog,cw,client).length:0,loggedN=0;
  if(prog)daysForWeek(prog,cw,client).forEach(d=>{const done=d.ex.every(x=>{const e=cl[`w${cw}|${d.id}|${x.exId}`];return e&&e.sets.length&&e.sets.every(s=>s.done);});if(done)loggedN++;});
  if(dayN>0){if(loggedN===0){sc+=40;sig.push(["🏋️",`No sessions logged in week ${cw}`]);}else if(loggedN<dayN){sc+=12;sig.push(["🏋️",`${loggedN}/${dayN} sessions this week`]);}}
  const ht=PILL.filter(p=>client.hab&&client.hab[p[0]]).length;
  if(ht<2){sc+=18;sig.push(["🎯",`${ht}/7 pillars today`]);}else if(ht<4){sc+=7;sig.push(["🎯",`${ht}/7 pillars today`]);}
  const streaks=Object.values(client.streak||{});const ms=streaks.length?Math.max(...streaks):0;
  if(ms<2){sc+=14;sig.push(["🔥","Streaks broken"]);}
  const ad=client.adherence||0;
  if(ad<0.7){sc+=22;sig.push(["📅",`Adherence ${Math.round(ad*100)}%`]);}else if(ad<0.8){sc+=10;sig.push(["📅",`Adherence ${Math.round(ad*100)}%`]);}
  const ci=(checkins[client.id]||[]);const last=ci[ci.length-1];
  if(last){const wb=(last.energy+last.sleep+(11-last.stress)+last.nutrition+last.mood)/5;if(wb<5){sc+=20;sig.push(["😔",`Wellbeing ${wb.toFixed(1)}/10`]);}else if(wb<6.5){sc+=7;sig.push(["😐",`Wellbeing ${wb.toFixed(1)}/10`]);}}
  else{sc+=6;sig.push(["📋","No check-in yet"]);}
  let tier,color,label;
  if(sc>=50){tier="high";color="#FF4D4D";label="HIGH";}
  else if(sc>=28){tier="med";color="#FFB23A";label="MEDIUM";}
  else if(sc>=14){tier="watch";color="#3AE0FF";label="WATCH";}
  else{tier="ok";color="#3AE07A";label="ON TRACK";}
  return{score:sc,tier,color,label,signals:sig,loggedN,dayN,pillars:ht,maxStreak:ms};
}
