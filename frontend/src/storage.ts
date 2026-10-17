// On-device persistence. There is no login: each install gets a random device id.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Category, PledgeIn } from './api/types';

const KEYS = {
  deviceId: 'device_id',
  profile: 'profile',
  pledges: 'pledges',
};

export interface Profile {
  photoUri?: string;
  name: string;
  dob: string; // YYYY-MM-DD
  email: string;
  phone: string;
}

export const EMPTY_PROFILE: Profile = { name: '', dob: '', email: '', phone: '' };

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(KEYS.deviceId);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await AsyncStorage.setItem(KEYS.deviceId, id);
  }
  return id;
}

export async function getProfile(): Promise<Profile> {
  const raw = await AsyncStorage.getItem(KEYS.profile);
  return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : EMPTY_PROFILE;
}

export async function saveProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export interface LocalPledge {
  foodbank_id: string;
  item: string;
  category: Category;
  qty: number;
  created_at: string;
}

export async function getLocalPledges(): Promise<LocalPledge[]> {
  const raw = await AsyncStorage.getItem(KEYS.pledges);
  return raw ? JSON.parse(raw) : [];
}

export async function addLocalPledge(p: PledgeIn): Promise<void> {
  const pledges = await getLocalPledges();
  pledges.push({
    foodbank_id: p.foodbank_id,
    item: p.item,
    category: p.category,
    qty: p.qty,
    created_at: new Date().toISOString(),
  });
  await AsyncStorage.setItem(KEYS.pledges, JSON.stringify(pledges));
}
