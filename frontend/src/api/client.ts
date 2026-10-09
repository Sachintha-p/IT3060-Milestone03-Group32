import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Platform } from 'react-native';

/**
 * Axios client pre-configured for the Smart Library backend.
 */

// ── UPDATE: Oyage Wi-Fi IP Address eka methanata damma ──
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://it3060-milestone03-group32-production.up.railway.app';

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