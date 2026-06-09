// src/lib/supabase.js
// Single Supabase client. If the env vars are absent (e.g. local artifact/demo),
// `supabase` is null and the app gracefully runs in offline demo mode.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasBackend = Boolean(url && anon);
export const supabase = hasBackend ? createClient(url, anon) : null;
