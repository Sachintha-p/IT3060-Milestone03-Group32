import { Stack } from 'expo-router';

/**
 * Auth group layout — wraps login and register screens.
 * Uses a plain Stack with no visible header so each auth screen
 * controls its own appearance.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
