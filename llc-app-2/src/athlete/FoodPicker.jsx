// athlete/FoodPicker.jsx — the Fuel-tab food logger. Tap a food → pick a
// portion (quick chips or +/- stepper in its native unit) → macros recalc
// live → Add logs it. Athletes can save their own custom foods too.
import { useState } from "react";
import { D } from "../theme/tokens";
import { FOODS, FOOD_CATS, kcalOf, round1, portionLabel } from "./foodLibrary";

const PINK = "#EC4899";

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function FoodRow({ food, onLog }) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(food.chips && food.chips[0] ? food.chips[0] : 1);
  const step = food.step || 1, min = food.min || step, max = food.max || 99;
  const p = food.p * qty, c = food.c * qty, f = food.f * qty, kcal = kcalOf(p, c, f);
  const set = v => setQty(round1(clamp(v, min, max)));
  const add = () => { onLog({ name: portionLabel(qty, food.unit, food.name), p: round1(p), c: round1(c), f: round1(f), kcal }); setOpen(false); };

  return (
    <div style={{ background: D.card, border: `1px solid ${open ? PINK + "66" : D.line}`, borderRadius: 11, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", cursor: "pointer" }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{food.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{food.name}</div>
          <div style={{ fontSize: 10.5, color: D.sub, marginTop: 1 }}>{food.p}P · {food.c}C · {food.f}F per {food.unit}</div>
        </div>
        <span style={{ fontSize: 18, color: open ? PINK : D.sub, fontWeight: 800, lineHeight: 1 }}>{open ? "×" : "+"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 13px 13px" }}>
          {food.chips && food.chips.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 11 }}>
              {food.chips.map(ch => (
                <button key={ch} onClick={() => set(ch)} style={{ background: round1(qty) === round1(ch) ? PINK + "22" : D.lift, border: `1px solid ${round1(qty) === round1(ch) ? PINK : D.line}`, color: round1(qty) === round1(ch) ? PINK : D.ink, borderRadius: 16, padding: "5px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{round1(ch)} {food.unit}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
            <button onClick={() => set(qty - step)} style={{ width: 36, height: 36, borderRadius: 9, background: D.lift, border: `1px solid ${D.line}`, color: D.ink, fontSize: 20, fontWeight: 800, cursor: "pointer", lineHeight: 1 }}>−</button>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "'Archivo Black',sans-serif", fontSize: 20 }}>{round1(qty)}</div>
              <div style={{ fontSize: 10.5, color: D.sub, marginTop: -1 }}>{food.unit}</div>
            </div>
            <button onClick={() => set(qty + step)} style={{ width: 36, height: 36, borderRadius: 9, background: D.lift, border: `1px solid ${D.line}`, color: D.ink, fontSize: 20, fontWeight: 800, cursor: "pointer", lineHeight: 1 }}>+</button>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", gap: 10, justifyContent: "center", background: D.lift, borderRadius: 9, padding: "8px 6px" }}>
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

function CustomForm({ onSave, onCancel }) {
  const [f, setF] = useState({ name: "", unit: "serving", p: "", c: "", f: "" });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const save = () => {
    const name = f.name.trim(); if (!name) return;
    const p = Number(f.p) || 0, c = Number(f.c) || 0, ff = Number(f.f) || 0;
    if (!p && !c && !ff) return;
    onSave({ id: "cf" + Date.now(), name, unit: (f.unit.trim() || "serving"), p, c, f: ff, custom: true });
  };
  const inp = { background: D.lift, border: `1px solid ${D.line}`, borderRadius: 7, padding: "9px 10px", color: D.ink, fontSize: 13.5, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };
  return (
    <div style={{ background: D.card, border: `1px solid ${PINK}55`, borderRadius: 11, padding: 13 }}>
      <div style={{ fontSize: 11, color: PINK, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>New custom food</div>
      <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
        <input value={f.name} onChange={e => set("name", e.target.value)} placeholder="Food name" style={{ ...inp, flex: 2 }} />
        <input value={f.unit} onChange={e => set("unit", e.target.value)} placeholder="unit (oz, cup…)" style={{ ...inp, flex: 1, minWidth: 0 }} />
      </div>
      <div style={{ fontSize: 10.5, color: D.sub, marginBottom: 7 }}>Macros for ONE {f.unit.trim() || "serving"}:</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 10 }}>
        {[["p", "Protein", "#FF6B2C"], ["c", "Carbs", "#3AE0FF"], ["f", "Fat", "#FFB23A"]].map(([k, l, col]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: col, fontWeight: 700, marginBottom: 3, textTransform: "uppercase" }}>{l}</div>
            <input type="number" value={f[k]} onChange={e => set(k, e.target.value)} placeholder="0" style={{ ...inp, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={onCancel} style={{ flex: 1, background: D.lift, color: D.sub, border: `1px solid ${D.line}`, borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>Cancel</button>
        <button onClick={save} style={{ flex: 2, background: PINK, color: "#0B0B0C", border: 0, borderRadius: 8, padding: 10, fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>Save to my foods</button>
      </div>
    </div>
  );
}

export default function FoodPicker({ onLog, customFoods = [], onAddCustomFood, onDeleteCustomFood }) {
  const [cat, setCat] = useState("all");
  const [adding, setAdding] = useState(false);
  const cats = [{ id: "all", label: "All", emoji: "" }, ...FOOD_CATS, { id: "mine", label: "Mine", emoji: "⭐" }];
  const list = cat === "mine" ? [] : cat === "all" ? FOODS : FOODS.filter(x => x.cat === cat);
  const mine = cat === "all" || cat === "mine" ? customFoods : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
        <div style={{ fontSize: 11, color: D.sub, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700 }}>Add food</div>
        <button onClick={() => setAdding(a => !a)} style={{ background: adding ? D.lift : PINK, color: adding ? D.sub : "#0B0B0C", border: adding ? `1px solid ${D.line}` : 0, borderRadius: 7, padding: "6px 11px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{adding ? "Close" : "+ Custom"}</button>
      </div>

      {adding && (
        <div style={{ marginBottom: 11 }}>
          <CustomForm onCancel={() => setAdding(false)} onSave={food => { onAddCustomFood && onAddCustomFood(food); setAdding(false); setCat("mine"); }} />
        </div>
      )}

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 11 }}>
        {cats.map(ct => (
          <button key={ct.id} onClick={() => setCat(ct.id)} style={{ flexShrink: 0, background: cat === ct.id ? PINK + "22" : D.lift, border: `1px solid ${cat === ct.id ? PINK : D.line}`, color: cat === ct.id ? PINK : D.ink, borderRadius: 16, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{ct.emoji ? ct.emoji + " " : ""}{ct.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mine.map(food => (
          <div key={food.id} style={{ position: "relative" }}>
            <FoodRow food={{ ...food, chips: [1, 2, 3], step: 0.5, min: 0.5, max: 20 }} onLog={onLog} />
            {onDeleteCustomFood && (
              <button onClick={() => { if (window.confirm("Delete " + food.name + " from your foods?")) onDeleteCustomFood(food.id); }} title="Delete" style={{ position: "absolute", top: 9, right: 38, background: "transparent", border: 0, color: D.sub, fontSize: 13, cursor: "pointer", padding: 4, lineHeight: 1 }}>🗑</button>
            )}
          </div>
        ))}
        {cat === "mine" && customFoods.length === 0 && (
          <div style={{ fontSize: 12, color: D.sub, fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>No custom foods yet. Tap “+ Custom” to save one — it’ll show up here every time.</div>
        )}
        {list.map(food => <FoodRow key={food.id} food={food} onLog={onLog} />)}
      </div>
    </div>
  );
}
