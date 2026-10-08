import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Radius, Spacing } from '@/constants/theme';

interface InlineMessageProps {
  type: 'error' | 'success';
  message: string;
}

export default function InlineMessage({ type, message }: InlineMessageProps) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <View style={[styles.container, isError ? styles.errorBg : styles.successBg]}>
      <Text style={[styles.text, isError ? styles.errorText : styles.successText]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginBottom: Spacing.four,
  },
  errorBg: {
    backgroundColor: '#FEE2E2',
  },
  successBg: {
    backgroundColor: '#DCFCE7',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#991B1B',
  },
  successText: {
    color: '#166534',
  }
});
