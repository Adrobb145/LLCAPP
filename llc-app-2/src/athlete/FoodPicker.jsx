// athlete/FoodPicker.jsx — the Fuel-tab food logger. Category-first: tap a
// category (Protein, Carbs…) to drop down its foods, tap a food to pick a
// portion (quick chips or +/- stepper in its native unit) → macros recalc
// live → Add logs it. Athletes can save their own custom foods, and the
// custom-food form auto-fills macros from the nutrition API by food name.
import { useState } from "react";
import { D } from "../theme/tokens";
import { FOODS, FOOD_CATS, kcalOf, round1, portionLabel } from "./foodLibrary";
import { lookupNutrition } from "../lib/db";

const PINK = D.acc;

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function FoodRow({ food, onLog }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(food.chips && food.chips[0] ? food.chips[0] : 1);
  const step = food.step || 1, min = food.min || step, max = food.max || 99;
  const p = food.p * qty, c = food.c * qty, f = food.f * qty, kcal = kcalOf(p, c, f);
  const set = v => setQty(round1(clamp(v, min, max)));
  const add = () => { onLog({ name: portionLabel(qty, food.unit, food.name), p: round1(p), c: round1(c), f: round1(f), kcal }); setOpen(false); };

  return (
    <div style={{ background: D.lift, border: `1px solid ${open ? PINK + "66" : D.line}`, borderRadius: 10, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", cursor: "pointer" }}>
        <span style={{ fontSize: 19, lineHeight: 1 }}>{food.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{food.name}</div>
          <div style={{ fontSize: 10.5, color: D.sub, marginTop: 1 }}>{food.p}P · {food.c}C · {food.f}F per {food.unit}</div>
        </div>
        <span style={{ fontSize: 18, color: open ? PINK : D.sub, fontWeight: 800, lineHeight: 1 }}>{open ? "×" : "+"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 12px 12px" }}>
          {food.chips && food.chips.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 11 }}>
              {food.chips.map(ch => (
                <button key={ch} onClick={() => set(ch)} style={{ background: round1(qty) === round1(ch) ? PINK + "22" : D.card, border: `1px solid ${round1(qty) === round1(ch) ? PINK : D.line}`, color: round1(qty) === round1(ch) ? PINK : D.ink, borderRadius: 16, padding: "5px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{round1(ch)} {food.unit}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
            <button onClick={() => set(qty - step)} style={{ width: 36, height: 36, borderRadius: 9, background: D.card, border: `1px solid ${D.line}`, color: D.ink, fontSize: 20, fontWeight: 800, cursor: "pointer", lineHeight: 1 }}>−</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20 }}>{round1(qty)}</div>
              <div style={{ fontSize: 10.5, color: D.sub, marginTop: -1 }}>{food.unit}</div>
            </div>
            <button onClick={() => set(qty + step)} style={{ width: 36, height: 36, borderRadius: 9, background: D.card, border: `1px solid ${D.line}`, color: D.ink, fontSize: 20, fontWeight: 800, cursor: "pointer", lineHeight: 1 }}>+</button>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", gap: 10, justifyContent: "center", background: D.card, borderRadius: 9, padding: "8px 6px" }}>
              {[["P", Math.round(p), "#FF6B2C"], ["C", Math.round(c), "#3AE0FF"], ["F", Math.round(f), "#FFB23A"]].map(([l, v, col]) => (
                <span key={l} style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}><span style={{ color: col, fontWeight: 800 }}>{l}</span> {v}</span>
              ))}
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: PINK, fontWeight: 800 }}>{kcal} kcal</span>
            </div>
            <button onClick={add} style={{ background: PINK, color: "#0B0B0C", border: 0, borderRadius: 9, padding: "0 18px", height: 38, fontWeight: 800, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

const MCOLS = [["p", "Protein", "#FF6B2C"], ["c", "Carbs", "#3AE0FF"], ["f", "Fat", "#FFB23A"]];

function CustomForm({ onSave, onCancel }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [status, setStatus] = useState(null); // "found" | "manual" | "error"
  const [m, setM] = useState({ p: "", c: "", f: "" });
  const set = (k, v) => setM(prev => ({ ...prev, [k]: v }));

  const P = Number(m.p) || 0, C = Number(m.c) || 0, F = Number(m.f) || 0;
  const cal = Math.round(P * 4 + C * 4 + F * 9);
  const hasMacros = P > 0 || C > 0 || F > 0;
  const canSave = searched && q.trim() && hasMacros;

  const search = async () => {
    const query = q.trim();
    if (!query || loading) return;
    setLoading(true); setSearched(false); setStatus(null);
    let res;
    try { res = await lookupNutrition(query); } catch (e) { res = { ok: false }; }
    setLoading(false); setSearched(true);
    if (res && res.ok) { setM({ p: res.p, c: res.c, f: res.f }); setStatus("found"); }
    else { setM({ p: "", c: "", f: "" }); setStatus(res && res.reason === "error" ? "error" : "manual"); }
  };

  const save = () => {
    const name = q.trim();
    if (!name || !hasMacros) return;
    onSave({ id: "cf" + Date.now(), name, unit: "serving", p: P, c: C, f: F, custom: true });
  };

  const inp = { background: D.lift, border: `1px solid ${D.line}`, borderRadius: 7, padding: "9px 10px", color: D.ink, fontSize: 13.5, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };
  const statusText = status === "found" ? "✓ Found — adjust the numbers if needed, then save."
    : status === "error" ? "Couldn't reach the nutrition service — enter the macros by hand."
    : status === "manual" ? "No match — enter the macros by hand, then save."
    : null;
  const statusColor = status === "found" ? D.good : status === "error" ? "#FFB23A" : D.sub;

  return (
    <div style={{ background: D.card, border: `1px solid ${PINK}55`, borderRadius: 11, padding: 13 }}>
      <div style={{ fontSize: 11, color: PINK, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>New custom food</div>

      <div style={{ fontSize: 10.5, color: D.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>Search a food — include the amount</div>
      <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") search(); }} placeholder="e.g. 6 oz chicken breast" style={{ ...inp, flex: 2 }} />
        <button onClick={search} disabled={loading || !q.trim()} style={{ flexShrink: 0, background: (loading || !q.trim()) ? D.lift : PINK, color: (loading || !q.trim()) ? D.sub : "#0B0B0C", border: (loading || !q.trim()) ? `1px solid ${D.line}` : 0, borderRadius: 7, padding: "0 15px", fontWeight: 800, fontSize: 12.5, cursor: (loading || !q.trim()) ? "default" : "pointer" }}>{loading ? "…" : "Search"}</button>
      </div>

      {statusText && <div style={{ fontSize: 11.5, color: statusColor, marginBottom: 10, lineHeight: 1.4 }}>{statusText}</div>}
      {!searched && !loading && <div style={{ fontSize: 11, color: D.sub, marginBottom: 10, lineHeight: 1.4 }}>The amount you type becomes the serving. No match? You can still enter macros by hand.</div>}

      {searched && (
        <>
          <div style={{ background: D.lift, borderRadius: 8, padding: "8px 11px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10.5, color: D.sub, fontWeight: 700, textTransform: "uppercase", flexShrink: 0 }}>Serving</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: D.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.trim()}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 9 }}>
            {MCOLS.map(([k, l, col]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: col, fontWeight: 700, marginBottom: 3, textTransform: "uppercase" }}>{l}</div>
                <input type="number" value={m[k]} onChange={e => set(k, e.target.value)} placeholder="0" style={{ ...inp, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: D.sub, marginBottom: 11 }}>= <b className="mono" style={{ color: D.ink }}>{cal}</b> kcal per serving</div>
        </>
      )}

      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={onCancel} style={{ flex: 1, background: D.lift, color: D.sub, border: `1px solid ${D.line}`, borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Cancel</button>
        <button onClick={save} disabled={!canSave} style={{ flex: 2, background: canSave ? PINK : D.lift, color: canSave ? "#0B0B0C" : D.sub, border: canSave ? 0 : `1px solid ${D.line}`, borderRadius: 8, padding: 10, fontWeight: 800, fontSize: 12.5, cursor: canSave ? "pointer" : "not-allowed" }}>{searched ? "Save to my foods" : "Search a food first"}</button>
      </div>
    </div>
  );
}

export default function FoodPicker({ onLog, customFoods = [], onAddCustomFood, onDeleteCustomFood }) {
  const [openCat, setOpenCat] = useState(null);
  const [adding, setAdding] = useState(false);
  const cats = [...FOOD_CATS, { id: "mine", label: "My foods", emoji: "⭐" }];
  const foodsFor = id => id === "mine" ? customFoods : FOODS.filter(f => f.cat === id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <div style={{ fontSize: 11, color: D.sub, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700 }}>Add food</div>
        <button onClick={() => setAdding(a => !a)} style={{ background: adding ? D.lift : PINK, color: adding ? D.sub : "#0B0B0C", border: adding ? `1px solid ${D.line}` : 0, borderRadius: 7, padding: "6px 11px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{adding ? "Close" : "+ Custom"}</button>
      </div>

      {adding && (
        <div style={{ marginBottom: 11 }}>
          <CustomForm onCancel={() => setAdding(false)} onSave={food => { onAddCustomFood && onAddCustomFood(food); setAdding(false); setOpenCat("mine"); }} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cats.map(ct => {
          const open = openCat === ct.id;
          const foods = foodsFor(ct.id);
          return (
            <div key={ct.id} style={{ background: D.card, border: `1px solid ${open ? PINK + "66" : D.line}`, borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setOpenCat(open ? null : ct.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: "transparent", border: 0, cursor: "pointer", color: D.ink, fontFamily: "inherit" }}>
                <span style={{ fontSize: 21, lineHeight: 1 }}>{ct.emoji}</span>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14.5, fontWeight: 800 }}>{ct.label}</span>
                <span style={{ fontSize: 11, color: D.sub, fontFamily: "'JetBrains Mono',monospace" }}>{foods.length}</span>
                <span style={{ fontSize: 16, color: open ? PINK : D.sub, fontWeight: 800, display: "inline-block", transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
              </button>

              {open && (
                <div style={{ padding: "2px 10px 11px", display: "flex", flexDirection: "column", gap: 7, background: "#0E0E10" }}>
                  {foods.length === 0 && ct.id === "mine" && (
                    <div style={{ fontSize: 12, color: D.sub, fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>No custom foods yet. Tap “+ Custom” above to save one.</div>
                  )}
                  {foods.map(food => ct.id === "mine"
                    ? (
                      <div key={food.id} style={{ position: "relative" }}>
                        <FoodRow food={{ ...food, chips: [1, 2, 3], step: 0.5, min: 0.5, max: 20 }} onLog={onLog} />
                        {onDeleteCustomFood && (
                          <button onClick={() => { if (window.confirm("Delete " + food.name + " from your foods?")) onDeleteCustomFood(food.id); }} title="Delete" style={{ position: "absolute", top: 8, right: 40, background: "transparent", border: 0, color: D.sub, fontSize: 13, cursor: "pointer", padding: 4, lineHeight: 1 }}>🗑</button>
                        )}
                      </div>
                    )
                    : <FoodRow key={food.id} food={food} onLog={onLog} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
