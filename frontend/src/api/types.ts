// Shared API contract. Must match backend/app/schemas.py.

export type Category = 'bread' | 'dairy' | 'fat' | 'non_perishable';

export interface Need {
  item: string;
  category: Category;
  needed_qty: number; // units still needed (predicted demand - current stock)
  urgency: number; // 0..1, computed by the backend model
}

export interface FoodBank {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance_km?: number;
  needs: Need[]; // sorted by urgency, highest first
}

export interface BulletinPost {
  id: string;
  foodbank_id: string;
  foodbank_name: string;
  message: string;
  created_at: string; // ISO 8601
}

export interface PledgeIn {
  device_id: string;
  foodbank_id: string;
  item: string;
  category: Category;
  qty: number;
}

export interface Insights {
  units_donated: number;
  people_helped: number;
  pledges_count: number;
  by_category: Record<Category, number>;
}
