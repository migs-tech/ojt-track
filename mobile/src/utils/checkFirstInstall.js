// src/utils/checkFirstInstall.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkFirstInstall = async () => {
  try {
    const isFirstLaunch = await AsyncStorage.getItem('alreadyLaunched3');
    if (isFirstLaunch === null) {
      return true; 
    }
    return false;
  } catch (error) {
    return false;
  }
};

//save first install status
export const saveFirstInstall = async () => {
  try {
    await AsyncStorage.setItem('alreadyLaunched2', 'true');
  } catch (error) {
  }
};