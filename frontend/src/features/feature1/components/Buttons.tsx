import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius, Spacing, FontSizes, Fonts } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ title, onPress, disabled, loading, style }) => (
  <TouchableOpacity
    style={[styles.primary, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    {loading ? (
      <ActivityIndicator color={Colors.light.background} />
    ) : (
      <Text style={styles.primaryText}>{title}</Text>
    )}
  </TouchableOpacity>
);

export const SecondaryButton: React.FC<ButtonProps> = ({ title, onPress, disabled, loading, style }) => (
  <TouchableOpacity
    style={[styles.secondary, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    {loading ? (
      <ActivityIndicator color={Colors.light.text} />
    ) : (
      <Text style={styles.secondaryText}>{title}</Text>
    )}
  </TouchableOpacity>
);

export const DangerButton: React.FC<ButtonProps> = ({ title, onPress, disabled, loading, style }) => (
  <TouchableOpacity
    style={[styles.danger, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    {loading ? (
      <ActivityIndicator color={Colors.light.statusOccupiedText} />
    ) : (
      <Text style={styles.dangerText}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing[16],
    paddingHorizontal: Spacing[24],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryText: {
    color: Colors.light.background,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
  },
  secondary: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing[16],
    paddingHorizontal: Spacing[24],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryText: {
    color: Colors.light.text,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
  },
  danger: {
    backgroundColor: Colors.light.statusOccupiedBg,
    paddingVertical: Spacing[16],
    paddingHorizontal: Spacing[24],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dangerText: {
    color: Colors.light.statusOccupiedText,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
  },
  disabled: {
    opacity: 0.5,
  },
});
