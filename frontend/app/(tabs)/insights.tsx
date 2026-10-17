// Insights: people helped, units donated, and a per-category breakdown.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { getInsights } from '../../src/api/client';
import type { Insights } from '../../src/api/types';
import { getDeviceId } from '../../src/storage';
import { CATEGORIES, colors } from '../../src/theme';

export default function InsightsScreen() {
  const [data, setData] = useState<Insights | null>(null);

  // Reload every time the tab is opened so new pledges show up.
  useFocusEffect(
    useCallback(() => {
      getDeviceId().then(getInsights).then(setData);
    }, []),
  );

  if (!data) return null;
  const maxCategory = Math.max(1, ...Object.values(data.by_category));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.statsRow}>
        <Stat icon="account-heart" value={data.people_helped} label="People helped" />
        <Stat icon="package-variant" value={data.units_donated} label="Units donated" />
      </View>
      <Stat icon="hand-heart" value={data.pledges_count} label="Donations made" />

      <Text style={styles.heading}>By category</Text>
      <View style={styles.card}>
        {CATEGORIES.map((c) => {
          const value = data.by_category[c.key] ?? 0;
          return (
            <View key={c.key} style={styles.barRow}>
              <Text style={styles.barLabel}>{c.label}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(value / maxCategory) * 100}%` }]} />
              </View>
              <Text style={styles.barValue}>{value}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <View style={[styles.card, styles.stat]}>
      <MaterialCommunityIcons name={icon as any} size={28} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: '800', color: colors.text, marginTop: 4 },
  statLabel: { fontSize: 13, color: colors.muted },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text, marginVertical: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  barLabel: { width: 120, fontSize: 14, color: colors.text },
  barTrack: { flex: 1, height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary },
  barValue: { width: 40, textAlign: 'right', fontSize: 14, color: colors.text },
});
