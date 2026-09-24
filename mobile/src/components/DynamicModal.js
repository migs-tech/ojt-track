// components/DynamicModal.js
import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useNavigation } from '@react-navigation/native';

export default function DynamicModal({ visible, type = "success", title, message, onClose }) {
  const isSuccess = type === "success";
  const navigation = useNavigation();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Animated Icon */}
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10 }}
          >
            <Feather
              name={isSuccess ? "check-circle" : "x-circle"}
              size={64}
              color={isSuccess ? "#22c55e" : "#ef4444"}
            />
          </MotiView>

          {/* Title */}
          <Text style={[styles.title, { color: isSuccess ? "#16a34a" : "#dc2626" }]}>
            {title || (isSuccess ? "Success" : "Error")}
          </Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isSuccess ? "#22c55e" : "#ef4444" }]}
            onPress={() => {
              navigation.navigate("QR Code");
              onClose();
            }}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    width: "80%",
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
    color: "#374151",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
