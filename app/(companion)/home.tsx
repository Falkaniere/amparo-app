import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { profileService } from '@/services/profile';
import { requestsService } from '@/services/requests';
import { RequestCard } from '@/components/cards/RequestCard';
import { colors, radius } from '@/constants/theme';

export default function CompanionHomeScreen() {
  const { user, token } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [earnings] = useState({ week: 0, month: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const reqs = await requestsService.getCompanionRequests(token!);
      const pending = (reqs.requests || []).filter(
        (r: any) => r.status === 'pending',
      );
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
      setIsOnline(!val);
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'você';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header verde escuro */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bom dia,</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingLabel}>Avaliação</Text>
            <Text style={styles.ratingValue}>★ 4.9</Text>
          </View>
        </View>
        <View style={styles.toggleRow}>
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ false: '#555', true: colors.primary }}
            thumbColor="#fff"
          />
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>
              {isOnline ? 'Disponível para pedidos' : 'Indisponível'}
            </Text>
            <Text style={styles.toggleSub}>
              {isOnline
                ? 'Você está recebendo novos pedidos'
                : 'Ative para receber pedidos'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* Ganhos */}
          <View style={styles.earningsCard}>
            <View style={styles.earnItem}>
              <Text style={styles.earnValue}>R${earnings.week}</Text>
              <Text style={styles.earnLabel}>Esta semana</Text>
            </View>
            <View style={styles.earnDivider} />
            <View style={styles.earnItem}>
              <Text style={styles.earnValue}>{earnings.total}</Text>
              <Text style={styles.earnLabel}>Serviços</Text>
            </View>
            <View style={styles.earnDivider} />
            <View style={styles.earnItem}>
              <Text style={styles.earnValue}>R${earnings.month}</Text>
              <Text style={styles.earnLabel}>Este mês</Text>
            </View>
          </View>

          {/* Pedidos */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Novos pedidos</Text>
            {requests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {requests.length} novo{requests.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : requests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {isOnline
                  ? 'Nenhum pedido no momento.\nFique atento às notificações!'
                  : 'Ative o toggle acima para receber pedidos.'}
              </Text>
            </View>
          ) : (
            requests.map((r) => (
              <RequestCard
                key={r.id}
                request={r}
                onAccept={() =>
                  router.push({
                    pathname: '/(companion)/request/[id]',
                    params: { id: r.id },
                  })
                }
                onDecline={() => {}}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.dark,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 2 },
  ratingBox: { alignItems: 'flex-end' },
  ratingLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  ratingValue: { color: colors.amber, fontSize: 16, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 12,
    gap: 12,
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { color: '#fff', fontSize: 12, fontWeight: '700' },
  toggleSub: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 8 },
  earningsCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earnItem: { alignItems: 'center' },
  earnValue: { color: colors.dark, fontSize: 18, fontWeight: '700' },
  earnLabel: { color: colors.muted, fontSize: 10, marginTop: 2 },
  earnDivider: { width: 0.5, height: 32, backgroundColor: colors.border },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  loader: { paddingVertical: 32 },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
