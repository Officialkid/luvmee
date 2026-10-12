import React from 'react';
import { Tabs } from 'expo-router';
import { Heart, Sparkles, FolderHeart, User } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.rose,
        tabBarInactiveTintColor: THEME.colors.muted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(232, 93, 117, 0.15)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: 'Templates',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="my-experiences"
        options={{
          title: 'My Surprises',
          tabBarIcon: ({ color, size }) => <FolderHeart color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
