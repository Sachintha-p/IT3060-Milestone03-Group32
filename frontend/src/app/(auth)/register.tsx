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

/** Register screen — calls POST /api/auth/register via AuthContext. */
export default function RegisterScreen() {
  const { register } = useAuth();
  const theme = useTheme();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!name.trim())    { setError('Name is required'); return; }
    if (!email.trim())   { setError('Email is required'); return; }
    if (!password)       { setError('Password is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setError(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      // Navigation to (tabs) is handled by RootNavigator
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
              Join the Smart Library
            </ThemedText>
          </ThemedView>

          {/* Form */}
          <ThemedView style={styles.form}>
            {error && (
              <ThemedView style={styles.errorBox}>
                <ThemedText type="small" style={styles.errorText}>{error}</ThemedText>
              </ThemedView>
            )}

            <ThemedText type="small" style={styles.label}>Full Name</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.backgroundElement }]}
              placeholder="John Doe"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              testID="register-name"
            />

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
              testID="register-email"
            />

            <ThemedText type="small" style={styles.label}>Password</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.backgroundElement }]}
              placeholder="Min. 6 characters"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              testID="register-password"
            />

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleRegister}
              disabled={loading}
              testID="register-submit">
              {loading
                ? <ActivityIndicator color="#ffffff" />
                : <ThemedText type="smallBold" style={styles.buttonText}>Create Account</ThemedText>}
            </Pressable>
          </ThemedView>

          {/* Footer link */}
          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">Already have an account? </ThemedText>
            <Link href={'/(auth)/login' as Href}>
              <ThemedText type="small" style={styles.link}>Sign In</ThemedText>
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
