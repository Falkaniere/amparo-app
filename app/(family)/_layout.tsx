import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
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

export default function FamilyLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Início" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="Buscar" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Pedidos" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Perfil" focused={focused} />
        }}
      />
      <Tabs.Screen name="new-request" options={{ href: null }} />
      <Tabs.Screen name="companion/[id]" options={{ href: null }} />
      <Tabs.Screen name="tracking/[id]" options={{ href: null }} />
      <Tabs.Screen name="rate/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 0.5,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabIcon: { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 18 },
  tabLabel: { fontSize: 9, fontWeight: '700', color: colors.muted },
  tabLabelActive: { color: colors.primary },
});
