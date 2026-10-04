import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function ReminderConfirmedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
      <Text style={styles.headerTitle}>Reminder Set</Text>

      <View style={styles.content}>
        {/* Bell Icon Simulation (Using standard yellow/gold symbol) */}
        <View style={styles.iconContainer}>
          <SymbolView name="bell.fill" size={64} tintColor="#EAB308" />
        </View>

        <Text style={styles.title}>We'll let you know</Text>
        <Text style={styles.message}>
          You'll get a push alert the moment "Human Computer Interaction" is back on the shelf.
        </Text>

        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>View My Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.four,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: Spacing.six,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.six,
  },
  iconContainer: {
    marginBottom: Spacing.six,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: Spacing.three,
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  linkButton: {
    marginBottom: Spacing.six,
  },
  linkText: {
    color: BrandColors.orange,
    fontWeight: '700',
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: BrandColors.navy,
    fontSize: 16,
    fontWeight: '700',
  }
});
