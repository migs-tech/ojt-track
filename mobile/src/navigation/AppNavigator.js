import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/store/useAuthStore';
import { checkFirstInstall } from '@/utils/checkFirstInstall';

import LoginScreen from '@/screens/Auth/LoginScreen';
import StudentStack from './StudentStack';
import TeacherStack from './TeacherStack';
import GetStartedScreen from '@/screens/Onboarding/GetStartedScreen';
import TraineeSignUp from '@/screens/Auth/TraineeSignUp';  
import SupervisorSignUp from '@/screens/Auth/SupervisorSignUp';
import SignUpRoleScreen from '@/screens/Auth/RoleScreen';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen'
import ResetPasswordScreen from '@/screens/Auth/ResetPasswordScreen';
import InstructionScreen from '@/screens/Onboarding/InstructionScreen';
import RoleSelectScreen from "@/screens/Onboarding/RoleSelectScreen";
import {useNotificationStore} from "@/store/useNotificationStore";

import {
  ActivityIndicator,
  View,
} from "react-native";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, role, loading, checkLogin } = useAuth();
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

  if (firstInstall === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#da1d1dff" />
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
                // <GetStartedScreen {...props} setFirstInstall={setFirstInstall} />
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
            <Stack.Screen name="TraineeSignUp" component={TraineeSignUp} />
            <Stack.Screen name="SupervisorSignUp" component={SupervisorSignUp} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>

        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
