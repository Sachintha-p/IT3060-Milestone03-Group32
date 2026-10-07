import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Home screen (placeholder).
 * Replace this content with the actual home design from the Milestone 02 prototype.
 */
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as Href);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Welcome, {user?.name ?? 'User'}!</ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.role}>
          Role: {user?.role ?? '—'}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            🚧 This is a placeholder home screen.{'\n'}
            Replace with the actual UI from the Milestone 02 prototype.
          </ThemedText>
        </ThemedView>

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          onPress={handleLogout}
          testID="home-logout">
          <ThemedText type="smallBold" style={styles.logoutText}>Log Out</ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  role: {
    marginTop: -Spacing.two,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  logoutButton: {
    marginTop: 'auto',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  logoutText: {
    color: '#DC2626',
  },
  pressed: {
    opacity: 0.7,
  },
});
