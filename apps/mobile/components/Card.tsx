import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'highlight' | 'flat';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, variant = 'surface', style }) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'highlight' && styles.cardHighlight,
        variant === 'flat' && styles.cardFlat,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.textHeading,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14
  },
  cardHighlight: {
    backgroundColor: THEME.colors.surfaceHighlight,
    borderColor: THEME.colors.borderHighlight
  },
  cardFlat: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    shadowOpacity: 0,
    elevation: 0
  }
});
