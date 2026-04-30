import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function CompanionRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuthStore();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    try {
      const data = await requestsService.getById(id!, token!);
      setRequest(data.request);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(status: string, confirmMsg?: string) {
    if (confirmMsg) {
      Alert.alert('Confirmação', confirmMsg, [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => updateStatus(status) },
      ]);
    } else {
      updateStatus(status);
    }
  }

  async function updateStatus(status: string) {
    try {
      setActing(true);
      await requestsService.updateStatus(id!, token!, status);
      await load();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível atualizar o pedido.');
    } finally {
      setActing(false);
    }
  }

  const r = request;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Detalhes do pedido</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : !r ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Pedido não encontrado.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.body}>
            {/* Tipo e valor */}
            <View style={styles.heroCard}>
              <Text style={styles.heroType}>
                {SERVICE_LABELS[r.type] || 'Serviço'}
              </Text>
              <Text style={styles.heroAmount}>
                R$ {r.companion_amount?.toFixed(2) || '—'}
              </Text>
              <Text style={styles.heroAmountLabel}>você recebe</Text>
            </View>

            {/* Detalhes */}
            <View style={styles.detailCard}>
              <DetailRow icon="📅" label="Data e hora" value={new Date(r.scheduled_at).toLocaleString('pt-BR')} />
              <DetailRow icon="⏱️" label="Duração" value={`${r.duration_hours}h`} />
              <DetailRow icon="📍" label="Saída" value={r.origin_address} />
              {r.destination_address && (
                <DetailRow icon="🏁" label="Destino" value={r.destination_address} />
              )}
              {r.notes && (
                <DetailRow icon="📝" label="Observações" value={r.notes} />
              )}
            </View>

            {/* Status atual */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionLabel}>STATUS ATUAL</Text>
              <Text style={styles.statusValue}>{r.status?.toUpperCase()}</Text>
            </View>

            {/* Ações por status */}
            <View style={styles.actions}>
              {r.status === 'pending' && (
                <>
                  <Pressable
                    style={[styles.btn, styles.btnPrimary, acting && styles.btnDisabled]}
                    onPress={() => handleStatus('accepted')}
                    disabled={acting}
                  >
                    {acting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.btnPrimaryText}>✓ Aceitar pedido</Text>
                    )}
                  </Pressable>
                  <Pressable
                    style={[styles.btn, styles.btnOutline, acting && styles.btnDisabled]}
                    onPress={() =>
                      handleStatus('cancelled', 'Tem certeza que deseja recusar este pedido?')
                    }
                    disabled={acting}
                  >
                    <Text style={styles.btnOutlineText}>✕ Recusar</Text>
                  </Pressable>
                </>
              )}

              {r.status === 'accepted' && (
                <Pressable
                  style={[styles.btn, styles.btnPrimary, acting && styles.btnDisabled]}
                  onPress={() =>
                    handleStatus('in_progress', 'Confirmar check-in? Isso indica que você iniciou o serviço.')
                  }
                  disabled={acting}
                >
                  {acting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>📍 Fazer check-in</Text>
                  )}
                </Pressable>
              )}

              {r.status === 'in_progress' && (
                <Pressable
                  style={[styles.btn, styles.btnSuccess, acting && styles.btnDisabled]}
                  onPress={() =>
                    handleStatus('completed', 'Confirmar que o serviço foi concluído?')
                  }
                  disabled={acting}
                >
                  {acting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>✓ Finalizar serviço</Text>
                  )}
                </Pressable>
              )}

              {['completed', 'cancelled'].includes(r.status) && (
                <View style={styles.doneCard}>
                  <Text style={styles.doneText}>
                    {r.status === 'completed'
                      ? '✓ Serviço concluído com sucesso!'
                      : '✕ Pedido cancelado.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.icon}>{icon}</Text>
      <View style={detailStyles.content}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  icon: { fontSize: 14, marginTop: 1 },
  content: { flex: 1 },
  label: { fontSize: 10, color: colors.muted, fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: 13, color: colors.text, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 32 },
  backText: { color: colors.dark, fontSize: 28 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: colors.dark },
  loader: { flex: 1, marginTop: 48 },
  emptyCard: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.muted, fontSize: 14 },
  body: { padding: 16, gap: 12 },
  heroCard: {
    backgroundColor: colors.dark,
    borderRadius: radius.md,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  heroType: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  heroAmount: { color: '#fff', fontSize: 32, fontWeight: '700' },
  heroAmountLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  detailCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    gap: 12,
  },
  statusSection: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.8,
  },
  statusValue: { fontSize: 12, fontWeight: '700', color: colors.primary },
  actions: { gap: 8 },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnSuccess: { backgroundColor: colors.dark },
  btnOutline: {
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btnOutlineText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  doneCard: {
    backgroundColor: colors.light,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
  },
  doneText: { color: colors.dark, fontSize: 13, fontWeight: '600' },
});
