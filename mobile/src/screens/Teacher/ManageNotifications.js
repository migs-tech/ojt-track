import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as Notifications from "expo-notifications";

export default function ManageNotificationScreen() {
  const [systemEnabled, setSystemEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      setSystemEnabled(true);
    } else {
      setSystemEnabled(false);
    }
  };

  const toggleSystemNotification = async (value) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Enable notifications from your settings to receive system alerts."
        );
        return;
      }
      setSystemEnabled(true);
    } else {
      setSystemEnabled(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.section}>
        <View style={styles.item}>
          <Text style={styles.label}>System Notifications</Text>
          <Switch
            value={systemEnabled}
            onValueChange={toggleSystemNotification}
          />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Email Notifications</Text>
          <Switch
            value={emailEnabled}
            onValueChange={(val) => setEmailEnabled(val)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#000" },

  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 15,
    color: "#333",
  },
});
