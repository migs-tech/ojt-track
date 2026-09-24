// src/screens/Supervisor/TraineeDetailsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import useTraineeStore from "@/store/useTraineeStore";

export default function TraineeDetailsScreen({ route }) {
  const { getTraineeDataById } = useTraineeStore();
  const [traineeData, setTraineeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const navigation = useNavigation();

  const { item } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTraineeDataById(item?.trainee_id);
        setTraineeData(data);
        setReports(data?.reports || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getTraineeDataById]);

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate("ReportDetails", { report: item })}
      activeOpacity={0.7}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportIconContainer}>
          <Ionicons name="document-text" size={16} color="#3B82F6" />
        </View>
        <Text style={styles.reportDate}>
          {new Date(item.created_at || Date.now()).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          })}
        </Text>
      </View>
      <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.reportDesc} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const totalDays = (traineeData?.total_present || 0) + (traineeData?.total_absent || 0);
  const attendanceRate = totalDays > 0 
    ? ((traineeData?.total_present || 0) / totalDays * 100).toFixed(1)
    : 0;

  return (
    <>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loaderText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Compact Profile Section */}
          <LinearGradient
            colors={['#eceef1ff', '#e5e8eeff']}
            style={styles.profileSection}
          >
            <View style={styles.profileRow}>
              <View style={styles.profileLeft}>
                <Image
                  source={{
                    uri:
                      traineeData?.trainee?.avatar_url ||
                      "https://randomuser.me/api/portraits/men/32.jpg",
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>
                    {traineeData?.trainee?.trainee_name || "John Doe"}
                  </Text>
                  <Text style={styles.email}>
                    {traineeData?.trainee?.email || "johndoe@email.com"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.evaluateButton}
                onPress={() => {
                  const params = {
                    traineeId: item?.trainee_id,
                    traineeName: traineeData?.trainee?.trainee_name,
                  };
                  // Midterm/Final evaluation (as in the study) or the 12-item OJT evaluation form
                  Alert.alert("Evaluate Trainee", "Choose the evaluation to fill out:", [
                    { text: "Midterm / Final", onPress: () => navigation.navigate("SupervisorEvaluation", params) },
                    { text: "Evaluation Form", onPress: () => navigation.navigate("EvaluationPage", params) },
                    { text: "Cancel", style: "cancel" },
                  ]);
                }}
              >
                <Ionicons name="clipboard-outline" size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Compact Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color="#3B82F6" />
              <Text style={styles.statValue}>{traineeData?.total_hours || 0}h</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <Text style={styles.statValue}>{attendanceRate}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="document-text-outline" size={18} color="#F59E0B" />
              <Text style={styles.statValue}>{reports.length}</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
          </View>

          {/* Compact Attendance Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
              <Text style={styles.cardTitle}>Attendance</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${attendanceRate}%` }]} />
            </View>
            <Text style={styles.progressText}>{attendanceRate}% Rate</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <FontAwesome5 name="check" size={14} color="#10B981" />
                <Text style={styles.statBoxValue}>{traineeData?.total_present || 0}</Text>
                <Text style={styles.statBoxLabel}>Present</Text>
              </View>
              <View style={styles.statBox}>
                <FontAwesome5 name="times" size={14} color="#EF4444" />
                <Text style={styles.statBoxValue}>{traineeData?.total_absent || 0}</Text>
                <Text style={styles.statBoxLabel}>Absent</Text>
              </View>
            </View>
          </View>

          {/* Compact Duty Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="briefcase-outline" size={18} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Duty Information</Text>
            </View>
            
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Hours</Text>
                <Text style={styles.infoValue}>{traineeData?.total_hours || 0}h</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{traineeData?.ojt_duration || "6 months"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{traineeData?.department || "IT"}</Text>
              </View>
            </View>
          </View>

          {/* Compact Reports */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={18} color="#F59E0B" />
              <Text style={styles.cardTitle}>Daily Reports</Text>
              {reports.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{reports.length}</Text>
                </View>
              )}
            </View>
            
            {reports.length > 0 ? (
              <FlatList
                data={reports}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderReport}
                scrollEnabled={false}
                contentContainerStyle={styles.reportsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={32} color="#CBD5E1" />
                <Text style={styles.emptyText}>No reports yet</Text>
              </View>
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  
  // Profile Section
  profileSection: {
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#000000ff",
    marginBottom: 2,
  },
  email: { 
    fontSize: 13, 
    color: "rgba(19, 3, 3, 0.85)",
  },
  evaluateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },

  // Progress Bar
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },

  // Stats Row
  statsRow: { 
    flexDirection: "row", 
    gap: 12,
  },
  statBox: { 
    flex: 1,
    alignItems: "center",
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  statBoxLabel: { 
    fontSize: 11, 
    color: "#64748B",
    fontWeight: '500',
  },

  // Info List
  infoList: {
    gap: 10,
  },
  infoItem: { 
    flexDirection: "row", 
    justifyContent: 'space-between',
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },

  // Reports
  reportsList: {
    gap: 10,
  },
  reportCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportDate: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  reportTitle: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: "#0F172A",
    marginBottom: 4,
  },
  reportDesc: { 
    fontSize: 13, 
    color: "#64748B", 
    lineHeight: 18,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    gap: 12,
  },
  loaderText: { 
    fontSize: 14, 
    color: "#64748B",
  },
});