import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Animated,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { FAB } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import useTraineeStore from "@/store/useTraineeStore";

function SkeletonRow({ width1 = "50%", width2 = "30%", showBadges = false }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmer]);

  const bgColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e5e7eb", "#f3f4f6"],
  });

  return (
    <View style={styles.row}>
      <Animated.View
        style={[styles.skeletonLine, { width: width1, backgroundColor: bgColor }]}
      />
      <Animated.View
        style={[
          styles.skeletonLine,
          { width: width2, marginTop: 8, backgroundColor: bgColor },
        ]}
      />
      {showBadges && (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Animated.View
            style={[styles.skeletonBadge, { width: 80, backgroundColor: bgColor }]}
          />
          <Animated.View
            style={[styles.skeletonBadge, { width: 80, backgroundColor: bgColor }]}
          />
        </View>
      )}
    </View>
  );
}

export default function TeacherTraineeScreen() {
  const [activeTab, setActiveTab] = useState("trainee");
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const {
    trainees,
    fetchTrainees,
    fetchAllAttendanceRecords,
    attendanceRecords,
    fetchTraineeRequests,
    traineeRequests,
    unEnrollTrainee,        // <-- ADD THIS
  } = useTraineeStore();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTraineeRequests();
      fetchAllAttendanceRecords();
      fetchTrainees();
    }, [fetchTraineeRequests, fetchAllAttendanceRecords, fetchTrainees])
  );

  useEffect(() => {
    if (traineeRequests.length > 0) {
      setShowModal(true);
    }
  }, [traineeRequests]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTrainees(), fetchAllAttendanceRecords()]);
      setLoading(false);
    };
    loadData();
  }, [fetchTrainees, fetchAllAttendanceRecords]);

  const filteredTrainees = trainees.filter((trainee) =>
    trainee.trainee_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formattedAttendance = Object.entries(
    attendanceRecords?.attendance ?? {}
  ).map(([date, data]) => ({
    id: date,
    date,
    present: data.present_count,
    absent: data.absent_count,
    trainees: data.trainees,
  }));

  // ----------------------------------------
  // DELETE CONFIRMATION
  // ----------------------------------------
  const confirmDelete = (id, name) => {
    Alert.alert(
      "Unenroll Trainee",
      `Are you sure you want to Unenroll this trainee: ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTrainee(id),
        },
      ]
    );
  };

  const deleteTrainee = async (id) => {
    try {
      const res = await unEnrollTrainee(id);  // <-- CALL THE STORE ACTION

      if (res.success) {
        showMessage("Trainee removed successfully.", "success");
        fetchTrainees(); // Refresh the trainee list
      } else {
        showMessage(res.error || "Failed to remove trainee.", "error");
      }
    } catch (error) {
      showMessage("An error occurred. Please try again.", "error");
    }
  };
      

  // ----------------------------------------
  // TRAINEE LIST ITEM
  // ----------------------------------------
  const renderTrainee = ({ item }) => (
    <View style={styles.traineeCard}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => navigation.navigate("TraineeDetails", { item })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarPlaceholder}>
          {item.avatar_url ? (
            <Image
              source={{ uri: item.avatar_url }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={22} color="#007bff" />
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.traineeName}>{item.trainee_name}</Text>
          <Text style={styles.cardSubtext}>Tap to view details</Text>
        </View>
      </TouchableOpacity>

      {/* UNENROLL BUTTON */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => confirmDelete(item.trainee_id, item.trainee_name)}
        accessibilityLabel="Unenroll Trainee"
      >
        <MaterialIcons name="person-remove" size={22} color="#dc2626" />
      </TouchableOpacity>
    </View>
  );

  // ----------------------------------------
  // ATTENDANCE LIST ITEM
  // ----------------------------------------
  const renderAttendance = ({ item }) => (
    <TouchableOpacity
      style={styles.attendanceCard}
      onPress={() =>
        navigation.navigate("AttendanceDetails", {
          date: item.date,
          trainees: item.trainees,
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.attendanceCardContent}>
        <Text style={styles.attendanceDate}>{item.date}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.presentBadge]}>
            <Feather name="check-circle" size={14} color="#059669" />
            <Text style={[styles.badgeText, { color: "#059669" }]}>
              {item.present}
            </Text>
          </View>
          <View style={[styles.badge, styles.absentBadge]}>
            <Feather name="x-circle" size={14} color="#dc2626" />
            <Text style={[styles.badgeText, { color: "#dc2626" }]}>
              {item.absent}
            </Text>
          </View>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={26} color="#007bff" />
    </TouchableOpacity>
  );

  // ----------------------------------------
  // MAIN RENDER
  // ----------------------------------------

  return (
    <View style={styles.container}>
      {message && (
        <View style={[styles.toast, styles[message.type]]}>
          <Ionicons
            name={message.type === "success" ? "checkmark-circle" : "close-circle"}
              size={22}
              color="#fff"
            />
          <Text style={styles.toastText}>{message.text}</Text>
        </View>
      )}
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Trainees</Text>
      </View> */}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "trainee" && styles.activeTab]}
          onPress={() => {
            setActiveTab("trainee");
            setSearchQuery("");
          }}
        >
          <Feather
            name="users"
            size={16}
            color={activeTab === "trainee" ? "#fff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "trainee" && styles.activeTabText,
            ]}
          >
            Trainee List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "attendance" && styles.activeTab]}
          onPress={() => setActiveTab("attendance")}
        >
          <Feather
            name="calendar"
            size={16}
            color={activeTab === "attendance" ? "#fff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "attendance" && styles.activeTabText,
            ]}
          >
            Attendance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {activeTab === "trainee" && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trainee..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      {activeTab === "trainee" ? (
        loading ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonRow width1="60%" width2="40%" />}
            contentContainerStyle={styles.listContent}
          />
        ) : filteredTrainees.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? "No trainee found" : "No trainee yet"}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search"
                : "Add your first trainee to get started"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTrainees}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderTrainee}
            contentContainerStyle={styles.listContent}
          />
        )
      ) : loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SkeletonRow width1="50%" width2="30%" showBadges />}
          contentContainerStyle={styles.listContent}
        />
      ) : formattedAttendance.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="clipboard" size={64} color="#cbd5e1" />
          <Text style={styles.emptyStateTitle}>No attendance records</Text>
          <Text style={styles.emptyStateText}>
            Start scanning QR codes to record attendance
          </Text>
        </View>
      ) : (
        <FlatList
          data={formattedAttendance}
          keyExtractor={(item) => item.id}
          renderItem={renderAttendance}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Button */}
      <FAB
        style={styles.fab}
        icon="qrcode-scan"
        color="#fff"
        label="Scan"
        onPress={() => navigation.navigate("ScanQrCode")}
      />

      {/* Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="mail-outline" size={48} color="#007bff" />
            </View>
            <Text style={styles.modalTitle}>New Request</Text>
            <Text style={styles.modalMessage}>
              You have a new trainee request. Review and approve or decline it.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => {
                  setShowModal(false);
                  navigation.navigate("RequestTrainee");
                }}
              >
                <Text style={styles.buttonText}>Review Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 30, fontWeight: "800", color: "#111827" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
  },
  activeTab: { backgroundColor: "#007bff" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  activeTabText: { color: "#fff" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 16, color: "#111827" },

  traineeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  traineeName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardSubtext: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

  deleteBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 8,
  },

  attendanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  attendanceCardContent: { flex: 1 },
  attendanceDate: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  badgeRow: { flexDirection: "row", gap: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f9fafb",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 },

  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  emptyStateTitle: { fontSize: 18, fontWeight: "700", marginTop: 12, color: "#111827" },
  emptyStateText: { fontSize: 14, color: "#6b7280", marginTop: 4, textAlign: "center" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#007bff",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalIconContainer: { marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
  modalMessage: { fontSize: 15, color: "#6b7280", textAlign: "center", marginBottom: 20 },
  buttonRow: { flexDirection: "row", gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  primaryButton: { backgroundColor: "#007bff" },
  secondaryButton: { backgroundColor: "#f3f4f6" },
  buttonText: { color: "#fff", fontWeight: "700" },
  secondaryButtonText: { color: "#111827", fontWeight: "700" },

  skeletonLine: { height: 14, borderRadius: 6, marginBottom: 8 },
  skeletonBadge: { height: 24, borderRadius: 8 },
  toast: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(10px)",
    gap: 10,
  },
  success: { backgroundColor: "#10b981" },
  error: { backgroundColor: "#ef4444" },
  toastText: { color: "#fff", fontWeight: "600", flex: 1 },
});
