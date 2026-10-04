import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppIcon } from '../icons';
import { Colors, Spacing, FontSizes, Fonts } from '@/constants/theme';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightLabel?: string;
  onRightPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack, rightLabel, onRightPress }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={[styles.title, !showBack && styles.titleLeft]}>{title}</Text>
      
      {rightLabel ? (
        <TouchableOpacity 
          style={styles.rightButton} 
          onPress={onRightPress}
          accessibilityRole="button"
          accessibilityLabel={rightLabel}
        >
          <AppIcon name="person" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.rightText}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[16],
    paddingVertical: Spacing[16],
    backgroundColor: Colors.light.background,
  },
  backButton: {
    padding: Spacing[4],
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xl,
    color: Colors.light.text,
  },
  titleLeft: {
    textAlign: 'left',
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  rightText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.light.textSecondary,
  },
  placeholder: {
    width: 40,
  },
});
