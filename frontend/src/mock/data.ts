// Used when EXPO_PUBLIC_API_URL is unset or the backend is unreachable.
import type { BulletinPost, FoodBank } from '../api/types';

export const MOCK_FOODBANKS: FoodBank[] = [
  {
    id: 'fb1',
    name: 'Central Community Food Bank',
    address: '12 High Street',
    lat: 51.5079,
    lng: -0.1281,
    needs: [
      { item: 'Tinned tomatoes', category: 'non_perishable', needed_qty: 120, urgency: 0.9 },
      { item: 'UHT milk', category: 'dairy', needed_qty: 60, urgency: 0.75 },
      { item: 'Pasta', category: 'non_perishable', needed_qty: 40, urgency: 0.45 },
      { item: 'Sliced bread', category: 'bread', needed_qty: 15, urgency: 0.2 },
    ],
  },
  {
    id: 'fb2',
    name: 'Riverside Pantry',
    address: '4 Wharf Road',
    lat: 51.5033,
    lng: -0.1195,
    needs: [
      { item: 'Cooking oil', category: 'fat', needed_qty: 30, urgency: 0.8 },
      { item: 'Butter', category: 'fat', needed_qty: 20, urgency: 0.55 },
      { item: 'Tinned beans', category: 'non_perishable', needed_qty: 50, urgency: 0.5 },
    ],
  },
  {
    id: 'fb3',
    name: 'Northside Food Share',
    address: '88 Park Lane',
    lat: 51.5155,
    lng: -0.1419,
    needs: [
      { item: 'Wholemeal bread', category: 'bread', needed_qty: 45, urgency: 0.85 },
      { item: 'Cheese', category: 'dairy', needed_qty: 25, urgency: 0.6 },
      { item: 'Rice', category: 'non_perishable', needed_qty: 10, urgency: 0.15 },
    ],
  },
];

export const MOCK_BULLETIN: BulletinPost[] = [
  {
    id: 'b1',
    foodbank_id: 'fb1',
    foodbank_name: 'Central Community Food Bank',
    message: 'Running very low on tinned goods ahead of the weekend.',
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'b2',
    foodbank_id: 'fb2',
    foodbank_name: 'Riverside Pantry',
    message: 'Thank you! We hit our pasta target this week.',
    created_at: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
];
