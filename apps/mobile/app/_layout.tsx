import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { THEME } from '../constants/theme';

// Prevent native splash screen from auto-hiding before ready
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen might already be prevented or unsupported in web
});

export default function RootLayout() {
  useEffect(() => {
    // Hide native splash screen smoothly after app initialization (~2.5s)
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME.colors.background }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen
          name="editor/[id]"
          options={{
            headerShown: true,
            title: 'Experience Studio',
            headerTintColor: THEME.colors.textHeading,
            headerStyle: { backgroundColor: THEME.colors.background }
          }}
        />
        <Stack.Screen
          name="preview/[id]"
          options={{
            headerShown: true,
            title: 'Live Preview',
            presentation: 'modal',
            headerTintColor: THEME.colors.textHeading,
            headerStyle: { backgroundColor: THEME.colors.background }
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
