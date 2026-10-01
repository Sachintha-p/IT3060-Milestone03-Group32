import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Axios client pre-configured for the Smart Library backend.
 *
 * BASE_URL is set in .env (or .env.local):
 *   EXPO_PUBLIC_API_URL=http://10.0.2.2:8080   (Android emulator)
 *   EXPO_PUBLIC_API_URL=http://<your-ip>:8080   (physical device on same Wi-Fi)
 *
 * The request interceptor automatically attaches the JWT stored in AsyncStorage.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
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
  (error) => {
    // Relay the backend ApiError message when available
    const message =
      error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
