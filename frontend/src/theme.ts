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

// Icon names are from MaterialCommunityIcons (@expo/vector-icons).
export const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'bread', label: 'Bread', icon: 'bread-slice' },
  { key: 'dairy', label: 'Dairy', icon: 'cheese' },
  { key: 'fat', label: 'Fats & Oils', icon: 'bottle-tonic' },
  { key: 'non_perishable', label: 'Non-perishables', icon: 'food-variant' },
];

export function urgencyColor(urgency: number): string {
  if (urgency >= 0.7) return colors.high;
  if (urgency >= 0.4) return colors.medium;
  return colors.low;
}
