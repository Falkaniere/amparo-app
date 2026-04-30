import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmparoLogo } from '@/components/ui/AmparoLogo';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-8 gap-4">

        <AmparoLogo size={64} color="white" />

        <Text className="text-white text-4xl font-bold tracking-tight mt-2">
          amparo
        </Text>

        <Text className="text-white/75 text-sm text-center leading-relaxed">
          Acompanhantes de confiança{'\n'}quando você mais precisa
        </Text>

        {/* Dots onboarding */}
        <View className="flex-row gap-1 mt-6">
          <View className="w-4 h-1.5 bg-white rounded-full" />
          <View className="w-1.5 h-1.5 bg-white/35 rounded-full" />
          <View className="w-1.5 h-1.5 bg-white/35 rounded-full" />
        </View>

        <Pressable
          className="mt-8 bg-white rounded-full px-10 py-3 active:opacity-80"
          onPress={() => router.push('/(auth)/register')}
        >
          <Text className="text-dark text-sm font-bold">Começar</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text className="text-white/60 text-xs mt-2">
            Já tenho conta · Entrar
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}
