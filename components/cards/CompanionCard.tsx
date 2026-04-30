import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/theme';

interface Props {
  companion: {
    id: string;
    hourly_rate: number;
    avg_rating: number;
    total_services: number;
    distance_km: number;
  };
  onPress: () => void;
}

const AVATAR_COLORS = ['#E1F5EE', '#EEEDFE', '#FAEEDA', '#FCEBEB'];
const TEXT_COLORS = ['#085041', '#3C3489', '#633806', '#712B13'];

export function CompanionCard({ companion, onPress }: Props) {
  const idx = companion.id.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[idx] }]}>
        <Text style={[styles.avatarText, { color: TEXT_COLORS[idx] }]}>
          {companion.id.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>Acompanhante</Text>
        <Text style={styles.rating}>
          ★ {companion.avg_rating.toFixed(1)}
          <Text style={styles.services}>
            {' '}
            · {companion.total_services} serviços
          </Text>
        </Text>
        <View style={styles.tags}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Disponível</Text>
          </View>
          <Text style={styles.distance}>{companion.distance_km} km</Text>
        </View>
      </View>
      <View style={styles.priceBox}>
        <Text style={styles.price}>R${companion.hourly_rate}</Text>
        <Text style={styles.perHour}>/hora</Text>
      </View>
    </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 12, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '700', color: colors.text },
  rating: {
    fontSize: 11,
    color: colors.amber,
    fontWeight: '700',
    marginTop: 2,
  },
  services: { color: colors.muted, fontWeight: '400' },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  badge: {
    backgroundColor: colors.light,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: colors.dark, fontSize: 9, fontWeight: '700' },
  distance: { color: colors.muted, fontSize: 10 },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', color: colors.primary },
  perHour: { fontSize: 10, color: colors.muted },
});
