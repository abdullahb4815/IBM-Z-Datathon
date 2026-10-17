// Map: nearby food banks.
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { getFoodBanks } from '../../src/api/client';
import type { FoodBank } from '../../src/api/types';
import { OsmMap } from '../../src/components/OsmMap';
import { colors } from '../../src/theme';

export default function MapScreen() {
  const [user, setUser] = useState<{ lat: number; lng: number }>();
  const [banks, setBanks] = useState<FoodBank[] | null>(null);

  // Show the food banks straight away; don't wait for a GPS fix, which can take 10+ seconds indoors.
  useEffect(() => {
    getFoodBanks().then(setBanks);
  }, []);

  // Location arrives separately and only adds the "you are here" dot.
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        // A cached position is instant; refine it with a quick network/Wi-Fi fix.
        const last = await Location.getLastKnownPositionAsync();
        if (last) setUser({ lat: last.coords.latitude, lng: last.coords.longitude });
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUser({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // Location services off or unavailable: the map still shows every food bank.
      }
    })();
  }, []);

  if (!banks) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <OsmMap banks={banks} user={user} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
