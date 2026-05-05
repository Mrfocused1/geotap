import '../global.css';

import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { registerGeofenceTask } from '@/services/geofenceTask';
import { useAuthStore } from '@/stores/useAuthStore';
import { useChecklistStore } from '@/stores/useChecklistStore';

// Register the background task ASAP (must happen at module load on iOS).
registerGeofenceTask();

function useAuthRouting(onboardingComplete: boolean | null) {
  const segments = useSegments();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'idle' || status === 'loading') return;
    if (onboardingComplete === null) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inAuth = segments[0] === '(auth)';
    const inTabs = segments[0] === '(tabs)';
    const inGeofences = segments[0] === 'geofences';
    const inChecklists = segments[0] === 'checklists';

    if (
      status === 'authenticated' &&
      !inTabs &&
      !inGeofences &&
      !inChecklists
    ) {
      router.replace('/(tabs)');
      return;
    }

    if (status !== 'authenticated') {
      if (!onboardingComplete && !inOnboarding) {
        router.replace('/(onboarding)');
        return;
      }
      if (onboardingComplete && !inAuth) {
        router.replace('/(auth)/login');
      }
    }
  }, [status, segments, onboardingComplete, router]);
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const status = useAuthStore((s) => s.status);
  const restoreSession = useChecklistStore((s) => s.restoreSession);

  const [onboardingComplete, setOnboardingComplete] = useState<
    boolean | null
  >(null);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    hydrate();
    restoreSession().catch(() => undefined);
    AsyncStorage.getItem(Config.storage.ONBOARDING_KEY).then((v) => {
      setOnboardingComplete(v === 'true');
    });
  }, [hydrate, restoreSession]);

  useAuthRouting(onboardingComplete);

  if (
    !fontsLoaded ||
    status === 'idle' ||
    status === 'loading' ||
    onboardingComplete === null
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator color="#0d9488" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="geofences/create"
          options={{
            headerShown: true,
            headerTitle: 'New Geofence',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="geofences/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Edit Geofence',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="checklists/create"
          options={{
            headerShown: true,
            headerTitle: 'New Checklist',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="checklists/[id]"
          options={{
            headerShown: true,
            headerTitle: 'Checklist',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="checklists/[id]/edit"
          options={{
            headerShown: true,
            headerTitle: 'Edit Checklist',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
