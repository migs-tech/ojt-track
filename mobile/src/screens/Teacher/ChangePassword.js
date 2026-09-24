import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from '@/store/useAuthStore';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isValid, setIsValid] = useState(false);

  const [saving, setSaving] = useState(false);
  const { changePassword } = useAuth();

  // Validate only if fields are filled
  useEffect(() => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill out all fields.");
      setMessageType("error");
      return;
    }
    if (newPassword === currentPassword) {
      setMessage("New password must be different from current password.");
      setMessageType("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await changePassword(currentPassword, newPassword);
      if (response.success) {
        setMessage("Password changed successfully!");
        setMessageType("success");
        // Reset fields (optional)
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(response.message || "Failed to change password.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || error?.message || "Failed to change password.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                <Icon
                  name={showCurrent ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Icon
                  name={showNew ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Icon
                  name={showConfirm ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Box */}
          {message ? (
            <View
              style={[
                styles.messageBox,
                messageType === "error"
                  ? styles.errorBox
                  : styles.successBox,
              ]}
            >
              <Icon
                name={
                  messageType === "error"
                    ? "close-circle"
                    : "checkmark-circle"
                }
                size={20}
                color={messageType === "error" ? "#B42318" : "#15803D"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.messageText,
                  messageType === "error"
                    ? styles.errorText
                    : styles.successText,
                ]}
              >
                {message}
              </Text>
            </View>
          ) : null}

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!isValid || saving) && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
  content: { padding: 20 },

  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: "#000",
  },

  saveButton: {
    backgroundColor: "#1E4FC2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorBox: {
    backgroundColor: "#FDEEEC",
    borderColor: "#B42318",
    borderWidth: 1,
  },
  successBox: {
    backgroundColor: "#EAF6EE",
    borderColor: "#15803D",
    borderWidth: 1,
  },
  messageText: { fontSize: 14, flex: 1 },
  errorText: { color: "#B42318", fontWeight: "500" },
  successText: { color: "#15803D", fontWeight: "500" },
});
