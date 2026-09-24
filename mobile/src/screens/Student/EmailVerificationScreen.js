import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/store/useAuthStore";
import Icon from "react-native-vector-icons/MaterialIcons";
import api from "@/lib/api";

const EmailVerificationScreen = () => {
  const { user, setUser } = useAuth();
  const [isVerified, setIsVerified] = useState(user?.email_flg || false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); 
  const [verifying, setVerifying] = useState(false);
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isVerified) {
      intervalRef.current = setInterval(() => {
        checkVerification();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVerified]);


  const checkVerification = async () => {
    try {
      const res = await api.post("/user/checkIfEmailIsVerified", {
        email: user.email,
      });
      if (res.data.success && res.data.message === "Email is verified.") {
        setIsVerified(true);
        setUser({
        ...user,
        email_flg: 1,
      });
      }
    } catch (err) {
      setMessageType("error");
    }
  };

  const sendVerification = async () => {
    setVerifying(true);
    setMessage(null);
    try {
      const res = await api.post("/user/sendVerificationEmail", {
        email: user.email,
      });
      setMessage(res.data.message);
      setMessageType(res.data.success ? "success" : "error");
      setVerifying(true);
    } catch (err) {
      setMessage("Failed to send verification email.");
      setMessageType("error");
    } finally {
      setVerifying(false);}
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#888" style={styles.icon} />
            <Text style={styles.input}>{user.email}</Text>
          </View>
        </View>

        {/* Verification Status */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Verification Status</Text>
          {isVerified ? (
            <View style={styles.statusRow}>
              <Icon name="check-circle" size={20} color="green" style={styles.statusIcon} />
              <Text style={styles.successText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <Icon name="error-outline" size={20} color="red" style={styles.statusIcon} />
              <Text style={styles.errorText}>Not Verified</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!isVerified && (
          <View style={styles.buttonsContainer}>
            {/* Verify Button */}
            {!verifying ? (
              <TouchableOpacity style={styles.verifyButton} onPress={sendVerification}>
                <Text style={styles.verifyButtonText}>Verify</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.verifyButton, styles.disabledButton]}>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.verifyButtonText}>Verifying...</Text>
              </View>
            )}
          </View>
        )}

       {isVerified && (
        <View style={styles.buttonsContainer}>
            <View style={[styles.verifyButton, styles.disabledButton]}>
            <Icon name="check-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.verifyButtonText}>Verified</Text>
            </View>
        </View>
        )}

        {/* Status Message */}
        {message && (
          <View style={styles.messageContainer}>
            <Icon
              name={messageType === "success" ? "check-circle" : "error"}
              size={20}
              color={messageType === "success" ? "green" : "red"}
              style={styles.messageIcon}
            />
            <Text
              style={[
                styles.messageText,
                messageType === "success" ? styles.successText : styles.errorText,
              ]}
            >
              {message}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    padding: 20,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    fontSize: 16,
    color: "#111",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 8,
  },
  successText: {
    color: "green",
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonsContainer: {
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  verifyButton: {
    backgroundColor: "#34C759", // iOS green color for verify
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",     // 👈 make children horizontal
    alignItems: "center",     // 👈 align spinner + text vertically
    justifyContent: "center", // 👈 keep button content centered
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: 10,
  },
  messageIcon: {
    marginRight: 8,
  },
  messageText: {
    fontSize: 14,
    flexShrink: 1,
  },

  disabledButton: {
    backgroundColor: "#999",
    opacity: 0.7,        
  },

});

export default EmailVerificationScreen;