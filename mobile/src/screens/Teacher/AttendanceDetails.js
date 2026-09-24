import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useTraineeStore from "@/store/useTraineeStore";

export default function AttendanceDetails() {
  const route = useRoute();
  const { date } = route.params;

  const { attendanceRecords } = useTraineeStore();

  // Get attendance by date
  const attendanceData = attendanceRecords?.attendance?.[date] || { trainees: [] };

  // Separate present/absent
  const presentTrainees =
    attendanceData.trainees?.filter((t) => t.status === 1) || [];
  const absentTrainees =
    attendanceData.trainees?.filter((t) => t.status === 2) || [];

  const totalTrainees = presentTrainees.length + absentTrainees.length;
  const attendanceRate = totalTrainees > 0 
    ? ((presentTrainees.length / totalTrainees) * 100).toFixed(1)
    : 0;

  const renderTrainee = ({ item, type }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.traineeCard,
        type === "present" ? styles.presentCard : styles.absentCard
      ]}
    >
      <View style={styles.traineeContent}>
        <View style={styles.traineeInfo}>
          <Text style={styles.traineeName}>{item.trainee_name}</Text>
          {item.remarks ? (
            <View style={styles.remarksContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={12} color="#6B7280" />
              <Text style={styles.remarksText}>{item.remarks}</Text>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.statusBadge,
            type === "present" ? styles.presentBadge : styles.absentBadge,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              type === "present" ? styles.presentBadgeText : styles.absentBadgeText,
            ]}
          >
            {type === "present" ? "Present" : "Absent"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="calendar" size={32} color="#fff" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerDate}>{date}</Text>
            <Text style={styles.headerSubtitle}>Daily Attendance Report</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalTrainees}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {presentTrainees.length}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {absentTrainees.length}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>
              {attendanceRate}%
            </Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Present Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={styles.sectionTitle}>
                Present Trainees
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{presentTrainees.length}</Text>
            </View>
          </View>

          {presentTrainees.length > 0 ? (
            <View style={styles.traineeList}>
              {presentTrainees.map((item, index) => (
                <View key={`present-${index}`}>
                  {renderTrainee({ item, type: "present" })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No present trainees</Text>
            </View>
          )}
        </View>

        {/* Absent Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </View>
              <Text style={styles.sectionTitle}>
                Absent Trainees
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{absentTrainees.length}</Text>
            </View>
          </View>

          {absentTrainees.length > 0 ? (
            <View style={styles.traineeList}>
              {absentTrainees.map((item, index) => (
                <View key={`absent-${index}`}>
                  {renderTrainee({ item, type: "absent" })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="happy-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No absentees today</Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F3F4F6" 
  },

  // Header
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerDate: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0E7FF",
    fontWeight: '500',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#E0E7FF',
    fontWeight: '600',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  countBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // Trainee List
  traineeList: {
    gap: 8,
  },

  // Trainee Card
  traineeCard: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  presentCard: {
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  absentCard: {
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  traineeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },

  // Status Indicator
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  presentIndicator: {
    backgroundColor: '#10B981',
  },
  absentIndicator: {
    backgroundColor: '#EF4444',
  },

  // Trainee Info
  traineeInfo: {
    flex: 1,
  },
  traineeName: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#111827",
    marginBottom: 4,
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  remarksText: { 
    fontSize: 13, 
    color: "#6B7280",
    fontStyle: 'italic',
    flex: 1,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  presentBadge: {
    backgroundColor: '#ECFDF5',
  },
  absentBadge: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  presentBadgeText: {
    color: '#10B981',
  },
  absentBadgeText: {
    color: '#EF4444',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: '500',
    marginTop: 12,
  },
});