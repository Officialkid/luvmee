import { Platform } from 'react-native';

export const THEME = {
  colors: {
    // Canvas & Surfaces
    background: '#FFF9F2',         // Soft Ivory — primary readable canvas
    surface: '#FFFFFF',            // Crisp White — primary card surface
    surfaceHighlight: '#FCE7ED',   // Blush Pink — gentle accent & hero banner surface
    surfaceAlt: 'rgba(255, 249, 242, 0.85)', // Translucent ivory
    cardBg: '#FFFFFF',             // Canonical card background

    // Primary Brand Accent
    primary: '#E85D75',            // Rose — primary actions & active states
    primaryHover: '#D6465F',       // Rose hover/active
    primarySubtle: 'rgba(232, 93, 117, 0.1)', // Rose tint for pills & badges
    rose: '#E85D75',               // Legacy alias
    roseHover: '#D6465F',          // Legacy alias
    blush: '#FCE7ED',              // Legacy alias
    ivory: '#FFF9F2',              // Legacy alias

    // Typography
    textPrimary: '#25212A',        // Dark Slate — body text with optimal contrast
    textHeading: '#542838',        // Deep Burgundy — editorial serif/headings
    textMuted: '#733E53',          // Soft Burgundy Muted — secondary copy
    textMutedSubtle: '#8E6072',    // Subtle timestamps & helper labels
    burgundy: '#542838',           // Legacy alias
    burgundySoft: '#733E53',       // Legacy alias
    muted: '#733E53',              // Legacy alias
    white: '#FFFFFF',

    // Borders & Hairlines
    border: 'rgba(84, 40, 56, 0.08)',       // Subtle, elegant card outline
    borderHighlight: 'rgba(232, 93, 117, 0.25)', // Rose active border
    borderSubtle: 'rgba(84, 40, 56, 0.05)',

    // Semantic Status
    success: '#059669',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    error: '#DC2626',
    danger: '#DC2626',
    errorBg: '#FEF2F2'
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 999
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40
  },
  typography: {
    fontFamily: {
      sans: Platform.select({ ios: 'System', android: 'Roboto', default: 'sans-serif' }),
      serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' })
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 18,
      xl: 22,
      xxl: 28
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const
    }
  },
  shadows: {
    subtle: {
      shadowColor: '#542838',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2
    },
    card: {
      shadowColor: '#542838',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3
    },
    modal: {
      shadowColor: '#542838',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8
    }
  }
};
