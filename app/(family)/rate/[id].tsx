import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { reviewsService } from '@/services/reviews';
import { colors, radius } from '@/constants/theme';

const TAGS = [
  'Pontual',
  'Atencioso',
  'Comunicativo',
  'Experiente',
  'Paciente',
  'Organizado',
  'Confiável',
  'Empático',
];

export default function RateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuthStore();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

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

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Atenção', 'Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    try {
      setSubmitting(true);
      await reviewsService.create(token!, {
        request_id: id!,
        companion_id: request?.companion_id,
        rating,
        comment: comment.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      Alert.alert(
        'Avaliação enviada!',
        'Obrigado pelo seu feedback. Isso ajuda a melhorar o serviço.',
        [{ text: 'OK', onPress: () => router.replace('/(family)/requests') }],
      );
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível enviar a avaliação.');
    } finally {
      setSubmitting(false);
    }
  }

  const activeStars = hovered || rating;

  const ratingLabels: Record<number, string> = {
    1: 'Péssimo',
    2: 'Ruim',
    3: 'Regular',
    4: 'Bom',
    5: 'Excelente',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Avaliar serviço</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.body}>
            {/* Companion info */}
            <View style={styles.companionCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {request?.companion_id?.slice(0, 2).toUpperCase() || 'AC'}
                </Text>
              </View>
              <View>
                <Text style={styles.companionName}>
                  {request?.companion_name || 'Acompanhante'}
                </Text>
                <Text style={styles.companionSub}>
                  Serviço concluído em{' '}
                  {request?.scheduled_at
                    ? new Date(request.scheduled_at).toLocaleDateString('pt-BR')
                    : '—'}
                </Text>
              </View>
            </View>

            {/* Estrelas */}
            <View style={styles.starsSection}>
              <Text style={styles.sectionTitle}>Qual foi sua experiência?</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    onPressIn={() => setHovered(star)}
                    onPressOut={() => setHovered(0)}
                    style={styles.starBtn}
                  >
                    <Text
                      style={[
                        styles.star,
                        star <= activeStars && styles.starActive,
                      ]}
                    >
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>
              {activeStars > 0 && (
                <Text style={styles.ratingLabel}>
                  {ratingLabels[activeStars]}
                </Text>
              )}
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                O que se destacou? (opcional)
              </Text>
              <View style={styles.tagsGrid}>
                {TAGS.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[
                      styles.tag,
                      selectedTags.includes(tag) && styles.tagActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag) && styles.tagTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Comentário */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Comentário (opcional)
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Descreva sua experiência com o acompanhante..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
            </View>

            {/* Submit */}
            <Pressable
              style={[
                styles.submitBtn,
                (submitting || rating === 0) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || rating === 0}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Enviar avaliação</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.skipBtn}
              onPress={() => router.replace('/(family)/requests')}
            >
              <Text style={styles.skipText}>Pular por agora</Text>
            </Pressable>

            <View style={{ height: 32 }} />
          </View>
        </ScrollView>
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
  loader: { flex: 1, marginTop: 48 },
  body: { padding: 16, gap: 20 },
  companionCard: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  companionName: { fontSize: 15, fontWeight: '700', color: colors.dark },
  companionSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  starsSection: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  starsRow: { flexDirection: 'row', gap: 8 },
  starBtn: { padding: 4 },
  star: { fontSize: 40, color: colors.border },
  starActive: { color: colors.amber },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 4,
  },
  section: { gap: 10 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  tagTextActive: { color: '#fff' },
  textArea: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: colors.muted, fontSize: 12 },
});
