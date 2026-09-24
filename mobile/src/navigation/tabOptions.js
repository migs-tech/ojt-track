// Shared look for the bottom tab bars (trainee and supervisor).
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/ui/theme';

const icons = {
  Home: ['home', 'home-outline'],
  Report: ['document-text', 'document-text-outline'],
  'QR Code': ['qr-code', 'qr-code-outline'],
  Trainee: ['people', 'people-outline'],
  Mail: ['notifications', 'notifications-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

export const tabScreenOptions = ({ route }) => ({
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { fontSize: 17, fontWeight: '600', color: colors.ink },
  headerTitleAlign: 'left',
  headerShadowVisible: false,
  sceneStyle: { backgroundColor: colors.background },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.subtle,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  // No fixed height: React Navigation adds the phone's bottom safe area itself
  tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
  tabBarBadgeStyle: { backgroundColor: colors.danger, fontSize: 11, minWidth: 18, height: 18, lineHeight: 17 },
  tabBarIcon: ({ focused, color }) => {
    const [on, off] = icons[route.name] || ['ellipse', 'ellipse-outline'];
    return <Ionicons name={focused ? on : off} size={23} color={color} />;
  },
});
