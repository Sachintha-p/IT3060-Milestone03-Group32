/**
 * =====================================================================
 * Smart Library System — Design Tokens
 * =====================================================================
 */

import '@/global.css';
import { Platform } from 'react-native';

// ── Colors ────────────────────────────────────────────────────────────

export const Colors = {
  light: {
    text: '#132455',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#64748B',
    surface: '#F8FAFC', 
    border: '#E2E8F0',
    primary: '#F2732E',
    
    // Status colors
    statusAvailableBg: '#D1FAE5',
    statusAvailableText: '#065F46',
    statusAvailableBorder: '#34D399',
    statusOccupiedBg: '#FEE2E2',
    statusOccupiedText: '#DC2626',
    statusOccupiedBorder: '#F87171',
    statusReservedBg: '#FEF3C7',
    statusReservedText: '#D97706',
    statusReservedBorder: '#FBBF24',
    
    // UI elements
    cardBackground: '#ffffff',
    cardBorder: '#E2E8F0',
  },
  dark: {
    text: '#132455',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#64748B',
    surface: '#F8FAFC', 
    border: '#E2E8F0',
    primary: '#F2732E',
    
    statusAvailableBg: '#D1FAE5',
    statusAvailableText: '#065F46',
    statusAvailableBorder: '#34D399',
    statusOccupiedBg: '#FEE2E2',
    statusOccupiedText: '#DC2626',
    statusOccupiedBorder: '#F87171',
    statusReservedBg: '#FEF3C7',
    statusReservedText: '#D97706',
    statusReservedBorder: '#FBBF24',
    
    cardBackground: '#ffffff',
    cardBorder: '#E2E8F0',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const BrandColors = {
  primary: '#F2732E',
  primaryDark: '#132455',
  primaryLight: '#ffa070',
  navy: '#132455',
  orange: '#F2732E',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  link: '#3c87f7',
} as const;

// ── Typography ────────────────────────────────────────────────────────

export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: Platform.OS === 'ios' ? 'ui-monospace' : 'monospace',
  sans: 'normal',
  serif: 'serif',
  rounded: 'normal',
};

// ── Spacing Scale ─────────────────────────────────────────────────────

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  2: 2,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  64: 64,
} as const;

// ── Border Radius ─────────────────────────────────────────────────────

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ── Layout Constants ──────────────────────────────────────────────────

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
