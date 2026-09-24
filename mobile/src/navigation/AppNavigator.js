import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/store/useAuthStore';
import { checkFirstInstall } from '@/utils/checkFirstInstall';
import { useNotificationStore } from '@/store/useNotificationStore';
import { colors } from '@/ui/theme';

import WelcomeScreen from '@/screens/Onboarding/WelcomeScreen';
import LoginScreen from '@/screens/Auth/LoginScreen';
import SignUpRoleScreen from '@/screens/Auth/RoleScreen';
import SupervisorSignUp from '@/screens/Auth/SupervisorSignUp';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/Auth/ResetPasswordScreen';
import StudentStack from './StudentStack';
import TeacherStack from './TeacherStack';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.ink,
    border: colors.border,
  },
};

export default function AppNavigator() {
  const { user, role, ready, checkLogin } = useAuth();
  const [firstInstall, setFirstInstall] = useState(null);
  const { register } = useNotificationStore();

  useEffect(() => {
    checkFirstInstall().then(setFirstInstall);
    checkLogin();
  }, []);

  useEffect(() => {
    if (user) register();
  }, [user]);

  // Wait for the saved login and first-launch flag, so the sign-in screen doesn't flash
  if (firstInstall === null || !ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <Image source={require('../../assets/images/icon.png')} style={{ width: 72, height: 72, borderRadius: 18 }} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {user ? (
          role === 1 ? (
            <Stack.Screen name="Student" component={StudentStack} />
          ) : (
            <Stack.Screen name="Teacher" component={TeacherStack} />
          )
        ) : (
          <>
            {/* Shown once, on the first launch */}
            {firstInstall ? <Stack.Screen name="Welcome" component={WelcomeScreen} /> : null}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUpRoleScreen" component={SignUpRoleScreen} />
            <Stack.Screen name="SupervisorSignUp" component={SupervisorSignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
