import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, StyleSheet } from 'react-native';
import { Heart, Sparkles, FolderHeart, User, MessageCircleHeart } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // Ensure Android navigation bar does not cut off the tabs
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  const tabHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.rose,
        tabBarInactiveTintColor: '#542638',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(232, 93, 117, 0.2)',
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#542638',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 10
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2
        },
        tabBarItemStyle: {
          paddingVertical: 2
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Heart
              color={color}
              size={focused ? size + 2 : size}
              fill={focused ? THEME.colors.rose : 'none'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Love Notes',
          tabBarIcon: ({ color, size, focused }) => (
            <MessageCircleHeart
              color={color}
              size={focused ? size + 2 : size}
              fill={focused ? 'rgba(232, 93, 117, 0.25)' : 'none'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Templates',
          tabBarIcon: ({ color, size, focused }) => (
            <Sparkles
              color={color}
              size={focused ? size + 2 : size}
              fill={focused ? THEME.colors.rose : 'none'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="my-experiences"
        options={{
          title: 'Surprises',
          tabBarIcon: ({ color, size, focused }) => (
            <FolderHeart
              color={color}
              size={focused ? size + 2 : size}
              fill={focused ? 'rgba(232, 93, 117, 0.25)' : 'none'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <User
              color={color}
              size={focused ? size + 2 : size}
            />
          )
        }}
      />
    </Tabs>
  );
}
