// src/lib/api.js
import axios from 'axios';
import * as SecureStore from '@/lib/secureStore';

// Set EXPO_PUBLIC_API_URL (in .env or the EAS build profile) to your API server, e.g. https://ojt-api.onrender.com/api
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
// The web app, used for the instruction pages
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:5173';

const api = axios.create({
  baseURL: API_BASE_URL,
  // The free server sleeps when idle and can take up to a minute to wake up.
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  },
});

let getTokenFromStore = null;
let onUnauthorized = null;

export const setTokenProvider = (fn) => {
  getTokenFromStore = fn;
};

/** Called when the server says the login is no longer valid (expired or revoked). */
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.request.use(
  async (config) => {
    const publicEndpoints = ['/login', '/register'];
    const isPublic = publicEndpoints.some((endpoint) =>
      config.url?.endsWith(endpoint)
    );

    if (!isPublic) {
      let token = await SecureStore.getItemAsync('accessToken');
      if (!token && getTokenFromStore) {
        token = getTokenFromStore();
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    // An expired login signs the user out, except while logging in or out.
    if (error.response?.status === 401 && !/\/(login|logout)$/.test(url) && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

/** A message to show the user for a failed request. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  const data = error.response?.data ?? error;
  const fromServer = data?.message || data?.error;
  if (typeof fromServer === 'string' && fromServer.trim()) return fromServer;
  if (error.code === 'ECONNABORTED') {
    return 'The server is taking too long to answer. Please try again.';
  }
  if (error.message === 'Network Error' || (error.request && !error.response)) {
    return "Can't reach the server. Check your internet connection and try again.";
  }
  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.';
  if (error instanceof Error && error.message && !/status code/i.test(error.message)) return error.message;
  return fallback;
}

export default api;
