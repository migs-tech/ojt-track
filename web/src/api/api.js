import axios from 'axios';
import CryptoJS from 'crypto-js';

const SECRET_KEY = '4f3c1b2a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a';

// Helper: decrypt token with expiry check
const getEncryptedToken = (key) => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return data.value; // return original token
  } catch (e) {
  }
};

// Set VITE_API_URL to the API server, e.g. https://ojt-api.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// Add a request interceptor to dynamically set the token
api.interceptors.request.use(
  (config) => {
    const token = getEncryptedToken("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
