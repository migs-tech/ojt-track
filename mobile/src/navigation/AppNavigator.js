import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/store/useAuthStore';
import { checkFirstInstall } from '@/utils/checkFirstInstall';

import LoginScreen from '@/screens/Auth/LoginScreen';
import StudentStack from './StudentStack';
import TeacherStack from './TeacherStack';
  
import SupervisorSignUp from '@/screens/Auth/SupervisorSignUp';
import SignUpRoleScreen from '@/screens/Auth/RoleScreen';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen'
import ResetPasswordScreen from '@/screens/Auth/ResetPasswordScreen';
import InstructionScreen from '@/screens/Onboarding/InstructionScreen';
import RoleSelectScreen from "@/screens/Onboarding/RoleSelectScreen";
import {useNotificationStore} from "@/store/useNotificationStore";

import {
  ActivityIndicator,
  Image,
  Text,
  View,
} from "react-native";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, role, ready, checkLogin } = useAuth();
  const [firstInstall, setFirstInstall] = useState(null);
  const { register } = useNotificationStore();

  useEffect(() => {
    (async () => {
      const first = await checkFirstInstall();
      setFirstInstall(first);
    })();
    checkLogin();
  }, []);

  useEffect(() => {
    if (user) {
      register(); 
    }
  }, [user]);

  // Wait for the saved login and onboarding flag, so the login screen doesn't flash
  if (firstInstall === null || !ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a5298' }}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={{ width: 96, height: 96, borderRadius: 24, marginBottom: 16 }}
        />
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 24 }}>OJT Track</Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {firstInstall ? (
           <>
            <Stack.Screen name="RoleSelection">
              {(props) => (
                <RoleSelectScreen {...props} setFirstInstall={setFirstInstall} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Instruction">
              {(props) => (
                <InstructionScreen {...props} setFirstInstall={setFirstInstall} />
              )}
            </Stack.Screen>
          </>
        ) : user ? (
          role === 1 ? (
            <Stack.Screen name="Student" component={StudentStack} />
          ) : (
            <Stack.Screen name="Teacher" component={TeacherStack} />
          )
        ) : (
          <>
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
