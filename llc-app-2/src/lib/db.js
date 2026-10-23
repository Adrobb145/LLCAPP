// src/lib/db.js
// Supabase-backed persistence + onboarding. Maps the app's state maps to rows
// and back. Per-column diff saves: only changed columns are written, so a coach
// session can never overwrite an athlete's logs (and vice versa).
import { supabase } from "./supabase";

const STATE_COLS = ["program","logs","notes","meals","goals","checkins","bodylog",
  "photos","misses","readiness","pillaracts","attendance","formvids","xp","freezes","ckday","seencoach","seenreview","customfoods","schedule","tracked"];

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data || null;
}
export async function setPassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
// Sends a password-reset email. The link returns to the app with type=recovery,
// which AuthGate routes to the "set a new password" screen.
export async function requestPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
}
// Role-gated server-side invite (owner->coach, coach->athlete). Sends the email.
export async function deleteClient(clientId) {
  const { data, error } = await supabase.functions.invoke("purge", { body: { clientId } });
  if (error) { let m = error.message; try { const b = await error.context.json(); if (b && b.error) m = b.error; } catch (e) {} throw new Error(m); }
  if (data && data.error) throw new Error(data.error);
  return data;
}
export async function deleteCoach(coachId) {
  const { data, error } = await supabase.functions.invoke("purge", { body: { coachId } });
  if (error) { let m = error.message; try { const b = await error.context.json(); if (b && b.error) m = b.error; } catch (e) {} throw new Error(m); }
  if (data && data.error) throw new Error(data.error);
  return data;
}
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
// last.state[cid] holds a PER-COLUMN JSON cache so we can write only the columns
// this session actually changed. This is what stops a coach/owner session from
// clobbering an athlete's logs: if the coach didn't touch `logs`, `logs` is never
// in the payload, and PostgREST upsert leaves that column untouched on the row.
let last = { coaches: {}, clients: {}, state: {} };
const J = (v) => JSON.stringify(v);

export async function persist(snapshot, role) {
  const coachSide = role === "coach" || role === "owner";

  // 1) coaches + clients. client_state RLS needs the client to already exist,
  //    so these commit first. Athletes can only UPDATE their own clients row
  //    (habits/streaks) and never touch coaches, so they take a scoped path.
  if (coachSide) {
    const coachRows  = snapshot.coaches.filter((c) => J(c) !== last.coaches[c.id]).map(coachToRow);
    const clientRows = snapshot.clients.filter((c) => J(c) !== last.clients[c.id]).map(clientToRow);
    const pre = [];
    if (coachRows.length)  pre.push(["coaches",  supabase.from("coaches").upsert(coachRows)]);
    if (clientRows.length) pre.push(["clients", supabase.from("clients").upsert(clientRows)]);
    for (const [name, p] of pre) { const { error } = await p; if (error) console.error("LLC " + name + " save error", error.message); }
  } else {
    for (const c of snapshot.clients) {
      if (J(c) === last.clients[c.id]) continue;
      const { error } = await supabase.from("clients").update({ data: c }).eq("id", c.id);
      if (error) console.error("LLC client save error", error.message);
    }
  }

  // 2) client_state — PER-COLUMN diff. Only changed columns go in the payload.
  for (const [cid, s] of Object.entries(snapshot.state)) {
    const prev = last.state[cid] || {};
    const patch = { client_id: cid };
    let any = false;
    for (const k of STATE_COLS) { const v = J(s[k]); if (v !== prev[k]) { patch[k] = s[k]; any = true; } }
    if (!any) continue;
    const { error } = await supabase.from("client_state").upsert(patch);
    if (error) { console.error("LLC state save error", cid, error.message); continue; } // leave cache stale -> retries next save
    const store = last.state[cid] || (last.state[cid] = {});
    STATE_COLS.forEach((k) => { store[k] = J(s[k]); });
  }

  // 3) refresh coaches/clients cache
  snapshot.coaches.forEach((c) => { last.coaches[c.id] = J(c); });
  snapshot.clients.forEach((c) => { last.clients[c.id] = J(c); });
}

// Seed the cache after the initial load so the first save doesn't rewrite everything.
// Stored PER-COLUMN to match the diff in persist().
export function primeCache(snapshot) {
  last = { coaches: {}, clients: {}, state: {} };
  snapshot.coaches.forEach((c) => { last.coaches[c.id] = J(c); });
  snapshot.clients.forEach((c) => { last.clients[c.id] = J(c); });
  Object.entries(snapshot.state).forEach(([cid, row]) => {
    const store = (last.state[cid] = {});
    STATE_COLS.forEach((k) => { store[k] = J(row[k]); });
  });
}

// ---- custom (coach-defined) exercises --------------------------------------
export async function loadCustomExercises() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("custom_exercises")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}
export async function addCustomExercise(p) {
  if (!supabase) return { id: "cx_" + Date.now(), ...p };
  const { data, error } = await supabase
    .from("custom_exercises")
    .insert({ name: p.name, pattern: p.pattern, equip: p.equip, level: p.level, muscles: p.muscles || "" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function deleteCustomExercise(id) {
  if (!supabase) return;
  const { error } = await supabase.from("custom_exercises").delete().eq("id", id);
  if (error) throw error;
}

// ---- form-review videos (Supabase Storage) ---------------------------------
const VIDEO_BUCKET = "Movement Video";
export async function uploadFormVideo(clientId, entryId, file) {
  if (!supabase) return null;
  const ext = ((file.name || "").split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const path = `${clientId}/${entryId}.${ext}`;
  const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, { contentType: file.type || "video/mp4", upsert: true });
  if (error) throw error;
  return path;
}
export async function signedVideoUrl(path) {
  if (!supabase || !path) return null;
  const { data, error } = await supabase.storage.from(VIDEO_BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data?.signedUrl || null;
}
export async function deleteFormVideo(path) {
  if (!supabase || !path) return;
  try { await supabase.storage.from(VIDEO_BUCKET).remove([path]); } catch (e) { /* best-effort */ }
}

// ---- community: challenges + wins feed -------------------------------------
export async function loadCommunity() {
  if (!supabase) return { challenges: [], progress: [], wins: [], reactions: [], comments: [], roster: [] };
  const [ch, pr, wn, rx, cm, rs] = await Promise.all([
    supabase.from("challenges").select("*").eq("active", true).order("created_at", { ascending: false }),
    supabase.from("challenge_progress").select("*"),
    supabase.from("wins").select("*").order("created_at", { ascending: false }).limit(120),
    supabase.from("win_reactions").select("*"),
    supabase.from("win_comments").select("*").order("created_at", { ascending: true }),
    supabase.rpc("community_roster"),
  ]);
  return { challenges: ch.data || [], progress: pr.data || [], wins: wn.data || [], reactions: rx.data || [], comments: cm.data || [], roster: rs.data || [] };
}
export async function createChallenge(c) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("challenges").insert(c).select().single();
  if (error) throw error; return data;
}
export async function endChallenge(id) {
  if (!supabase) return;
  await supabase.from("challenges").update({ active: false }).eq("id", id);
}
export async function upsertProgress(challengeId, clientId, value) {
  if (!supabase) return;
  await supabase.from("challenge_progress")
    .upsert({ challenge_id: challengeId, client_id: clientId, value, updated_at: new Date().toISOString() }, { onConflict: "challenge_id,client_id" });
}
export async function postWin(w) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("wins").insert(w).select().single();
  if (error) { if (error.code === "23505") return null; throw error; } // milestone already posted
  return data;
}

export async function addComment(winId, body, authorKind, authorName) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("win_comments")
    .insert({ win_id: winId, body, author_kind: authorKind || "client", author_name: authorName || "" })
    .select().single();
  if (error) throw error; return data;
}

export async function deleteComment(id) {
  if (!supabase) return;
  await supabase.from("win_comments").delete().eq("id", id);
}
export async function deleteWin(id) {
  if (!supabase) return;
  await supabase.from("wins").delete().eq("id", id);
}
export async function addReaction(winId, emoji) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("win_reactions").insert({ win_id: winId, emoji }).select().single();
  if (error) { if (error.code === "23505") return null; throw error; } // already reacted
  return data;
}
export async function removeReaction(winId, emoji) {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("win_reactions").delete().eq("win_id", winId).eq("emoji", emoji).eq("actor", user.id);
}
export async function myAuthId() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user ? user.id : null;
}

// ---- nutrition lookup ------------------------------------------------------
export async function lookupNutrition(query) {
  try {
    const { data, error } = await supabase.functions.invoke("nutrition", { body: { query } });
    if (error) return { ok: false, reason: "error" };
    if (!data || data.error || !Array.isArray(data.items) || data.items.length === 0) return { ok: false, reason: "nomatch" };
    const s = data.items.reduce((a, it) => ({
      cal: a.cal + (Number(it.calories) || 0),
      p:   a.p   + (Number(it.protein_g) || 0),
      c:   a.c   + (Number(it.carbohydrates_total_g) || 0),
      f:   a.f   + (Number(it.fat_total_g) || 0),
    }), { cal: 0, p: 0, c: 0, f: 0 });
    return { ok: true, cal: Math.round(s.cal), p: +s.p.toFixed(1), c: +s.c.toFixed(1), f: +s.f.toFixed(1) };
  } catch (e) {
    return { ok: false, reason: "error" };
  }
}
