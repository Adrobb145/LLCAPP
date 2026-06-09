# See it pre-launch + deploy to Vercel

## A. See the app right now (no deploy needed)
The truest pre-launch view is running it on your own machine:
```bash
unzip llc-platform.zip && cd llc-app
npm install
npm run dev
```
Open the printed URL (usually **http://localhost:5173**). Because `.env.local`
is filled in, it boots in **production mode** → the sign-in screen. To use it you
need Email auth ON in Supabase and an account (sign up → "I'm a coach").

### Want to eyeball the whole UI in 60 seconds without auth?
Run it in **demo mode**: temporarily rename the env file so no backend is detected.
```bash
mv .env.local .env.local.off
npm run dev      # now shows the demo roster + PIN logins (coach 1234, client 1111)
```
Rename it back (`mv .env.local.off .env.local`) to return to the real backend.

### Production-like local check
```bash
npm run build && npm run preview   # serves the built site locally
```

## B. Deploy to Vercel (shareable URL)
You get **preview** URLs (private, per-deploy) before you ever "launch."

### Easiest — dashboard
1. Push `llc-app` to a GitHub repo.
2. vercel.com → **Add New → Project** → import that repo.
3. Vercel auto-detects Vite (build `npm run build`, output `dist`). Leave defaults.
4. **Environment Variables** → add both (from your `.env.local`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   These are build-time values for Vite, so they must be set in Vercel, not just locally.
5. **Deploy.** First deploy gives a preview URL like `llc-app-xxxx.vercel.app`.

### CLI alternative
```bash
npm i -g vercel
cd llc-app
vercel              # creates a PREVIEW deployment (private URL) — your pre-launch view
vercel --prod       # promotes to your production URL when you're ready
```
Set the two env vars once with `vercel env add VITE_SUPABASE_URL` etc., or in the dashboard.

## C. One Supabase setting for the live URL
In Supabase → Authentication → URL Configuration, add your Vercel URL(s) to
**Redirect URLs / Site URL** so email auth works from the deployed site
(localhost is already allowed by default).

> Reminder: `.env.local` is gitignored (correct — keeps keys out of git). That's
> why the keys must be added in Vercel's dashboard for the hosted build.
