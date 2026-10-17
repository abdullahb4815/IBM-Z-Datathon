// Home: map of nearby food banks.
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { getFoodBanks } from '../../src/api/client';
import type { FoodBank } from '../../src/api/types';
import { OsmMap } from '../../src/components/OsmMap';
import { colors } from '../../src/theme';

const DEFAULT_CENTER = { lat: 51.5079, lng: -0.1281 };

export default function HomeScreen() {
  const [user, setUser] = useState<{ lat: number; lng: number }>();
  const [banks, setBanks] = useState<FoodBank[] | null>(null);

  useEffect(() => {
    (async () => {
      let coords: { lat: number; lng: number } | undefined;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUser(coords);
      }
      setBanks(await getFoodBanks(coords));
    })();
  }, []);

  if (!banks) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <OsmMap banks={banks} center={user ?? DEFAULT_CENTER} user={user} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
