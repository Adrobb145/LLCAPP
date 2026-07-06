// lib/program.js — the program model engine.
//
// A program moves from a single auto-repeating template ({days:[...]}) to
// explicit, independently-editable weeks:
//   { weeks:[ {id,label,days:[ {id,name,dow,ex:[ {exId,sets,reps,load,mod,tempo,grp,role,...} ]} ]} ],
//     days: <mirror of weeks[0].days> }
//
// `days` is kept as a live mirror of week-1 so structure-only consumers
// (athlete schedule, analytics, weekly recap) keep reading program.days and
// stay correct — day/exercise identity is shared across weeks, so week-1's
// structure is the block's structure. Per-week LOADS come through daysForWeek().
//
// Migration is non-destructive and load-identical: expanding a legacy template
// across totalWeeks uses the SAME progression math the app already used.

import { targetW, dReps, isDeload } from "./training";

export function isMigrated(p) { return !!(p && Array.isArray(p.weeks)); }
export function weekCount(p) { return isMigrated(p) ? p.weeks.length : 1; }
export function clampWeek(p, w) { return Math.max(1, Math.min(weekCount(p), Number(w) || 1)); }

function expandEx(x, w, total) {
  return {
    exId: x.exId, role: x.role || "accessory", sets: x.sets,
    reps: dReps(x, w, total), load: targetW(x, w, total),
    loadMode: x.loadMode || "fixed", mod: x.mod || "straight",
    tempo: x.tempo || "", grp: x.grp || "", note: x.note || "",
  };
}
function expandDay(d, w, total) { return { id: d.id, name: d.name, dow: d.dow, ex: (d.ex || []).map(x => expandEx(x, w, total)) }; }
function mirror(p) { return { ...p, days: p.weeks[0] ? p.weeks[0].days : [] }; }

// Expand a legacy template into explicit stored weeks. Idempotent.
export function migrateProgram(program, totalWeeks) {
  if (!program) return program;
  if (Array.isArray(program.weeks)) return Array.isArray(program.days) ? program : mirror(program);
  const total = Math.max(1, Number(totalWeeks) || 1);
  const tmpl = Array.isArray(program.days) ? program.days : [];
  const weeks = [];
  for (let w = 1; w <= total; w++) weeks.push({ id: "w" + w, label: "Week " + w + (isDeload(w, total) ? " · Deload" : ""), days: tmpl.map(d => expandDay(d, w, total)) });
  return mirror({ weeks });
}

// THE read accessor: the days (each exercise carrying resolved load/reps) for a week.
export function daysForWeek(program, week, client) {
  if (!program) return [];
  if (Array.isArray(program.weeks)) { const wk = program.weeks[clampWeek(program, week) - 1]; return wk ? wk.days : []; }
  const total = (client && client.totalWeeks) || 1;
  return (program.days || []).map(d => expandDay(d, Number(week) || 1, total));
}

// ---- write helpers (each returns a NEW program with the days mirror synced) --

// Edit one exercise in ONE week (per-week load/reps/etc).
export function editWeekEx(program, week, dayId, exId, patch) {
  if (!isMigrated(program)) return program;
  const wi = clampWeek(program, week) - 1;
  const weeks = program.weeks.map((wk, i) => i !== wi ? wk : ({ ...wk, days: wk.days.map(d => d.id !== dayId ? d : ({ ...d, ex: d.ex.map(x => x.exId !== exId ? x : ({ ...x, ...patch })) })) }));
  return mirror({ ...program, weeks });
}

// Apply a day-list transform to EVERY week (structural / baseline edits).
export function editAllWeeks(program, fn) {
  if (!isMigrated(program)) return program;
  const weeks = program.weeks.map(wk => ({ ...wk, days: fn(wk.days) }));
  return mirror({ ...program, weeks });
}

function relabel(program) {
  const total = program.weeks.length;
  const weeks = program.weeks.map((wk, i) => ({ ...wk, id: "w" + (i + 1), label: "Week " + (i + 1) + (isDeload(i + 1, total) ? " · Deload" : "") }));
  return mirror({ ...program, weeks });
}

// Copy one week's days over another week's.
export function cloneWeek(program, fromW, toW) {
  if (!isMigrated(program)) return program;
  const fi = clampWeek(program, fromW) - 1, ti = clampWeek(program, toW) - 1;
  const src = program.weeks[fi]; if (!src || fi === ti) return program;
  const weeks = program.weeks.map((wk, i) => i !== ti ? wk : ({ ...wk, days: JSON.parse(JSON.stringify(src.days)) }));
  return mirror({ ...program, weeks });
}

// Append a new week (a copy of the last). Caller must also bump client.totalWeeks.
export function addWeek(program) {
  if (!isMigrated(program)) return program;
  const last = program.weeks[program.weeks.length - 1];
  const nw = { id: "w" + (program.weeks.length + 1), label: "Week " + (program.weeks.length + 1), days: JSON.parse(JSON.stringify(last ? last.days : [])) };
  return relabel(mirror({ ...program, weeks: [...program.weeks, nw] }));
}

// Remove a week (never below 1). Caller must also adjust client.totalWeeks/currentWeek.
export function removeWeek(program, week) {
  if (!isMigrated(program) || program.weeks.length <= 1) return program;
  const wi = clampWeek(program, week) - 1;
  return relabel(mirror({ ...program, weeks: program.weeks.filter((_, i) => i !== wi) }));
}
