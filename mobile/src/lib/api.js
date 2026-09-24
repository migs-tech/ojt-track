// src/api/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set EXPO_PUBLIC_API_URL (in .env or the EAS build profile) to your API server, e.g. https://ojt-api.onrender.com/api
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
// The web app, used for the instruction pages
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:5173';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    // Accept form data if needed
    'Content-Type': 'multipart/form-data',
  },
});

let getTokenFromStore = null;

export const setTokenProvider = (fn) => {
  getTokenFromStore = fn;
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

export default api;
