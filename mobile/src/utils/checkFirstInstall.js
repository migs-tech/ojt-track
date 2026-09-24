// src/utils/checkFirstInstall.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set once the welcome screens have been shown. (Reading and writing used different keys
// before, so the welcome screens appeared on every launch.)
const ONBOARDING_KEY = 'onboardingDone';

export const checkFirstInstall = async () => {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === null;
  } catch (error) {
    return false;
  }
};

// Save that the welcome screens were shown
export const saveFirstInstall = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
  }
};
