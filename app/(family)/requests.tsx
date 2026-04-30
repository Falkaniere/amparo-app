import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { requestsService } from '@/services/requests';
import { colors, radius } from '@/constants/theme';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Aguardando', color: colors.amber, bg: '#FEF7E7' },
  accepted: { label: 'Confirmado', color: colors.primary, bg: colors.light },
  in_progress: { label: 'Em andamento', color: colors.dark, bg: '#E8F5E9' },
  completed: { label: 'Concluído', color: colors.muted, bg: colors.surface },
  cancelled: { label: 'Cancelado', color: colors.danger, bg: '#FDEAEA' },
};

const SERVICE_LABELS: Record<string, string> = {
  medical: '🏥 Consulta médica',
  walk: '🌳 Passeio',
  errand: '🛒 Recados',
  other: '➕ Outro serviço',
};

const TABS = ['Ativos', 'Histórico'];

export default function FamilyRequestsScreen() {
  const { token } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await requestsService.getFamilyRequests(token!);
      setRequests(data.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const active = requests.filter((r) =>
    ['pending', 'accepted', 'in_progress'].includes(r.status),
  );
  const history = requests.filter((r) =>
    ['completed', 'cancelled'].includes(r.status),
  );
  const displayed = tab === 0 ? active : history;

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }) + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus pedidos</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t, i) => (
          <Pressable
            key={t}
            onPress={() => setTab(i)}
            style={[styles.tabBtn, tab === i && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>
              {t}
              {i === 0 && active.length > 0 && (
                <Text style={styles.tabBadge}> {active.length}</Text>
              )}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.body}>
            {displayed.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {tab === 0 ? 'Nenhum pedido ativo' : 'Nenhum histórico'}
                </Text>
                <Text style={styles.emptyText}>
                  {tab === 0
                    ? 'Crie uma solicitação na tela inicial.'
                    : 'Seus pedidos concluídos aparecerão aqui.'}
                </Text>
              </View>
            ) : (
              displayed.map((r) => {
                const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                return (
                  <Pressable
                    key={r.id}
                    style={styles.card}
                    onPress={() =>
                      router.push({
                        pathname: '/(family)/tracking/[id]',
                        params: { id: r.id },
                      })
                    }
                  >
                    <View style={styles.cardTop}>
                      <Text style={styles.cardType}>
                        {SERVICE_LABELS[r.type] || 'Serviço'}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                        <Text style={[styles.statusText, { color: s.color }]}>
                          {s.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.icon}>📅</Text>
                      <Text style={styles.detailText}>
                        {formatDate(r.scheduled_at)} · {r.duration_hours}h
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.icon}>📍</Text>
                      <Text style={styles.detailText} numberOfLines={1}>
                        {r.origin_address}
                      </Text>
                    </View>

                    {r.status === 'in_progress' && (
                      <Pressable
                        style={styles.trackBtn}
                        onPress={() =>
                          router.push({
                            pathname: '/(family)/tracking/[id]',
                            params: { id: r.id },
                          })
                        }
                      >
                        <Text style={styles.trackBtnText}>Ver localização →</Text>
                      </Pressable>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.dark },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.primary },
  tabBadge: { color: colors.primary },
  loader: { flex: 1, marginTop: 48 },
  body: { padding: 16, gap: 10 },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 32,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: colors.dark },
  emptyText: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  card: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardType: { fontSize: 13, fontWeight: '700', color: colors.dark },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 11 },
  detailText: { fontSize: 12, color: colors.muted, flex: 1 },
  trackBtn: {
    marginTop: 4,
    alignSelf: 'flex-end',
    backgroundColor: colors.light,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trackBtnText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
});
