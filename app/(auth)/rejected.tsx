import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { profileService } from '@/services/profile';
import { colors, radius } from '@/constants/theme';

export default function RejectedScreen() {
  const { token, clearAuth } = useAuthStore();
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    profileService.getMe(token)
      .then(({ profile }) => setReason(profile?.rejection_reason || null))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>❌</Text>
        <Text style={styles.title}>Cadastro não aprovado</Text>
        <Text style={styles.subtitle}>
          Infelizmente seu cadastro não foi aprovado desta vez.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginBottom: 32 }} />
        ) : reason ? (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Motivo:</Text>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.btn}
          onPress={() => router.replace('/(auth)/companion-onboarding')}
        >
          <Text style={styles.btnText}>Reenviar documentos</Text>
        </Pressable>

        <Pressable
          style={styles.logoutBtn}
          onPress={() => { clearAuth(); router.replace('/(auth)/welcome'); }}
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  emoji: { fontSize: 60, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.dark, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 24, textAlign: 'center' },
  reasonBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  reasonLabel: { fontSize: 12, fontWeight: '700', color: '#EF4444', marginBottom: 4 },
  reasonText: { fontSize: 14, color: '#7F1D1D', lineHeight: 20 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  logoutBtn: { alignItems: 'center', paddingVertical: 12 },
  logoutText: { color: colors.muted, fontSize: 14 },
});
