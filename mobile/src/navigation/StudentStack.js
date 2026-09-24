// src/navigation/StudentStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentTabs from './StudentTabs';
import EditProfileScreen from '@/screens/Student/EditProfile';
import AttendanceScreen from '@/screens/Student/HourScreen'; // Assuming you want to include the AttendanceScreen
import ReportDetails from "@/screens/Student/ReportDetails";
import EditReport from "@/screens/Student/EditReport";
import ChangePasswordScreen from '@/screens/Student/ChangePassword';
import ManageNotificationsScreen from '@/screens/Teacher/ManageNotifications';
import OjtCompletionScreen from '@/screens/Student/OjtCompletionScreen';
import AIAssistant from '@/screens/Student/AIAssistant';
import EmailVerificationScreen from '@/screens/Student/EmailVerificationScreen';
import RequestTabs from '@/screens/Student/Request';
import Instructions from '@/screens/Student/Instructions';

import { headerOptions } from '@/ui/theme';

const Stack = createNativeStackNavigator();

export default function StudentStack() {
  return (
     <Stack.Navigator
      screenOptions={{ ...headerOptions, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="StudentTabs" component={StudentTabs} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance history' }} />
      <Stack.Screen name="ReportDetails" component={ReportDetails} options={{ title: 'Report' }} />
      <Stack.Screen name="EditReport" component={EditReport} options={{ title: 'Edit report' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change password' }} />
      <Stack.Screen name="ManageNotifications" component={ManageNotificationsScreen} options={{ title: 'Notification settings' }} />
      <Stack.Screen name="OjtCompletion" component={OjtCompletionScreen} options={{ title: 'OJT completion' }} />
      <Stack.Screen name="AIAssistant" component={AIAssistant} options={{ title: 'AI assistant' }} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ title: 'Email verification' }} />
      <Stack.Screen name="Requests" component={RequestTabs} options={{ title: 'Document requests' }} />
      <Stack.Screen name="Instructions" component={Instructions} options={{ title: 'How it works' }} />
    </Stack.Navigator>
  );
}
