import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';

function TabIcon({
  emoji,
  label,
  focused,
}: {
  emoji: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function CompanionLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { paddingBottom: insets.bottom + 6 }],
        tabBarShowLabel: false,
        tabBarIconStyle: { width: '100%' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Início" focused={focused} /> }}
      />
      <Tabs.Screen
        name="requests"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Pedidos" focused={focused} /> }}
      />
      <Tabs.Screen
        name="earnings"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Ganhos" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Perfil" focused={focused} /> }}
      />
      <Tabs.Screen name="request/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 0.5,
    paddingTop: 6,
  },
  tabIcon: {
    alignItems: 'center',
    gap: 2,
  },
  emoji: { fontSize: 18 },
  tabLabel: { fontSize: 9, fontWeight: '700', color: colors.muted },
  tabLabelActive: { color: colors.primary },
});
