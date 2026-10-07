import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Login screen — calls POST /api/auth/login via AuthContext. */
export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    // Basic client-side validation
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password)     { setError('Password is required'); return; }

    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Navigation to (tabs) is handled by RootNavigator in _layout.tsx
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>Smart Library</ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
              Sign in to your account
            </ThemedText>
          </ThemedView>

          {/* Form */}
          <ThemedView style={styles.form}>
            {/* Error message */}
            {error && (
              <ThemedView style={styles.errorBox}>
                <ThemedText type="small" style={styles.errorText}>{error}</ThemedText>
              </ThemedView>
            )}

            <ThemedText type="small" style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.backgroundElement }]}
              placeholder="you@example.com"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              testID="login-email"
            />

            <ThemedText type="small" style={styles.label}>Password</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.backgroundElement }]}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              testID="login-password"
            />

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleLogin}
              disabled={loading}
              testID="login-submit">
              {loading
                ? <ActivityIndicator color="#ffffff" />
                : <ThemedText type="smallBold" style={styles.buttonText}>Sign In</ThemedText>}
            </Pressable>
          </ThemedView>

          {/* Footer link */}
          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">Don't have an account? </ThemedText>
            <Link href={'/(auth)/register' as Href}>
              <ThemedText type="small" style={styles.link}>Register</ThemedText>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.two,
  },
  label: {
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
  button: {
    backgroundColor: Colors.light.text,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  errorText: {
    color: '#DC2626',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: '#3c87f7',
  },
});
