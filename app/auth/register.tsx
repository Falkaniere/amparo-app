import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth';

type Role = 'family' | 'companion';

export default function RegisterScreen() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<Role>('family');
  const [loading, setLoading]   = useState(false);
  const { setAuth }             = useAuthStore();

  async function handleRegister() {
    if (!name || !email || !password || !phone) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    try {
      setLoading(true);
      await authService.register({ name, email, password, phone, role });
      // Faz login automático após cadastro
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
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>

        <Pressable onPress={() => router.back()} className="mb-8">
          <Text className="text-dark text-2xl">‹</Text>
        </Pressable>

        <Text className="text-dark text-2xl font-bold mb-1">Criar conta</Text>
        <Text className="text-muted text-sm mb-6">Junte-se ao Amparo</Text>

        {/* Seletor de perfil */}
        <Text className="text-xs font-bold text-dark uppercase tracking-wider mb-2">
          Eu sou
        </Text>
        <View className="flex-row gap-3 mb-5">
          {(['family', 'companion'] as Role[]).map(r => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              className={`flex-1 py-3 rounded-xl border items-center ${
                role === r
                  ? 'bg-light border-primary'
                  : 'bg-white border-border'
              }`}
            >
              <Text className={`text-sm font-bold ${role === r ? 'text-dark' : 'text-muted'}`}>
                {r === 'family' ? '👨‍👩‍👧 Família' : '🤝 Acompanhante'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Campos */}
        <View className="gap-3">
          {[
            { label: 'Nome completo',  value: name,     setter: setName,     placeholder: 'Maria Aparecida', type: 'default' },
            { label: 'E-mail',         value: email,    setter: setEmail,    placeholder: 'seu@email.com',   type: 'email-address' },
            { label: 'Telefone',       value: phone,    setter: setPhone,    placeholder: '(21) 99999-9999', type: 'phone-pad' },
          ].map(field => (
            <View key={field.label}>
              <Text className="text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
                {field.label}
              </Text>
              <TextInput
                className="bg-white border border-border rounded-xl px-4 py-3.5 text-sm"
                placeholder={field.placeholder}
                keyboardType={field.type as any}
                autoCapitalize={field.type === 'default' ? 'words' : 'none'}
                value={field.value}
                onChangeText={field.setter}
              />
            </View>
          ))}

          <View>
            <Text className="text-xs font-bold text-dark uppercase tracking-wider mb-1.5">
              Senha
            </Text>
            <TextInput
              className="bg-white border border-border rounded-xl px-4 py-3.5 text-sm"
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <Pressable
          className="bg-primary rounded-xl py-4 items-center mt-6 active:opacity-80"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text className="text-white font-bold text-sm">Criar conta</Text>
          }
        </Pressable>

        <Pressable className="items-center mt-4 mb-8" onPress={() => router.push('/(auth)/login')}>
          <Text className="text-muted text-xs">
            Já tem conta?{' '}
            <Text className="text-primary font-bold">Entrar</Text>
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
