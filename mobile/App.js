import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import CustomToast from "./src/components/CustomToast";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("funny-channel", {
        name: "Funny Notifications",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "funny_notify",
      });
    }
  }, []);
  return (
    <>
      <AppNavigator />
      <Toast 
        config={{
          successCheck: (props) => <CustomToast {...props} type="success" />,
          errorCheck: (props) => <CustomToast {...props} type="error" />,
          infoCheck: (props) => <CustomToast {...props} type="info" />,
        }}
      />
    </>
  );
}