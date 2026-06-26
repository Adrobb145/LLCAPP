// athlete/foodLibrary.js — curated food library for the Fuel tab.
// Each food stores macros for ONE base unit; portions multiply from there.
// Units are the unit that's actually accurate for that food (oz for meats,
// cup for grains, each for eggs/fruit, scoop for powder). Carbs that change
// dramatically dry vs cooked are labeled explicitly so nobody logs 3x.
// Macros are standard reference values (USDA-level), per single base unit.

export const FOOD_CATS = [
  { id: "protein", label: "Protein", emoji: "🍗" },
  { id: "carb", label: "Carbs", emoji: "🍚" },
  { id: "dairy", label: "Dairy", emoji: "🥛" },
  { id: "fat", label: "Fats", emoji: "🥑" },
];

// p/c/f = grams per ONE unit. chips = common quick portions in that unit.
export const FOODS = [
  // ---- PROTEIN (per oz, cooked) ----
  { id: "chicken",  name: "Chicken breast", emoji: "🍗", cat: "protein", unit: "oz", p: 8.7, c: 0,   f: 1.0, chips: [4, 6, 8],   step: 1,    min: 1,    max: 16 },
  { id: "beef93",   name: "93/7 ground beef", emoji: "🥩", cat: "protein", unit: "oz", p: 7.0, c: 0,   f: 2.3, chips: [4, 6, 8],   step: 1,    min: 1,    max: 16 },
  { id: "sirloin",  name: "Sirloin steak", emoji: "🥩", cat: "protein", unit: "oz", p: 8.3, c: 0,   f: 1.8, chips: [4, 6, 8],   step: 1,    min: 1,    max: 16 },
  { id: "salmon",   name: "Salmon", emoji: "🐟", cat: "protein", unit: "oz", p: 7.0, c: 0,   f: 3.7, chips: [4, 6, 8],   step: 1,    min: 1,    max: 16 },
  { id: "tilapia",  name: "Tilapia", emoji: "🐟", cat: "protein", unit: "oz", p: 8.5, c: 0,   f: 0.8, chips: [4, 6, 8],   step: 1,    min: 1,    max: 16 },
  { id: "shrimp",   name: "Shrimp", emoji: "🦐", cat: "protein", unit: "oz", p: 6.9, c: 0.2, f: 0.3, chips: [4, 6, 8],   step: 1,    min: 1,    max: 16 },
  { id: "turkey",   name: "Ground turkey 93/7", emoji: "🦃", cat: "protein", unit: "oz", p: 7.0, c: 0,   f: 2.3, chips: [4, 6, 8],   step: 1,    min: 1,    max: 16 },
  { id: "egg",      name: "Large egg", emoji: "🥚", cat: "protein", unit: "each", p: 6.3, c: 0.4, f: 5.0, chips: [1, 2, 3],   step: 1,    min: 1,    max: 12 },
  { id: "eggwhite", name: "Egg whites", emoji: "🥚", cat: "protein", unit: "cup", p: 26.0, c: 2.0, f: 0,  chips: [0.25, 0.5, 0.75], step: 0.25, min: 0.25, max: 2 },
  { id: "whey",     name: "Whey protein", emoji: "🥤", cat: "protein", unit: "scoop", p: 24.0, c: 3.0, f: 1.5, chips: [1, 2],   step: 0.5,  min: 0.5,  max: 4 },

  // ---- CARBS ----
  { id: "rice",     name: "White rice", emoji: "🍚", cat: "carb", unit: "cup cooked", p: 4.3, c: 45, f: 0.4, chips: [0.5, 1, 1.5], step: 0.25, min: 0.25, max: 4 },
  { id: "oats",     name: "Oats", emoji: "🥣", cat: "carb", unit: "cup dry", p: 11, c: 54, f: 5.0, chips: [0.5, 1], step: 0.25, min: 0.25, max: 3 },
  { id: "sweetpot", name: "Sweet potato", emoji: "🍠", cat: "carb", unit: "oz", p: 0.4, c: 5.8, f: 0,   chips: [4, 6, 8], step: 1, min: 1, max: 16 },
  { id: "potato",   name: "Potato", emoji: "🥔", cat: "carb", unit: "oz", p: 0.6, c: 5.9, f: 0,   chips: [4, 6, 8], step: 1, min: 1, max: 16 },
  { id: "banana",   name: "Banana", emoji: "🍌", cat: "carb", unit: "each", p: 1.3, c: 27, f: 0.4, chips: [1, 2], step: 0.5, min: 0.5, max: 3 },
  { id: "berries",  name: "Mixed berries", emoji: "🫐", cat: "carb", unit: "cup", p: 1.2, c: 17, f: 0.5, chips: [0.5, 1], step: 0.25, min: 0.25, max: 3 },
  { id: "bread",    name: "Bread", emoji: "🍞", cat: "carb", unit: "slice", p: 3.5, c: 13, f: 1.0, chips: [1, 2], step: 1, min: 1, max: 6 },
  { id: "ricecake", name: "Rice cake", emoji: "🍘", cat: "carb", unit: "each", p: 0.7, c: 7.3, f: 0.3, chips: [1, 2, 3], step: 1, min: 1, max: 8 },

  // ---- DAIRY ----
  { id: "greek",    name: "Greek yogurt (nonfat)", emoji: "🥛", cat: "dairy", unit: "cup", p: 23, c: 9, f: 0.7, chips: [0.5, 1], step: 0.25, min: 0.25, max: 3 },
  { id: "cottage",  name: "Cottage cheese (2%)", emoji: "🥛", cat: "dairy", unit: "cup", p: 24, c: 8, f: 5.0, chips: [0.5, 1], step: 0.25, min: 0.25, max: 3 },

  // ---- FATS ----
  { id: "almonds",  name: "Almonds", emoji: "🌰", cat: "fat", unit: "oz", p: 6, c: 6, f: 14, chips: [0.5, 1], step: 0.25, min: 0.25, max: 4 },
  { id: "pb",       name: "Peanut butter", emoji: "🥜", cat: "fat", unit: "tbsp", p: 3.5, c: 3.5, f: 8, chips: [1, 2], step: 0.5, min: 0.5, max: 6 },
  { id: "avocado",  name: "Avocado", emoji: "🥑", cat: "fat", unit: "each", p: 3, c: 12, f: 22, chips: [0.5, 1], step: 0.5, min: 0.5, max: 2 },
  { id: "oliveoil", name: "Olive oil", emoji: "🫒", cat: "fat", unit: "tbsp", p: 0, c: 0, f: 14, chips: [1, 2], step: 0.5, min: 0.5, max: 4 },
];

export const kcalOf = (p, c, f) => Math.round(p * 4 + c * 4 + f * 9);

// Clean up float math from 0.25 steps.
export const round1 = (n) => Math.round(n * 10) / 10;

// Build a logged-meal name like "6 oz Chicken breast" or "2 × Large egg".
export function portionLabel(qty, unit, name) {
  const q = round1(qty);
  if (unit === "each") return `${q} × ${name}`;
  return `${q} ${unit} ${name}`;
}
