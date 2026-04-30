import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { companionsService } from '@/services/companions';
import { CompanionCard } from '@/components/cards/CompanionCard';

const SERVICE_TYPES = [
  { key: 'medical', emoji: '🏥', label: 'Consulta médica',  sub: 'Hospital · UPA'     },
  { key: 'now',     emoji: '⚡', label: 'Agora',            sub: 'Disponível agora'   },
  { key: 'walk',    emoji: '🌳', label: 'Passeio',          sub: 'Parque · Compras'   },
  { key: 'other',   emoji: '➕', label: 'Outro serviço',    sub: 'Personalizar'       },
];

export default function FamilyHomeScreen() {
  const { user } = useAuthStore();
  const [companions, setCompanions] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    loadCompanions();
  }, []);

  async function loadCompanions() {
    try {
      // Localização default Rio de Janeiro para o MVP
      const data = await companionsService.getAvailable({
        lat: -22.9068,
        lng: -43.1729,
        date: new Date().toISOString().split('T')[0],
        start_time: '14:00',
        duration_hours: 2,
      });
      setCompanions(data.companions || []);
    } catch {
      setCompanions([]);
    } finally {
      setLoading(false);
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'você';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>

      {/* Header verde */}
      <View className="bg-primary px-4 pt-2 pb-4">
        <Text className="text-white/80 text-xs">{greeting},</Text>
        <Text className="text-white text-lg font-bold mt-0.5">{firstName} 👋</Text>
        <View className="flex-row items-center bg-white/20 rounded-xl px-3 py-2 mt-3 gap-2">
          <Text className="text-white/80 text-xs">🔍</Text>
          <TextInput
            placeholder="Buscar acompanhante..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            className="flex-1 text-white text-xs"
            onFocus={() => router.push('/(family)/search')}
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 gap-4">

          {/* Ações rápidas */}
          <View>
            <Text className="text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Ações rápidas
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SERVICE_TYPES.map(s => (
                <Pressable
                  key={s.key}
                  className="flex-1 min-w-[45%] bg-white border border-border rounded-xl p-3 active:opacity-80"
                  onPress={() => router.push({ pathname: '/(family)/new-request', params: { type: s.key } })}
                >
                  <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                  <Text className="text-dark text-xs font-bold mt-1.5">{s.label}</Text>
                  <Text className="text-muted text-[10px] mt-0.5">{s.sub}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Disponíveis agora */}
          <View className="pb-6">
            <Text className="text-xs font-bold text-dark uppercase tracking-wider mb-2">
              Disponíveis agora
            </Text>
            {loading ? (
              <ActivityIndicator color="#1D9E75" className="py-8" />
            ) : companions.length === 0 ? (
              <View className="bg-white border border-border rounded-xl p-6 items-center">
                <Text className="text-muted text-sm">Nenhum acompanhante disponível no momento.</Text>
              </View>
            ) : (
              companions.map(c => (
                <CompanionCard
                  key={c.id}
                  companion={c}
                  onPress={() => router.push({ pathname: '/(family)/companion/[id]', params: { id: c.id } })}
                />
              ))
            )}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
