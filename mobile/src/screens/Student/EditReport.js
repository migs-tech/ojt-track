import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Modal
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useReportStore } from "@/store/useReportStore";

export default function EditReport({ route, navigation }) {
  const { reportId } = route.params;
  const { updateReport, getReports, reports } = useReportStore();
  const [modalAlertVisible, setModalAlertVisible] = useState(false);

  const report = useMemo(
    () => reports.find((r) => r.id === reportId),
    [reports, reportId]
  );

  const [title, setTitle] = useState(report.title);
  const [description, setDescription] = useState(report.description);
  const [date, setDate] = useState(new Date(report.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [files, setFiles] = useState(
    report.files
      ? report.files.map((f) => ({ ...f, isExisting: true }))
      : []
  );
  const [descHeight, setDescHeight] = useState(120);
  const [message, setMessage] = useState(null);
  const [removeExistingFiles, setRemoveExistingFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setMessage({
        type: "error",
        text: "Permission denied. Please allow access to photos.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 1 - files.length,
    });

    if (!result.canceled) {
      let newFiles = [
        ...files,
        ...result.assets.map((a) => ({
          uri: a.uri,
          name: a.fileName || `image_${Date.now()}.jpg`,
          type: a.mimeType || "image/jpeg",
          isExisting: false,
        })),
      ];
      if (newFiles.length > 1) {
        setModalAlertVisible(true);
        newFiles = newFiles.slice(0, 1);
      }
      setFiles(newFiles);
    }
  };

  const removeFile = (index) => {
    const file = files[index];
    if (file.isExisting) {
      // store its ID for deletion
      setRemoveExistingFiles((prev) => [...prev, file.id]);
    }
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const saveChanges = async () => {
    if (!title || !description || !date) {
      setMessage({ type: "error", text: "Please fill all fields" });
      return;
    }

    const formData = new FormData();
    formData.append("id", report.id);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date.toISOString());
    formData.append("remove_files", JSON.stringify(removeExistingFiles));

    files.forEach((file, i) => {
      if (!file.isExisting) {
        formData.append("files[]", {
          uri: file.uri,
          name: file.name || `image_${i}.jpg`,
          type: file.type || "image/jpeg",
        });
      }
    });
    setLoading(true);

    try {
      const res = await updateReport(formData);
      await getReports();

      if (res && res.success) {
        setMessage({ type: "success", text: "Report updated successfully" });
      } else {
        setMessage({ type: "error", text: "Could not update the report." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Update failed. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f9fafc" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter report title"
          placeholderTextColor={"#999"}
          color={"#333"}
        />

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ fontSize: 15, color: "#333" }}>
            {date.toDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: descHeight, textAlignVertical: "top" }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Enter description"
          onContentSizeChange={(e) =>
            setDescHeight(Math.max(120, e.nativeEvent.contentSize.height))
          }
          placeholderTextColor={"#999"}
          color={"#333"}
        />

        {/* File Attachment */}
        <Text style={styles.label}>Attachment</Text>
        <TouchableOpacity style={styles.selectBtn} onPress={pickFile}>
          <Ionicons name="images" size={20} color="#fff" />
          <Text style={styles.btnText}>
            {files.length > 0 ? "Add More Images" : "Select Images"}
          </Text>
        </TouchableOpacity>

        {files.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {files.map((file, index) => (
              <View key={index} style={styles.previewBox}>
                <Image
                  source={{ uri: file.isExisting ? file.url : file.uri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  onPress={() => removeFile(index)}
                  style={styles.removeBtnOverlay}
                >
                  <MaterialIcons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Message */}
        {message && (
          <View
            style={[
              styles.messageBox,
              message.type === "success"
                ? styles.successBox
                : message.type === "error"
                ? styles.errorBox
                : styles.infoBox,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={saveChanges}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        visible={modalAlertVisible}
        animationType="fade"
        onRequestClose={() => setModalAlertVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: 300,
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 20,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Limit Reached</Text>
            <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>You can only upload one image.</Text>
            <TouchableOpacity
              style={[styles.submitButton, { width: '100%' }]}
              onPress={() => setModalAlertVisible(false)}
            >
              <Text style={styles.submitText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#444",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a90e2",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: "center",
  },
  btnText: { color: "#fff", marginLeft: 8, fontWeight: "600" },
  previewBox: {
    position: "relative",
    marginRight: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeBtnOverlay: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#F44336",
    borderRadius: 12,
    padding: 2,
  },
  messageBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  successBox: {
    backgroundColor: "#4CAF50",
  },
  errorBox: {
    backgroundColor: "#F44336",
  },
  infoBox: {
    backgroundColor: "#2196F3",
  },
  footer: {
    backgroundColor: "#f9fafc",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
