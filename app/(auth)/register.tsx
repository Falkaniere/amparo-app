import { useState } from 'react';
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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth';
import { colors, radius } from '@/constants/theme';

type Role = 'family' | 'companion';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('family');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  async function handleRegister() {
    if (!name || !email || !password || !phone) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    try {
      setLoading(true);
      await authService.register({ name, email, password, phone, role });
      const data = await authService.login(email, password);
      setAuth(data.access_token, data.user);
      if (role === 'companion') {
        router.replace('/(companion)/home');
      } else {
        router.replace('/(family)/home');
      }
    } catch (err: any) {
      Alert.alert('Erro no cadastro', err.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Junte-se ao Amparo</Text>

        {/* Seletor de perfil */}
        <Text style={styles.label}>EU SOU</Text>
        <View style={styles.roleRow}>
          {(['family', 'companion'] as Role[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[styles.roleBtn, role === r && styles.roleBtnActive]}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  role === r && styles.roleBtnTextActive,
                ]}
              >
                {r === 'family' ? '👨‍👩‍👧 Família' : '🤝 Acompanhante'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.form}>
          {[
            {
              label: 'NOME COMPLETO',
              value: name,
              setter: setName,
              placeholder: 'Maria Aparecida',
              type: 'default',
              caps: 'words',
            },
            {
              label: 'E-MAIL',
              value: email,
              setter: setEmail,
              placeholder: 'seu@email.com',
              type: 'email-address',
              caps: 'none',
            },
            {
              label: 'TELEFONE',
              value: phone,
              setter: setPhone,
              placeholder: '(21) 99999-9999',
              type: 'phone-pad',
              caps: 'none',
            },
          ].map((f) => (
            <View key={f.label}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={colors.muted}
                keyboardType={f.type as any}
                autoCapitalize={f.caps as any}
                value={f.value}
                onChangeText={f.setter}
              />
            </View>
          ))}
          <View>
            <Text style={styles.label}>SENHA</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <Pressable
          style={styles.btn}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Criar conta</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.loginLink}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>
            Já tem conta? <Text style={styles.loginTextBold}>Entrar</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  backBtn: { marginBottom: 32 },
  backText: { color: colors.dark, fontSize: 28 },
  title: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: { color: colors.muted, fontSize: 14, marginBottom: 24 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  roleBtnActive: { backgroundColor: colors.light, borderColor: colors.primary },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  roleBtnTextActive: { color: colors.dark },
  form: { gap: 16 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: colors.text,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  loginLink: { alignItems: 'center', marginTop: 16, marginBottom: 32 },
  loginText: { color: colors.muted, fontSize: 12 },
  loginTextBold: { color: colors.primary, fontWeight: '700' },
});
