// shared/ConfirmDeleteClient.jsx
// Type-to-confirm delete. Calls deleteClient() -> your `purge` Edge Function.
// onDeleted(clientId) fires after success so you can drop it from the roster.

import { useState } from "react";
import { deleteClient } from "../lib/clientAdmin";
import { overlay, card, input, btnDanger, btnGhost } from "./adminStyles";

export function ConfirmDeleteClient({ client, onDeleted, onClose }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const target = (client?.name || "").trim();
  const ok = text.trim().toLowerCase() === target.toLowerCase() && target.length > 0;

  const run = async () => {
    if (!ok || busy) return;
    setBusy(true); setErr("");
    try {
      await deleteClient(client.id);
      onDeleted?.(client.id);
    } catch (e) {
      setErr(e.message || "Delete failed");
      setBusy(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#C01800", marginBottom: 6 }}>Delete athlete</div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 14, lineHeight: 1.5 }}>
          This permanently removes <b>{target}</b>'s programming, logs, and pillar history,
          and deletes their login and email from the server. This cannot be undone.
        </div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
          Type <b style={{ color: "#111" }}>{target}</b> to confirm.
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={target}
          style={input}
          autoFocus
        />
        {err && <div style={{ color: "#C01800", fontSize: 13, marginTop: 8 }}>{err}</div>}
        <button
          onClick={run}
          disabled={!ok || busy}
          style={{ ...btnDanger, width: "100%", marginTop: 12, opacity: ok && !busy ? 1 : 0.5 }}
        >
          {busy ? "Deleting..." : "Permanently delete"}
        </button>
        <button onClick={onClose} style={{ ...btnGhost, width: "100%", marginTop: 8 }}>Cancel</button>
      </div>
    </div>
  );
}
