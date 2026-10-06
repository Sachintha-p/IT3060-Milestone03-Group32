import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

/**
 * Axios client pre-configured for the Smart Library backend.
 *
 * BASE_URL is set in .env (or .env.local):
 *   EXPO_PUBLIC_API_URL=http://10.0.2.2:8080   (Android emulator)
 *   EXPO_PUBLIC_API_URL=http://<your-ip>:8080   (physical device on same Wi-Fi)
 *
 * The request interceptor automatically attaches the JWT stored in AsyncStorage.
 */

import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 20 seconds
});

// ── Request interceptor: attach JWT ──────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: unwrap errors ──────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new Error('Server is waking up, please try again'));
    }
    
    if (error.response?.status === 401 && !error.config?.url?.includes('/api/auth/')) {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            await AsyncStorage.multiRemove(['auth_token', 'auth_user', 'auth_guest']);
            router.replace('/(auth)/login');
            return Promise.reject(new Error('Your session has expired. Please log in again.'));
        }
    }

    // Relay the backend ApiError message when available
    const message =
      error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
