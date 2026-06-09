// supabase/functions/ai/index.ts
// Server-side proxy to Anthropic. The API key lives ONLY here (Supabase secret),
// never in the browser bundle. The client calls this function instead of api.anthropic.com.
//
// Deploy:  supabase functions deploy ai
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Requires a valid Supabase auth JWT (verify_jwt = true in config.toml) so only
// signed-in coaches/athletes can spend tokens.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1000;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "Server missing ANTHROPIC_API_KEY" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt : null;
    const messages = Array.isArray(body?.messages) ? body.messages : null;
    if (!prompt && !messages) {
      return new Response(JSON.stringify({ error: "Provide `prompt` or `messages`" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const r = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body?.model || MODEL,
        max_tokens: body?.max_tokens || MAX_TOKENS,
        messages: messages || [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json();
    // Normalize to a plain string the client can drop straight into chat.
    const text = Array.isArray(data?.content)
      ? data.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join(" ").trim()
      : "";
    return new Response(JSON.stringify({ text, raw: data }), {
      status: r.ok ? 200 : r.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
