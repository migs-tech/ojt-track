import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function EvaluationPage() {
  const [page, setPage] = useState(1);
  const [scores, setScores] = useState({});
  const [message, setMessage] = useState(null);
  const scrollRef = useRef();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const route = useRoute();
  const traineeId = route.params?.traineeId || 1;
  const traineeName = route.params?.traineeName || "Trainee";

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  //check if evaluation already saved
  useFocusEffect(
    useCallback(() => {
      const checkEvaluation = async () => {
        try {
          const result = await api.get(
            `/trainee/checkEvaluationExists?traineeId=${traineeId}`
          );
          if (result.data.exists) {
            setIsSaved(true);
            showMessage("Evaluation already submitted for this trainee.", "info");
          }
        } catch (err) {
          console.log(err);
        }
      };
      checkEvaluation();
    }, [traineeId])
  );

  const data = [
    {
      id: "1",
      title: "Leadership",
      items: [
        { id: "1a", text: "Has self-discipline and potential for leadership", max: 5 },
        { id: "1b", text: "Assumes responsibility readily and gains group loyalty", max: 5 },
        { id: "1c", text: "Understands clear instructions", max: 5 },
        { id: "1d", text: "Accepts suggestions and strives to improve work", max: 5 },
      ],
    },
    {
      id: "2",
      title: "Attitude Towards Work",
      items: [
        { id: "2a", text: "Makes use of time and doesn't waste it", max: 5 },
        { id: "2b", text: "Reports to work regularly on time", max: 5 },
        { id: "2c", text: "Follows company/agency rules", max: 5 },
        { id: "2d", text: "Courteous and polite", max: 5 },
      ],
    },
    {
      id: "3",
      title: "Performance",
      items: [
        { id: "3a", text: "Works accurately, efficiently and effectively", max: 5 },
        { id: "3b", text: "Accomplishes tasks on time", max: 5 },
        { id: "3c", text: "Follows instructions correctly", max: 5 },
        { id: "3d", text: "Produces quality work and cooperates with others", max: 5 },
      ],
    },
  ];

  const currentSection = page <= 3 ? data[page - 1] : null;

  const handleChange = (sectionId, itemId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [itemId]: {
          ...prev[sectionId]?.[itemId],
          [field]: value,
        },
      },
    }));
  };

  const handleScoreChange = (sectionId, itemId, rawValue) => {
    let value = rawValue.replace(/[^0-9]/g, "");

    if (value === "") {
      handleChange(sectionId, itemId, "points", "");
      return;
    }

    let num = parseInt(value);

    if (num < 1) num = 1;
    if (num > 5) num = 5;

    handleChange(sectionId, itemId, "points", String(num));
  };

  const isPageValid = () => {
    if (page > 3) return true;
    return currentSection.items.every((item) => {
      const points = scores[currentSection.id]?.[item.id]?.points;
      return points && points !== "";
    });
  };

  const saveEvaluation = async () => {
    setIsSaving(true);
    const payload = {
      scores: scores,
      traineeId: traineeId,
    };

    try {
      const result = await api.post("/trainee/saveEvaluationV2", payload);
      console.log(result.data);
      if (result.data.success) {
        showMessage("Evaluation saved successfully!", "success");
        setIsSaved(true);
      } else {
        showMessage(result.data.message || "Failed to save evaluation. Please try again.", "error");
      }
    } catch (err) {
      console.log(err);
      showMessage("An error occurred while saving. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

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
      {/* Top Progress */}
      <View style={styles.headerContainer}>
        <View style={styles.progressBar}>
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={[
                styles.progressStep,
                step <= page && styles.progressStepActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.pageIndicator}>Step {page} of 4</Text>
      </View>

      {/* Pages 1–3 */}
      {page <= 3 && (
        <ScrollView ref={scrollRef} style={styles.scrollView}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{currentSection.title}</Text>
          </View>

          {currentSection.items.map((item, index) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.pointsContainer}>
                  <Text style={styles.inputLabel}>Score</Text>

                  <TextInput
                    placeholder=""
                    keyboardType="numeric"
                    style={styles.pointsInput}
                    value={scores[currentSection.id]?.[item.id]?.points || ""}
                    onChangeText={(t) =>
                      handleScoreChange(currentSection.id, item.id, t)
                    }
                  />
                  <Text style={styles.maxScore}>/ {item.max}</Text>
                </View>
              </View>

              <View style={styles.remarksContainer}>
                <Text style={styles.inputLabel}>Remarks (Optional)</Text>
                <TextInput
                  placeholder="Add your comments here..."
                  style={styles.remarkInput}
                  multiline
                  value={scores[currentSection.id]?.[item.id]?.remarks || ""}
                  onChangeText={(t) =>
                    handleChange(currentSection.id, item.id, "remarks", t)
                  }
                />
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Page 4 - Review & Submit */}
      {page === 4 && (
        <View style={styles.submitPage}>
          <Text style={styles.summaryTitle}>Review & Submit</Text>
          <Text style={styles.summaryText}>
            Your evaluation is ready to submit.
          </Text>
          {/* Youre evaluation for traine name*/}
          <Text style={[styles.summaryText, { marginTop: 20, fontWeight: "600" }]}>
            Evaluating: {traineeName}
          </Text>
        </View>
      )}

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {page > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setPage(page - 1)}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}

        {page < 4 ? (
          <TouchableOpacity
            disabled={!isPageValid()}
            onPress={() => {
              setPage(page + 1);
              setTimeout(() => {
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }, 100);
            }}
            style={[styles.nextBtn, !isPageValid() && styles.btnDisabled]}
          >
            <Text style={styles.btnText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={saveEvaluation}
            disabled={isSaving || isSaved}
            style={[
              styles.saveBtn,
              (isSaving || isSaved) && { opacity: 0.6 }
            ]}
          >
            {isSaving ? (
              <Text style={styles.btnText}>Saving...</Text>
            ) : isSaved ? (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.btnText}>Saved</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Save Evaluation</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F9" },

  headerContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  progressBar: {
    flexDirection: "row",
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginHorizontal: 4,
  },
  progressStepActive: { backgroundColor: "#1E4FC2" },
  pageIndicator: { textAlign: "center", fontSize: 14, color: "#6b7280" },

  scrollView: { paddingHorizontal: 20 },

  sectionHeader: { alignItems: "center", marginVertical: 10 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#1a1a1a" },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", marginBottom: 12 },
  itemNumber: {
    width: 30,
    height: 30,
    backgroundColor: "#EEF3FC",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  itemNumberText: { color: "#1E4FC2", fontWeight: "700" },
  itemText: { flex: 1, fontSize: 16, fontWeight: "500", color: "#374151" },

  pointsContainer: { flexDirection: "row", alignItems: "center" },
  inputLabel: { marginBottom: 6, color: "#6b7280", fontSize: 13 },
  pointsInput: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 18,
    width: 70,
    textAlign: "center",
    backgroundColor: "#F6F7F9",
  },
  maxScore: { marginLeft: 8, color: "#9ca3af", fontSize: 15 },

  remarksContainer: { marginTop: 10 },
  remarkInput: {
    minHeight: 80,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F6F7F9",
    textAlignVertical: "top",
  },

  submitPage: { 
    alignItems: "center", 
    padding: 30,
    marginTop: 80,
    marginBottom: 320,
  },
  summaryTitle: { fontSize: 22, fontWeight: "bold" },
  summaryText: { marginTop: 10, color: "#6b7280", fontSize: 16 },

  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  backBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  backBtnText: { color: "#6b7280", fontWeight: "600" },

  nextBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1E4FC2",
    alignItems: "center",
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#15803D",
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  btnDisabled: { opacity: 0.4 },
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
