// Shared API contract. Must match backend/app/schemas.py.

// Matches the categories in data/inventory_history.csv ("Baked Goods" -> 'baked_goods', etc.).
export type Category = 'baked_goods' | 'dry_staples' | 'fresh_produce' | 'tinned_goods' | 'toiletries';

export interface Need {
  item: string; // display name, currently the category label
  category: Category;
  forecast_qty: number; // model forecast before existing pledges
  needed_qty: number; // units still needed (quantity_required, predicted by the backend model)
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
  item: string; // display name, currently the category label
  category: Category;
  qty: number;
}

export interface Insights {
  units_donated: number;
  people_helped: number;
  pledges_count: number;
  by_category: Record<Category, number>;
}
