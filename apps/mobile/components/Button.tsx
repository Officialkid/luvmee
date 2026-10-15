import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { THEME } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'ghost':
        return styles.ghostBtn;
      case 'danger':
        return styles.dangerBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.baseBtn,
        getVariantStyle(),
        size === 'lg' && styles.largeBtn,
        size === 'sm' && styles.smallBtn,
        disabled && styles.disabledBtn,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : THEME.colors.rose} />
      ) : (
        <>
          {icon}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    borderRadius: THEME.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    minHeight: 48
  },
  largeBtn: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    minHeight: 54
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 38
  },
  primaryBtn: {
    backgroundColor: THEME.colors.rose,
    shadowColor: THEME.colors.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  secondaryBtn: {
    backgroundColor: THEME.colors.blush
  },
  outlineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  ghostBtn: {
    backgroundColor: 'transparent'
  },
  dangerBtn: {
    backgroundColor: THEME.colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)'
  },
  disabledBtn: {
    opacity: 0.5
  },
  baseText: {
    fontWeight: '700',
    fontSize: 15
  },
  primaryText: {
    color: '#FFFFFF'
  },
  secondaryText: {
    color: THEME.colors.burgundy
  },
  outlineText: {
    color: THEME.colors.burgundy
  },
  ghostText: {
    color: THEME.colors.rose
  },
  dangerText: {
    color: THEME.colors.error
  }
});
