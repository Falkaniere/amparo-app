import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { setAuth }             = useAuthStore();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      setAuth(data.access_token, data.user);
      // Redireciona conforme o role
      if (data.user.role === 'companion') {
        router.replace('/(companion)/home');
      } else {
        router.replace('/(family)/home');
      }
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err.message || 'Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-6 pt-8">

        {/* Header */}
        <Pressable onPress={() => router.back()} className="mb-8">
          <Text className="text-dark text-2xl">‹</Text>
        </Pressable>

        <Text className="text-dark text-2xl font-bold mb-1">Bem-vindo de volta</Text>
        <Text className="text-muted text-sm mb-8">Entre na sua conta Amparo</Text>

        {/* Campos */}
        <View className="gap-3">
          <View>
            <Text className="text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              E-mail
            </Text>
            <TextInput
              className="bg-white border border-border rounded-xl px-4 py-3.5 text-sm"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Senha
            </Text>
            <TextInput
              className="bg-white border border-border rounded-xl px-4 py-3.5 text-sm"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* Botão */}
        <Pressable
          className="bg-primary rounded-xl py-4 items-center mt-6 active:opacity-80"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text className="text-white font-bold text-sm">Entrar</Text>
          }
        </Pressable>

        <Pressable
          className="items-center mt-4"
          onPress={() => router.push('/(auth)/register')}
        >
          <Text className="text-muted text-xs">
            Não tem conta?{' '}
            <Text className="text-primary font-bold">Cadastre-se</Text>
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}
