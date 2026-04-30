import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { requestsService } from '@/services/requests';
import { colors, radius } from '@/constants/theme';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Aguardando confirmação', color: colors.amber, bg: '#FEF7E7' },
  accepted: { label: 'Confirmado — aguardando início', color: colors.primary, bg: colors.light },
  in_progress: { label: 'Em andamento', color: colors.dark, bg: '#E8F5E9' },
  completed: { label: 'Serviço concluído', color: colors.muted, bg: colors.surface },
  cancelled: { label: 'Cancelado', color: colors.danger, bg: '#FDEAEA' },
};

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuthStore();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) {
      load();
      // Poll a cada 15s enquanto em andamento
      intervalRef.current = setInterval(load, 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  async function load() {
    try {
      const data = await requestsService.getById(id!, token!);
      setRequest(data.request);
      if (['completed', 'cancelled'].includes(data.request?.status)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    Alert.alert('Cancelar pedido', 'Tem certeza? Esta ação não pode ser desfeita.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar pedido',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestsService.updateStatus(id!, token!, 'cancelled', 'Cancelado pela família');
            router.back();
          } catch (e: any) {
            Alert.alert('Erro', e.message || 'Não foi possível cancelar.');
          }
        },
      },
    ]);
  }

  const s = request ? STATUS_CONFIG[request.status] : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Acompanhar pedido</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : !request ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Pedido não encontrado.</Text>
        </View>
      ) : (
        <View style={styles.body}>
          {/* Status */}
          {s && (
            <View style={[styles.statusCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          )}

          {/* Mapa placeholder */}
          {request.status === 'in_progress' ? (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapText}>Localização em tempo real</Text>
              {request.last_lat && request.last_lng && (
                <Text style={styles.mapCoords}>
                  {request.last_lat.toFixed(4)}, {request.last_lng.toFixed(4)}
                </Text>
              )}
              <Text style={styles.mapSub}>Integre React Native Maps para exibir o mapa</Text>
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapIcon}>📍</Text>
              <Text style={styles.mapText}>
                {request.status === 'completed'
                  ? 'Serviço finalizado'
                  : 'Aguardando início do serviço'}
              </Text>
            </View>
          )}

          {/* Detalhes */}
          <View style={styles.detailCard}>
            <DetailRow icon="🏷️" label="Serviço" value={request.type} />
            <DetailRow
              icon="📅"
              label="Data/hora"
              value={new Date(request.scheduled_at).toLocaleString('pt-BR')}
            />
            <DetailRow icon="⏱️" label="Duração" value={`${request.duration_hours}h`} />
            <DetailRow icon="📍" label="Saída" value={request.origin_address} />
            {request.destination_address && (
              <DetailRow icon="🏁" label="Destino" value={request.destination_address} />
            )}
            {request.notes && (
              <DetailRow icon="📝" label="Observações" value={request.notes} />
            )}
          </View>

          {/* Ações */}
          {['pending', 'accepted'].includes(request.status) && (
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancelar pedido</Text>
            </Pressable>
          )}

          {request.status === 'completed' && (
            <Pressable
              style={styles.rateBtn}
              onPress={() =>
                router.push({
                  pathname: '/(family)/rate/[id]',
                  params: { id: request.id },
                })
              }
            >
              <Text style={styles.rateBtnText}>★ Avaliar acompanhante</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

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
  body: { flex: 1, padding: 16, gap: 12 },
  statusCard: {
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusLabel: { fontSize: 14, fontWeight: '700' },
  mapPlaceholder: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapIcon: { fontSize: 40 },
  mapText: { fontSize: 14, fontWeight: '700', color: colors.dark },
  mapCoords: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  mapSub: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingHorizontal: 24 },
  detailCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    gap: 10,
  },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailIcon: { fontSize: 14, marginTop: 1 },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 10, color: colors.muted, fontWeight: '600', textTransform: 'uppercase' },
  detailValue: { fontSize: 13, color: colors.text, marginTop: 1 },
  cancelBtn: {
    borderWidth: 0.5,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  rateBtn: {
    backgroundColor: colors.amber,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rateBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
