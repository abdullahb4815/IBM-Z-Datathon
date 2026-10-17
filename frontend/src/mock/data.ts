// Used when EXPO_PUBLIC_API_URL is unset or the backend is unreachable.
// Food banks and their needs are generated from data/food_banks.csv and data/inventory_history.csv.
import type { BulletinPost, FoodBank } from '../api/types';
import { CSV_FOODBANKS } from './foodBanks.generated';

export const MOCK_FOODBANKS: FoodBank[] = CSV_FOODBANKS;

// Sample posts about the two most urgent needs in the data.
const mostUrgent = MOCK_FOODBANKS.flatMap((bank) => bank.needs.map((need) => ({ bank, need })))
  .sort((a, b) => b.need.urgency - a.need.urgency)
  .slice(0, 2);

export const MOCK_BULLETIN: BulletinPost[] = mostUrgent.map(({ bank, need }, i) => ({
  id: `b${i + 1}`,
  foodbank_id: bank.id,
  foodbank_name: bank.name,
  message: `We urgently need ${need.item.toLowerCase()}: ${need.needed_qty} units short this week.`,
  created_at: new Date(Date.now() - (2 + i * 24) * 3600_000).toISOString(),
}));
