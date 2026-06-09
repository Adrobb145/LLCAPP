// lib/training.js — pure progression math
import { DELOAD } from "../constants/progression";

export const round5=n=>Math.round(n/5)*5;
export const baseW=(x,w)=>round5(x.base*(1+(w-1)*x.step));
export const isDeload=(w,total)=>!!(total&&total>1&&w===total);
export const targetW=(x,w,total)=>isDeload(w,total)?round5(baseW(x,Math.max(1,total-1))*DELOAD):baseW(x,w);
export const dReps=(x,w,total)=>isDeload(w,total)?Math.max(3,Math.round(x.reps*0.6)):x.reps;
export const peakW=(x,total)=>baseW(x,(total&&total>1)?total-1:(total||1));
export const e1rm=(w,r)=>Math.round(w*(1+r/30));
