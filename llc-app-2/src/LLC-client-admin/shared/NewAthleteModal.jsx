// shared/NewAthleteModal.jsx
// Shows the email + temp password after adding an athlete, with copy buttons.
// This is what was missing — the credential was generated but never surfaced.
// Render it after a successful addAthlete().

import { useState } from "react";
import { overlay, card, btnPrimary, btnGhost } from "./adminStyles";

export function NewAthleteModal({ result, onClose }) {
  const [copied, setCopied] = useState("");
  if (!result) return null;

  const APP = "https://llcapp.vercel.app";
  const shareBlock =
    `DNA / Live Long Collective login\n` +
    `App: ${APP}\n` +
    `Email: ${result.email}\n` +
    `Temp password: ${result.tempPassword}\n` +
    `You'll set your own password on first login.`;

  const copy = (label, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const Field = ({ label, value, k }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111", fontFamily: "monospace" }}>{value}</div>
      </div>
      <button onClick={() => copy(k, value)} style={btnGhost}>{copied === k ? "Copied" : "Copy"}</button>
    </div>
  );

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#E8420A", marginBottom: 4 }}>Athlete added</div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
          Send these to {result.client?.name || "your athlete"}. The email is already confirmed,
          so they can log in right away and set their own password.
        </div>
        <Field label="Email" value={result.email} k="email" />
        <Field label="Temp password" value={result.tempPassword} k="pw" />
        <button onClick={() => copy("all", shareBlock)} style={{ ...btnPrimary, width: "100%", marginTop: 6 }}>
          {copied === "all" ? "Copied message" : "Copy shareable message"}
        </button>
        <button onClick={onClose} style={{ ...btnGhost, width: "100%", marginTop: 8 }}>Done</button>
      </div>
    </div>
  );
}
