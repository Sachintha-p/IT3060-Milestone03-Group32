import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Slot } from 'expo-router';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { router, type Href } from 'expo-router';

SplashScreen.preventAutoHideAsync();

/**
 * Inner navigator — runs after AuthProvider has resolved the token.
 * Redirects to (auth)/login or (tabs) depending on auth state.
 */
function RootNavigator() {
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
      if (token) {
        router.replace('/(tabs)' as Href);
      } else {
        router.replace('/(auth)/login' as Href);
      }
    }
  }, [token, loading]);

  return <Slot />;
}

/** Root layout — wraps the whole app in AuthProvider and the theme. */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
