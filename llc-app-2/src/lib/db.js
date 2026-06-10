// src/lib/db.js
// Supabase-backed persistence + onboarding. Maps the app's state maps to rows
// and back. Diff-based saves: only changed rows are written.
import { supabase } from "./supabase";

const STATE_COLS = ["program","logs","notes","meals","goals","checkins","bodylog",
  "photos","misses","readiness","pillaracts","attendance","formvids","xp","freezes","ckday"];

// ---- row <-> app-object mappers -------------------------------------------
const coachFromRow  = (r) => ({ ...(r.data||{}), id: r.id });
const clientFromRow = (r) => ({ ...(r.data||{}), id: r.id, coachId: r.coach_id, email: r.email });
const coachToRow    = (c) => ({ id: c.id, data: c });
const clientToRow   = (c) => ({ id: c.id, coach_id: c.coachId || null, email: c.email || null, data: c });
const stateToRow    = (cid, s) => { const row = { client_id: cid }; STATE_COLS.forEach(k => row[k] = s[k]); return row; };

// ---- auth / profile --------------------------------------------------------
export async function getSession()  { const { data } = await supabase.auth.getSession(); return data.session; }
export function onAuthChange(cb)    { return supabase.auth.onAuthStateChange((_e, s) => cb(s)); }
export async function signIn(email, password)  { return supabase.auth.signInWithPassword({ email, password }); }
export async function signUp(email, password)  { return supabase.auth.signUp({ email, password }); }
export async function signOut()                { return supabase.auth.signOut(); }
export async function getProfile() {
  const { data } = await supabase.from("profiles").select("*").maybeSingle();
  return data || null;
}
export async function setPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
// Role-gated server-side invite (owner→coach, coach→athlete). Sends the email.
export async function invite(payload) {
  const { data, error } = await supabase.functions.invoke("invite", { body: payload });
  if (error) {
    // supabase-js hides the function's real message — dig it out of the response body.
    let msg = error.message;
    try { const body = await error.context.json(); if (body && body.error) msg = body.error; } catch (e) {}
    throw new Error(msg);
  }
  if (data && data.error) throw new Error(data.error);
  return data;
}

// ---- load everything in scope ---------------------------------------------
export async function loadAll() {
  const [{ data: coaches }, { data: clients }, { data: states }] = await Promise.all([
    supabase.from("coaches").select("*"),
    supabase.from("clients").select("*"),
    supabase.from("client_state").select("*"),
  ]);
  const stateById = {};
  (states || []).forEach((r) => { stateById[r.client_id] = r; });
  return {
    coaches: (coaches || []).map(coachFromRow),
    clients: (clients || []).map(clientFromRow),
    stateById,
  };
}

// ---- diff-based persist ----------------------------------------------------
let last = { coaches: {}, clients: {}, state: {} };
const J = (v) => JSON.stringify(v);

export async function persist(snapshot) {
  // Coaches + clients must commit BEFORE client_state — the client_state RLS
  // policy checks that the client already exists in `clients`.
  const coachRows = snapshot.coaches.filter((c) => J(c) !== last.coaches[c.id]).map(coachToRow);
  const clientRows = snapshot.clients.filter((c) => J(c) !== last.clients[c.id]).map(clientToRow);
  const pre = [];
  if (coachRows.length) pre.push(supabase.from("coaches").upsert(coachRows));
  if (clientRows.length) pre.push(supabase.from("clients").upsert(clientRows));
  if (pre.length) await Promise.all(pre);

  const stateRows = [];
  Object.entries(snapshot.state).forEach(([cid, s]) => { if (J(s) !== last.state[cid]) stateRows.push(stateToRow(cid, s)); });
  if (stateRows.length) await supabase.from("client_state").upsert(stateRows);

  // refresh snapshot cache
  snapshot.coaches.forEach((c) => { last.coaches[c.id] = J(c); });
  snapshot.clients.forEach((c) => { last.clients[c.id] = J(c); });
  Object.entries(snapshot.state).forEach(([cid, s]) => { last.state[cid] = J(s); });
}

// Seed the cache after the initial load so the first save doesn't rewrite everything.
export function primeCache(snapshot) {
  last = { coaches: {}, clients: {}, state: {} };
  snapshot.coaches.forEach((c) => { last.coaches[c.id] = J(c); });
  snapshot.clients.forEach((c) => { last.clients[c.id] = J(c); });
  Object.entries(snapshot.state).forEach(([cid, s]) => { last.state[cid] = J(s); });
}
