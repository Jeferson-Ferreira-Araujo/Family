import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingView } from '@/components/ui/LoadingView';
import { AppProvider, useApp } from '@/context/app-context';

function RootNavigator() {
  const { session, profile, isLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const group = segments[0];
    const inAuthGroup = group === '(auth)';
    const inOnboardingGroup = group === '(onboarding)';

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    if (!profile?.family_id) {
      if (!inOnboardingGroup) router.replace('/(onboarding)/welcome');
      return;
    }

    if (inAuthGroup || inOnboardingGroup) {
      router.replace('/');
    }
  }, [session, profile, isLoading, segments, router]);

  if (isLoading) return <LoadingView />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="events/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="events/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="tasks/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="tasks/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="lists/[id]" />
      <Stack.Screen name="routines/index" />
      <Stack.Screen name="routines/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="mural/index" />
      <Stack.Screen name="family/members" />
      <Stack.Screen name="family/invite" options={{ presentation: 'modal' }} />
      <Stack.Screen name="account/index" />
      <Stack.Screen name="categories/index" />
      <Stack.Screen name="notifications/index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <RootNavigator />
          <StatusBar style="dark" />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
