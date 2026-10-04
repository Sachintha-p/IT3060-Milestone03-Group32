import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BrandColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function BooksScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="book-outline" size={64} color={BrandColors.primary} style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Books</Text>
      <Text style={styles.subtitle}>This feature is coming in a future update.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.light.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.light.textSecondary, textAlign: 'center' }
});
