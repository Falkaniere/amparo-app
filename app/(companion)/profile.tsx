import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { profileService } from '@/services/profile';
import { colors, radius } from '@/constants/theme';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DEFAULT_SLOTS = DAYS.map((_, i) => ({
  day_of_week: i,
  start_time: '08:00',
  end_time: '18:00',
  is_active: i > 0 && i < 6, // Seg–Sex ativados por padrão
}));

const MENU_ITEMS = [
  { icon: '👤', label: 'Editar informações', key: 'edit' },
  { icon: '📄', label: 'Documentos', key: 'docs' },
  { icon: '🔔', label: 'Notificações', key: 'notifications' },
  { icon: '🏦', label: 'Dados bancários', key: 'bank' },
  { icon: '❓', label: 'Ajuda e suporte', key: 'help' },
];

export default function CompanionProfileScreen() {
  const { user, token, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await profileService.getMe(token!);
      setProfile(data.profile);
      if (data.profile?.availability?.length > 0) {
        setSlots(data.profile.availability);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function saveAvailability() {
    try {
      setSaving(true);
      await profileService.setAvailability(token!, slots);
      Alert.alert('Disponibilidade salva!');
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(idx: number) {
    setSlots((prev) =>
      prev.map((s) =>
        s.day_of_week === idx ? { ...s, is_active: !s.is_active } : s,
      ),
    );
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          clearAuth();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  const displayName = user?.name || profile?.name || 'Acompanhante';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user?.email || profile?.email || ''}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.rating}>
                {profile?.avg_rating?.toFixed(1) || '—'}
              </Text>
              <Text style={styles.ratingCount}>
                ({profile?.total_services || 0} serviços)
              </Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Acompanhante</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.total_services ?? 0}</Text>
              <Text style={styles.statLabel}>Serviços</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                R$ {profile?.hourly_rate?.toFixed(0) ?? '—'}
              </Text>
              <Text style={styles.statLabel}>Por hora</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.avg_rating?.toFixed(1) ?? '—'}
              </Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
          </View>

          {/* Disponibilidade */}
          <View style={styles.availSection}>
            <Text style={styles.sectionTitle}>Disponibilidade semanal</Text>
            <View style={styles.daysGrid}>
              {slots.map((slot) => (
                <Pressable
                  key={slot.day_of_week}
                  style={[
                    styles.dayBtn,
                    slot.is_active && styles.dayBtnActive,
                  ]}
                  onPress={() => toggleDay(slot.day_of_week)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      slot.is_active && styles.dayTextActive,
                    ]}
                  >
                    {DAYS[slot.day_of_week]}
                  </Text>
                  {slot.is_active && (
                    <Text style={styles.dayTime}>
                      {slot.start_time}–{slot.end_time}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={saveAvailability}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Salvando…' : 'Salvar disponibilidade'}
              </Text>
            </Pressable>
          </View>

          {/* Menu */}
          <View style={styles.menuSection}>
            {MENU_ITEMS.map((item, idx) => (
              <Pressable
                key={item.key}
                style={[
                  styles.menuItem,
                  idx < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => {}}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuChevron}>›</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair da conta</Text>
          </Pressable>

          <Text style={styles.version}>safeAge v1.0.0</Text>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
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
  loader: { flex: 1, marginTop: 48 },
  hero: {
    backgroundColor: colors.card,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: colors.dark },
  email: { fontSize: 12, color: colors.muted, marginTop: 2 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  star: { color: colors.amber, fontSize: 14 },
  rating: { color: colors.dark, fontSize: 14, fontWeight: '700' },
  ratingCount: { color: colors.muted, fontSize: 12 },
  roleBadge: {
    marginTop: 8,
    backgroundColor: colors.dark,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  statsRow: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.dark },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },
  statDivider: { width: 0.5, height: 32, backgroundColor: colors.border },
  availSection: {
    backgroundColor: colors.card,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginTop: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  dayBtnActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  dayText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  dayTextActive: { color: '#fff' },
  dayTime: { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  menuSection: {
    backgroundColor: colors.card,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  menuIcon: { fontSize: 16, width: 24 },
  menuLabel: { flex: 1, fontSize: 14, color: colors.text },
  menuChevron: { color: colors.muted, fontSize: 18 },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 0.5,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  version: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 11,
    marginTop: 16,
  },
});
