import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";

export default function EvaluationScreen() {
  const [page, setPage] = useState(1);
  const [scores, setScores] = useState({});
  const [signature, setSignature] = useState(null);
  const [confirmedSignature, setConfirmedSignature] = useState(null);
  const [isShowSignature, setIsShowPreview] = useState(false);

  const sigRef = useRef(null);

  const data = [
    {
      id: "1",
      title: "Leadership",
      icon: "👥",
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
      icon: "💼",
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
      icon: "⭐",
      items: [
        { id: "3a", text: "Works accurately, efficiently and effectively", max: 5 },
        { id: "3b", text: "Accomplishes tasks on time", max: 5 },
        { id: "3c", text: "Follows instructions correctly", max: 5 },
        { id: "3d", text: "Produces quality work and cooperates with others", max: 5 },
      ],
    },
  ];

  // *********************************
  // VALIDATION APPLIED HERE
  // *********************************
  const handleScoreChange = (sectionId, itemId, rawValue) => {
    // allow only digits
    let value = rawValue.replace(/[^0-9]/g, "");

    // allow empty
    if (value === "") {
      handleChange(sectionId, itemId, "points", "");
      return;
    }

    // convert to number
    let num = parseInt(value);

    // enforce min=1 max=5
    if (num < 1) num = 1;
    if (num > 5) num = 5;

    handleChange(sectionId, itemId, "points", String(num));
  };

  const showPreview = () => {
    setIsShowPreview(true);
  };

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

  const isPageValid = () => {
    if (page > 3) return true;
    if (!currentSection) return false;

    return currentSection.items.every((item) => {
      const points = scores[currentSection.id]?.[item.id]?.points;
      return points && points !== "";
    });
  };

  const handleSignature = (sig) => {
    setSignature(sig);
  };

  const confirmSignature = () => {
    if (!signature) {
      alert("Please sign first.");
      return;
    }
    setConfirmedSignature(signature);
    alert("Signature confirmed!");
  };

  const clearSignature = () => {
    if (sigRef.current) sigRef.current.clearSignature();
    setSignature(null);
    setConfirmedSignature(null);
    setIsShowPreview(false);
  };

  const saveEvaluation = async () => {
    const payload = {
      scores: scores,
      signature: confirmedSignature,
    };

    try {
      const response = await fetch("https://ojt.kamsite.com/api/user/saveSignature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log(result);
      alert("Saved!");
    } catch (err) {
      console.log(err);
      alert("Error saving evaluation.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Evaluation Form</Text>
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
      {page <= 3 && currentSection && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>{currentSection.icon}</Text>
            <Text style={styles.sectionTitle}>{currentSection.title}</Text>
          </View>

          {currentSection.items?.map((item, index) => (
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

      {/* Page 4 */}
      {page === 4 && (
        <View style={styles.signatureSection}>
          <Text style={styles.summaryTitle}>E-Signature</Text>
          <Text style={styles.summaryText}>Please provide your signature to complete the evaluation</Text>

          {!confirmedSignature && !isShowSignature && (
            <>
              <View style={styles.signatureBox}>
                <SignatureScreen
                  ref={sigRef}
                  onOK={handleSignature}
                  onEnd={() => sigRef.current.readSignature()}
                  descriptionText="Sign Here"
                  webStyle={`
                    .m-signature-pad--footer {display:none;}
                    .m-signature-pad {box-shadow:none; border:none;}
                  `}
                />
              </View>
              <View style={styles.signatureActions}>
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={clearSignature}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.previewBtn,
                    !signature && styles.btnDisabled
                  ]}
                  onPress={showPreview}
                  disabled={!signature}
                >
                  <Text style={styles.previewText}>Preview Signature</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {signature && isShowSignature && (
            <View style={styles.previewContainer}>
              <View style={styles.previewBox}>
                <Image
                  source={{ uri: signature }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>

              {!confirmedSignature ? (
                <View style={styles.signatureActions}>
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={clearSignature}
                  >
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={confirmSignature}
                  >
                    <Text style={styles.confirmText}>Confirm Signature</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.confirmedBadge}>
                  <Text style={styles.confirmedText}>✓ Signature Confirmed</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Footer Buttons */}
      {!(page === 4 && !confirmedSignature) && (
        <View style={styles.footer}>
          {page > 1 && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setPage(page - 1)}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}

          {page < 4 ? (
            <TouchableOpacity
              disabled={!isPageValid()}
              onPress={() => setPage(page + 1)}
              style={[
                styles.nextBtn,
                !isPageValid() && styles.btnDisabled,
                page === 1 && styles.nextBtnFull,
              ]}
            >
              <Text style={styles.btnText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={!confirmedSignature}
              onPress={saveEvaluation}
              style={[
                styles.saveBtn,
                !confirmedSignature && styles.btnDisabled,
              ]}
            >
              <Text style={styles.btnText}>Save Evaluation</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    backgroundColor: "#fff",
    paddingTop: 13,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: "#4F46E5",
  },
  pageIndicator: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 38,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  itemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemNumberText: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: 14,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    fontWeight: "500",
  },
  inputRow: {
    marginBottom: 12,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  pointsInput: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    width: 80,
    textAlign: "center",
    backgroundColor: "#f9fafb",
  },
  maxScore: {
    fontSize: 16,
    color: "#9ca3af",
    marginLeft: 8,
    fontWeight: "500",
  },
  remarksContainer: {
    marginTop: 4,
  },
  remarkInput: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#374151",
    backgroundColor: "#f9fafb",
    minHeight: 80,
    textAlignVertical: "top",
  },
  signatureSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
    height: 510,
  },
  summaryTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  summaryText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 15,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  signatureBox: {
    borderWidth: 2,
    borderColor: "#4F46E5",
    borderStyle: "dashed",
    height: 200, 
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  previewContainer: {
    marginTop: 24,
    width: "100%",
  },
  previewLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  previewBox: {
    width: "100%",
    height: 180,
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 12,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  signatureActions: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  clearText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 15,
  },
  confirmedBadge: {
    marginTop: 16,
    backgroundColor: "#D1FAE5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmedText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  backBtn: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  backBtnText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 16,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextBtnFull: {
    flex: 2,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: {
    backgroundColor: "#d1d5db",
    opacity: 0.6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  previewBtn: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  previewText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});