// Donate: category filter, bulletin board, and foldable list of food banks with their needs.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createPledge, getBulletin, getFoodBanks } from '../../src/api/client';
import type { BulletinPost, Category, FoodBank, Need } from '../../src/api/types';
import { BulletinBoard } from '../../src/components/BulletinBoard';
import { FoodBankCard } from '../../src/components/FoodBankCard';
import { getDeviceId } from '../../src/storage';
import { CATEGORIES, colors } from '../../src/theme';

const QTY_OPTIONS = [1, 5, 10];

export default function DonateScreen() {
  const [banks, setBanks] = useState<FoodBank[]>([]);
  const [posts, setPosts] = useState<BulletinPost[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [b, p] = await Promise.all([getFoodBanks(), getBulletin()]);
    setBanks(b);
    setPosts(p);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function onDonate(bank: FoodBank, need: Need) {
    Alert.alert(`Donate ${need.item}`, `How many units for ${bank.name}?`, [
      ...QTY_OPTIONS.map((qty) => ({
        text: `${qty}`,
        onPress: async () => {
          await createPledge({
            device_id: await getDeviceId(),
            foodbank_id: bank.id,
            item: need.item,
            category: need.category,
            qty,
          });
          Alert.alert('Thank you!', `You pledged ${qty} × ${need.item}. Drop it off at ${bank.address}.`);
          load();
        },
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }

  const visible = banks
    .map((bank) => ({ bank, needs: bank.needs.filter((n) => !category || n.category === category) }))
    .filter(({ needs }) => needs.length > 0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" icon="view-grid" active={category === null} onPress={() => setCategory(null)} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            icon={c.icon}
            active={category === c.key}
            onPress={() => setCategory(c.key)}
          />
        ))}
      </ScrollView>

      <BulletinBoard posts={posts} />

      <Text style={styles.heading}>Food banks in need</Text>
      {visible.map(({ bank, needs }) => (
        <FoodBankCard key={bank.id} bank={bank} needs={needs} onDonate={onDonate} />
      ))}
      {visible.length === 0 && <Text style={styles.empty}>No food banks need this category right now.</Text>}
    </ScrollView>
  );
}

function Chip(props: { label: string; icon: string; active: boolean; onPress: () => void }) {
  const fg = props.active ? '#fff' : colors.text;
  return (
    <Pressable style={[styles.chip, props.active && styles.chipActive]} onPress={props.onPress}>
      <MaterialCommunityIcons name={props.icon as any} size={16} color={fg} />
      <Text style={[styles.chipText, { color: fg }]}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  chips: { gap: 8, paddingBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '500' },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 20 },
});
