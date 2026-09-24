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

const Stack = createNativeStackNavigator();

export default function TeacherStack() {
  return (
     <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3a5bc0ff',
        },
        headerTintColor: '#fff', // white text
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TeacherTabs" component={TeacherTabs} options={{ headerShown: false }} />
       <Stack.Screen name="ScanQrCode" component={ScanQrCode} options={{ title: 'QR Code' }} />
      <Stack.Screen name="AttendanceDetails" component={AttendanceDetails} options={{ title: 'Attendance Details' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <Stack.Screen name="ManageNotifications" component={ManageNotificationsScreen} options={{ title: 'Manage Notifications' }} />
      <Stack.Screen name="TraineeDetails" component={TraineeDetailsScreen} options={{ title: 'Trainee Details', presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} options={{ title: 'Report Details', presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="RequestTrainee" component={RequestTraineeScreen} options={{ title: 'Request Trainee', presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="TraineeReportList" component={TraineeReportList} options={{ title: 'Trainee Reports', presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="SupervisorEvaluation" component={SupervisorEvaluation} options={{ title: 'Evaluate Trainee', presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="EvaluationPage" component={EvaluationPage} options={{ title: 'Evaluation Page', presentation: "card", animation: "slide_from_right" }} />
      <Stack.Screen name="Instructions" component={Instructions} options={{ title: 'Instructions', presentation: "card", animation: "slide_from_right" }} />
    </Stack.Navigator>
  );
}
