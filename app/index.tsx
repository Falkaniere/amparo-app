import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { profileService } from '@/services/profile';

export default function Index() {
  const { token, user, setAuth } = useAuthStore();
  const [companionStatus, setCompanionStatus] = useState<string | undefined>(undefined);
  const [hasPhoto, setHasPhoto] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token || user?.role !== 'companion') return;

    profileService.getMe(token)
      .then(({ profile }) => {
        const s = profile?.status ?? 'pending';
        setCompanionStatus(s);
        setHasPhoto(!!profile?.profile_photo_url);
        setAuth(token, { ...user!, companion_status: s });
      })
      .catch(() => {
        setCompanionStatus(user?.companion_status ?? 'pending');
        setHasPhoto(false);
      });
  }, [token]);

  if (!token) return <Redirect href="/(auth)/welcome" />;
  if (user?.role === null) return <Redirect href="/(auth)/role-select" />;

  if (user?.role === 'companion') {
    if (companionStatus === undefined || hasPhoto === null) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
          <ActivityIndicator color="#1D9E75" size="large" />
        </View>
      );
    }
    if (companionStatus === 'approved') return <Redirect href="/(companion)/home" />;
    if (companionStatus === 'rejected') return <Redirect href="/(auth)/rejected" />;
    if (!hasPhoto) return <Redirect href="/(auth)/companion-onboarding" />;
    return <Redirect href="/(auth)/pending-approval" />;
  }

  return <Redirect href="/(family)/home" />;
}
