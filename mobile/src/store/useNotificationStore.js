import { create } from 'zustand';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import api from '@/lib/api';
import * as SecureStore from 'expo-secure-store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ✅ Listener for incoming notifications
Notifications.addNotificationReceivedListener(notification => {
});

Notifications.addNotificationResponseReceivedListener(response => {
});

export const useNotificationStore = create((set, get) => ({
  expoPushToken: '',
  platform: Device.osName || 'unknown',
  model: Device.modelName || 'unknown',
  loading: false,
  timeoutReached: false,
  notifications: null,
  unreadCount: null,

  register: async () => {
    set({ loading: true, timeoutReached: false });

    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      set({ timeoutReached: true, loading: false });
    }, 10000);

    try {
      const token = await registerForPushNotificationsAsync();

      if (!didTimeout) {
        clearTimeout(timeout);
        set({ expoPushToken: token || '', loading: false });
        if (token) {
          await saveDeviceToken(token, Device.osName, Device.modelName);
        }
      }
    } catch (err) {
      console.error(err);
      if (!didTimeout) {
        clearTimeout(timeout);
        set({ timeoutReached: true, loading: false });
      }
    }

    // ✅ Listener for incoming notifications
    Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
    });
  },

  getNotification: async () => {
    try {
      const response = await api.post('/user/getNotifications');
      if (response.data.success) {
        set({
          notifications: response.data.data, 
          unreadCount: response.data.unread_count > 0 ? response.data.unread_count : null,
        });
      }
    } catch (error) {
      set({ notifications: null, unreadCount: null });
    }
  },

  deleteNotificationById: async (id) => {
    console.log("Deleting notification ID:", id);
    try {
      const response = await api.post('/notification/deleteNotification', { id });
      if (response.data.success) {
        const updatedNotifications = (get().notifications || []).filter(n => n.id !== id);
        const updatedUnreadCount = updatedNotifications.filter(n => n.is_read === 0).length || null;
        set({ notifications: updatedNotifications, unreadCount: updatedUnreadCount });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  markAsReadById: async (id) => {
    console.log("Marking as read ID:", id);
    try {
      const response = await api.post('/notification/markNotificationRead', { id });
      if (response.data.success) {
        const updatedNotifications = (get().notifications || []).map(n => 
          n.id === id ? { ...n, is_read: 1 } : n
        );
        const updatedUnreadCount = updatedNotifications.filter(n => n.is_read === 0).length || null;
        set({ notifications: updatedNotifications, unreadCount: updatedUnreadCount });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
}));

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (e) {
    console.error('Error getting push token', e);
    return null;
  }
}

async function saveDeviceToken(token, platform, model) {
  try {
    const userStr = await SecureStore.getItemAsync('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? user.id : null;

    console.log("device token:", token, platform, model, userId);

    const response = await api.post('/user/saveDeviceToken', {
      token,
      platform: platform || 'unknown',
      model: model || 'unknown',
      user_id: userId,
    });

    if (!response.data.success) {
      console.error('Failed to save device token');
    }
  } catch (error) {
    console.error('Error saving device token:', error);
  }
}

