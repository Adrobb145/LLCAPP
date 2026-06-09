# Live Long Collective — Setup & Go-Live

The app runs in **two modes**, controlled only by whether Supabase env vars exist:

- **Demo mode (no env):** data in the browser (`window.storage`), demo PIN logins. Great for local dev — nothing to configure.
- **Production mode (env set):** real accounts (Supabase Auth), cross-device data (Postgres + RLS), AI calls proxied server-side. This is the mode for real clients.

---

## 1. Run the demo locally
```bash
npm install
npm run dev
```
Opens the role picker with the seeded demo roster. No backend needed.

## 2. Stand up the backend (one time)
1. **Create a Supabase project** (supabase.com → New project). Save the project URL + anon key (Settings → API).
2. **Create the schema:** SQL Editor → paste all of `supabase/migrations/0001_init.sql` → Run. (Creates tables, RLS, and onboarding functions.)
3. **Deploy the AI proxy** (needs the Supabase CLI, `npm i -g supabase`):
   ```bash
   supabase link --project-ref YOUR-REF
   supabase functions deploy ai
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   # your real key, server-side only
   ```
4. **Enable Auth:** Authentication → Providers → Email = ON. For faster beta testing, turn **Confirm email = OFF** (re-enable later).

## 3. Point the app at it
```bash
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```
The app now shows the **sign-in / sign-up** screen instead of the demo picker.

## 4. First accounts
- **You (coach):** Sign up → on the one-time setup screen, enter your name → **"I'm a coach — set me up."** You're now the coach of an empty roster.
- **A client:** add a `clients` row first (see gap below), with their `email`. Send them the app URL. They sign up with that same email → **"I'm an athlete — link my account."** Their account binds to that client record.

## 5. Deploy the frontend (Vercel)
- Build command `npm run build`, output dir `dist`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel env vars.

---

## Known gaps to close before a wider beta
- **No "Add Client" UI yet.** The schema + athlete-linking are ready, but the app can't yet create a client from the coach view (the demo roster was seeded). Until that form exists, add clients via the Supabase dashboard (`clients` table: `id`, `coach_id`, `email`, and a `data` JSON with name/goal/etc.). *This is the most useful next build.*
- **Concurrency is last-write-wins per client.** Each client's data is one row; if a coach and that athlete save the exact same second, the later write wins. Fine for 1-coach/few-clients beta; revisit if you scale to simultaneous editors.
- **Form-review videos & progress photos** still need Supabase Storage to persist across devices (currently in-row/in-browser).

## Security notes
- The Anthropic key lives **only** in the Edge Function secret — never in the browser bundle.
- The anon key in the browser is public *by design*; **Row-Level Security** is what protects data. Coaches see only their roster; athletes see only themselves. **Validate this on your live project** (sign in as a test athlete, confirm you cannot read another client's row) before onboarding real people.
