// src/navigation/StudentStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentTabs from './StudentTabs';
import EditProfileScreen from '@/screens/Student/EditProfile';
import StudentViewDetailsScreen from '@/screens/Student/StudentViewDetailsScreen';
import AttendanceScreen from '@/screens/Student/HourScreen'; // Assuming you want to include the AttendanceScreen
import ReportDetails from "@/screens/Student/ReportDetails";
import EditReport from "@/screens/Student/EditReport";
import ChangePasswordScreen from '@/screens/Student/ChangePassword';
import ManageNotificationsScreen from '@/screens/Teacher/ManageNotifications';
import OjtCompletionScreen from '@/screens/Student/OjtCompletionScreen';
import AIAssistant from '@/screens/Student/AIAssistant';
import EmailVerificationScreen from '@/screens/Student/EmailVerificationScreen';
import WalletScreen from '@/screens/Student/wallet';
import RequestTabs from '@/screens/Student/Request';
import Instructions from '@/screens/Student/Instructions';

const Stack = createNativeStackNavigator();

export default function StudentStack() {
  return (
     <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3a5bc0ff', // blue
        },
        headerTintColor: '#fff', // white text
        presentation: 'modal',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="StudentTabs" component={StudentTabs} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ProfileDetails" component={StudentViewDetailsScreen} options={{ title: 'Profile Details' }} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <Stack.Screen name="ReportDetails" component={ReportDetails} options={{ title: 'Report Details' }} />
      <Stack.Screen name="EditReport" component={EditReport} options={{ title: 'Edit Report' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <Stack.Screen name="ManageNotifications" component={ManageNotificationsScreen} options={{ title: 'Manage Notifications' }} />
      <Stack.Screen name="OjtCompletion" component={OjtCompletionScreen} options={{ title: 'OJT Completion' }} />
      <Stack.Screen name="AIAssistant" component={AIAssistant} options={{ title: 'AI Assistant' }} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ title: 'Email Verification' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Wallet' }} />
      <Stack.Screen name="Requests" component={RequestTabs} options={{ title: 'Requests' }} />
      <Stack.Screen name="Instructions" component={Instructions} options={{ title: 'Instructions' }} />
    </Stack.Navigator>
  );
}
