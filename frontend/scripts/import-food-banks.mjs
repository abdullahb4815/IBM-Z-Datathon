// Converts ../data/food_banks.csv and ../data/inventory_history.csv into src/mock/foodBanks.generated.ts.
// The app can't read files outside frontend/ at runtime, so re-run this after the CSVs change:
//   npm run import:food-banks
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, '..', 'data');
const outPath = join(root, 'src', 'mock', 'foodBanks.generated.ts');

// Must match Category in src/api/types.ts.
const CATEGORY_KEYS = {
  'Baked Goods': 'baked_goods',
  'Dry Staples': 'dry_staples',
  'Fresh Produce': 'fresh_produce',
  'Tinned Goods': 'tinned_goods',
  Toiletries: 'toiletries',
};

// Splits one CSV line, honouring double-quoted fields.
function parseLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') field += line[++i];
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      fields.push(field);
      field = '';
    } else field += ch;
  }
  fields.push(field);
  return fields.map((f) => f.trim());
}

function readCsv(file, requiredCols) {
  const [header, ...lines] = readFileSync(join(dataDir, file), 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const cols = parseLine(header);
  for (const c of requiredCols) {
    if (!cols.includes(c)) throw new Error(`${file} is missing the "${c}" column`);
  }
  return lines.map((line) => Object.fromEntries(parseLine(line).map((v, j) => [cols[j], v])));
}

// Latest inventory record per (food bank, category).
const latest = new Map();
for (const r of readCsv('inventory_history.csv', [
  'record_id',
  'date',
  'food_bank_id',
  'category',
  'quantity_in_stock',
  'quantity_required',
])) {
  if (!CATEGORY_KEYS[r.category]) throw new Error(`inventory_history.csv: unknown category "${r.category}"`);
  const key = `${r.food_bank_id}|${r.category}`;
  const prev = latest.get(key);
  if (!prev || r.date > prev.date || (r.date === prev.date && Number(r.record_id) > Number(prev.record_id))) {
    latest.set(key, r);
  }
}

function needsFor(bankId) {
  const needs = [];
  for (const [label, category] of Object.entries(CATEGORY_KEYS)) {
    const r = latest.get(`${bankId}|${label}`);
    if (!r) continue;
    const required = Number(r.quantity_required);
    const stock = Number(r.quantity_in_stock);
    if (required <= 0) continue;
    // Share of the shortfall relative to what the bank would have once it's met.
    const urgency = Math.round((required / (required + stock)) * 100) / 100;
    needs.push({ item: label, category, forecast_qty: required, needed_qty: required, urgency });
  }
  return needs.sort((a, b) => b.urgency - a.urgency);
}

const banks = readCsv('food_banks.csv', ['id', 'name', 'latitude', 'longitude']).map((r, i) => {
  const lat = Number(r.latitude);
  const lng = Number(r.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`food_banks.csv row ${i + 2}: invalid coordinates`);
  }
  return { id: r.id, name: r.name, address: r.address ?? '', lat, lng, needs: needsFor(r.id) };
});

writeFileSync(
  outPath,
  `// Generated from data/food_banks.csv and data/inventory_history.csv by scripts/import-food-banks.mjs.
// Do not edit by hand.
import type { FoodBank } from '../api/types';

export const CSV_FOODBANKS: FoodBank[] = ${JSON.stringify(banks, null, 2)};
`,
);
const needCount = banks.reduce((n, b) => n + b.needs.length, 0);
console.log(`Wrote ${banks.length} food banks with ${needCount} needs to ${outPath}`);
