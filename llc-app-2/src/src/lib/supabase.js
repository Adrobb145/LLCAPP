// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Capture invite/recovery token type from the URL BEFORE supabase-js consumes the hash.
const initialHash = typeof window !== "undefined" ? window.location.hash : "";
export const inviteType = (initialHash.match(/type=(invite|recovery)/) || [])[1] || null;

export const hasBackend = Boolean(url && anon);
export const supabase = hasBackend ? createClient(url, anon) : null;
