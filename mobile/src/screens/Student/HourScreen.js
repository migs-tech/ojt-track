import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useHourStore } from '@/store/useHourStore';

export default function AttendanceScreen() {
  const [attendanceData, setAttendanceData] = useState([]);
  const { fetchAttendanceByUserId } = useHourStore();
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState("0h 0m 0s");
  const [daysCount, setDaysCount] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await fetchAttendanceByUserId();
        if (!data) throw new Error("No data received");
        // Use backend response directly
        setAttendanceData(data.records || []);
        setTotalHours(data.total_hours || "0h 0m 0s");
        setDaysCount(data.days_count || 0);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const renderItem = ({ item }) => {
    const isAbsent = !item.is_present;

    return (
      <View style={styles.attendanceCard}>
        {/* Top row: Date + Tag */}
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <View
              style={[
                styles.greenDot,
                { backgroundColor: isAbsent ? "red" : "green" },
              ]}
            />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View
            style={[
              styles.presentTag,
              { backgroundColor: isAbsent ? "#fdecea" : "#e8f9ee" },
            ]}
          >
            <Text
              style={[
                styles.presentText,
                { color: isAbsent ? "red" : "green" },
              ]}
            >
              {isAbsent ? "Absent" : "Present"}
            </Text>
          </View>
        </View>

        {/* Bottom row: In/Out/Duration */}
        {!isAbsent ? (
          <Text style={styles.inOutText}>
            In: {item.time_in}   Out: {item.time_out}{"   "}
            <Text style={styles.duration}>{item.duration}</Text>
          </Text>
        ) : (
          <Text
            style={[styles.inOutText, { color: "red", fontStyle: "italic" }]}
          >
            No attendance recorded
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#52389bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Overall Work Hours */}
      <View style={styles.overallCard}>
        <Text style={styles.overallTitle}>Overall work hours</Text>
        <Text style={styles.overallSubtitle}>
          This is your total hours of working.
        </Text>
        <View style={styles.redBox}>
          <Text style={styles.redBoxText}>{totalHours}</Text>
        </View>
      </View>

      {/* Today's Hours (first item only) */}
      <View style={styles.rowBetween}>
        <Text style={styles.todayTitle}>Today's Hours</Text>
        <View style={styles.grayBox}>
          <Text style={styles.grayBoxText}>
            {attendanceData[0]?.duration || "0h 0m 0s"}
          </Text>
        </View>
      </View>

      {/* Attendance History */}
      <View style={styles.rowBetween}>
        <Text style={styles.historyTitle}>Attendance History</Text>
        <Text style={styles.historyDays}>{daysCount} days</Text>
      </View>

      <FlatList
        data={attendanceData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },

  // Overall work hours
  overallCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  overallTitle: { fontSize: 16, fontWeight: "bold", color: "#52389bff" },
  overallSubtitle: { fontSize: 12, color: "#555", marginVertical: 5 },
  redBox: {
    backgroundColor: "#684ff5ff",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 5,
  },
  redBoxText: { fontSize: 22, fontWeight: "bold", color: "#fff" },

  // Today’s Hours
  todayTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  grayBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  grayBoxText: { fontSize: 14, fontWeight: "600", color: "#3f3db6ff" },

  // Attendance History
  historyTitle: { fontSize: 16, fontWeight: "600", marginVertical: 10 },
  historyDays: { fontSize: 14, color: "#777" },

  // Attendance Card
  attendanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "green",
    marginRight: 8,
  },
  dateText: { fontSize: 15, fontWeight: "600" },
  presentTag: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  presentText: { fontWeight: "600", fontSize: 13 },
  inOutText: { fontSize: 14, marginTop: 8, color: "#333" },
  duration: { color: "#2a46e4ff", fontWeight: "600" },
});
