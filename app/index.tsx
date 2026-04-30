import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function Index() {
  const { token, user } = useAuthStore();
  if (!token) return <Redirect href="/(auth)/welcome" />;
  if (user?.role === null) return <Redirect href="/(auth)/role-select" />;
  if (user?.role === 'companion') return <Redirect href="/(companion)/home" />;
  return <Redirect href="/(family)/home" />;
}
