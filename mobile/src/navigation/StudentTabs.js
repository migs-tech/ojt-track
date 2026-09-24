// Trainee tabs. Home draws its own greeting; the other tabs use a plain title header.
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StudentHomeScreen from '../screens/Student/StudentHomeScreen';
import StudentProfileScreen from '../screens/Student/StudentProfileScreen';
import StudentMailScreen from '../screens/Student/StudentMailScreen';
import StudentReportScreen from '../screens/Student/StudentReportScreen';
import StudentQrScreen from '../screens/Student/StudentQrScreen';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuth } from '@/store/useAuthStore';
import { tabScreenOptions } from './tabOptions';

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  const { unreadCount, getNotification } = useNotificationStore();
  const { getUserProfile } = useAuth();

  useEffect(() => {
    getNotification();
    getUserProfile();
  }, [getNotification, getUserProfile]);

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={StudentHomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Report" component={StudentReportScreen} options={{ title: 'Reports' }} />
      <Tab.Screen name="QR Code" component={StudentQrScreen} options={{ title: 'Attendance', tabBarLabel: 'QR Code' }} />
      <Tab.Screen
        name="Mail"
        component={StudentMailScreen}
        options={{ title: 'Notifications', tabBarLabel: 'Inbox', tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}
      />
      <Tab.Screen name="Profile" component={StudentProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
