import { useState } from 'react';
import {
  View, Text, Pressable, Image,
  ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/auth';
import { profileService } from '@/services/profile';
import { colors, radius } from '@/constants/theme';

type Step = 'photo' | 'document' | 'done';

export default function CompanionOnboardingScreen() {
  const { token } = useAuthStore();
  const [step, setStep] = useState<Step>('photo');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [docUri, setDocUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage(source: 'camera' | 'library') {
    const fn = source === 'camera'
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await fn({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    return result.canceled ? null : result.assets[0];
  }

  function promptPick(onPick: (uri: string) => void) {
    Alert.alert('Escolher imagem', 'Como deseja enviar?', [
      {
        text: 'Câmera', onPress: async () => {
          const asset = await pickImage('camera');
          if (asset) onPick(asset.uri);
        },
      },
      {
        text: 'Galeria', onPress: async () => {
          const asset = await pickImage('library');
          if (asset) onPick(asset.uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function handleSubmit() {
    if (!token || !photoUri || !docUri) return;
    try {
      setLoading(true);
      await profileService.uploadProfilePhoto(token, photoUri);
      await profileService.uploadDocument(token, docUri, 'rg_cnh');
      setStep('done');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao enviar arquivos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'done') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.doneEmoji}>✅</Text>
          <Text style={styles.title}>Cadastro enviado!</Text>
          <Text style={styles.subtitle}>
            Nossa equipe vai analisar seus documentos em até 48 horas.{' '}Você será notificado quando for aprovado.
          </Text>
          <Pressable style={styles.btn} onPress={() => router.replace('/(auth)/pending-approval')}>
            <Text style={styles.btnText}>Entendido</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.steps}>
          <View style={[styles.stepDot, step === 'photo' && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === 'document' && styles.stepDotActive]} />
        </View>

        {step === 'photo' && (
          <>
            <Text style={styles.title}>Foto de perfil</Text>
            <Text style={styles.subtitle}>
              Envie uma foto clara do seu rosto. Ela será exibida para as famílias.
            </Text>
            <Pressable style={styles.imageBox} onPress={() => promptPick(setPhotoUri)}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={styles.image} />
                : <Text style={styles.imageBoxText}>Toque para escolher a foto</Text>}
            </Pressable>
            <Pressable
              style={[styles.btn, !photoUri && styles.btnDisabled]}
              onPress={() => photoUri && setStep('document')}
              disabled={!photoUri}
            >
              <Text style={styles.btnText}>Próximo</Text>
            </Pressable>
          </>
        )}

        {step === 'document' && (
          <>
            <Text style={styles.title}>Documento de identidade</Text>
            <Text style={styles.subtitle}>
              Envie uma foto do seu RG ou CNH (frente) para validarmos sua identidade.
            </Text>
            <Pressable style={styles.imageBox} onPress={() => promptPick(setDocUri)}>
              {docUri
                ? <Image source={{ uri: docUri }} style={styles.image} />
                : <Text style={styles.imageBoxText}>Toque para fotografar o documento</Text>}
            </Pressable>
            <Pressable
              style={[styles.btn, (!docUri || loading) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!docUri || loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Enviar para análise</Text>}
            </Pressable>
            <Pressable style={styles.backBtn} onPress={() => setStep('photo')}>
              <Text style={styles.backText}>Voltar</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 40, justifyContent: 'center' },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.primary },
  stepLine: { width: 40, height: 2, backgroundColor: colors.border, marginHorizontal: 8 },
  title: { fontSize: 22, fontWeight: '700', color: colors.dark, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 32 },
  imageBox: {
    height: 200,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageBoxText: { color: colors.muted, fontSize: 14 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  backBtn: { alignItems: 'center', marginTop: 16 },
  backText: { color: colors.muted, fontSize: 14 },
  doneEmoji: { fontSize: 60, textAlign: 'center', marginBottom: 24 },
});
