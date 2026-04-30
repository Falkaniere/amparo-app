import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FamilySearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center">
      <Text className="text-muted">Buscar — em breve</Text>
    </SafeAreaView>
  );
}
