# LLC client-admin drop-in

Fixes two things:
1. New athletes get a temp password they can actually log in with (no expiring email link).
2. Coaches can delete a client and remove their email/login from the server.

## Files and where they go (under `src/`)

    lib/clientAdmin.js              -> src/lib/
    shared/adminStyles.js           -> src/shared/
    shared/NewAthleteModal.jsx      -> src/shared/
    shared/ConfirmDeleteClient.jsx  -> src/shared/
    athlete/PasswordGate.jsx        -> src/athlete/

If your folders are nested differently, just fix the two import paths noted
in clientAdmin.js and PasswordGate.jsx (the `./supabase` / `../lib/supabase`
line that points at your Supabase client).

## Wiring (3 edits)

### 1. Add-athlete handler (Roster / add-athlete form)
Replace the old invite call. Do NOT pass usePassword:false anymore.

    import { addAthlete } from "../lib/clientAdmin";
    import { NewAthleteModal } from "../shared/NewAthleteModal";
    const [newAthlete, setNewAthlete] = useState(null);

    const onAdd = async (form) => {
      try {
        const res = await addAthlete(coach.accent, form); // {email, tempPassword, ...}
        addToRoster(res.client);
        setNewAthlete(res);            // pops the credential modal
      } catch (e) { alert(e.message); }
    };

    // render:
    <NewAthleteModal result={newAthlete} onClose={() => setNewAthlete(null)} />

### 2. Roster row / client detail — delete control

    import { ConfirmDeleteClient } from "../shared/ConfirmDeleteClient";
    const [toDelete, setToDelete] = useState(null);

    <button onClick={() => setToDelete(client)}>Delete</button>
    {toDelete && (
      <ConfirmDeleteClient
        client={toDelete}
        onClose={() => setToDelete(null)}
        onDeleted={(id) => { removeFromRoster(id); setToDelete(null); }}
      />
    )}

### 3. Wrap the athlete app so first login forces a real password

    import { PasswordGate } from "./athlete/PasswordGate";
    <PasswordGate><ClientApp ... /></PasswordGate>

## Optional server hardening — invite function v4

Forces the temp-password path for athletes so the email-link route can never be
triggered for an athlete by accident. Only one line changes vs your current v3:

    // OLD
    const usePwd = role === "athlete" ? (body.usePassword !== false) : !!body.usePassword;
    // NEW
    const usePwd = role === "athlete" ? true : !!body.usePassword;

Deploy when you're ready (or have it deployed for you).
