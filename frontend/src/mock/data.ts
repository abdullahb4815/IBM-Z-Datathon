// Used when EXPO_PUBLIC_API_URL is unset or the backend is unreachable.
// Food banks come from data/food_banks.csv; their needs are sample values until the backend serves real ones.
import type { BulletinPost, FoodBank, Need } from '../api/types';
import { CSV_FOODBANKS } from './foodBanks.generated';

const SAMPLE_NEEDS: Need[][] = [
  [
    { item: 'Tinned tomatoes', category: 'non_perishable', needed_qty: 120, urgency: 0.9 },
    { item: 'UHT milk', category: 'dairy', needed_qty: 60, urgency: 0.75 },
    { item: 'Sliced bread', category: 'bread', needed_qty: 15, urgency: 0.2 },
  ],
  [
    { item: 'Cooking oil', category: 'fat', needed_qty: 30, urgency: 0.8 },
    { item: 'Tinned beans', category: 'non_perishable', needed_qty: 50, urgency: 0.5 },
  ],
  [
    { item: 'Wholemeal bread', category: 'bread', needed_qty: 45, urgency: 0.85 },
    { item: 'Cheese', category: 'dairy', needed_qty: 25, urgency: 0.6 },
    { item: 'Rice', category: 'non_perishable', needed_qty: 10, urgency: 0.15 },
  ],
  [
    { item: 'Pasta', category: 'non_perishable', needed_qty: 40, urgency: 0.45 },
    { item: 'Butter', category: 'fat', needed_qty: 20, urgency: 0.55 },
  ],
];

export const MOCK_FOODBANKS: FoodBank[] = CSV_FOODBANKS.map((bank, i) => ({
  ...bank,
  needs: SAMPLE_NEEDS[i % SAMPLE_NEEDS.length],
}));

export const MOCK_BULLETIN: BulletinPost[] = [
  {
    id: 'b1',
    foodbank_id: MOCK_FOODBANKS[0].id,
    foodbank_name: MOCK_FOODBANKS[0].name,
    message: 'Running very low on tinned goods ahead of the weekend.',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'b2',
    foodbank_id: MOCK_FOODBANKS[1].id,
    foodbank_name: MOCK_FOODBANKS[1].name,
    message: 'Thank you! We hit our pasta target this week.',
    created_at: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
];
