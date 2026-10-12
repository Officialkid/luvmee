import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={THEME.colors.blush} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: THEME.colors.blush }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="editor/[id]"
          options={{
            headerShown: true,
            title: 'Experience Studio',
            headerTintColor: THEME.colors.burgundy,
            headerStyle: { backgroundColor: THEME.colors.blush }
          }}
        />
        <Stack.Screen
          name="preview/[id]"
          options={{
            headerShown: true,
            title: 'Live Preview',
            presentation: 'modal',
            headerTintColor: THEME.colors.burgundy,
            headerStyle: { backgroundColor: THEME.colors.blush }
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
