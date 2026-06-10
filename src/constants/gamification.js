// constants/gamification.js — XP levels, ranks, verses, badges (athlete-side content)
export const LVLSTEP=300;
export const lvlOf=xp=>1+Math.floor((xp||0)/LVLSTEP);
export const lvlPct=xp=>Math.round(((xp||0)%LVLSTEP)/LVLSTEP*100);
export const toNext=xp=>LVLSTEP-((xp||0)%LVLSTEP);
export const RANKS=["Rookie","Builder","Grinder","Athlete","Warrior","Beast","Elite","Legend","Icon"];
export const rankOf=xp=>RANKS[Math.min(RANKS.length-1,lvlOf(xp)-1)];
export const MAINLIFTS=["Back Squat","Barbell Bench Press","Conventional Deadlift","Overhead Press","Barbell Row","Front Squat"];
export const VERSES=[
  ["Philippians 4:13","Strength for this set isn't self-made. Show up — finish what you started."],
  ["1 Corinthians 9:27","Discipline the body. Not from shame — from purpose."],
  ["Proverbs 21:5","Steady plans beat frantic effort. Log it. Repeat it. Trust it."],
  ["Isaiah 40:31","Recovery is part of the work. Rest so you can rise."],
  ["Galatians 6:9","Don't quit in the boring middle. The harvest comes to those who stay."],
  ["1 Timothy 4:8","Train the body. Train the soul harder. Both, today."],
  ["Colossians 3:23","Whatever the lift — give it real effort, as worship, not for applause."]
];
export const verseToday=()=>VERSES[Math.floor(Date.now()/864e5)%VERSES.length];
export const BADGES=[
  {id:"first_lift",ic:"🏋️",l:"First Rep",d:"Log a session"},
  {id:"ten_lifts",ic:"🔟",l:"Consistent",d:"Log 10 sessions"},
  {id:"perfect_day",ic:"🎯",l:"Perfect Day",d:"All 7 pillars in a day"},
  {id:"on_fire",ic:"🔥",l:"On Fire",d:"7-day streak"},
  {id:"first_pr",ic:"📈",l:"Record Breaker",d:"Set a PR"},
  {id:"reflective",ic:"📋",l:"Reflective",d:"Submit a check-in"},
  {id:"fueled",ic:"🥗",l:"Dialed In",d:"Log 10 meals"},
  {id:"lvl5",ic:"⭐",l:"Level 5",d:"Reach Level 5"}
];
