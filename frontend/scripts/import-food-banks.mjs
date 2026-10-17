// Converts ../data/food_banks.csv into src/mock/foodBanks.generated.ts.
// The app can't read files outside frontend/ at runtime, so re-run this after the CSV changes:
//   npm run import:food-banks
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const csvPath = join(root, '..', 'data', 'food_banks.csv');
const outPath = join(root, 'src', 'mock', 'foodBanks.generated.ts');

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

const [header, ...rows] = readFileSync(csvPath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
const cols = parseLine(header);
for (const required of ['id', 'name', 'latitude', 'longitude']) {
  if (!cols.includes(required)) throw new Error(`food_banks.csv is missing the "${required}" column`);
}

const banks = rows.map((line, i) => {
  const r = Object.fromEntries(parseLine(line).map((v, j) => [cols[j], v]));
  const lat = Number(r.latitude);
  const lng = Number(r.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`food_banks.csv row ${i + 2}: invalid coordinates`);
  }
  return { id: r.id, name: r.name, address: r.address ?? '', lat, lng, needs: [] };
});

writeFileSync(
  outPath,
  `// Generated from data/food_banks.csv by scripts/import-food-banks.mjs. Do not edit by hand.
import type { FoodBank } from '../api/types';

export const CSV_FOODBANKS: FoodBank[] = ${JSON.stringify(banks, null, 2)};
`,
);
console.log(`Wrote ${banks.length} food banks to ${outPath}`);
