import * as Battery from 'expo-battery';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PlanimProvider } from '@/context/PlanimContext';
import { Consent } from '@/components/Consent';
import { DailyQuote } from '@/components/DailyQuote';
import { Onboarding } from '@/components/Onboarding';
import { useColors } from '@/hooks/useColors';
import { LessonScheduler } from '@/components/LessonScheduler';
import { SpotifyProvider } from '@/context/SpotifyContext';
import { usePlanim } from '@/context/PlanimContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Geri', headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="exams" />
      <Stack.Screen name="wrongs" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="lesson-summary" options={{ gestureEnabled: false }} />
      <Stack.Screen name="weekly" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="lesson-start" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="study-mode" options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="spotify-callback" />
      <Stack.Screen name="locked-apps" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

function NavigationGate() {
  const { settings, hydrated, updateSettings } = usePlanim();
  const colors = useColors();

  // İlk açılışta beyaz tema; telefon güç tasarrufu modundaysa siyah tema ile başla.
  useEffect(() => {
    if (!hydrated || settings.themeInit) return;
    Battery.isLowPowerModeEnabledAsync()
      .then((low) => updateSettings({ themeInit: true, ...(low ? { theme: 'dark' as const } : {}) }))
      .catch(() => updateSettings({ themeInit: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, settings.themeInit]);

  if (!hydrated) return null;
  const statusBar = <StatusBar style={colors.isDark ? 'light' : 'dark'} />;
  if (!settings.consentAccepted) return <>{statusBar}<Consent /></>;
  return settings.onboardingComplete ? <>{statusBar}<LessonScheduler /><RootLayoutNav /><DailyQuote /></> : <>{statusBar}<Onboarding /></>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Web preview can render before remote fonts finish loading; native builds
  // still keep the splash screen gated until fonts are ready.
  if (!fontsLoaded && !fontError && Platform.OS !== 'web') return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <PlanimProvider>
            <SpotifyProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <NavigationGate />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </SpotifyProvider>
          </PlanimProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
