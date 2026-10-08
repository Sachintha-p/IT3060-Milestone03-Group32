import { Stack } from 'expo-router';
import { Feature1Provider } from '@/features/feature1/context/Feature1Context';

export default function Feature1Layout() {
  return (
    <Feature1Provider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="filters" />
        <Stack.Screen name="reservation" />
        <Stack.Screen name="booking-confirmed" />
        <Stack.Screen name="check-in" />
        <Stack.Screen name="cancel" />
      </Stack>
    </Feature1Provider>
  );
}
