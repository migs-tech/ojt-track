import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQrStore } from '@/store/useQrStore';
import { Ionicons } from "@expo/vector-icons";

export default function ScanQrCode() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type] = useState("back");
  const [isActive, setIsActive] = useState(false);
  const isProcessing = useRef(false); // 🔑 prevents double scans
  const navigation = useNavigation();
  const { scanQRCode } = useQrStore();
  const [message, setMessage] = useState(null);
    
  const showMessage = (text, type) => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null),3000);
  };

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required to scan QR codes.");
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  // Enable/disable camera when screen is focused
  useFocusEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  });

  const handleBarCodeScanned = async ({ data }) => {
    if (isProcessing.current) return; // 🚫 stop duplicates
    isProcessing.current = true;

    try {
     const res = await scanQRCode(data);
      if (res.success) {
        showMessage("Attendance Recorded Successfully", "success");
      } else {
        showMessage(res.message || "Failed to record attendance", "error");
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
      showMessage("An error occurred while processing the QR code", "error");
    } finally {
      setTimeout(() => {
        isProcessing.current = false;
      }, 2000);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    navigation.goBack();
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {message && (
            <View
              style={[
                styles.messageBanner,
                styles[message.type] // maps directly to success, error, info, warning
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
                        : "#ED6C02"
                  }
                ]}
              >
                {message.text}
              </Text>
            </View>
          )}
      {isActive && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          type={type}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
        />
      )}

      <View style={styles.overlay}>
        <Text style={styles.title}>Scan Trainee QR Code</Text>
        <View style={styles.qrFrame} />
        <View style={styles.instructionBox}>
          <Text style={styles.instruction}>
            Position the QR code inside the frame to record trainee attendance
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 8,
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "orange",
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  instructionBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    width: "90%",
    alignItems: "center",
  },
  instruction: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: { fontSize: 16, fontWeight: "500", color: "#333" },
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
