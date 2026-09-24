// Supervisor tabs. Home draws its own greeting; the other tabs use a plain title header.
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TeacherHomeScreen from '@/screens/Teacher/TeacherHomeScreen';
import TeacherReportScreen from '@/screens/Teacher/TeacherReportScreen';
import TeacherMailScreen from '@/screens/Teacher/TeacherMailScreen';
import TeacherProfileScreen from '@/screens/Teacher/TeacherProfileScreen';
import TeacherTrainee from '@/screens/Teacher/TeacherTrainee';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuth } from '@/store/useAuthStore';
import { tabScreenOptions } from './tabOptions';

const Tab = createBottomTabNavigator();

export default function TeacherTabs() {
  const { unreadCount, getNotification } = useNotificationStore();
  const { getUserProfile } = useAuth();

  useEffect(() => {
    getNotification();
    getUserProfile();
  }, [getNotification, getUserProfile]);

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={TeacherHomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Report" component={TeacherReportScreen} options={{ title: 'Reports' }} />
      <Tab.Screen name="Trainee" component={TeacherTrainee} options={{ title: 'Trainees', tabBarLabel: 'Trainees' }} />
      <Tab.Screen
        name="Mail"
        component={TeacherMailScreen}
        options={{ title: 'Notifications', tabBarLabel: 'Inbox', tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}
      />
      <Tab.Screen name="Profile" component={TeacherProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
