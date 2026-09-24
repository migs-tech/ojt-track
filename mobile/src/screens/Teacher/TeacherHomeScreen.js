import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, RefreshControl, Alert } from "react-native";
import { errorMessage } from "@/lib/api";
import { notify } from "@/lib/notify";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import useTraineeStore from "@/store/useTraineeStore";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import DropDownPicker from "react-native-dropdown-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function TeacherHomeScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null); // store ID instead of object
  const [attendance, setAttendance] = useState("present");

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const { noAttendanceRecords, fetchNoAttendanceRecords, recordAttendance, trainees, fetchTrainees } =
    useTraineeStore();
  const { attendanceRecordToday, fetchAttendanceRecordToday } = useAttendanceStore();
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAttendanceRecordToday(), fetchTrainees()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAttendanceRecordToday();
    const interval = setInterval(() => {
      fetchAttendanceRecordToday();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAttendanceRecordToday();
      fetchTrainees();
    }, [fetchTrainees, fetchAttendanceRecordToday])
  );

  useEffect(() => {
    if (!noAttendanceRecords || noAttendanceRecords.length === 0) {
      setItems([]);
    } else {
      setItems([
        { label: "-- Select a student --", value: null },
        ...noAttendanceRecords.map((t) => ({
          label: t.trainee_name,
          value: t.trainee_id, // ✅ unique key = trainee_id
        })),
      ]);
    }
  }, [noAttendanceRecords]);

  // Marking someone absent is easy to get wrong, so ask first
  const confirmRecord = () => {
    if (attendance !== "absent") return handleRecordAttendance();
    const selected = (noAttendanceRecords || []).find((s) => s.trainee_id === selectedStudentId);
    Alert.alert("Mark as absent?", `${selected?.trainee_name ?? "This trainee"} will be marked absent for today.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Mark absent", style: "destructive", onPress: handleRecordAttendance },
    ]);
  };

  const handleRecordAttendance = async () => {
    if (!selectedStudentId) {
      notify.error("Choose a trainee", "Select who to record attendance for.");
      return;
    }
    setSaving(true);
    try {
      const res = await recordAttendance({
        studentId: selectedStudentId,
        status: attendance,
      });
      if (res?.success === false) {
        notify.error("Not recorded", res.message || "Please try again.");
        return;
      }
      const selected = noAttendanceRecords.find((s) => s.trainee_id === selectedStudentId);
      setModalVisible(false);
      setSelectedStudentId(null);
      notify.success(
        "Attendance recorded",
        `${selected?.trainee_name ?? "Trainee"} marked ${attendance}.`
      );
      fetchAttendanceRecordToday();
    } catch (error) {
      notify.error("Not recorded", errorMessage(error, "Failed to record attendance."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2076cc"]} />}
      >
        {/* Present / Absent Boxes */}
        <View style={styles.row}>
          <View style={[styles.box, styles.present]}>
            <View style={styles.headerRow}>
              <FontAwesome name="check-circle" size={20} color="#15803d" />
              <Text style={styles.titleText}>Present Trainees</Text>
            </View>
            <Text style={styles.countText}>{attendanceRecordToday.present ?? 0}</Text>
          </View>

          <View style={[styles.box, styles.absent]}>
            <View style={styles.headerRow}>
              <FontAwesome name="times-circle" size={20} color="#b91c1c" />
              <Text style={styles.titleText}>Absent Trainees</Text>
            </View>
            <Text style={styles.countText}>{attendanceRecordToday.absent ?? 0}</Text>
          </View>
        </View>

        {/* Enrolled Trainees Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerRow}>
              <FontAwesome name="users" size={20} color="#1f2937" />
              <Text style={styles.cardTitle}>Enrolled Trainees</Text>
            </View>
            <Text style={styles.cardCount}>{trainees?.length ?? 0}</Text>
          </View>
          <Text style={[styles.cardSubtitle, {paddingTop: 10}]}>Trainees enrolled under your supervision</Text>
          {trainees.length === 0 ? (
            <Text style={styles.cardStatus}>No trainees enrolled yet</Text>
          ) : null}
          <TouchableOpacity style={[styles.buttonBlue, {marginTop: 25}]} onPress={() => navigation.navigate("Trainee")}>
            <FontAwesome name="cog" size={16} color="#fff" />
            <Text style={styles.buttonText}>Manage Enrollment</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Scanning Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Daily Scanning</Text>
            <MaterialIcons name="qr-code-scanner" size={24} color="#1f2937" />
          </View>
          <Text style={[styles.cardSubtitle]}>
            Scan trainee attendance codes to record their check in and check out times
          </Text>
          <View style={[styles.row, { paddingTop: 15 }]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.buttonBlue]}
              onPress={() => navigation.navigate("ScanQrCode")}
            >
              <MaterialIcons name="qr-code-scanner" size={18} color="#fff" />
              <Text style={styles.buttonText}>Open Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.buttonGray]}
              onPress={() => {
                setModalVisible(true);
                fetchNoAttendanceRecords();
              }}
            >
              <FontAwesome name="pencil" size={16} color="#fff" />
              <Text style={styles.buttonText}>Manual Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Manual Attendance Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Manual Attendance</Text>

            {/* Student dropdown */}
            <Text style={styles.sectionTitle}>Select Student:</Text>
            <DropDownPicker
              open={open}
              value={selectedStudentId}
              items={items}
              setOpen={setOpen}
              setValue={setSelectedStudentId} // ✅ stores trainee_id only
              setItems={setItems}
              placeholder="-- Select a student --"
              searchable={true}
              searchPlaceholder="Search student..."
              style={[styles.dropdown, !selectedStudentId ? styles.errorBackground : null,  { height: 20 }]}
              dropDownContainerStyle={[styles.dropdownContainer, { maxHeight: 500, height: 300   } ]}
            />

            {/* Attendance radio */}
            {/* <Text style={styles.sectionTitle}>Mark Attendance:</Text> */}
            <View style={styles.radioContainer}>
              <TouchableOpacity style={styles.radioOption} onPress={() => setAttendance("present")}>
                <FontAwesome
                  name={attendance === "present" ? "dot-circle-o" : "circle-thin"}
                  size={20}
                  color="#3a5bc0"
                />
                <Text style={styles.radioText}>Present</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => setAttendance("absent")}>
                <FontAwesome
                  name={attendance === "absent" ? "dot-circle-o" : "circle-thin"}
                  size={20}
                  color="red"
                />
                <Text style={styles.radioText}>Absent</Text>
              </TouchableOpacity>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  selectedStudentId ? styles.recordButton : styles.recordButtonDisabled,
                ]}
                disabled={!selectedStudentId || saving}
                onPress={confirmRecord}
              >
                <Text style={styles.recordText}>Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, paddingTop: 16 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  box: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    flex: 1,
    marginHorizontal: 5,
    height: 100,
  },
  present: { backgroundColor: "#d1fae5" },
  absent: { backgroundColor: "#fee2e2" },
  headerRow: { flexDirection: "row", alignItems: "center" },
  titleText: { fontWeight: "600", fontSize: 14, marginLeft: 8 },
  countText: { marginTop: 5, fontWeight: "700", fontSize: 18, color: "#111827" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1f2937", marginLeft: 8 },
  cardCount: { fontSize: 18, fontWeight: "700", color: "#111827" },
  cardSubtitle: { marginTop: 8, fontSize: 14, color: "#4b5563" },
  cardStatus: { marginTop: 5, fontSize: 14, color: "#6b7280", fontStyle: "italic" },

  buttonBlue: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: "flex-start",
  },
  buttonGray: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6b7280",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: "flex-start",
  },
  buttonText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  actionButton: { flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "center", marginHorizontal: 5 },

  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 20 },
  modalContainer: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 10, marginBottom: 6 },

  radioContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 15, marginTop : 50 },
  radioOption: { flexDirection: "row", alignItems: "center" },
  radioText: { marginLeft: 6, fontSize: 16 },

  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#eee" },
  recordButton: { backgroundColor: "#3a5bc0" },
  cancelText: { color: "#333", fontWeight: "600" },
  recordText: { color: "#fff", fontWeight: "600" },
  recordButtonDisabled: { backgroundColor: "#ccc" },

  traineeItem: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  traineeName: { marginLeft: 8, fontSize: 14, color: "#374151" },

  dropdown: { borderColor: "#ccc", backgroundColor: "#fff" },
  dropdownContainer: { borderColor: "#ccc" },
  errorBackground: { backgroundColor: "white" },
});
