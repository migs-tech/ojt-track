import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import useTraineeStore from "@/store/useTraineeStore";

export default function SupervisorEvaluation() {
  const [criteria, setCriteria] = useState([
    { key: "personality", label: "Personality", score: 0, icon: "happy-outline" },
    { key: "punctuality", label: "Punctuality", score: 0, icon: "time-outline" },
    { key: "courtesy", label: "Courtesy", score: 0, icon: "hand-left-outline" },
    { key: "attitude", label: "Attitude Towards Work", score: 0, icon: "trending-up-outline" },
  ]);

  const [evaluationType, setEvaluationType] = useState("Midterm");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { submitEvaluation } = useTraineeStore();
  const route = useRoute();
  const traineeId = route.params?.traineeId || 1;
  const traineeName = route.params?.traineeName || "Trainee";

  const [keyboardOffset] = useState(new Animated.Value(0));

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height / 3,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const setScore = (key, score) =>
    setCriteria((prev) => prev.map((c) => (c.key === key ? { ...c, score } : c)));

  const totalScore = () => criteria.reduce((acc, c) => acc + c.score, 0);
  const maxScore = criteria.length * 5;
  const percentage = ((totalScore() / maxScore) * 100).toFixed(0);

  const validate = () => {
    const missing = criteria.filter((c) => c.score < 1);
    if (missing.length) {
      showMessage(
        `Please rate all criteria: ${missing.map((m) => m.label).join(", ")}`,
        "error"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      trainee_id: traineeId,
      evaluation_type: evaluationType,
      criteria: criteria.reduce((acc, c) => {
        acc[c.key] = c.score;
        return acc;
      }, {}),
      total_score: totalScore(),
      comments,
      evaluated_at: new Date().toISOString(),
    };

    const res = await submitEvaluation(payload);
    if (res.status === "success") {
      showMessage("Evaluation submitted successfully", "success");
      setCriteria((p) => p.map((c) => ({ ...c, score: 0 })));
      setComments("");
    } else {
      showMessage(res.message || "Failed to submit evaluation", "error");
    }
    setSubmitting(false);
  };

  const getPerformanceLevel = () => {
    const score = totalScore();
    if (score >= 18) return { label: "Excellent", color: "#15803D", icon: "star" };
    if (score >= 15) return { label: "Very Satisfactory", color: "#1E4FC2", icon: "thumbs-up" };
    if (score >= 12) return { label: "Satisfactory", color: "#B45309", icon: "checkmark-circle" };
    if (score >= 8) return { label: "Fair", color: "#B42318", icon: "alert-circle" };
    return { label: "Not Rated", color: "#9ca3af", icon: "help-circle" };
  };

  const performance = getPerformanceLevel();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Animated.View style={[styles.wrapper, { transform: [{ translateY: keyboardOffset }] }]}>
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

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.header, { backgroundColor: "#1E4FC2" }]}>
            <View style={styles.headerIcon}>
              <Ionicons name="clipboard-outline" size={32} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Performance Evaluation</Text>
            <Text style={styles.headerSub}>{traineeName}</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{evaluationType}</Text>
            </View>
          </View>

          <View style={styles.section}>
            {/* Evaluation Type */}
            <View style={styles.card}>
              <Text style={styles.label}>Evaluation Period</Text>
              <View style={styles.toggle}>
                {["Midterm", "Final"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setEvaluationType(type)}
                    style={[
                      styles.toggleBtn,
                      evaluationType === type && styles.toggleActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={type === "Midterm" ? "calendar-outline" : "trophy-outline"}
                      size={18}
                      color={evaluationType === type ? "#fff" : "#1E4FC2"}
                    />
                    <Text
                      style={
                        evaluationType === type ? styles.toggleTextActive : styles.toggleText
                      }
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Score Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.small}>Overall Score</Text>
                  <Text style={styles.total}>
                    {totalScore()} / {maxScore}
                  </Text>
                </View>
                <View style={[styles.badgePerf, { backgroundColor: performance.color }]}>
                  <Ionicons name={performance.icon} size={16} color="#fff" />
                  <Text style={styles.badgePerfText}>{performance.label}</Text>
                </View>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: performance.color }]}
                />
              </View>
              <Text style={styles.progressPercent}>{percentage}% Complete</Text>
            </View>

            {/* Criteria */}
            <View style={styles.card}>
              <View style={styles.rowHeader}>
                <Text style={styles.cardTitle}>Evaluation Criteria</Text>
                <Text style={styles.scale}>1-5 Scale</Text>
              </View>

              {criteria.map((c) => (
                <View key={c.key} style={styles.criteriaRow}>
                  <View style={styles.criteriaInfo}>
                    <View style={styles.criteriaIcon}>
                      <Ionicons name={c.icon} size={20} color="#1E4FC2" />
                    </View>
                    <Text style={styles.criteriaLabel}>{c.label}</Text>
                  </View>
                  <View style={styles.scoreRow}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[styles.scoreBtn, c.score >= n && styles.scoreBtnActive]}
                        onPress={() => setScore(c.key, n)}
                        activeOpacity={0.8}
                      >
                        <Text style={c.score >= n ? styles.scoreTextActive : styles.scoreText}>
                          {n}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Comments */}
            <View style={styles.card}>
              <View style={styles.rowHeader}>
                <Ionicons name="chatbox-ellipses-outline" size={20} color="#1E4FC2" />
                <Text style={styles.cardTitle}>Comments & Feedback</Text>
              </View>
              <TextInput
                multiline
                numberOfLines={6}
                style={styles.textarea}
                placeholder="Share your feedback..."
                placeholderTextColor="#9ca3af"
                value={comments}
                onChangeText={setComments}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submit, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <View style={[styles.submitGrad, { backgroundColor: submitting ? "#C7CDD8" : "#1E4FC2" }]}>
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.submitInner}>
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <Text style={styles.submitText}>Submit Evaluation</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 70 }} />
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F6F7F9" },
  scroll: { flexGrow: 1 },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#1E4FC2",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 16 },
  headerBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  headerBadgeText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  label: { color: "#6b7280", fontWeight: "700", marginBottom: 12 },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  toggleActive: { backgroundColor: "#1E4FC2" },
  toggleText: { color: "#374151", fontWeight: "600" },
  toggleTextActive: { color: "#fff", fontWeight: "700" },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  small: { color: "#6b7280", fontWeight: "600", marginBottom: 2 },
  total: { fontSize: 30, fontWeight: "800", color: "#111827" },
  badgePerf: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgePerfText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  progressBg: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressPercent: { textAlign: "center", color: "#6b7280", fontWeight: "600", marginTop: 6 },
  rowHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1f2937" },
  scale: {
    marginLeft: "auto",
    backgroundColor: "#EEF3FC",
    color: "#1E4FC2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "700",
  },
  criteriaRow: { marginBottom: 18 },
  criteriaInfo: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  criteriaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF3FC",
    alignItems: "center",
    justifyContent: "center",
  },
  criteriaLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  scoreRow: { flexDirection: "row", gap: 8 },
  scoreBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  scoreBtnActive: { backgroundColor: "#1E4FC2", borderColor: "#1E4FC2" },
  scoreText: { color: "#374151", fontWeight: "700" },
  scoreTextActive: { color: "#fff", fontWeight: "800" },
  textarea: {
    minHeight: 120,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#F6F7F9",
    color: "#111827",
    textAlignVertical: "top",
  },
  submit: { borderRadius: 16, overflow: "hidden", marginTop: 10 },
  submitGrad: { padding: 18, alignItems: "center" },
  submitInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 17},
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
  success: { backgroundColor: "#15803D" },
  error: { backgroundColor: "#B42318" },
  toastText: { color: "#fff", fontWeight: "600", flex: 1 },
});
