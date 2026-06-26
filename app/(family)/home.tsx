import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { companionsService } from '@/services/companions';
import { CompanionCard } from '@/components/cards/CompanionCard';
import { colors, radius, spacing } from '@/constants/theme';

const SERVICE_TYPES = [
  {
    key: 'medical',
    emoji: '🏥',
    label: 'Consulta médica',
    sub: 'Hospital · UPA',
  },
  { key: 'walk', emoji: '🌳', label: 'Passeio', sub: 'Parque · Compras' },
  { key: 'errand', emoji: '🛒', label: 'Recados', sub: 'Compras · Banco' },
  { key: 'other', emoji: '➕', label: 'Outro serviço', sub: 'Personalizar' },
];

export default function FamilyHomeScreen() {
  const { user } = useAuthStore();
  const [companions, setCompanions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanions();
  }, []);

  async function loadCompanions() {
    try {
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
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{firstName} 👋</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Buscar acompanhante..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.searchInput}
            onFocus={() => router.push('/(family)/search')}
          />
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* Ações rápidas */}
          <Text style={styles.sectionLabel}>Ações rápidas</Text>
          <View style={styles.qaGrid}>
            {SERVICE_TYPES.map((s) => (
              <Pressable
                key={s.key}
                style={styles.qaCard}
                onPress={() =>
                  router.push({
                    pathname: '/(family)/new-request',
                    params: { type: s.key },
                  })
                }
              >
                <Text style={styles.qaEmoji}>{s.emoji}</Text>
                <Text style={styles.qaLabel}>{s.label}</Text>
                <Text style={styles.qaSub}>{s.sub}</Text>
              </Pressable>
            ))}
          </View>

          {/* Disponíveis agora */}
          <Text style={styles.sectionLabel}>Disponíveis agora</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : companions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Nenhum acompanhante disponível no momento.
              </Text>
            </View>
          ) : (
            companions.map((c) => (
              <CompanionCard
                key={c.id}
                companion={c}
                onPress={() =>
                  router.push({
                    pathname: '/(family)/companion/[id]',
                    params: { id: c.id },
                  })
                }
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
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  name: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    gap: 8,
  },
  searchIcon: { fontSize: 12 },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },
  scroll: { flex: 1 },
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qaCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
  },
  qaEmoji: { fontSize: 22 },
  qaLabel: {
    color: colors.dark,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  qaSub: { color: colors.muted, fontSize: 10, marginTop: 2 },
  loader: { paddingVertical: 32 },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
