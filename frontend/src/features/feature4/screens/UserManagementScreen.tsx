import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function UserManagementScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <SymbolView name="arrow.left" size={20} tintColor={BrandColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      {/* Filter Dropdown Simulator */}
      <TouchableOpacity style={styles.filterDropdown}>
        <SymbolView name="arrowtriangle.down.square.fill" size={16} tintColor="#64748B" style={styles.filterIcon} />
        <Text style={styles.filterText}>All Roles</Text>
      </TouchableOpacity>

      {/* User 1 */}
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Kavindu de Silva</Text>
          <Text style={styles.userRole}>Student</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.statusText, { color: '#166534' }]}>ACTIVE</Text>
        </View>
      </View>

      {/* User 2 */}
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Nimeshi Perera</Text>
          <Text style={styles.userRole}>Staff</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.statusText, { color: '#166534' }]}>ACTIVE</Text>
        </View>
      </View>

      {/* User 3 */}
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Dr. Anura Bandara</Text>
          <Text style={styles.userRole}>Admin</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.statusText, { color: '#166534' }]}>ACTIVE</Text>
        </View>
      </View>

      {/* User 4 */}
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Ishara Fernando</Text>
          <Text style={styles.userRole}>Student</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: BrandColors.danger }]}>DISABLED</Text>
        </View>
      </View>

      {/* User 5 */}
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Malith Costa</Text>
          <Text style={styles.userRole}>Guest</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.statusText, { color: '#166534' }]}>ACTIVE</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  filterIcon: {
    marginRight: Spacing.two,
  },
  filterText: {
    fontSize: 16,
    color: BrandColors.navy,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
