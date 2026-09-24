import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/store/useAuthStore";
import { useNavigation } from "@react-navigation/native";

const EmailCheckModal = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user && user.email_flg == 0 && user.complete_name && user.birthdate) {
      setVisible(true);
    }
  }, [user]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.message}>
            Please verify your email to receive updates and notifications.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.laterButton]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.verifyButton]}
              onPress={() => {
                setVisible(false);
                navigation.navigate("EmailVerification"); // must match your navigator name
              }}
            >
              <Text style={styles.verifyText}>Verify Email Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EmailCheckModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "column",
    width: "100%",
    },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  laterButton: {
    backgroundColor: "#eee",
  },
  verifyButton: {
    backgroundColor: "#007bff",
  },
  laterText: {
    color: "#555",
    fontWeight: "500",
  },
  verifyText: {
    color: "#fff",
    fontWeight: "600",
  },
});