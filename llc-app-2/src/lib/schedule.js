// lib/schedule.js — client-chosen workout dates.
//
// The client places each week's workouts onto calendar dates they pick.
// schedule shape:  { [weekNumber]: { [dayId]: "YYYY-MM-DD" } }
//
// When a day has no chosen date, callers fall back to the day-of-week the
// coach set (program day.dow), so clients who haven't scheduled anything yet
// keep working exactly as before.

export const isoOf = (d) => {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${m}-${day}`;
};
export const todayISO = () => isoOf(new Date());
export const parseISO = (iso) => { const [y, m, d] = String(iso).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };

export function weekSched(schedule, week) { return (schedule && schedule[week]) || {}; }

// The chosen ISO date for a day in a week, or null.
export function dateOf(schedule, week, dayId) { return weekSched(schedule, week)[dayId] || null; }

// Which { week, dayId } is scheduled on a given ISO date (across all weeks), or null.
export function onDate(schedule, iso) {
  if (!schedule) return null;
  for (const wk of Object.keys(schedule)) {
    const days = schedule[wk] || {};
    for (const dayId of Object.keys(days)) if (days[dayId] === iso) return { week: Number(wk), dayId };
  }
  return null;
}

// Is every set of every exercise in this day logged + done?
export function dayDone(clogs, week, day) {
  if (!day || !day.ex || !day.ex.length) return false;
  return day.ex.every((x) => { const e = clogs && clogs[`w${week}|${day.id}|${x.exId}`]; return e && e.sets && e.sets.length && e.sets.every((s) => s.done); });
}

// Are all of a week's days done?
export function weekDone(clogs, days, week) { return days.length > 0 && days.every((d) => dayDone(clogs, week, d)); }
