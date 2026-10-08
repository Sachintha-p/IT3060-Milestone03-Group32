import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { Colors, BrandColors, Spacing, Radius, FontSizes, FontWeights } from '@/constants/theme';
import { router } from 'expo-router';

export default function CreateAccountScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ name?: string, email?: string, password?: string }>({});

  const validate = () => {
    const errors: { name?: string, email?: string, password?: string } = {};
    if (!name.trim()) {
      errors.name = 'Full Name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email / Student ID is required';
    } else if (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register(name, email, password);
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
          Create Account
        </ThemedText>

        {/* Logo block */}
        <View style={styles.logoContainer}>
          <Ionicons name="library" size={44} color="#FFF" />
        </View>

        <ThemedText style={styles.headerSubtitle}>
          Join the SLIIT Library System
        </ThemedText>

        {/* Error message */}
        {error ? (
          <ThemedText style={styles.globalError}>{error}</ThemedText>
        ) : null}

        {/* Inputs */}
        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, validationErrors.name ? styles.inputErrorBorder : null]}>
            <Ionicons
              name="person"
              size={20}
              color={Colors.light.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.light.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (validationErrors.name) setValidationErrors({ ...validationErrors, name: undefined });
              }}
              editable={!loading}
            />
          </View>
          {validationErrors.name ? <Text style={styles.fieldError}>{validationErrors.name}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, validationErrors.email ? styles.inputErrorBorder : null]}>
            <Ionicons
              name="mail"
              size={20}
              color={Colors.light.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email or Student ID"
              placeholderTextColor={Colors.light.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (validationErrors.email) setValidationErrors({ ...validationErrors, email: undefined });
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>
          {validationErrors.email ? <Text style={styles.fieldError}>{validationErrors.email}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, validationErrors.password ? styles.inputErrorBorder : null]}>
            <Ionicons
              name="lock-closed"
              size={20}
              color={Colors.light.textSecondary}
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

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Back Link */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

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
    marginBottom: Spacing.four,
    borderBottomWidth: 4,
    borderBottomColor: BrandColors.orange,
    shadowColor: BrandColors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: FontSizes.base,
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: Spacing.five,
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

  // ---------- Register button ----------
  registerButton: {
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
  buttonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.6,
  },

  // ---------- Back link ----------
  backButton: {
    marginTop: Spacing.four,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  backText: {
    color: '#64748B',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});