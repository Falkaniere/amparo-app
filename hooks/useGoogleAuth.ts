import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const { setAuth } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;

    const code = response.params.code;
    const redirectUri = makeRedirectUri();

    (async () => {
      try {
        const data = await authService.googleLogin({
          code,
          codeVerifier: request?.codeVerifier,
          redirectUri,
        });
        setAuth(data.access_token, data.user);
        if (data.user.role === null) {
          router.replace('/(auth)/role-select');
        } else if (data.user.role === 'companion') {
          router.replace('/(companion)/home');
        } else {
          router.replace('/(family)/home');
        }
      } catch (err: any) {
        Alert.alert('Erro', err.message || 'Falha ao entrar com Google.');
      }
    })();
  }, [response]);

  return { request, promptAsync };
}
