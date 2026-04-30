import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmparoLogo } from '@/components/ui/AmparoLogo';
import { colors } from '@/constants/theme';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function WelcomeScreen() {
  const { request, promptAsync } = useGoogleAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.body}>
        <AmparoLogo size={64} color="white" />
        <Text style={styles.name}>amparo</Text>
        <Text style={styles.tagline}>
          Acompanhantes de confiança{'\n'}quando você mais precisa
        </Text>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Pressable
          style={styles.btn}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.btnText}>Começar</Text>
        </Pressable>
        <Pressable
          style={styles.googleBtn}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          {!request ? (
            <ActivityIndicator color={colors.dark} size="small" />
          ) : (
            <Text style={styles.googleBtnText}>Continuar com Google</Text>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.link}>Já tenho conta · Entrar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  name: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    marginTop: 4,
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#fff',
  },
  btn: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  btnText: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '700',
  },
  googleBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 40,
    paddingVertical: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  googleBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  link: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 8,
  },
});
