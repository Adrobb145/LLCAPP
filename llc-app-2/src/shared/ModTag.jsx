// shared/ModTag.jsx
// ──────────────────────────────────────────────────────────────────
// Modality / tempo / group badge. Shared — rendered by the coach Sheet
// and by the athlete SessionRunner, so it lives here rather than inside
// either consumer. Pure presentational; reads modality metadata via modOf.
// (New in Pass 2B — was inline in the monolith, not in the Pass 1 shared set.)
// ──────────────────────────────────────────────────────────────────
import { modOf } from "../constants/modalities";

export default function ModTag({ x, size = 9 }) {
  const m = modOf(x);
  if (m.id === "straight" && !(x && x.tempo) && !(x && x.grp)) return null;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:size,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase",color:m.color,background:m.color+"1F",border:`1px solid ${m.color}44`,borderRadius:3,padding:"1px 5px",whiteSpace:"nowrap"}}>{x&&x.grp?x.grp+" · ":""}{m.id==="straight"?"Tempo":m.short}{x&&x.tempo?` ${x.tempo}`:""}</span>
  );
}
