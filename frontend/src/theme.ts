import type { Category } from './api/types';

export const colors = {
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  bg: '#F6F7F9',
  card: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#6B7280',
  border: '#E5E7EB',
  high: '#DC2626',
  medium: '#F59E0B',
  low: '#16A34A',
};

// Labels match data/inventory_history.csv. Icon names are from MaterialCommunityIcons (@expo/vector-icons).
export const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'baked_goods', label: 'Baked Goods', icon: 'baguette' },
  { key: 'dry_staples', label: 'Dry Staples', icon: 'rice' },
  { key: 'fresh_produce', label: 'Fresh Produce', icon: 'food-apple' },
  { key: 'tinned_goods', label: 'Tinned Goods', icon: 'food-variant' },
  { key: 'toiletries', label: 'Toiletries', icon: 'toothbrush-paste' },
];

export function urgencyLabel(urgency: number): string {
  if (urgency >= 0.7) return 'High';
  if (urgency >= 0.4) return 'Medium';
  return 'Low';
}

export function urgencyColor(urgency: number): string {
  if (urgency >= 0.7) return colors.high;
  if (urgency >= 0.4) return colors.medium;
  return colors.low;
}
