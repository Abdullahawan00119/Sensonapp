import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold
} from '@expo-google-fonts/dm-sans';
import {
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    useFonts
} from '@expo-google-fonts/outfit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import { useAuthStore } from '../lib/stores/authStore';

// Suppress web-only warnings that originate inside react-native-web and
// React Navigation internals — not fixable from user code.
if (Platform.OS === 'web') {
  LogBox.ignoreLogs([
    'props.pointerEvents is deprecated',
    'Blocked aria-hidden on an element',
  ]);
}

// Import global styles (Tailwind / NativeWind v4 entry)
import '../../global.css';

// Create TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Handles redirecting based on auth state changes (login / logout)
function AuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const token = useAuthStore(state => state.token);
  const isLoading = useAuthStore(state => state.isLoading);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!token && inTabsGroup) {
      // Logged out — send to login
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // Already logged in — send to app
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const initAuth = useAuthStore(state => state.init);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
