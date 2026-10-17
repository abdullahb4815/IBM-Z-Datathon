// Home: map of nearby food banks.
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { getFoodBanks } from '../../src/api/client';
import type { FoodBank } from '../../src/api/types';
import { colors, urgencyColor } from '../../src/theme';

const DEFAULT_REGION = { latitude: 51.5079, longitude: -0.1281, latitudeDelta: 0.05, longitudeDelta: 0.05 };

export default function HomeScreen() {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [banks, setBanks] = useState<FoodBank[] | null>(null);

  useEffect(() => {
    (async () => {
      let coords: { lat: number; lng: number } | undefined;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setRegion({ ...DEFAULT_REGION, latitude: coords.lat, longitude: coords.lng });
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

  return (
    <MapView style={StyleSheet.absoluteFill} region={region} showsUserLocation>
      {banks.map((bank) => {
        const topUrgency = bank.needs[0]?.urgency ?? 0;
        return (
          <Marker
            key={bank.id}
            coordinate={{ latitude: bank.lat, longitude: bank.lng }}
            pinColor={urgencyColor(topUrgency)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.name}>{bank.name}</Text>
                <Text style={styles.sub}>{bank.address}</Text>
                {bank.needs.slice(0, 3).map((n) => (
                  <Text key={n.item} style={styles.need}>
                    • {n.item} ({n.needed_qty})
                  </Text>
                ))}
              </View>
            </Callout>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  callout: { width: 200, padding: 4 },
  name: { fontWeight: '700', fontSize: 14, color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  need: { fontSize: 13, color: colors.text },
});
