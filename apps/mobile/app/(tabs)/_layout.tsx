import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Heart, MessageCircleHeart, Users, CalendarDays, User, Sparkles, FolderHeart } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8);
  const tabHeight = 58 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 8,
          shadowColor: THEME.colors.textHeading,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
              fill={focused ? THEME.colors.primary : 'none'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size, focused }) => (
            <MessageCircleHeart
              color={color}
              size={focused ? size + 2 : size}
              fill={focused ? 'rgba(232, 93, 117, 0.2)' : 'none'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: 'People',
          tabBarIcon: ({ color, size, focused }) => (
            <Users
              color={color}
              size={focused ? size + 2 : size}
              fill={focused ? 'rgba(232, 93, 117, 0.2)' : 'none'}
            />
          )
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size, focused }) => (
            <CalendarDays
              color={color}
              size={focused ? size + 2 : size}
              fill={focused ? 'rgba(232, 93, 117, 0.2)' : 'none'}
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
      {/* Secondary Screens kept registered for deep linking and programmatic navigation, but hidden from bottom tab bar */}
      <Tabs.Screen
        name="templates"
        options={{
          href: null,
          title: 'Templates',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="my-experiences"
        options={{
          href: null,
          title: 'Surprises',
          tabBarIcon: ({ color, size }) => <FolderHeart color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          href: null,
          title: 'Plans',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
