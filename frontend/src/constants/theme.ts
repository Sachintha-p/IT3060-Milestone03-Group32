/**
 * =====================================================================
 * Smart Library System — Design Tokens
 * =====================================================================
 * All colors, spacing, typography, and layout constants live here.
 * To retheme the app:
 *   1. Update Colors.light / Colors.dark.
 *   2. Update FontSizes / FontWeights.
 *   3. Everything using these tokens updates automatically.
 * =====================================================================
 */

import '@/global.css';

import { Platform } from 'react-native';

// ── Colors ────────────────────────────────────────────────────────────

export const Colors = {
  light: {
    /** Primary text */
    text: '#000000',
    /** Page / screen background */
    background: '#ffffff',
    /** Card / input background */
    backgroundElement: '#F0F0F3',
    /** Selected / active element background */
    backgroundSelected: '#E0E1E6',
    /** Secondary / hint text */
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ── Brand / Accent Colors ─────────────────────────────────────────────

export const BrandColors = {
  primary: '#208AEF',       // main brand blue (splash, buttons)
  primaryDark: '#0274DF',   // darker shade for pressed states
  primaryLight: '#3C9FFE',  // lighter shade for gradients
  danger: '#DC2626',        // red for errors and logout
  success: '#16A34A',       // green for success states
  warning: '#D97706',       // amber for warnings
  link: '#3c87f7',          // hyperlink blue
} as const;

// ── Typography ────────────────────────────────────────────────────────

export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 20,
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

/** Platform-specific font families. */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// ── Spacing Scale ─────────────────────────────────────────────────────
// Base unit is 4 px. Use these tokens instead of raw numbers.

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ── Border Radius ─────────────────────────────────────────────────────

export const Radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ── Layout Constants ──────────────────────────────────────────────────

/** Extra bottom padding so content clears the native tab bar. */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** Maximum width for content on wide screens (tablets / web). */
export const MaxContentWidth = 800;
