import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { colors } from '../../src/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

// Open on the Map tab even though Donate is first in the tab bar.
export const unstable_settings = { initialRouteName: 'index' };

function icon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <MaterialCommunityIcons name={name} color={color as string} size={size} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="donate" options={{ title: 'Donate', tabBarIcon: icon('piggy-bank') }} />
      <Tabs.Screen name="index" options={{ title: 'Map', tabBarIcon: icon('map') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('account-circle') }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: icon('chart-bar') }} />
    </Tabs>
  );
}
