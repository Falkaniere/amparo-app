import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth';
import { colors, radius } from '@/constants/theme';

type Role = 'family' | 'companion';

export default function RoleSelectScreen() {
  const [role, setRole] = useState<Role>('family');
  const [loading, setLoading] = useState(false);
  const { token, user, setAuth } = useAuthStore();

  async function handleConfirm() {
    if (!token || !user) return;
    try {
      setLoading(true);
      await authService.setRole(role, token);
      setAuth(token, { ...user, role });
      router.replace(role === 'companion' ? '/(companion)/home' : '/(family)/home');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Qual é o seu perfil?</Text>
        <Text style={styles.subtitle}>
          Escolha como você vai usar o Amparo
        </Text>

        <View style={styles.options}>
          <Pressable
            style={[styles.option, role === 'family' && styles.optionActive]}
            onPress={() => setRole('family')}
          >
            <Text style={styles.optionEmoji}>👨‍👩‍👧</Text>
            <Text style={[styles.optionTitle, role === 'family' && styles.optionTitleActive]}>
              Família
            </Text>
            <Text style={styles.optionDesc}>
              Estou buscando um acompanhante para mim ou alguém da família
            </Text>
          </Pressable>

          <Pressable
            style={[styles.option, role === 'companion' && styles.optionActive]}
            onPress={() => setRole('companion')}
          >
            <Text style={styles.optionEmoji}>🤝</Text>
            <Text style={[styles.optionTitle, role === 'companion' && styles.optionTitleActive]}>
              Acompanhante
            </Text>
            <Text style={styles.optionDesc}>
              Sou um profissional e quero oferecer serviços de acompanhamento
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.btn} onPress={handleConfirm} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Confirmar</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 48, justifyContent: 'center' },
  title: { color: colors.dark, fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: colors.muted, fontSize: 14, marginBottom: 32, lineHeight: 20 },
  options: { gap: 12, marginBottom: 32 },
  option: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 20,
    gap: 4,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.light,
  },
  optionEmoji: { fontSize: 28, marginBottom: 4 },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
  },
  optionTitleActive: { color: colors.primary },
  optionDesc: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
