// src/navigation/TeacherStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherTabs from './TeacherTabs';
import ScanQrCode from '@/screens/Teacher/ScanQrCode';
import AttendanceDetails from '@/screens/Teacher/AttendanceDetails';
import EditProfileScreen from '@/screens/Teacher/EditProfile';
import ChangePasswordScreen from '@/screens/Teacher/ChangePassword';
import ManageNotificationsScreen from '@/screens/Teacher/ManageNotifications';
import TraineeDetailsScreen from '@/screens/Teacher/TraineeDetail';
import ReportDetailsScreen from '@/screens/Teacher/ReportDetailsScreen';
import RequestTraineeScreen from '@/screens/Teacher/RequestTrainee';
import TraineeReportList from '@/screens/Teacher/TraineeReportList';
import SupervisorEvaluation from '@/screens/Teacher/SupervisorEvaluation';
import EvaluationPage from '@/screens/Teacher/EvaluationPage';
import Instructions from '@/screens/Teacher/Instructions';

import { headerOptions } from '@/ui/theme';

const Stack = createNativeStackNavigator();

export default function TeacherStack() {
  return (
     <Stack.Navigator
      screenOptions={{ ...headerOptions, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="TeacherTabs" component={TeacherTabs} options={{ headerShown: false }} />
       <Stack.Screen name="ScanQrCode" component={ScanQrCode} options={{ title: 'Scan QR code', headerShown: false }} />
      <Stack.Screen name="AttendanceDetails" component={AttendanceDetails} options={{ title: 'Attendance' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change password' }} />
      <Stack.Screen name="ManageNotifications" component={ManageNotificationsScreen} options={{ title: 'Notification settings' }} />
      <Stack.Screen name="TraineeDetails" component={TraineeDetailsScreen} options={{ title: 'Trainee' }} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} options={{ title: 'Report' }} />
      <Stack.Screen name="RequestTrainee" component={RequestTraineeScreen} options={{ title: 'Trainee requests' }} />
      <Stack.Screen name="TraineeReportList" component={TraineeReportList} options={{ title: 'Reports' }} />
      <Stack.Screen name="SupervisorEvaluation" component={SupervisorEvaluation} options={{ title: 'Midterm / final evaluation' }} />
      <Stack.Screen name="EvaluationPage" component={EvaluationPage} options={{ title: 'Evaluation form' }} />
      <Stack.Screen name="Instructions" component={Instructions} options={{ title: 'How it works' }} />
    </Stack.Navigator>
  );
}
