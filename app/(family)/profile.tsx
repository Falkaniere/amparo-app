import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { profileService } from '@/services/profile';
import { colors, radius } from '@/constants/theme';

const MENU_ITEMS = [
  { icon: '👤', label: 'Editar perfil', key: 'edit' },
  { icon: '🔔', label: 'Notificações', key: 'notifications' },
  { icon: '🔒', label: 'Privacidade e segurança', key: 'privacy' },
  { icon: '❓', label: 'Ajuda e suporte', key: 'help' },
  { icon: '📄', label: 'Termos de uso', key: 'terms' },
];

export default function FamilyProfileScreen() {
  const { user, token, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await profileService.getMe(token!);
      setProfile(data.profile);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
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

  const displayName = user?.name || profile?.name || 'Usuário';
  const displayEmail = user?.email || profile?.email || '';
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
          {/* Avatar + info */}
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{displayEmail}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Família</Text>
            </View>
          </View>

          {/* Estatísticas */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.total_requests ?? 0}
              </Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.total_companions ?? 0}
              </Text>
              <Text style={styles.statLabel}>Acompanhantes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.avg_rating?.toFixed(1) ?? '—'}
              </Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
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

          {/* Logout */}
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: colors.dark },
  email: { fontSize: 12, color: colors.muted, marginTop: 2 },
  roleBadge: {
    marginTop: 8,
    backgroundColor: colors.light,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: colors.dark },
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
