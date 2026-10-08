import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { feature4, UserSummary, CreateUserRequest, handleError } from '@/features/feature4/api';
import ConfirmModal from '../components/ConfirmModal';
import InlineMessage from '../components/InlineMessage';
import { useAuth } from '@/context/AuthContext';

export default function UserManagementScreen() {
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [screenError, setScreenError] = useState('');

  // Add User Modal state
  const [addUserVisible, setAddUserVisible] = useState(false);
  const [addForm, setAddForm] = useState<CreateUserRequest>({ name: '', email: '', role: 'STUDENT', password: '' });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Per-user Confirm Modal states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  
  // Role Modal
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<UserSummary | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setScreenError('');
      const data = await feature4.users.getAll(debouncedSearch, roleFilter, statusFilter);
      setUsers(data);
    } catch (err) {
      setScreenError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleAddUser = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      setAddError('Name, email and password are required');
      return;
    }
    setAddError('');
    setIsAdding(true);
    try {
      await feature4.users.create(addForm);
      setAddUserVisible(false);
      setAddForm({ name: '', email: '', role: 'STUDENT', password: '' });
      fetchUsers();
    } catch (err) {
      setAddError(handleError(err));
    } finally {
      setIsAdding(false);
    }
  };

  const promptAction = (title: string, message: string, action: () => Promise<void>) => {
    setConfirmTitle(title);
    setConfirmMsg(message);
    setConfirmAction(() => async () => {
      setConfirmModalVisible(false);
      setScreenError('');
      try {
        await action();
      } catch (err) {
        setScreenError(handleError(err));
      }
    });
    setConfirmModalVisible(true);
  };

  const handleToggleStatus = (user: UserSummary) => {
    const isSuspending = user.status === 'ACTIVE';
    const nextStatus = isSuspending ? 'SUSPENDED' : 'ACTIVE';
    promptAction(
      isSuspending ? 'Suspend User' : 'Activate User',
      `Are you sure you want to ${isSuspending ? 'suspend' : 'activate'} ${user.name}?`,
      async () => {
        await feature4.users.updateStatus(user.id, nextStatus);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      }
    );
  };

  const handleDelete = (user: UserSummary) => {
    promptAction(
      'Delete User',
      `Are you sure you want to completely delete ${user.name}?`,
      async () => {
        await feature4.users.delete(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
      }
    );
  };

  const handleChangeRole = async (newRole: string) => {
    if (!userToChangeRole) return;
    setRoleModalVisible(false);
    setScreenError('');
    try {
      await feature4.users.updateRole(userToChangeRole.id, newRole);
      setUsers(prev => prev.map(u => u.id === userToChangeRole.id ? { ...u, role: newRole } : u));
    } catch (err) {
      setScreenError(handleError(err));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.orange} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>User Management</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddUserVisible(true)}>
            <SymbolView name="plus" size={16} tintColor="#FFF" />
            <Text style={styles.addBtnText}>Add User</Text>
          </TouchableOpacity>
        </View>

        <InlineMessage type="error" message={screenError} />

        <View style={styles.searchContainer}>
          <SymbolView name="magnifyingglass" size={16} tintColor="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.filterLabel}>Filter by Role</Text>
        <View style={styles.chipsContainer}>
          {['ALL', 'STUDENT', 'STAFF', 'ADMIN'].map(r => (
            <TouchableOpacity 
              key={r} 
              style={[styles.chip, roleFilter === r && styles.chipActive]}
              onPress={() => setRoleFilter(r)}
            >
              <Text style={[styles.chipText, roleFilter === r && styles.chipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Filter by Status</Text>
        <View style={styles.chipsContainer}>
          {['ALL', 'ACTIVE', 'SUSPENDED'].map(s => (
            <TouchableOpacity 
              key={s} 
              style={[styles.chip, statusFilter === s && styles.chipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={BrandColors.orange} style={{ marginTop: 20 }} />
        ) : screenError && users.length === 0 ? (
          <TouchableOpacity style={styles.retryBtn} onPress={fetchUsers}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        ) : users.length === 0 ? (
          <Text style={styles.emptyText}>No users found.</Text>
        ) : (
          users.map(user => {
            const isSelf = user.email === currentUser?.email;
            return (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  
                  <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                    <View style={styles.rolePill}>
                      <Text style={styles.rolePillText}>{user.role}</Text>
                    </View>
                    <View style={[styles.statusPill, user.status === 'ACTIVE' ? styles.statusActive : styles.statusSuspended]}>
                      <Text style={[styles.statusPillText, user.status === 'ACTIVE' ? styles.textActive : styles.textSuspended]}>{user.status}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.actionsColumn}>
                  {isSelf ? (
                    <Text style={styles.selfNote}>Current User</Text>
                  ) : (
                    <>
                      <TouchableOpacity onPress={() => { setUserToChangeRole(user); setRoleModalVisible(true); }} style={styles.actionLink}>
                        <Text style={styles.actionLinkText}>Change Role</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleToggleStatus(user)} style={styles.actionLink}>
                        <Text style={styles.actionLinkText}>{user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(user)} style={styles.actionLink}>
                        <Text style={styles.actionLinkTextDanger}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add User Modal */}
      <Modal visible={addUserVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New User</Text>
            
            <InlineMessage type="error" message={addError} />

            <TextInput style={styles.modalInput} placeholder="Full Name" value={addForm.name} onChangeText={(t) => setAddForm({ ...addForm, name: t })} />
            <TextInput style={styles.modalInput} placeholder="Email" value={addForm.email} onChangeText={(t) => setAddForm({ ...addForm, email: t })} keyboardType="email-address" />
            <TextInput style={styles.modalInput} placeholder="Temporary Password" value={addForm.password} onChangeText={(t) => setAddForm({ ...addForm, password: t })} secureTextEntry />
            
            <View style={styles.chipsContainer}>
              {['STUDENT', 'STAFF', 'ADMIN'].map(r => (
                <TouchableOpacity key={r} style={[styles.chip, addForm.role === r && styles.chipActive]} onPress={() => setAddForm({ ...addForm, role: r })}>
                  <Text style={[styles.chipText, addForm.role === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setAddUserVisible(false); setAddError(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={handleAddUser} disabled={isAdding}>
                {isAdding ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalSubmitText}>Create User</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Role Options Modal */}
      <Modal visible={roleModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Role for {userToChangeRole?.name}</Text>
            <View style={{ marginTop: 12, gap: 12 }}>
              {['STUDENT', 'STAFF', 'ADMIN'].map(r => (
                <TouchableOpacity key={r} style={styles.roleSelectBtn} onPress={() => handleChangeRole(r)}>
                  <Text style={styles.roleSelectText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.modalCancel, { marginTop: 24, alignSelf: 'flex-end' }]} onPress={() => setRoleModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmModalVisible}
        title={confirmTitle}
        message={confirmMsg}
        onConfirm={() => confirmAction?.()}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: BrandColors.orange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    height: 48,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.two,
    fontSize: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.three,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: BrandColors.orange,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: BrandColors.orange,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: Spacing.six,
  },
  retryBtn: {
    alignSelf: 'center',
    padding: Spacing.three,
    backgroundColor: '#E2E8F0',
    borderRadius: Radius.md,
    marginTop: Spacing.three,
  },
  retryText: {
    color: BrandColors.navy,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusSuspended: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textActive: {
    color: '#166534',
  },
  textSuspended: {
    color: '#991B1B',
  },
  actionsColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
  },
  actionLink: {
  },
  actionLinkText: {
    fontSize: 14,
    color: BrandColors.navy,
    fontWeight: '600',
  },
  actionLinkTextDanger: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  selfNote: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: Radius.lg,
    padding: Spacing.five,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: Spacing.four,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 16,
    marginBottom: Spacing.three,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.four,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  modalCancelText: {
    color: '#64748B',
    fontWeight: '600',
  },
  modalSubmit: {
    backgroundColor: BrandColors.orange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  modalSubmitText: {
    color: '#FFF',
    fontWeight: '700',
  },
  roleSelectBtn: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  roleSelectText: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.navy,
  }
});
