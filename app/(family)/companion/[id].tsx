import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { companionsService } from '@/services/companions';
import { colors, radius } from '@/constants/theme';

const AVATAR_COLORS = ['#E1F5EE', '#EEEDFE', '#FAEEDA', '#FCEBEB'];
const TEXT_COLORS = ['#085041', '#3C3489', '#633806', '#712B13'];

const SERVICE_LABELS: Record<string, string> = {
  medical: '🏥 Consulta médica',
  walk: '🌳 Passeio',
  errand: '🛒 Recados',
  other: '➕ Outros',
};

export default function CompanionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuthStore();
  const [data, setData] = useState<{ companion: any; reviews: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    try {
      const res = await companionsService.getById(id!, token!);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const companion = data?.companion;
  const reviews = data?.reviews || [];
  const idx = id ? id.charCodeAt(0) % AVATAR_COLORS.length : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : !companion ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Acompanhante não encontrado.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[idx] }]}>
              <Text style={[styles.avatarText, { color: TEXT_COLORS[idx] }]}>
                {id!.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>{companion.name || 'Acompanhante'}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.rating}>
                {companion.avg_rating?.toFixed(1) || '—'}
              </Text>
              <Text style={styles.ratingCount}>
                ({companion.total_services || 0} serviços)
              </Text>
            </View>
            <Text style={styles.distance}>
              📍 {companion.distance_km || '?'} km de você
            </Text>
          </View>

          <View style={styles.body}>
            {/* Preço */}
            <View style={styles.priceCard}>
              <Text style={styles.priceValue}>
                R$ {companion.hourly_rate || '—'}
              </Text>
              <Text style={styles.priceLabel}>/hora</Text>
            </View>

            {/* Sobre */}
            {companion.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sobre</Text>
                <Text style={styles.bio}>{companion.bio}</Text>
              </View>
            )}

            {/* Serviços */}
            {companion.services?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Serviços oferecidos</Text>
                <View style={styles.tags}>
                  {companion.services.map((s: string) => (
                    <View key={s} style={styles.tag}>
                      <Text style={styles.tagText}>
                        {SERVICE_LABELS[s] || s}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Avaliações */}
            {reviews.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Avaliações ({reviews.length})
                </Text>
                {reviews.slice(0, 3).map((r, i) => (
                  <View key={i} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewRating}>
                        {'★'.repeat(r.rating)}
                        {'☆'.repeat(5 - r.rating)}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(r.created_at).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    {r.comment && (
                      <Text style={styles.reviewComment}>{r.comment}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      )}

      {/* CTA fixo */}
      {!loading && companion && (
        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerPriceValue}>
              R$ {companion.hourly_rate || '—'}/h
            </Text>
            <Text style={styles.footerPriceLabel}>Total estimado</Text>
          </View>
          <Pressable
            style={styles.ctaBtn}
            onPress={() =>
              router.push({
                pathname: '/(family)/new-request',
                params: { companion_id: id },
              })
            }
          >
            <Text style={styles.ctaText}>Solicitar</Text>
          </Pressable>
        </View>
      )}
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
  loader: { flex: 1 },
  emptyCard: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.muted, fontSize: 14 },
  hero: {
    backgroundColor: colors.card,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 24, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: colors.dark },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  star: { color: colors.amber, fontSize: 16 },
  rating: { color: colors.dark, fontSize: 14, fontWeight: '700' },
  ratingCount: { color: colors.muted, fontSize: 12 },
  distance: { color: colors.muted, fontSize: 12, marginTop: 4 },
  body: { padding: 16, gap: 16 },
  priceCard: {
    backgroundColor: colors.light,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: { fontSize: 28, fontWeight: '700', color: colors.dark },
  priceLabel: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bio: { fontSize: 13, color: colors.text, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, color: colors.text },
  reviewCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewRating: { color: colors.amber, fontSize: 12 },
  reviewDate: { color: colors.muted, fontSize: 11 },
  reviewComment: { fontSize: 12, color: colors.text, lineHeight: 18 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  footerPrice: {},
  footerPriceValue: { fontSize: 16, fontWeight: '700', color: colors.dark },
  footerPriceLabel: { fontSize: 10, color: colors.muted },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  ctaText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
