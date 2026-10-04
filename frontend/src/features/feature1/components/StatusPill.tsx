import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSizes, Fonts, Radius } from '@/constants/theme';

interface StatusPillProps {
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: Colors.light.statusAvailableBg,
          text: Colors.light.statusAvailableText,
        };
      case 'OCCUPIED':
        return {
          bg: Colors.light.statusOccupiedBg,
          text: Colors.light.statusOccupiedText,
        };
      case 'RESERVED':
        return {
          bg: Colors.light.statusReservedBg,
          text: Colors.light.statusReservedText,
        };
      default:
        return {
          bg: Colors.light.surface,
          text: Colors.light.textSecondary,
        };
    }
  };

  const { bg, text } = getStyle();

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[4],
    borderRadius: Radius.lg,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
  },
});
