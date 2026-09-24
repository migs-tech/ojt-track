
// src/store/useAuthStore.js
import * as SecureStore from 'expo-secure-store';
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
import { setTokenProvider } from '@/lib/api';

export const useAuth = create((set) => ({
  user: null,
  token: null,
  role: null,
  loading: false,
  profile: null,
  setUser: (user) => set({ user }),

  login: async (username, password) => {
    set({ loading: true });
    try {
      const credentials = { username, password };
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
      console.error('Login error:', error);
      set({ loading: false });
      return Promise.reject(error);
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
      return Promise.reject(error);
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
    set({ token: null, user: null, role: null, loading: false });
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
          loading: false
        });
      } else {
        set({ token: null, user: null, role: null, loading: false });
      }
    } catch (error) {
      set({ token: null, user: null, role: null, loading: false });
      Alert.alert('Error', 'Failed to load login state.');
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
      set({ loading: false });
      return Promise.reject(error);
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
      return Promise.reject(error);
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
      return Promise.reject(error);
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
      return Promise.reject(error);
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
