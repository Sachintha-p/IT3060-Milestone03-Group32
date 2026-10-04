import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandColors, Spacing, Radius, FontSizes, FontWeights } from '@/constants/theme';
import { SymbolView } from 'expo-symbols';
import { TextInput } from 'react-native';

export default function LoginScreen() {
  const { login, loginAsGuest } = useAuth();
  const [portal, setPortal] = useState<'STUDENT' | 'STAFF_ADMIN'>('STUDENT');
  const [staffRole, setStaffRole] = useState<'LIBRARY_STAFF' | 'ADMIN'>('ADMIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ identifier?: string, password?: string }>({});

  const isStudent = portal === 'STUDENT';

  const validate = () => {
    const errors: { identifier?: string, password?: string } = {};
    if (!identifier.trim()) {
      errors.identifier = isStudent ? 'Student ID / Email is required' : 'Staff Email is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(identifier, password, portal);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      await loginAsGuest();
    } catch (err: any) {
      setError('Could not continue as guest');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

        {/* Header Title */}
        <ThemedText style={styles.headerTitle} type="subtitle">
          SLIIT Library System
        </ThemedText>

        {/* Logo block */}
        <View style={styles.logoContainer}>
          <SymbolView name="building.columns.fill" size={32} tintColor="#FFF" style={styles.logoIcon} />
        </View>

        {/* Selector */}
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={[styles.selectorTab, isStudent && styles.selectorTabActive]}
            onPress={() => { setPortal('STUDENT'); setError(''); setValidationErrors({}); }}
            disabled={loading}
          >
            <Text style={[styles.selectorText, isStudent && styles.selectorTextActive]}>
              Student Portal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectorTab, !isStudent && styles.selectorTabActive]}
            onPress={() => { setPortal('STAFF_ADMIN'); setError(''); setValidationErrors({}); }}
            disabled={loading}
          >
            <Text style={[styles.selectorText, !isStudent && styles.selectorTextActive]}>
              Staff / Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {error ? (
          <ThemedText style={styles.globalError}>{error}</ThemedText>
        ) : null}

        {/* Role Selection for Staff / Admin */}
        {!isStudent && (
          <View style={styles.roleSelectionContainer}>
            <TouchableOpacity 
              style={[styles.roleCard, staffRole === 'LIBRARY_STAFF' && styles.roleCardActive]} 
              onPress={() => setStaffRole('LIBRARY_STAFF')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleCardText, staffRole === 'LIBRARY_STAFF' && styles.roleCardTextActive]}>Library Staff</Text>
              {staffRole === 'LIBRARY_STAFF' && <View style={styles.roleDot} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.roleCard, staffRole === 'ADMIN' && styles.roleCardActive]} 
              onPress={() => setStaffRole('ADMIN')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleCardText, staffRole === 'ADMIN' && styles.roleCardTextActive]}>Administrator</Text>
              {staffRole === 'ADMIN' && <View style={styles.roleDot} />}
            </TouchableOpacity>
          </View>
        )}

        {/* Inputs */}
        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, validationErrors.identifier ? styles.inputErrorBorder : null]}>
            <SymbolView
              name={isStudent ? "graduationcap.fill" : "person.fill"}
              size={18}
              tintColor={isStudent ? Colors.light.textSecondary : "#60A5FA"}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={isStudent ? "Student ID / Email" : "Staff / Admin email"}
              placeholderTextColor={Colors.light.textSecondary}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (validationErrors.identifier) setValidationErrors({ ...validationErrors, identifier: undefined });
              }}
              autoCapitalize="none"
              keyboardType={isStudent ? "default" : "email-address"}
              editable={!loading}
            />
          </View>
          {validationErrors.identifier ? <Text style={styles.fieldError}>{validationErrors.identifier}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, validationErrors.password ? styles.inputErrorBorder : null]}>
            <SymbolView
              name="lock.fill"
              size={18}
              tintColor={isStudent ? Colors.light.textSecondary : "#F59E0B"}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.light.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (validationErrors.password) setValidationErrors({ ...validationErrors, password: undefined });
              }}
              secureTextEntry
              editable={!loading}
            />
          </View>
          {validationErrors.password ? <Text style={styles.fieldError}>{validationErrors.password}</Text> : null}
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Guest Link */}
        {isStudent ? (
          <TouchableOpacity style={styles.guestButton} onPress={handleGuest} disabled={loading}>
            <Text style={styles.guestText}>Continue as Guest →</Text>
          </TouchableOpacity>
        ) : null}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: 80, // rough match for safe area / top layout
  },
  headerTitle: {
    color: BrandColors.navy,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
    marginBottom: Spacing.three,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: BrandColors.navy,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  logoIcon: {
    // some shadow or tweak if needed
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 6,
    marginBottom: Spacing.four,
  },
  selectorTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  selectorTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectorText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
  selectorTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  globalError: {
    color: BrandColors.danger,
    marginBottom: Spacing.three,
    textAlign: 'center',
    fontSize: FontSizes.sm,
  },
  roleSelectionContainer: {
    marginBottom: 4,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 48,
    marginBottom: Spacing.three,
  },
  roleCardActive: {
    backgroundColor: '#FFF7ED', // light orange
    borderColor: BrandColors.orange,
  },
  roleCardText: {
    fontSize: FontSizes.base,
    color: '#64748B',
  },
  roleCardTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  roleDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: BrandColors.orange,
  },
  inputWrapper: {
    marginBottom: Spacing.three,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC', 
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputErrorBorder: {
    borderColor: BrandColors.danger,
  },
  inputIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.light.text,
  },
  fieldError: {
    color: BrandColors.danger,
    fontSize: FontSizes.xs,
    marginTop: 4,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: BrandColors.orange,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  guestButton: {
    marginTop: Spacing.four,
    alignItems: 'center',
    padding: Spacing.two,
  },
  guestText: {
    color: Colors.light.textSecondary,
    fontSize: FontSizes.sm,
  }
});
