
// src/store/useAuthStore.js
import * as SecureStore from '@/lib/secureStore';
import { Alert } from 'react-native';
import { create } from 'zustand';
import {
  login,
  register,
  changePasswordApi,
  updateUserProfileApi,
  getUserProfileApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi
} from '@/api/authApi';
import Toast from 'react-native-toast-message';
import api, { setTokenProvider, setUnauthorizedHandler, errorMessage } from '@/lib/api';

export const useAuth = create((set) => ({
  user: null,
  token: null,
  role: null,
  loading: false,
  // false until the saved login has been read, so the app doesn't flash the login screen
  ready: false,
  profile: null,

  login: async (username, password) => {
    set({ loading: true });
    try {
      // "client" tells the server this is the app (staff accounts use the website).
      const credentials = { username: username.trim(), password, client: 'app' };
      const response = await login(credentials);
      if (response.success && response.user && response.token) {
        const { user, token } = response;
        set({ user, role: user.role, token, loading: false });
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        await SecureStore.setItemAsync('accessToken', token);
      } else {
        throw new Error(response?.message || 'Invalid login response.');
      }
    } catch (error) {
      set({ loading: false });
      return Promise.reject(new Error(errorMessage(error, 'Sign-in failed. Please try again.')));
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const response = await register(data);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      return { success: false, message: errorMessage(error, 'Registration failed. Please try again.') };
    }
  },

  logout: async () => {
    // Revoke the token on the server too, so it can't be reused.
    try {
      await api.post('/user/logout');
    } catch (e) {
      // Already expired or offline: clearing the local session is enough.
    }
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
    set({ token: null, user: null, role: null, profile: null, loading: false });
  },

  // The server rejected the saved login (expired or revoked): sign out locally.
  sessionExpired: async () => {
    if (!useAuth.getState().token) return;
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
    set({ token: null, user: null, role: null, profile: null, loading: false });
    Toast.show({
      type: 'infoCheck',
      text1: 'Signed out',
      text2: 'Your session expired. Please sign in again.',
      position: 'top',
    });
  },

  checkLogin: async () => {
    set({ loading: true });
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        const userStr = await SecureStore.getItemAsync('user');
        const user = userStr ? JSON.parse(userStr) : null;
        set({
          token,
          user,
          role: user?.role || null,
          loading: false,
          ready: true,
        });
      } else {
        set({ token: null, user: null, role: null, loading: false, ready: true });
      }
    } catch (error) {
      set({ token: null, user: null, role: null, loading: false, ready: true });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true });
    try {
      const passwordData = { currentPassword, newPassword };
      const response = await changePasswordApi(passwordData);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to change password.'
      );
      throw error;
    }
  },

  updateUserProfile: async (profileData) => {
    set({ loading: true });
    try {
      const response = await updateUserProfileApi(profileData);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      return Promise.reject(error);
    }
  },

  getUserProfile: async () => {
    set({ loading: true });
    try {
      const response = await getUserProfileApi();
      set({ loading: false, profile: response.data });
      return response.data;
    } catch (error) {
      // Offline or signed out: keep the last profile instead of crashing the screen
      set({ loading: false });
      return null;
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true });
    try {
      const response = await forgotPasswordApi(email);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      return { success: false, message: errorMessage(error, 'Couldn\'t send the code. Please try again.') };
    }
  },

  verifyOtp: async (data) => {
    set({ loading: true });
    try {
      const response = await verifyOtpApi(data);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      return { success: false, message: errorMessage(error, 'Couldn\'t check the code. Please try again.') };
    }
  },  
  
  resetPassword: async (resetData) => {
    set({ loading: true });
    try {
      const response = await resetPasswordApi(resetData);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      return { success: false, message: errorMessage(error, 'Couldn\'t reset the password. Please try again.') };
    }
  },

  setUser: async (user) => {
    set({ user });
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(user));
    } catch (e) {
      console.error("Failed to persist user:", e);
    }
  },

}));

setTokenProvider(() => useAuth.getState().token);
setUnauthorizedHandler(() => useAuth.getState().sessionExpired());
