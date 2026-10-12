import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 117, 0.18)',
    shadowColor: THEME.colors.burgundy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 16
  }
});
