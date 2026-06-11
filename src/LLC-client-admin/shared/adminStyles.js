// shared/adminStyles.js
// Shared inline styles for the client-admin modals. Brand: #E8420A primary.
// Move these into your theme tokens later if you prefer.

export const overlay = {
  position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000,
};
export const card = {
  width: "100%", maxWidth: 380, background: "#fff", borderRadius: 16,
  padding: 22, boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
};
export const input = {
  width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #ddd",
  fontSize: 15, boxSizing: "border-box", outline: "none",
};
export const btnPrimary = {
  padding: "12px 16px", borderRadius: 10, border: "none", background: "#E8420A",
  color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
};
export const btnDanger = {
  padding: "12px 16px", borderRadius: 10, border: "none", background: "#C01800",
  color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
};
export const btnGhost = {
  padding: "8px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff",
  color: "#333", fontWeight: 600, fontSize: 14, cursor: "pointer",
};
