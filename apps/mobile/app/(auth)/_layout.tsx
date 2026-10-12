import React from 'react';
import { Stack } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: THEME.colors.burgundy,
        headerStyle: { backgroundColor: THEME.colors.blush },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: THEME.colors.blush }
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: 'Sign In',
          headerBackTitle: 'Back'
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: 'Create Account',
          headerBackTitle: 'Back'
        }}
      />
    </Stack>
  );
}
