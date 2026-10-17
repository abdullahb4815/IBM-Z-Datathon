import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FoodBank, Need } from '../api/types';
import { colors, urgencyColor } from '../theme';

interface Props {
  bank: FoodBank;
  needs: Need[]; // already filtered by category
  onDonate: (bank: FoodBank, need: Need) => void;
}

// Foldable card: food bank header, with the items it needs listed directly below.
export function FoodBankCard({ bank, needs, onDonate }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setOpen(!open)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{bank.name}</Text>
          <Text style={styles.sub}>
            {bank.address}
            {bank.distance_km != null ? ` · ${bank.distance_km.toFixed(1)} km` : ''}
          </Text>
        </View>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={24} color={colors.muted} />
      </Pressable>

      {open &&
        needs.map((need) => (
          <View key={need.item} style={styles.needRow}>
            <View style={[styles.dot, { backgroundColor: urgencyColor(need.urgency) }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.item}>{need.item}</Text>
              <Text style={styles.sub}>{need.needed_qty} units needed</Text>
            </View>
            <Pressable style={styles.donateBtn} onPress={() => onDonate(bank, need)}>
              <Text style={styles.donateText}>Donate</Text>
            </Pressable>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  needRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  item: { fontSize: 15, color: colors.text },
  donateBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  donateText: { color: '#fff', fontWeight: '600' },
});
