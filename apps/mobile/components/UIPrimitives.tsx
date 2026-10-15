import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { THEME } from '../constants/theme';

// ==============================================================================
// 1. SectionHeader
// ==============================================================================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  style
}) => {
  return (
    <View style={[styles.sectionHeaderContainer, style]}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionHeaderSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.sectionHeaderAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ==============================================================================
// 2. Badge
// ==============================================================================
interface BadgeProps {
  label: string;
  variant?: 'primary' | 'muted' | 'neutral' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'neutral':
      case 'muted':
        return { backgroundColor: 'rgba(84, 40, 56, 0.06)', borderColor: 'transparent' };
      case 'success':
        return { backgroundColor: THEME.colors.successBg, borderColor: 'rgba(5, 150, 105, 0.2)' };
      case 'warning':
        return { backgroundColor: THEME.colors.warningBg, borderColor: 'rgba(217, 119, 6, 0.2)' };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: THEME.colors.borderHighlight };
      case 'primary':
      default:
        return { backgroundColor: THEME.colors.primarySubtle, borderColor: 'rgba(232, 93, 117, 0.2)' };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'neutral':
      case 'muted':
        return { color: THEME.colors.textMuted };
      case 'success':
        return { color: THEME.colors.success };
      case 'warning':
        return { color: THEME.colors.warning };
      case 'outline':
      case 'primary':
      default:
        return { color: THEME.colors.primary };
    }
  };

  return (
    <View
      style={[
        styles.badgeBase,
        getBadgeStyle(),
        size === 'sm' && styles.badgeSm,
        style
      ]}
    >
      <Text style={[styles.badgeText, getTextStyle(), size === 'sm' && styles.badgeTextSm]}>
        {label}
      </Text>
    </View>
  );
};

// ==============================================================================
// 3. Avatar
// ==============================================================================
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | number;
  backgroundColor?: string;
  textColor?: string;
  showOnlineDot?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  backgroundColor = THEME.colors.surfaceHighlight,
  textColor = THEME.colors.textHeading,
  showOnlineDot = false,
  style
}) => {
  const pixelSize = typeof size === 'number' ? size : size === 'sm' ? 32 : size === 'lg' ? 52 : 42;
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <View style={[{ position: 'relative' }, style]}>
      <View
        style={[
          styles.avatarContainer,
          {
            width: pixelSize,
            height: pixelSize,
            borderRadius: pixelSize / 2,
            backgroundColor
          }
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            {
              color: textColor,
              fontSize: Math.floor(pixelSize * 0.42)
            }
          ]}
        >
          {initials}
        </Text>
      </View>
      {showOnlineDot ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(8, Math.floor(pixelSize * 0.24)),
            height: Math.max(8, Math.floor(pixelSize * 0.24)),
            borderRadius: Math.floor(pixelSize * 0.12),
            backgroundColor: THEME.colors.success,
            borderWidth: 2,
            borderColor: THEME.colors.surface
          }}
        />
      ) : null}
    </View>
  );
};

// ==============================================================================
// 4. EmptyState
// ==============================================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style
}) => {
  return (
    <View style={[styles.emptyStateContainer, style]}>
      {icon ? <View style={styles.emptyStateIconContainer}>{icon}</View> : null}
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDesc}>{description}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyStateButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ==============================================================================
// 5. SkeletonLoader
// ==============================================================================
interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = THEME.radius.sm,
  style
}) => {
  return (
    <View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height,
          borderRadius
        },
        style
      ]}
    />
  );
};

// ==============================================================================
// 6. InlineNotice
// ==============================================================================
interface InlineNoticeProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
  style?: ViewStyle;
}

export const InlineNotice: React.FC<InlineNoticeProps> = ({
  type = 'info',
  message,
  onClose,
  style
}) => {
  const getContainerStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: THEME.colors.successBg, borderColor: 'rgba(5, 150, 105, 0.25)' };
      case 'warning':
        return { backgroundColor: THEME.colors.warningBg, borderColor: 'rgba(217, 119, 6, 0.25)' };
      case 'error':
        return { backgroundColor: THEME.colors.errorBg, borderColor: 'rgba(220, 38, 38, 0.25)' };
      case 'info':
      default:
        return { backgroundColor: 'rgba(232, 93, 117, 0.08)', borderColor: 'rgba(232, 93, 117, 0.2)' };
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'success':
        return { color: THEME.colors.success };
      case 'warning':
        return { color: THEME.colors.warning };
      case 'error':
        return { color: THEME.colors.error };
      case 'info':
      default:
        return { color: THEME.colors.textHeading };
    }
  };

  return (
    <View style={[styles.inlineNoticeContainer, getContainerStyle(), style]}>
      <Text style={[styles.inlineNoticeText, getTextStyle()]}>{message}</Text>
      {onClose ? (
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.inlineNoticeClose, getTextStyle()]}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // SectionHeader
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12
  },
  sectionHeaderLeft: {
    flex: 1
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    letterSpacing: -0.2
  },
  sectionHeaderSubtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2
  },
  sectionHeaderAction: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primary,
    marginLeft: 8
  },

  // Badge
  badgeBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  badgeTextSm: {
    fontSize: 9
  },

  // Avatar
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  avatarText: {
    fontWeight: '700'
  },

  // EmptyState
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(232, 93, 117, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.textHeading,
    textAlign: 'center',
    marginBottom: 6
  },
  emptyStateDesc: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 18
  },
  emptyStateButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: THEME.radius.md
  },
  emptyStateButtonText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '600'
  },

  // SkeletonLoader
  skeletonBase: {
    backgroundColor: 'rgba(84, 40, 56, 0.06)'
  },

  // InlineNotice
  inlineNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    marginBottom: 12
  },
  inlineNoticeText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1
  },
  inlineNoticeClose: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10
  }
});
