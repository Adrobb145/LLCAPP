// lib/clientAdmin.js
// Helpers that call your existing `invite` and `purge` Edge Functions.
// supabase-js automatically attaches the signed-in coach/owner JWT, which the
// functions check, so there are no headers to set here.
// NOTE: adjust the "./supabase" import path if your client lives elsewhere.

import { supabase } from "./supabase";

async function invokeFn(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let msg = error.message;
    try { const j = await error.context.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

// Create an athlete with a TEMP PASSWORD. No email link, email is pre-confirmed.
// Returns { ok, clientId, client, email, tempPassword }.
export async function addAthlete(coachAccent, client) {
  const email = (client.email || "").trim().toLowerCase();
  if (!email) throw new Error("Email is required");
  return invokeFn("invite", {
    role: "athlete",
    email,
    usePassword: true, // force temp-password path — this is the fix
    client: {
      name: client.name,
      initials: client.initials,
      goal: client.goal,
      accent: client.accent || coachAccent || "#FF6B2C",
      bw: client.bw,
      block: client.block,
      totalWeeks: client.totalWeeks,
      lifts: client.lifts,
    },
  });
}

// Hard delete: removes client_state, profile, clients row, and the login/email
// from the auth server. Owner can delete anyone; a coach can delete their own.
export async function deleteClient(clientId) {
  return invokeFn("purge", { clientId }); // { ok, deleted }
}
