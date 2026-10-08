import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { Colors, BrandColors, Spacing, Radius, FontSizes, FontWeights } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [portal, setPortal] = useState<'STUDENT' | 'STAFF_ADMIN'>('STUDENT');
  const [staffRole, setStaffRole] = useState<'LIBRARY_STAFF' | 'ADMIN'>('ADMIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleCreateAccount = () => {
    router.push('/register'); // change to your create-user screen route
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
          <Ionicons name="library" size={44} color="#FFF" />
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
            <Ionicons
              name={isStudent ? "school" : "person"}
              size={20}
              color={isStudent ? Colors.light.textSecondary : "#60A5FA"}
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
            <Ionicons
              name="lock-closed"
              size={20}
              color={isStudent ? Colors.light.textSecondary : "#F59E0B"}
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
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
          {validationErrors.password ? <Text style={styles.fieldError}>{validationErrors.password}</Text> : null}
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Create Account (students only) */}
        {isStudent ? (
          <View style={styles.createRow}>
            <Text style={styles.createText}>New to the library?</Text>
            <TouchableOpacity onPress={handleCreateAccount} disabled={loading} activeOpacity={0.7}>
              <Text style={styles.createLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: 60,
    paddingBottom: 48,
  },

  // ---------- Header ----------
  headerTitle: {
    alignSelf: 'stretch',
    textAlign: 'center',
    color: BrandColors.navy,
    fontWeight: FontWeights.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.3,
    marginBottom: Spacing.four,
  },
  logoContainer: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    backgroundColor: BrandColors.navy,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.five,
    borderBottomWidth: 4,
    borderBottomColor: BrandColors.orange,
    shadowColor: BrandColors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },

  // ---------- Portal selector ----------
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 5,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectorTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectorTabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: FontSizes.sm,
    letterSpacing: 0.2,
  },
  selectorTextActive: {
    color: BrandColors.navy,
    fontWeight: '700',
  },

  // ---------- Errors ----------
  globalError: {
    color: BrandColors.danger,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.danger,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    overflow: 'hidden',
  },

  // ---------- Staff role cards ----------
  roleSelectionContainer: {
    marginBottom: 4,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 54,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  roleCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: BrandColors.orange,
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  roleCardText: {
    fontSize: FontSizes.base,
    color: '#64748B',
    fontWeight: '500',
  },
  roleCardTextActive: {
    color: BrandColors.navy,
    fontWeight: '700',
  },
  roleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BrandColors.orange,
    borderWidth: 3,
    borderColor: '#FFF7ED',
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },

  // ---------- Inputs ----------
  inputWrapper: {
    marginBottom: Spacing.three,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputErrorBorder: {
    borderColor: BrandColors.danger,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.light.text,
    height: '100%',
    paddingVertical: 0,
  },
  fieldError: {
    color: BrandColors.danger,
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 6,
  },

  // ---------- Sign in button ----------
  loginButton: {
    backgroundColor: BrandColors.orange,
    height: 54,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.6,
  },

  // ---------- Create account ----------
  createRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  createText: {
    color: '#64748B',
    fontSize: FontSizes.sm,
    marginRight: 6,
  },
  createLink: {
    color: BrandColors.orange,
    fontSize: FontSizes.sm,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});