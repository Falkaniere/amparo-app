import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { profileService } from '@/services/profile';
import { requestsService } from '@/services/requests';
import { RequestCard } from '@/components/cards/RequestCard';

export default function CompanionHomeScreen() {
  const { user, token } = useAuthStore();
  const [isOnline, setIsOnline]       = useState(false);
  const [requests, setRequests]       = useState<any[]>([]);
  const [earnings, setEarnings]       = useState({ week: 0, month: 0, total_services: 0 });
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reqs] = await Promise.all([
        requestsService.getCompanionRequests(token!),
      ]);
      // Filtra apenas pedidos pendentes
      const pending = (reqs.requests || []).filter((r: any) => r.status === 'pending');
      setRequests(pending.slice(0, 3));
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function toggleOnline(val: boolean) {
    setIsOnline(val);
    try {
      await profileService.setOnline(token!, val);
    } catch {
      setIsOnline(!val); // reverte se falhar
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'você';

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>

      {/* Header verde escuro */}
      <View className="bg-dark px-4 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/70 text-xs">Bom dia,</Text>
            <Text className="text-white text-lg font-bold mt-0.5">{firstName}</Text>
          </View>
          <View className="items-end">
            <Text className="text-white/60 text-[10px]">Avaliação</Text>
            <Text className="text-amber text-base font-bold">★ 4.9</Text>
          </View>
        </View>

        {/* Toggle online */}
        <View className="flex-row items-center bg-white/10 rounded-xl px-3 py-3 mt-3 gap-3">
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ false: '#555', true: '#1D9E75' }}
            thumbColor="#fff"
          />
          <View className="flex-1">
            <Text className="text-white text-xs font-bold">
              {isOnline ? 'Disponível para pedidos' : 'Indisponível'}
            </Text>
            <Text className="text-white/60 text-[10px] mt-0.5">
              {isOnline ? 'Você está recebendo novos pedidos' : 'Ative para receber pedidos'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 gap-4">

          {/* Card de ganhos */}
          <View className="bg-white border border-border rounded-xl p-4 flex-row justify-between">
            <View className="items-center">
              <Text className="text-dark text-lg font-bold">R${earnings.week.toFixed(0)}</Text>
              <Text className="text-muted text-[10px] mt-0.5">Esta semana</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="items-center">
              <Text className="text-dark text-lg font-bold">{earnings.total_services}</Text>
              <Text className="text-muted text-[10px] mt-0.5">Serviços</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="items-center">
              <Text className="text-dark text-lg font-bold">R${earnings.month.toFixed(0)}</Text>
              <Text className="text-muted text-[10px] mt-0.5">Este mês</Text>
            </View>
          </View>

          {/* Novos pedidos */}
          <View className="pb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-bold text-dark uppercase tracking-wider">
                Novos pedidos
              </Text>
              {requests.length > 0 && (
                <View className="bg-danger rounded px-1.5 py-0.5">
                  <Text className="text-white text-[9px] font-bold">{requests.length} novo{requests.length > 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>

            {loading ? (
              <ActivityIndicator color="#1D9E75" className="py-8" />
            ) : requests.length === 0 ? (
              <View className="bg-white border border-border rounded-xl p-6 items-center">
                <Text className="text-muted text-sm text-center">
                  {isOnline
                    ? 'Nenhum pedido no momento.\nFique atento às notificações!'
                    : 'Ative o toggle acima para receber pedidos.'}
                </Text>
              </View>
            ) : (
              requests.map(r => (
                <RequestCard
                  key={r.id}
                  request={r}
                  onAccept={() => router.push({ pathname: '/(companion)/request/[id]', params: { id: r.id } })}
                  onDecline={() => {/* handle decline */}}
                />
              ))
            )}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
