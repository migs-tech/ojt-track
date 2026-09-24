import React, { useLayoutEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useReportStore } from "@/store/useReportStore";

export default function ReportDetails({ route, navigation }) {
  const { reportId } = route.params;
  const { reports } = useReportStore();

  const report = useMemo(
    () => reports.find((r) => r.id === reportId),
    [reports, reportId]
  );

  useLayoutEffect(() => {
    if (report) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditReport", { reportId: report.id })
            }
            style={{ marginRight: 15 }}
          >
            <Ionicons name="create-outline" size={22} color="#e7e8ebff" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, report]);

  if (!report) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "gray" }}>Report not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ✅ Display all file URLs */}
      {report?.files?.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
        >
          {report.files.map((file, index) => (
            <Image
              key={file.id || index}
              source={{ uri: file.url }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      <Text style={styles.title}>{report?.title}</Text>
      <Text style={styles.date}>
        {new Date(report?.date).toLocaleString()}
      </Text>
      <Text style={styles.desc}>{report?.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: {
    width: 220,
    height: 160,
    borderRadius: 12,
    marginRight: 10,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  date: { fontSize: 14, color: "gray", marginBottom: 12 },
  desc: { fontSize: 16, lineHeight: 22 },
});
