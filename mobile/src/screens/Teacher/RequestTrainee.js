import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useTraineeStore from "@/store/useTraineeStore";

export default function RequestTraineeScreen() {
  const { traineeRequests, updateTraineeRequest } = useTraineeStore();
  const [trainees, setTrainees] = useState([...traineeRequests]);
  const [message, setMessage] = useState(null);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleApprove = async (id) => {
    const res = await updateTraineeRequest(id, 1);
    if (res.success) {
      setTrainees((prev) => prev.filter((t) => t.id !== id));
      showMessage("Trainee Approved", "success");
    }
  };

  const handleDecline = async (id) => {
    const res = await updateTraineeRequest(id, 2);
    if (res.success) {
      setTrainees((prev) => prev.filter((t) => t.id !== id));
      showMessage("Trainee Declined", "error");
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Inline Message */}
      {message && (
        <View
          style={[
            styles.messageBanner,
            message.type === "success" ? styles.success : styles.error,
          ]}
        >
          <Ionicons
            name={message.type === "success" ? "checkmark-circle" : "close-circle"}
            size={22}
            color={message.type === "success" ? "#2E7D32" : "#C62828"}
          />
          <Text
            style={[
              styles.messageText,
              { color: message.type === "success" ? "#2E7D32" : "#C62828" },
            ]}
          >
            {message.text}
          </Text>
        </View>
      )}

      <Text style={styles.title}>Requested Trainees</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {trainees.length > 0 ? (
          trainees.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.name}>{item.trainee_name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleDecline(item.id)}>
                  <Ionicons name="close-circle" size={28} color="#F44336" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleApprove(item.id)}>
                  <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No trainee requests available</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12 },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "gray",
  },
  // ✅ Message Banner
  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  success: { backgroundColor: "#DFF6E0" }, // light green
  error: { backgroundColor: "#FDE2E1" }, // light red
  messageText: { marginLeft: 8, fontSize: 15, fontWeight: "600" },
});
