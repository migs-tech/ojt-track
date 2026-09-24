// src/screens/Supervisor/ReportDetailsScreen.js
import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

export default function ReportDetailsScreen({ route }) {
  const { report } = route.params;

  return (
    <ScrollView style={styles.container}>
      {report.image_url && (
        <Image source={{ uri: report.image_url }} style={styles.image} />
      )}
      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.description}>{report.description}</Text>
      <Text style={styles.date}>
        Submitted on: {report.date || "Unknown date"}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  description: { fontSize: 15, color: "#374151", lineHeight: 22 },
  date: {
    marginTop: 15,
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
  },
});
