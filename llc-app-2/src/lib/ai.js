// src/lib/ai.js
// Single entry point for AI calls. In production it hits the Supabase Edge
// Function (`/functions/v1/ai`) which holds the Anthropic key server-side.
// With no backend configured it falls back to the direct call (dev/artifact only).
import { supabase, hasBackend } from "./supabase";

export async function askClaude(prompt) {
  if (hasBackend) {
    const { data, error } = await supabase.functions.invoke("ai", { body: { prompt } });
    if (error) throw error;
    return (data && data.text) || "";
  }
  // Fallback path — only works where a key is injected (artifact/dev). Never ship as prod.
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await r.json();
  return data.content.filter((i) => i.type === "text").map((i) => i.text).join(" ").trim();
}
