import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/theme';

const SERVICE_LABELS: Record<string, string> = {
  medical: 'Consulta médica',
  errand: 'Farmácia / Banco',
  walk: 'Passeio',
  other: 'Outro serviço',
};

interface Props {
  request: {
    id: string;
    type: string;
    scheduled_at: string;
    duration_hours: number;
    origin_address: string;
    destination_address?: string;
    companion_amount: number;
  };
  onAccept: () => void;
  onDecline: () => void;
}

export function RequestCard({ request, onAccept, onDecline }: Props) {
  const date = new Date(request.scheduled_at);
  const dateStr = date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  const timeStr = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.tipo}>
          {SERVICE_LABELS[request.type] || 'Serviço'}
        </Text>
        <View style={styles.distBadge}>
          <Text style={styles.distText}>Perto de você</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.detailText}>
            {dateStr} · {timeStr} · {request.duration_hours}h
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {request.origin_address}
          </Text>
        </View>
        {request.destination_address && (
          <View style={styles.detailRow}>
            <Text style={styles.icon}>🏁</Text>
            <Text style={styles.detailText} numberOfLines={1}>
              {request.destination_address}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.amount}>
            R${request.companion_amount.toFixed(2)}
          </Text>
          <Text style={styles.amountLabel}>você recebe</Text>
        </View>
        <View style={styles.btnRow}>
          <Pressable style={styles.declineBtn} onPress={onDecline}>
            <Text style={styles.declineBtnText}>Recusar</Text>
          </Pressable>
          <Pressable style={styles.acceptBtn} onPress={onAccept}>
            <Text style={styles.acceptBtnText}>Aceitar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipo: { fontSize: 13, fontWeight: '700', color: colors.dark },
  distBadge: {
    backgroundColor: colors.light,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  distText: { color: colors.dark, fontSize: 10, fontWeight: '700' },
  details: { gap: 4, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 11 },
  detailText: { fontSize: 12, color: colors.muted, flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: { fontSize: 20, fontWeight: '700', color: colors.primary },
  amountLabel: { fontSize: 10, color: colors.muted },
  btnRow: { flexDirection: 'row', gap: 8 },
  declineBtn: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  declineBtnText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  acceptBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  acceptBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
