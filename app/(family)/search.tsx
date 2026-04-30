import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { companionsService } from '@/services/companions';
import { CompanionCard } from '@/components/cards/CompanionCard';
import { colors, radius } from '@/constants/theme';

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'medical', label: 'Médico' },
  { key: 'walk', label: 'Passeio' },
  { key: 'errand', label: 'Recados' },
];

export default function FamilySearchScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [companions, setCompanions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
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

  const filtered = companions.filter((c) => {
    const matchesQuery =
      query.length === 0 ||
      c.id.toLowerCase().includes(query.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar acompanhante..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhum resultado</Text>
              <Text style={styles.emptyText}>
                Tente outros termos ou remova os filtros.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultCount}>
                {filtered.length} acompanhante{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              </Text>
              {filtered.map((c) => (
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
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  backBtn: { paddingRight: 4 },
  backText: { color: colors.dark, fontSize: 28 },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  filterScroll: { marginTop: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  filterTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  body: { padding: 16, gap: 4 },
  resultCount: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  loader: { paddingVertical: 32 },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: { color: colors.dark, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: colors.muted, fontSize: 12, textAlign: 'center' },
});
