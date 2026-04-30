import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { requestsService } from '@/services/requests';
import { colors, radius } from '@/constants/theme';

const SERVICE_TYPES = [
  { key: 'medical', emoji: '🏥', label: 'Consulta médica' },
  { key: 'walk', emoji: '🌳', label: 'Passeio' },
  { key: 'errand', emoji: '🛒', label: 'Recados' },
  { key: 'other', emoji: '➕', label: 'Outro' },
];

const DURATIONS = [1, 2, 3, 4, 6, 8];

export default function NewRequestScreen() {
  const { token } = useAuthStore();
  const params = useLocalSearchParams<{ companion_id?: string; type?: string }>();

  const [type, setType] = useState(params.type || 'medical');
  const [duration, setDuration] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!date || !time || !address) {
      Alert.alert('Atenção', 'Preencha data, hora e endereço de saída.');
      return;
    }

    const [d, m, y] = date.split('/');
    const scheduledAt = `${y}-${m}-${d}T${time}:00`;

    try {
      setLoading(true);
      await requestsService.create(token!, {
        companion_id: params.companion_id || '',
        type,
        scheduled_at: scheduledAt,
        duration_hours: duration,
        origin_address: address,
        destination_address: destination || undefined,
        notes: notes || undefined,
      });
      Alert.alert('Solicitação enviada!', 'Aguarde a confirmação do acompanhante.', [
        { text: 'OK', onPress: () => router.replace('/(family)/requests') },
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nova solicitação</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.body}>
          {/* Tipo de serviço */}
          <View style={styles.section}>
            <Text style={styles.label}>TIPO DE SERVIÇO</Text>
            <View style={styles.typeGrid}>
              {SERVICE_TYPES.map((s) => (
                <Pressable
                  key={s.key}
                  onPress={() => setType(s.key)}
                  style={[styles.typeBtn, type === s.key && styles.typeBtnActive]}
                >
                  <Text style={styles.typeEmoji}>{s.emoji}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      type === s.key && styles.typeLabelActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Data e hora */}
          <View style={styles.section}>
            <Text style={styles.label}>DATA E HORA</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={date}
                onChangeText={setDate}
              />
              <TextInput
                style={[styles.input, { width: 90 }]}
                placeholder="HH:MM"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {/* Duração */}
          <View style={styles.section}>
            <Text style={styles.label}>DURAÇÃO</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => setDuration(h)}
                  style={[
                    styles.durationBtn,
                    duration === h && styles.durationBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.durationText,
                      duration === h && styles.durationTextActive,
                    ]}
                  >
                    {h}h
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Endereço */}
          <View style={styles.section}>
            <Text style={styles.label}>ENDEREÇO DE SAÍDA</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua, número, bairro"
              placeholderTextColor={colors.muted}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>DESTINO (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Hospital das Clínicas"
              placeholderTextColor={colors.muted}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          {/* Observações */}
          <View style={styles.section}>
            <Text style={styles.label}>OBSERVAÇÕES (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Idoso usa cadeira de rodas..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Resumo de valor */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duração</Text>
              <Text style={styles.summaryValue}>{duration}h</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Serviço</Text>
              <Text style={styles.summaryValue}>
                {SERVICE_TYPES.find((s) => s.key === type)?.label}
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Confirmar solicitação</Text>
            )}
          </Pressable>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scroll: { flex: 1 },
  body: { padding: 16, gap: 20 },
  section: { gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.8,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    width: '47%',
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.light },
  typeEmoji: { fontSize: 22 },
  typeLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  typeLabelActive: { color: colors.dark },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  durationRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  durationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  durationBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  durationText: { fontSize: 13, fontWeight: '600', color: colors.muted },
  durationTextActive: { color: '#fff' },
  summaryCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: colors.muted },
  summaryValue: { fontSize: 13, fontWeight: '700', color: colors.dark },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
