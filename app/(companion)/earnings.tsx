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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { requestsService } from '@/services/requests';
import { colors, radius } from '@/constants/theme';

const SERVICE_LABELS: Record<string, string> = {
  medical: '🏥 Consulta médica',
  walk: '🌳 Passeio',
  errand: '🛒 Recados',
  other: '➕ Outro serviço',
};

const PERIODS = ['Esta semana', 'Este mês', 'Total'];

export default function EarningsScreen() {
  const { token } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await requestsService.getCompanionRequests(token!);
      const completed = (data.requests || []).filter(
        (r: any) => r.status === 'completed',
      );
      setRequests(completed);
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

  function isThisWeek(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }

  function isThisMonth(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  const displayed =
    period === 0
      ? requests.filter((r) => isThisWeek(r.completed_at || r.scheduled_at))
      : period === 1
      ? requests.filter((r) => isThisMonth(r.completed_at || r.scheduled_at))
      : requests;

  const totalAmount = displayed.reduce(
    (sum, r) => sum + (r.companion_amount || 0),
    0,
  );

  const weekAmount = requests
    .filter((r) => isThisWeek(r.completed_at || r.scheduled_at))
    .reduce((sum, r) => sum + (r.companion_amount || 0), 0);

  const monthAmount = requests
    .filter((r) => isThisMonth(r.completed_at || r.scheduled_at))
    .reduce((sum, r) => sum + (r.companion_amount || 0), 0);

  const allTimeAmount = requests.reduce(
    (sum, r) => sum + (r.companion_amount || 0),
    0,
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ganhos</Text>
      </View>

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
        {/* Cards de resumo */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>R$ {weekAmount.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Esta semana</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardMain]}>
            <Text style={[styles.summaryValue, styles.summaryValueMain]}>
              R$ {monthAmount.toFixed(2)}
            </Text>
            <Text style={[styles.summaryLabel, styles.summaryLabelMain]}>Este mês</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{requests.length}</Text>
            <Text style={styles.summaryLabel}>Serviços</Text>
          </View>
        </View>

        {/* Total geral */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total acumulado</Text>
          <Text style={styles.totalValue}>R$ {allTimeAmount.toFixed(2)}</Text>
        </View>

        {/* Filtro de período */}
        <View style={styles.periodRow}>
          {PERIODS.map((p, i) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(i)}
              style={[styles.periodBtn, period === i && styles.periodBtnActive]}
            >
              <Text
                style={[styles.periodText, period === i && styles.periodTextActive]}
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.body}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : displayed.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhum serviço concluído</Text>
              <Text style={styles.emptyText}>
                Seus ganhos aparecerão aqui após concluir os serviços.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.periodTotal}>
                <Text style={styles.periodTotalLabel}>
                  {PERIODS[period]}
                </Text>
                <Text style={styles.periodTotalValue}>
                  R$ {totalAmount.toFixed(2)}
                </Text>
              </View>
              {displayed.map((r) => (
                <View key={r.id} style={styles.itemCard}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemType}>
                      {SERVICE_LABELS[r.type] || 'Serviço'}
                    </Text>
                    <Text style={styles.itemDate}>
                      {new Date(r.scheduled_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })} · {r.duration_hours}h
                    </Text>
                  </View>
                  <Text style={styles.itemAmount}>
                    + R$ {r.companion_amount?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
  },
  summaryCardMain: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  summaryValue: { fontSize: 16, fontWeight: '700', color: colors.dark },
  summaryValueMain: { color: '#fff', fontSize: 14 },
  summaryLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },
  summaryLabelMain: { color: 'rgba(255,255,255,0.6)' },
  totalCard: {
    marginHorizontal: 16,
    backgroundColor: colors.light,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, color: colors.dark, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '700', color: colors.primary },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  periodTextActive: { color: '#fff' },
  body: { padding: 16, gap: 8 },
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
  periodTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  periodTotalLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  periodTotalValue: { fontSize: 16, fontWeight: '700', color: colors.dark },
  itemCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: { gap: 2 },
  itemType: { fontSize: 13, fontWeight: '700', color: colors.dark },
  itemDate: { fontSize: 11, color: colors.muted },
  itemAmount: { fontSize: 16, fontWeight: '700', color: colors.primary },
});
