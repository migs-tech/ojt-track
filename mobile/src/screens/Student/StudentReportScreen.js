import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  Image,
  Pressable,
  ScrollView,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useReportStore } from "@/store/useReportStore";
import Modal from "react-native-modal"; // 👈 use this instead of RN Modal
import { set } from "date-fns";

const Tab = createMaterialTopTabNavigator();

function SubmitReport() {
  const { saveReport, loading, getReports } = useReportStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

    
  const showMessage = (text, type) => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null),3000);
  };

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
       showAlert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      let newFiles = [...files, ...result.assets];
      if (newFiles.length > 1) {
        showAlert("You can only upload one image per report.");
        newFiles = newFiles.slice(0, 1);
      }
      setFiles(newFiles);
    }
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };


  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  };

  const submitReport = async () => {
    if (!title || !description) {
      showMessage("Please fill in all required fields", "error");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date.toISOString());

    if (files.length > 0) {
      files.forEach((file, i) => {
        formData.append("files[]", {
          uri: file.uri,
          name: file.fileName || `image_${i}.jpg`,
          type: file.mimeType || "image/jpeg",
        });
      });
    }
    try {
      const res = await saveReport(formData);
      if (res.success) {
        showMessage("Report submitted successfully", "success");
        setTitle("");
        setDescription("");
        setDate(new Date());
        setFiles([]);
        await getReports(); // Refresh the report list
      } else {
        showMessage(res.message || "Failed to submit report", "error");
      }
      
    } catch (error) {
      showMessage("Failed to submit report", "error");
    }
  };

  return (
    <View style={styles.container}>
      {message && (
        <View
          style={[
            styles.messageBanner,
            styles[message.type], // maps directly to success, error, info, warning
          ]}
        >
          <Ionicons
            name={
              message.type === "success"
                ? "checkmark-circle"
                : message.type === "error"
                ? "close-circle"
                : message.type === "info"
                ? "information-circle"
                : "warning"
            }
            size={22}
            color={
              message.type === "success"
                ? "#2E7D32"
                : message.type === "error"
                ? "#C62828"
                : message.type === "info"
                ? "#0288D1"
                : "#ED6C02"
            }
          />
          <Text
            style={[
              styles.messageText,
              {
                color:
                  message.type === "success"
                    ? "#2E7D32"
                    : message.type === "error"
                    ? "#C62828"
                    : message.type === "info"
                    ? "#0288D1"
                    : "#ED6C02",
              },
            ]}
          >
            {message.text}
          </Text>
        </View>
      )}

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
        placeholderTextColor={"#999"}
        color={"#333"}
      />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 150 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
        placeholderTextColor={"#999"}
        color={"#333"}
      />

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
              <Image source={{ uri: file.uri }} style={styles.previewImage} />
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

      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.7 }]}
        onPress={submitReport}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Saving..." : "Submit Weekly Report"}
        </Text>
      </TouchableOpacity>
      <Modal
        isVisible={alertVisible}
        onBackdropPress={() => setAlertVisible(false)}
        onBackButtonPress={() => setAlertVisible(false)}
        backdropOpacity={0.3}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 15 }}>{alertMessage}</Text>
          <Pressable
            onPress={() => setAlertVisible(false)}
            style={{
              backgroundColor: "#4a90e2",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>OK</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function History({ navigation }) {
  const { reports, getReports} = useReportStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      await getReports();
      setLoading(false);
    };
    fetchReports();
  }, []);

  const validReports = reports.filter(Boolean);

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7]} // dummy data for skeletons
          keyExtractor={(item) => item.toString()}
          renderItem={() => <SkeletonCard />}
        />
      ) : (
        <FlatList
          contentContainerStyle={{ flexGrow: 1 }}
          data={validReports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historySimpleCard}
              onPress={() =>
                navigation.navigate("ReportDetails", { reportId: item.id })
              }
            >
              <Text style={styles.historySimpleTitle}>{item.title}</Text>
              <Text style={styles.historySimpleDate}>
                {new Date(item.date).toDateString()}
              </Text>
              <Text style={styles.historySimplePreview} numberOfLines={1}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Report yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmer]);

  const bgColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ["#e0e0e0", "#f5f5f5"], // shimmer effect
  });

  return (
    <View style={styles.historySimpleCard}>
      <Animated.View
        style={[styles.skeletonLine, { width: "60%", backgroundColor: bgColor }]}
      />
      <Animated.View
        style={[styles.skeletonLine, { width: "40%", marginTop: 6, backgroundColor: bgColor }]}
      />
      <Animated.View
        style={[styles.skeletonLine, { width: "80%", marginTop: 6, backgroundColor: bgColor }]}
      />
    </View>
  );
}

export default function StudentReportScreen({ route }) {
  const initialTab =
    route?.params?.screen === "History" ? "History" : "Submit Report";
  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: "600" },
        tabBarIndicatorStyle: { backgroundColor: "#4a90e2" },
        swipeEnabled: false,
      }}
    >
      <Tab.Screen name="Submit Report" component={SubmitReport} />
      <Tab.Screen name="History" component={History} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f7fa" },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#333" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  btnText: { color: "#fff", marginLeft: 8, fontWeight: "bold" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: { marginLeft: 6, color: "#4CAF50", fontWeight: "bold" },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    justifyContent: "space-between",
    marginBottom: 15,
  },
  fileText: { flex: 1, marginLeft: 10, fontSize: 14 },
  removeBtn: {
    backgroundColor: "#F44336",
    padding: 5,
    borderRadius: 50,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#4a90e2",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // --- Simplified History styles ---
  historySimpleCard: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  historySimpleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  historySimpleDate: {
    fontSize: 13,
    color: "#777",
    marginBottom: 4,
  },
  historySimplePreview: {
    fontSize: 13,
    color: "#555",
  },

  skeletonLine: {
    height: 14,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
  },
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
  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  success: { backgroundColor: "#DFF6E0" }, // light green
  error: { backgroundColor: "#FDE2E1" }, // light red
  info: { backgroundColor: "#E0F2FE" }, // light blue
  warning: { backgroundColor: "#FFF4E5" }, // light yellow
  messageText: { marginLeft: 8, fontSize: 15, fontWeight: "600" },
 
});
