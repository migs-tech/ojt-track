import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import {
   Pressable, 
   ScrollView, 
   StyleSheet, 
   Text, View, 
   TextInput,
   Modal,
   TouchableOpacity } from 'react-native';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CustomModal from '@/components/CustomModal';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { useSupervisorStore } from '@/store/useSupervisorStore';
import { useNavigation } from "@react-navigation/native";
import { useOtp } from '@/store/useOtpStore';
import DynamicModal from "@/components/DynamicModal";
import { useReportStore } from '@/store/useReportStore';
import { useQrStore } from '@/store/useQrStore';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const today = new Date();
const currentDayIndex = today.getDay() - 1; // Mon = 0, Sat = 5
const fullDate = format(today, 'EEEE, MMMM d, yyyy'); // e.g., Monday, August 4, 2025

export default function HomeIndex() {
  const navigation = useNavigation();

  const { loading, totalHours, fetchTotalHours } = useAttendanceStore();
  const [noSupervisorModal, setNoSupervisorModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [pendingModal, setPendingModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const {getReports } = useReportStore();
  const [reports, setReports] = useState([]);

  const {
    fetchSupervisorDetails,
    supervisors,
    sendSupervisorRequest,
    fetchMySupervisor,
    mySupervisor,
  } = useSupervisorStore();

  const {
      qrData,
      fetchQrCode,
  } = useQrStore();

  const { loading: otpLoading, error: otpError, generateOtp } = useOtp();
 
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [message, setMessage] = useState(null);
  const [isNotAllowToGenerateOtp, setIsNotAllowToGenerateOtp] = useState(false);

  // Load the QR once each time the screen is shown. (Fetching inside the effect below made
  // it run again on every response, sending requests in an endless loop.)
  useFocusEffect(
    useCallback(() => {
      fetchQrCode();
    }, [fetchQrCode])
  );

  // Work out whether a new OTP is allowed from the current QR
  useEffect(() => {
    {
      if (!qrData) {
        setIsNotAllowToGenerateOtp(false);
        return;
      }

      const expiresAt = new Date(qrData.expires_at).getTime();
      const now = Date.now();

      if (qrData.is_used === 1) {
        setIsNotAllowToGenerateOtp(true);
        return;
      }

      if (now < expiresAt && qrData.is_used === 0) {
        setIsNotAllowToGenerateOtp(true);
      } else {
        setIsNotAllowToGenerateOtp(false);
      }
    }
  }, [qrData]);
    
  const showMessage = (text, type) => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 2000);
  };

  const showSuccess = () => {
    setModalType("success");
    setModalMessage("The OTP was generated successfully!");
    setAlertModalVisible(true);
  };

  const handleVerify = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    const otpData = {
      username,
      password
    };
    try {
      const res = await generateOtp(otpData);
      if (res.success) {
        showSuccess();
      } else {
         showMessage(res.error || "Verification failed. Please try again.", "error");
      }
    } catch (error) {
      showMessage("An error occurred during verification. Please try again.", "error");
    }
    setModalVisible(false);
    setIsVerifying(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchSupervisorDetails();
      await fetchMySupervisor();
      
    };
    fetchData();
  }, [fetchSupervisorDetails, fetchMySupervisor]);

  const handleSaveSupervisor = async () => {
    const selectedSupObj = supervisors.find(s => s.id === selectedSupervisor);
    try {
      await sendSupervisorRequest(selectedSupObj.id);
      await fetchMySupervisor();
      Toast.show({
        type: 'success',
        text1: 'Supervisor Assigned',
        text2: `You have assigned ${selectedSupObj.username} as your supervisor.`,
        position: 'top',
        topOffset: 110,
      });
      setRequestModal(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: 'Unable to assign supervisor. Please try again.',
        position: 'top',
        topOffset: 110,
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTotalHours();
      fetchMySupervisor();

      const fetchReports = async () => {
        const res = await getReports();
        if (res && res.success) {
          setReports(res.reports);
        } else {
          setReports([]);
        }
      };

      if (reports.length < 3){
        fetchReports();
      }

      const interval = setInterval(() => {
        fetchTotalHours();
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(interval);
    }, [fetchTotalHours, fetchMySupervisor, getReports])
  );

  const supervisorName =
    mySupervisor && mySupervisor.length > 0
      ? mySupervisor[0].supervisor_name ?? 'N/A'
      : 'N/A';

  const safeReports = Array.isArray(reports) ? reports : [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      >
        {message && (
          <View
            style={[
              styles.messageBanner,
              styles[message.type],
              { flexDirection: "row", alignItems: "center" }
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
                  ? "#2E7D32"
                  : message.type === "error"
                  ? "#C62828"
                  : message.type === "info"
                  ? "#0288D1"
                  : "#ED6C02"
              }
            />
            <Text
              style={[
                styles.messageText,
                {
                  color:
                    message.type === "success"
                      ? "#2E7D32"
                      : message.type === "error"
                      ? "#C62828"
                      : message.type === "info"
                      ? "#0288D1"
                      : "#ED6C02"
                }
              ]}
            >
              {message.text}
            </Text>
          </View>
        )}
        {mySupervisor && mySupervisor.length > 0 ? (
          mySupervisor[0].status === 0 ? (
            // Case: Supervisor request is pending
            <View style={styles.supervisorCard}>
              <Pressable
                style={styles.supervisorButton}
                onPress={() => setPendingModal(true)}
              >
                <Ionicons name="time-outline" size={20} color="#f59e0b" />
                <Text style={styles.supervisorText}>
                  Request pending with {mySupervisor[0].supervisor_name}
                </Text>
              </Pressable>
              <Text style={styles.supervisorNote}>
                You will be notified once your supervisor approves your request.
              </Text>
            </View>
          ) : (
            // Case: Supervisor is approved
            <View style={styles.supervisorCard}>
              <View style={styles.supervisorButton}>
                <Ionicons name="person-circle-outline" size={20} color="#2076cc" />
                <Text style={styles.supervisorText}>
                  You have supervisor now: {supervisorName}
                </Text>
              </View>
              <Text style={styles.supervisorNote}>
                You can submit your report to your supervisor.
              </Text>
            </View>
          )
        ) : (
          // Case: No supervisor at all
          <View style={styles.supervisorCard}>
            <Pressable
              style={styles.supervisorButton}
              onPress={() => setNoSupervisorModal(true)}
            >
              <Ionicons name="person-circle-outline" size={20} color="#2076cc" />
              <Text style={styles.supervisorText}>No Supervisor</Text>
            </Pressable>
            <Text style={styles.supervisorNote}>
              Request supervisor to submit report
            </Text>
          </View>
        )}

        {/* Pending Request Modal */}
        <CustomModal
          visible={pendingModal}
          title="Pending Request"
          message={`\n\n Request sent to ${supervisorName}\n\nYou will be notified when your request is processed`}
          iconName="time-outline"
          onClose={() => setPendingModal(false)}
        />

        {/* First Modal: No Supervisor */}
        <CustomModal
          visible={noSupervisorModal}
          title="No Active Request"
          message="You haven't requested a supervisor yet"
          iconName="information-circle-outline"
          onClose={() => setNoSupervisorModal(false)}
          onAction={() => {
            setNoSupervisorModal(false);
            setRequestModal(true);
          }}
          actionLabel="Request Supervisor"
        />

        {/* Second Modal: Request Supervisor */}
        <CustomModal
          visible={requestModal}
          title="Request Supervisor"
          message="Select a supervisor to request supervision"
          iconName="person-add-outline"
          onClose={() => setRequestModal(false)}
          onAction={handleSaveSupervisor}
          actionLabel="Save"
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 6,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            <Picker
              style={{ width: '100%', color: 'black' }}
              selectedValue={selectedSupervisor}
              onValueChange={value => setSelectedSupervisor(value)}
            >
              <Picker.Item label="-- Select Supervisor --" value={null} color = "black" />
              {supervisors && supervisors.length > 0 ? (
                supervisors.map(sup => (
                  <Picker.Item key={sup.id} label={sup.username} value={sup.id} />
                ))
              ) : (
                <Picker.Item label="No supervisors found" value={null} color = "black" />
              )}
            </Picker>
          </View>

          <Text style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
            Your supervisor will need to approve your request
          </Text>
        </CustomModal>

        <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeTextContainer}>
                <Text style={styles.challengeTitle}>Daily Challenge</Text>
                <Text style={styles.challengeText}>
            Get your QR code before 7:00 AM
                </Text>
              </View>
              <Ionicons name="time-outline" size={64} color="#2076cc" />
            </View>
            <Pressable
              style={[
                styles.challengeButton,
                isNotAllowToGenerateOtp && { backgroundColor: "#ccc" }
              ]}
              onPress={() => setModalVisible(true)}
              disabled={isNotAllowToGenerateOtp}
            >
              <Text style={styles.challengeButtonText}>Generate Code</Text>
            </Pressable>
        </View>
        <View style={styles.attendanceCard}>
          <Text style={styles.attendanceTitle}>Weekly Attendance</Text>
          <View style={styles.weekRow}>
            {weekdays.map((day, index) => {
              const isToday = index === currentDayIndex;
              return (
                <View key={day} style={styles.dayItem}>
                  <Text
                    style={[
                      styles.dayText,
                      isToday && styles.activeDayText,
                    ]}
                  >
                    {day}
                  </Text>
                  {isToday && <View style={styles.dot} />}
                </View>
              );
            })}
          </View>
          <Text style={styles.fullDate}>{fullDate}</Text>
        </View>

        <View style={styles.totalHoursCard}>
          <View style={styles.totalHoursHeader}>
            <Text style={styles.totalHoursTitle}>Total Hours</Text>
            <Pressable onPress={() => navigation.navigate("Attendance")}>
              <Text style={styles.seeAllText}>See all &gt;</Text>
            </Pressable>
          </View>
          <Text style={styles.workHoursHeading}>Overall work hours</Text>
          <Text style={styles.workHoursDescription}>
            This is your total hours of working
          </Text>
          <View style={styles.totalHoursValueBox}>
            <Text style={styles.totalHoursValueText}> {totalHours}</Text>
          </View>
        </View>

        <View style={styles.dailyReportCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Daily Report</Text>
            <Pressable onPress={() => navigation.navigate("Report", { screen: "History" })}>
              <Text style={styles.cardSeeAll}>See all &gt;</Text>
            </Pressable>
          </View>

          <View style={styles.reportList}>
            {reports && reports.length > 0 ? (
              safeReports.slice(0, 3).map((report) => (
                <Text key={report.id} style={styles.reportItem}>
                  - {report.title}
                </Text>
              ))
            ) : (
              <Text style={styles.reportItem}>No report yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
      {/* Verification Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Verification Required</Text>
            <Text style={styles.modalSubtitle}>
              Please enter your username and password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#999"
              autoCapitalize="none"
              color="black"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
              autoCapitalize="none"
              color="black"
            />

            <Pressable
              style={[
                styles.verifyButton,
                (!username || !password || isVerifying) && { backgroundColor: "#ccc" }, // gray if disabled
              ]}
              onPress={handleVerify}
              disabled={!username || !password || isVerifying} // disable if empty or already verifying
            >
              <Text style={styles.verifyButtonText}>
                {isVerifying ? "Verifying..." : "Verify"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <DynamicModal
        visible={alertModalVisible}
        type={modalType}
        message={modalMessage}
        onClose={() => setAlertModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  row: {
    justifyContent: 'space-between',
  },
  flatListContent: {
    paddingBottom: 16,
  },
  supervisorCard: {
    marginBottom: 16,
    backgroundColor: '#e6f0fc',
    borderRadius: 12,
    padding: 16,
  },
  supervisorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  supervisorText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2076cc',
  },
  supervisorNote: {
    fontSize: 13,
    color: '#4d6a8b',
  },
  challengeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  challengeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  challengeButton: {
    backgroundColor: '#2076cc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  challengeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeDayText: {
    color: '#2076cc',
    fontWeight: 'bold',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2076cc',
    marginTop: 4,
  },
  fullDate: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  totalHoursCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  totalHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalHoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2076cc',
  },
  workHoursHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  workHoursDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  totalHoursValueBox: {
    marginTop: 12,
    backgroundColor: '#2076cc',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  totalHoursValueText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dailyReportCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSeeAll: {
    fontSize: 14,
    color: '#2076cc',
    fontWeight: '500',
  },
  reportList: {
    marginTop: 8,
  },
  reportItem: {
    fontSize: 14,
    marginBottom: 4,
  },
   modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: "#2076cc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
  success: { backgroundColor: "#DFF6E0" }, // light green
  error: { backgroundColor: "#FDE2E1" }, // light red
  info: { backgroundColor: "#E0F2FE" }, // light blue
  warning: { backgroundColor: "#FFF4E5" }, // light yellow
  messageText: { marginLeft: 8, fontSize: 15, fontWeight: "600" },
});
