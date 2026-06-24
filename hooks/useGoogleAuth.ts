import { useCallback } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export function useGoogleAuth() {
  const { setAuth } = useAuthStore();

  const signIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert('Erro', 'Não foi possível obter o token do Google.');
        return;
      }

      const data = await authService.googleLogin({ idToken });
      setAuth(data.access_token, data.user);

      if (data.user.role === null) {
        router.replace('/(auth)/role-select');
      } else if (data.user.role === 'companion') {
        router.replace('/(companion)/home');
      } else {
        router.replace('/(family)/home');
      }
    } catch (err: any) {
      const code = err?.code;
      if (code === statusCodes.SIGN_IN_CANCELLED) return;
      if (code === statusCodes.IN_PROGRESS) return;
      if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Erro', 'Google Play Services não disponível.');
        return;
      }
      if (code !== undefined && code === statusCodes.DEVELOPER_ERROR) {
        Alert.alert(
          'Erro de configuração',
          'SHA-1 fingerprint não registrado no Firebase ou webClientId incorreto.',
        );
        console.error('[GoogleSignIn] DEVELOPER_ERROR', err);
        return;
      }
      console.error('[GoogleSignIn] signIn error', err);
      Alert.alert('Erro', err.message || 'Falha ao entrar com Google.');
    }
  }, [setAuth]);

  return { signIn };
}
