// Trainee attendance history with total hours.
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import { useAuth } from "@/store/useAuthStore";

const BLUE = "#2076cc";

// "12h 30m 5s" -> "12h 30m"
const short = (d) => (d ? String(d).replace(/\s*\d+s$/, "") : null);
const toHours = (text) => {
  const m = String(text || "").match(/(\d+)h\s*(\d+)m/);
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
};

export default function AttendanceScreen() {
  const { myAttendance, fetchMyAttendance } = useAttendanceStore();
  const { profile } = useAuth();
  const [loaded, setLoaded] = useState(!!myAttendance);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMyAttendance().finally(() => setLoaded(true));
    }, [fetchMyAttendance])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyAttendance();
    setRefreshing(false);
  };

  if (!loaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  const records = myAttendance?.records || [];
  const today = myAttendance?.today;
  const presentDays = records.filter((r) => r.is_present && r.time_in).length;
  const absentDays = records.filter((r) => Number(r.status) === 2).length;
  const done = toHours(myAttendance?.total_hours);
  const required = Number(profile?.ojt_required_hours) || 0;

  const renderItem = ({ item }) => {
    const absent = Number(item.status) === 2 || !item.time_in;
    const inProgress = !absent && !item.time_out;
    return (
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: absent ? "#ef4444" : inProgress ? BLUE : "#16a34a" }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.muted}>
            {absent
              ? "Absent"
              : inProgress
              ? `In ${item.time_in} · still working`
              : `${item.time_in} – ${item.time_out}`}
          </Text>
        </View>
        {!absent && item.duration ? <Text style={styles.duration}>{short(item.duration)}</Text> : null}
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BLUE]} />}
      ListHeaderComponent={
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>Total hours</Text>
            <Text style={styles.summaryValue}>
              {short(myAttendance?.total_hours) || "0h 0m"}
              {required ? <Text style={styles.summaryOf}> of {required}h</Text> : null}
            </Text>
            {required ? (
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.min(100, (done / required) * 100)}%` }]} />
              </View>
            ) : null}
            <View style={styles.stats}>
              <Text style={styles.stat}>
                <Text style={styles.statNum}>{presentDays}</Text> present
              </Text>
              <Text style={styles.stat}>
                <Text style={styles.statNum}>{absentDays}</Text> absent
              </Text>
              <Text style={styles.stat}>
                Today: <Text style={styles.statNum}>{today?.duration ? short(today.duration) : "—"}</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>History</Text>
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={44} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No attendance yet</Text>
          <Text style={styles.muted}>Days appear here after your supervisor scans your QR code.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  center: { alignItems: "center", justifyContent: "center" },
  summary: { backgroundColor: BLUE, borderRadius: 18, padding: 18, marginBottom: 18 },
  summaryLabel: { color: "#dbeafe", fontSize: 13 },
  summaryValue: { color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 2 },
  summaryOf: { fontSize: 16, fontWeight: "600", color: "#dbeafe" },
  track: { height: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, marginTop: 12, overflow: "hidden" },
  fill: { height: 8, backgroundColor: "#fff", borderRadius: 4 },
  stats: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  stat: { color: "#dbeafe", fontSize: 13 },
  statNum: { color: "#fff", fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  date: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  muted: { fontSize: 13, color: "#64748b", marginTop: 2 },
  duration: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  empty: { alignItems: "center", padding: 32, gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#334155" },
});
