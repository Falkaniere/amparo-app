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
  pending: { label: 'Aguardando resposta', color: colors.amber, bg: '#FEF7E7' },
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

const TABS = ['Novos', 'Em andamento', 'Histórico'];

export default function CompanionRequestsScreen() {
  const { token } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await requestsService.getCompanionRequests(token!);
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

  const tabs = [
    requests.filter((r) => r.status === 'pending'),
    requests.filter((r) => ['accepted', 'in_progress'].includes(r.status)),
    requests.filter((r) => ['completed', 'cancelled'].includes(r.status)),
  ];
  const displayed = tabs[tab];

  function formatDate(iso: string) {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) +
      ' · ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContent}
      >
        {TABS.map((t, i) => (
          <Pressable
            key={t}
            onPress={() => setTab(i)}
            style={[styles.tabBtn, tab === i && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>
              {t}
              {tabs[i].length > 0 ? ` (${tabs[i].length})` : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

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
                <Text style={styles.emptyTitle}>Nenhum pedido aqui</Text>
                <Text style={styles.emptyText}>
                  {tab === 0
                    ? 'Fique online para receber novos pedidos.'
                    : 'Os pedidos aparecerão conforme o andamento.'}
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
                        pathname: '/(companion)/request/[id]',
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

                    <View style={styles.cardFooter}>
                      <Text style={styles.amount}>
                        R$ {r.companion_amount?.toFixed(2) || '—'}
                      </Text>
                      {r.status === 'pending' && (
                        <Text style={styles.tapHint}>Toque para responder →</Text>
                      )}
                    </View>
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
  tabScroll: { backgroundColor: colors.card, maxHeight: 44 },
  tabContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.primary },
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
  statusBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 11 },
  detailText: { fontSize: 12, color: colors.muted, flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  amount: { fontSize: 16, fontWeight: '700', color: colors.primary },
  tapHint: { fontSize: 11, color: colors.muted },
});
