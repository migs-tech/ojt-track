// Encrypted storage on phones (expo-secure-store). On the web build, where that module isn't
// available, it falls back to the browser's localStorage so the app can run for testing.
import { Platform } from 'react-native';
import * as ExpoSecureStore from 'expo-secure-store';

const web = Platform.OS === 'web';

export async function getItemAsync(key) {
  if (web) return globalThis.localStorage?.getItem(key) ?? null;
  return ExpoSecureStore.getItemAsync(key);
}

export async function setItemAsync(key, value) {
  if (web) return globalThis.localStorage?.setItem(key, value);
  return ExpoSecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key) {
  if (web) return globalThis.localStorage?.removeItem(key);
  return ExpoSecureStore.deleteItemAsync(key);
}
