import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { profileService } from '@/services/profile';
import { colors, radius } from '@/constants/theme';

export default function PendingApprovalScreen() {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(false);

  async function handleCheckStatus() {
    if (!token) return;
    try {
      setChecking(true);
      const { profile } = await profileService.getMe(token);
      const status = profile?.status;

      if (status === 'approved') {
        setAuth(token, { ...user!, companion_status: 'approved' });
        router.replace('/(companion)/home');
      } else if (status === 'rejected') {
        setAuth(token, { ...user!, companion_status: 'rejected' });
        router.replace('/(auth)/rejected');
      }
      // still pending — no redirect
    } catch {
      // silently ignore
    } finally {
      setChecking(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>⏳</Text>
        <Text style={styles.title}>Cadastro em análise</Text>
        <Text style={styles.subtitle}>
          Nossa equipe está revisando seus documentos.{' '}Isso leva até 48 horas.{'

'}
          Você receberá uma notificação assim que for aprovado.
        </Text>

        <Pressable style={styles.btn} onPress={handleCheckStatus} disabled={checking}>
          {checking
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Verificar status</Text>}
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
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 22, textAlign: 'center', marginBottom: 40 },
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
