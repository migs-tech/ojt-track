// Short messages at the top of the screen, using the app's custom toast styles (see App.js).
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

const show = (type, title, message) => {
  Toast.show({ type, text1: title, text2: message, position: 'top', topOffset: 60 });
};

export const notify = {
  success(title, message) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    show('successCheck', title, message);
  },
  error(title, message) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    show('errorCheck', title, message);
  },
  info(title, message) {
    show('infoCheck', title, message);
  },
};
