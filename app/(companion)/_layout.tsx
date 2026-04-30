import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View className="items-center gap-0.5">
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text className={`text-[9px] font-bold ${focused ? 'text-primary' : 'text-muted'}`}>
        {label}
      </Text>
    </View>
  );
}

export default function CompanionLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8E8E4',
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
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
