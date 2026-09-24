import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import DateTimePicker from "@react-native-community/datetimepicker";
import useTraineeStore  from '@/store/useTraineeStore';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";

const Tab = createMaterialTopTabNavigator();

function RequestScreen() {
  const { saveTraineeRequest } = useTraineeStore();
  const [type, setType] = useState("weekly"); // weekly | monthly
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [reason, setReason] = useState("");
  const [showPicker, setShowPicker] = useState(null); // "start", "end", "month"
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [message, setMessage] = useState(null);
  const showMessage = (text, type) => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null),3000);
  };

  const isMonday = (date) => date.getDay() === 1; // 1 = Monday
  const isFriday = (date) => date.getDay() === 5; // 5 = Friday

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const handleSubmit = async () => {
    const today = new Date();

    if (type === "weekly") {
      if (!isMonday(startDate)) {
        showAlert("Start date must be a Monday");
        return;
      }
      if (!isFriday(endDate)) {
        showAlert("End date must be a Friday");
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        showAlert("Start date cannot be later than end date");
        return;
      }
      if (new Date(startDate) > today) {
        showAlert("Start date cannot be in the future");
        return;
      }
      if (new Date(endDate) > today) {
        showAlert("End date cannot be in the future");
        return;
      }
    }

    if (type === "monthly") {
      if (!month) {
        showAlert("Please select a month and year");
        return;
      }

      const selectedMonth = new Date(month);
      const lastDayOfMonth = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + 1,
        0 // 0 gives last day of previous month
      );

      if (selectedMonth > today) {
        showAlert("You cannot request for a future month");
        return;
      }

      // ✅ must be last day of the month
      if (
        selectedMonth.getFullYear() !== lastDayOfMonth.getFullYear() ||
        selectedMonth.getMonth() !== lastDayOfMonth.getMonth() ||
        selectedMonth.getDate() !== lastDayOfMonth.getDate()
      ) {
        showAlert("Monthly requests must be made at the end of the month");
        return;
      }
    }

    if (!reason) {
      showAlert("Please provide a reason for your request");
      return;
    }

    const requestData = { type, startDate, endDate, month, reason };
    const res = await saveTraineeRequest(requestData);

    if (res && res.success) {
      showMessage("Request submitted successfully", "success");
      // Reset form
      setType("weekly");
      setStartDate(new Date());
      setEndDate(new Date());
      setMonth(new Date());
      setReason("");
    } else {
      showAlert(res.message || "Failed to submit request");
    }
  };
  
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#F6F7F9" }}>
      {message && (
        <View
          style={[
            styles.messageBanner,
            styles[message.type], // maps directly to success, error, info, warning
          ]}
        >
          <Ionicons
            name={
              message.type === "success"
                ? "checkmark-circle"
                : message.type === "error"
                ? "close-circle"
                : message.type === "info"
                ? "information-circle"
                : "warning"
            }
            size={22}
            color={
              message.type === "success"
                ? "#15803D"
                : message.type === "error"
                ? "#B42318"
                : message.type === "info"
                ? "#1E4FC2"
                : "#B45309"
            }
          />
          <Text
            style={[
              styles.messageText,
              {
                color:
                  message.type === "success"
                    ? "#15803D"
                    : message.type === "error"
                    ? "#B42318"
                    : message.type === "info"
                    ? "#1E4FC2"
                    : "#B45309",
              },
            ]}
          >
            {message.text}
          </Text>
        </View>
      )}
      {/* Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === "weekly" && styles.activeType]}
          onPress={() => setType("weekly")}
        >
          <Text style={styles.typeText}>Weekly Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === "monthly" && styles.activeType]}
          onPress={() => setType("monthly")}
        >
          <Text style={styles.typeText}>Monthly Hours</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Report */}
      {type === "weekly" && (
        <View>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker("start")}
          >
            <Text>Start Date: {startDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker("end")}
          >
            <Text>End Date: {endDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Monthly Hours */}
      {type === "monthly" && (
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPicker("month")}
        >
          <Text>
            Month: {month.toLocaleString("default", { month: "long" })}{" "}
            {month.getFullYear()}
          </Text>
        </TouchableOpacity>
      )}

      {/* Reason */}
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={reason}
        onChangeText={setReason}
        placeholder="Enter reason"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>Submit Request</Text>
      </TouchableOpacity>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={
            showPicker === "start"
              ? startDate
              : showPicker === "end"
              ? endDate
              : month
          }
          mode={showPicker === "month" ? "date" : "date"}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              if (showPicker === "start") setStartDate(selectedDate);
              if (showPicker === "end") setEndDate(selectedDate);
              if (showPicker === "month") setMonth(selectedDate);
            }
            setShowPicker(null);
          }}
        />
      )}
        {/* Alert Modal */}
        <Modal
        visible={alertVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{alertMessage}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAlertVisible(false)}
              >
                <Text style={styles.cancelText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HistoryScreen() {
    const { traineeRequestsHistory, getTraineeRequestsHistory  } = useTraineeStore();


  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#15803D"; // green
      case "pending":
        return "#B45309"; // orange
      case "rejected":
        return "#B42318"; // red
      default:
        return "#333";
    }
  };

    useFocusEffect(
    useCallback(() => {
      getTraineeRequestsHistory();
    }, [])
  );

  const historyData = traineeRequestsHistory || [];

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={historyData}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.type}>{item.type}</Text>
            <Text style={styles.details}>{item.details}</Text>
            <Text style={styles.reason}>Reason: {item.reason}</Text>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

export default function RequestTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: '#1E4FC2' },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Request" component={RequestScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  typeSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  activeType: {
    backgroundColor: "#1E4FC2",
  },
  typeText: {
    color: "#333",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: "#1E4FC2",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
  },
  cancelText: { color: "#fff", fontWeight: "600" }, 
  card: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2, // shadow for Android
    shadowColor: "#000", // shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  type: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  reason: {
    fontSize: 13,
    color: "#777",
    marginBottom: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: "700",
  },
  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  success: { backgroundColor: "#EAF6EE" }, // light green
  error: { backgroundColor: "#FDEEEC" }, // light red
  info: { backgroundColor: "#EEF3FC" }, // light blue
  warning: { backgroundColor: "#FEF6E7" }, // light yellow
  messageText: { marginLeft: 8, fontSize: 15, fontWeight: "600" },
});
