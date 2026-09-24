import React, { useCallback, memo, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useReportStore } from "@/store/useReportStore";

const ITEM_HEIGHT = 200; // average trainee card height

// ✅ Memoized Report Card
const ReportCard = memo(
  ({ report }) => {
    // Prefer image_url, else first file from files array
    const imageSource =
      report.image_url || (report.files?.length > 0 ? report.files[0] : null);

    return (
      <View style={styles.reportCard}>
        {imageSource ? (
          <Image source={{ uri: imageSource }} style={styles.reportImage} />
        ) : (
          <View style={[styles.reportImage, styles.reportImagePlaceholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.reportContent}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDate}>
            {new Date(report.date).toLocaleDateString()}
          </Text>
          <Text style={styles.reportDesc} numberOfLines={2}>
            {report.description}
          </Text>
        </View>
      </View>
    );
  },
  (prev, next) => prev.report.id === next.report.id
);

// ✅ Memoized Trainee Card
const TraineeCard = memo(
  ({ item }) => {
    const navigation = useNavigation();
    const reports = item.reports?.filter(Boolean) || [];
    const visibleReports = reports.slice(0, 2);

    const handleNavigate = useCallback(() => {
      navigation.navigate("TraineeReportList", {
        traineeId: item.trainee_id,
        traineeName: item.trainee_name,
      });
    }, [navigation, item.trainee_id, item.trainee_name]);

    return (
      <View style={styles.traineeCard}>
        {/* Header */}
        <View style={styles.traineeHeader}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitials}>
                {item.trainee_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.traineeName}>{item.trainee_name}</Text>
            <Text style={styles.assignedAt}>
              Assigned: {new Date(item.assigned_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Reports */}
        <View style={styles.reportList}>
          {reports.length > 0 ? (
            <>
              {visibleReports.map((r) => (
                <ReportCard key={r.id} report={r} />
              ))}

              {reports.length&& (
                <TouchableOpacity onPress={handleNavigate} style={styles.viewAllBtn}>
                  <Text style={styles.viewAllText}>
                    View All Reports ({reports.length})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.noReports}>No reports yet</Text>
          )}
        </View>
      </View>
    );
  },
  (prev, next) => prev.item.trainee_id === next.item.trainee_id
);

export default function ReportScreen() {
  const { getTraineeLatestReport } = useReportStore();
  const [traineeLatestReport, setTraineeLatestReport] = useState([]);

  const renderTrainee = useCallback(
    ({ item }) => <TraineeCard item={item} />,
    []
  );

  const getItemLayout = useCallback(
    (data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  useEffect(() => {
    (async () => {
      const res = await getTraineeLatestReport();
      setTraineeLatestReport(res.data || []);
    })();
  }, [getTraineeLatestReport]);

  return (
    <View style={styles.container}>
      {traineeLatestReport.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#9ca3af", fontSize: 16, fontStyle: "italic" }}>
            No trainee yet with reports.
          </Text>
        </View>
      ) : (
        <FlatList
          data={traineeLatestReport}
          keyExtractor={(item) => item.trainee_id.toString()}
          renderItem={renderTrainee}
          contentContainerStyle={{ padding: 16 }}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={10}
          getItemLayout={getItemLayout}
          removeClippedSubviews
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  traineeCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  traineeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  traineeName: { fontSize: 16, fontWeight: "bold", color: "#111" },
  assignedAt: { fontSize: 12, color: "#6b7280" },
  reportList: { marginTop: 8 },
  reportCard: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  reportImage: { width: 80, height: 80, backgroundColor: "#e5e7eb" },
  reportImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { fontSize: 12, color: "#9ca3af" },
  reportContent: { flex: 1, padding: 8 },
  reportTitle: { fontSize: 14, fontWeight: "bold", color: "#111" },
  reportDate: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  reportDesc: { fontSize: 13, color: "#374151" },
  noReports: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" },
  viewAllBtn: {
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
  viewAllText: { color: "#2563eb", fontWeight: "bold" },
});