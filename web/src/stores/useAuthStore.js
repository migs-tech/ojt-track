// src/stores/auth.js
import { defineStore } from "pinia";
import api from '@/api/api.js';
import CryptoJS from 'crypto-js';

const SECRET_KEY = '4f3c1b2a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a'; // replace with a strong secret
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function setEncryptedToken(key, token, expireInMs = TOKEN_EXPIRY_MS) {
  const data = {
    value: token,
    expiry: new Date().getTime() + expireInMs
  };
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  localStorage.setItem(key, encrypted);
}

function getEncryptedToken(key) {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    if (new Date().getTime() > data.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return data.value;
  } catch (e) {
    console.error("Failed to decrypt token:", e);
    localStorage.removeItem(key);
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: getEncryptedToken("token") || null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const response = await api.post("/user/login", credentials);
        console.log("Login response:", response.data);

        // Check role and status
        if ([1, 2].includes(response.data.user.role)) {
          return { success: false, message: "Access denied: your role is not allowed to log in." };
        } else if (response.data.user.status !== 1) {
          return { success: false, message: "Account inactive: please contact support." };
        }

        const { user, token } = response.data;

        // Set state
        this.user = user;
        this.token = token;

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(user));
        setEncryptedToken("token", token);

        let intendedRoute = localStorage.getItem("userIntendedRoute") ?? "/";
        localStorage.removeItem("userIntendedRoute");

        return { success: true, redirectTo: intendedRoute };
      } catch (error) {
        return { success: false, message: error.response?.data?.error || "Login failed" };
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    async register(credentials) {
      try {
        const response = await api.post("/user/register", credentials);
        console.log("Registration response:", response.data);
        return { success: response.data.success, message: response.data.message };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || "Registration failed" };
      }
    },
  },
});
