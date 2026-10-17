// Talks to the backend. If EXPO_PUBLIC_API_URL is unset or a request fails,
// falls back to mock/local data so the frontend can be built independently.
import { MOCK_BULLETIN, MOCK_FOODBANKS } from '../mock/data';
import { addLocalPledge, getLocalPledges } from '../storage';
import type { BulletinPost, Category, FoodBank, Insights, PledgeIn } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function request<T>(path: string, fallback: () => T | Promise<T>, init?: RequestInit): Promise<T> {
  if (!BASE_URL) return fallback();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`API ${path} failed, using fallback:`, err);
    return fallback();
  }
}

export function getFoodBanks(coords?: { lat: number; lng: number }): Promise<FoodBank[]> {
  const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : '';
  return request(`/foodbanks${query}`, () => MOCK_FOODBANKS);
}

export function getBulletin(): Promise<BulletinPost[]> {
  return request('/bulletin', () => MOCK_BULLETIN);
}

export async function createPledge(pledge: PledgeIn): Promise<void> {
  // Always keep a local copy so Insights works offline.
  await addLocalPledge(pledge);
  await request('/pledges', () => null, { method: 'POST', body: JSON.stringify(pledge) });
}

export function getInsights(deviceId: string): Promise<Insights> {
  return request(`/insights/${deviceId}`, localInsights);
}

// Placeholder estimate until the backend model provides people_helped.
const UNITS_PER_PERSON = 3;

async function localInsights(): Promise<Insights> {
  const pledges = await getLocalPledges();
  const by_category: Record<Category, number> = { bread: 0, dairy: 0, fat: 0, non_perishable: 0 };
  let units = 0;
  for (const p of pledges) {
    units += p.qty;
    by_category[p.category] += p.qty;
  }
  return {
    units_donated: units,
    people_helped: Math.floor(units / UNITS_PER_PERSON),
    pledges_count: pledges.length,
    by_category,
  };
}
